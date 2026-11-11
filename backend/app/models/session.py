"""Phiên đăng nhập — mỗi lần login tạo 1 dòng, logout xoá dòng đó."""
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String

from ..database import Base


class AuthSession(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    # Chỉ lưu SHA-256 của token: lộ DB cũng không dùng được token để đăng nhập
    token_hash = Column(String(64), unique=True, index=True, nullable=False)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    expires_at = Column(DateTime, nullable=False)
