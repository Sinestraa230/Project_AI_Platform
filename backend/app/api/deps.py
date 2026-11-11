"""Dependency xác thực dùng chung cho các route cần đăng nhập."""
from datetime import datetime, timezone

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from ..core.security import hash_token
from ..database import get_db
from ..models.session import AuthSession
from ..models.user import User

_bearer = HTTPBearer(auto_error=False)


def _as_utc(dt: datetime) -> datetime:
    # SQLite không lưu múi giờ -> giá trị gốc là UTC
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def get_current_session(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> AuthSession:
    """Phiên ứng với token trong header. Thiếu / sai / hết hạn / user bị khoá -> 401."""
    if creds is None or not creds.credentials:
        raise HTTPException(401, "Chưa đăng nhập.", headers={"WWW-Authenticate": "Bearer"})
    sess = (
        db.query(AuthSession)
        .filter(AuthSession.token_hash == hash_token(creds.credentials))
        .first()
    )
    if sess is None:
        raise HTTPException(
            401, "Phiên đăng nhập không hợp lệ.", headers={"WWW-Authenticate": "Bearer"}
        )
    if _as_utc(sess.expires_at) <= datetime.now(timezone.utc):
        db.delete(sess)
        db.commit()
        raise HTTPException(
            401, "Phiên đăng nhập đã hết hạn.", headers={"WWW-Authenticate": "Bearer"}
        )
    user = db.get(User, sess.user_id)
    if user is None or not user.is_active:
        raise HTTPException(
            401, "Phiên đăng nhập không hợp lệ.", headers={"WWW-Authenticate": "Bearer"}
        )
    return sess


def get_current_user(
    sess: AuthSession = Depends(get_current_session), db: Session = Depends(get_db)
) -> User:
    """Dùng trong route cần đăng nhập: `user: User = Depends(get_current_user)`."""
    return db.get(User, sess.user_id)
