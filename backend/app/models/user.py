"""Bảng người dùng — đăng ký/đăng nhập qua /api/auth."""
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Integer, String

from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    # Luôn lưu dạng chữ thường để so khớp không phân biệt hoa/thường
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False, default="")
    password_hash = Column(String(255), nullable=False)  # xem core/security.py
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
