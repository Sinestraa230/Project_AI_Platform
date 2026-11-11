"""Kết nối database (SQLAlchemy) — mặc định SQLite cho dev, đổi qua DATABASE_URL."""
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from .config import DATABASE_URL

_connect_args = (
    {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

engine = create_engine(DATABASE_URL, connect_args=_connect_args)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()


def init_db() -> None:
    """Tạo bảng nếu chưa tồn tại (chạy lúc khởi động app)."""
    from . import models  # noqa: F401 — đăng ký model trước khi create_all

    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency cho FastAPI — trả session và tự đóng."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()