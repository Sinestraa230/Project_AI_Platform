"""Đăng ký / đăng nhập / đăng xuất — phiên đăng nhập lưu ở bảng sessions."""
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..config import SESSION_TTL_DAYS
from ..core.security import (
    DUMMY_HASH,
    hash_password,
    hash_token,
    new_session_token,
    verify_password,
)
from ..database import get_db
from ..models.session import AuthSession
from ..models.user import User
from ..schemas.auth import LoginRequest, RegisterRequest, SessionOut, UserOut
from .deps import get_current_session, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _to_out(u: User) -> UserOut:
    created = u.created_at
    if created.tzinfo is None:  # SQLite không lưu múi giờ -> giá trị gốc là UTC
        created = created.replace(tzinfo=timezone.utc)
    return UserOut(
        id=u.id,
        email=u.email,
        full_name=u.full_name or "",
        created_at=created.isoformat(timespec="seconds"),
    )


def _find_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email.strip().lower()).first()


@router.post("/register", response_model=UserOut, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)) -> UserOut:
    """Tạo tài khoản mới; mật khẩu được băm trước khi lưu."""
    if _find_by_email(db, body.email) is not None:
        raise HTTPException(409, "Email này đã được đăng ký.")
    user = User(
        email=body.email.strip().lower(),
        full_name=body.full_name.strip(),
        password_hash=hash_password(body.password),
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:  # 2 request đăng ký cùng email chạy song song
        db.rollback()
        raise HTTPException(409, "Email này đã được đăng ký.")
    db.refresh(user)
    return _to_out(user)


@router.post("/login", response_model=SessionOut)
def login(body: LoginRequest, db: Session = Depends(get_db)) -> SessionOut:
    """Đối chiếu email + mật khẩu; đúng -> tạo phiên mới và trả token. Sai -> 401."""
    user = _find_by_email(db, body.email)
    # Email không tồn tại vẫn băm 1 lần với DUMMY_HASH để thời gian phản hồi như nhau
    ok = verify_password(body.password, user.password_hash if user else DUMMY_HASH)
    if user is None or not ok:
        raise HTTPException(401, "Email hoặc mật khẩu không đúng.")
    if not user.is_active:
        raise HTTPException(403, "Tài khoản đã bị khoá.")

    now = datetime.now(timezone.utc)
    token = new_session_token()
    expires = now + timedelta(days=SESSION_TTL_DAYS)
    # Dọn luôn các phiên đã hết hạn của user này để bảng không phình mãi
    db.query(AuthSession).filter(
        AuthSession.user_id == user.id, AuthSession.expires_at <= now
    ).delete(synchronize_session=False)
    db.add(AuthSession(token_hash=hash_token(token), user_id=user.id, expires_at=expires))
    db.commit()
    return SessionOut(
        message="Đăng nhập thành công.",
        access_token=token,
        expires_at=expires.isoformat(timespec="seconds"),
        user=_to_out(user),
    )


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)) -> UserOut:
    """Người dùng ứng với token hiện tại (FE gọi khi mở app để khôi phục phiên)."""
    return _to_out(user)


@router.post("/logout", status_code=204)
def logout(
    sess: AuthSession = Depends(get_current_session), db: Session = Depends(get_db)
) -> None:
    """Xoá phiên hiện tại -> token này không dùng được nữa (các thiết bị khác không ảnh hưởng)."""
    db.delete(sess)
    db.commit()
