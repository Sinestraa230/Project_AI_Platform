"""Kết nối database (SQLAlchemy) — mặc định SQLite cho dev, đổi qua DATABASE_URL."""
import logging

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

from .config import APP_ENV, DATABASE_URL, IMAGE_STORAGE, SAVE_IMAGES

logger = logging.getLogger(__name__)

_connect_args = (
    {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

# pool_pre_ping: Postgres trên cloud (Neon...) tự ngắt kết nối rảnh -> kiểm tra trước khi dùng
engine = create_engine(DATABASE_URL, connect_args=_connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()


def init_db() -> None:
    """Tạo bảng nếu chưa tồn tại (chạy lúc khởi động app)."""
    from . import models  # noqa: F401 — đăng ký model trước khi create_all

    if APP_ENV == "production":
        # Ổ đĩa server (Vercel) không bền -> dữ liệu mất mà không báo lỗi
        if DATABASE_URL.startswith("sqlite"):
            logger.warning("APP_ENV=production nhưng DATABASE_URL là SQLite — dữ liệu sẽ mất "
                           "khi server khởi động lại. Đặt DATABASE_URL trỏ tới Postgres.")
        if SAVE_IMAGES and IMAGE_STORAGE != "db":
            logger.warning("APP_ENV=production nhưng IMAGE_STORAGE=%s — ảnh sẽ mất khi server "
                           "khởi động lại. Đặt IMAGE_STORAGE=db.", IMAGE_STORAGE)
    Base.metadata.create_all(bind=engine)
    _add_missing_columns()


def _add_missing_columns() -> None:
    """create_all không sửa bảng đã có -> tự thêm cột mới cho DB tạo từ bản cũ."""
    columns = {c["name"] for c in inspect(engine).get_columns("detections")}
    if "image_path" not in columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE detections ADD COLUMN image_path VARCHAR(100)"))


def get_db():
    """Dependency cho FastAPI — trả session và tự đóng."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()