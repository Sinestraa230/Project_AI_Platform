"""Cấu hình backend — đọc từ biến môi trường / file .env ở gốc project (xem .env.example ở gốc)."""
import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent  # thư mục backend/
PROJECT_DIR = BASE_DIR.parent  # gốc project (chứa backend/, frontend/)

# Đọc <gốc project>/.env (nếu có), dùng chung cho backend + frontend.
# Biến môi trường thật (VD đặt trên Vercel) vẫn được ưu tiên hơn file này.
load_dotenv(PROJECT_DIR / ".env")


def _env(key: str, default: str) -> str:
    # Biến được đặt nhưng để trống (hay gặp khi điền form Environment Variables trên Vercel)
    # cũng dùng giá trị mặc định, tránh int("") làm app chết lúc khởi động.
    value = os.getenv(key, "").strip()
    return value or default


def _path(key: str, default: Path) -> str:
    """Đường dẫn tương đối được tính từ backend/, không phụ thuộc thư mục đang đứng."""
    p = Path(_env(key, str(default)))
    return str(p if p.is_absolute() else BASE_DIR / p)


APP_ENV = _env("APP_ENV", "development")
HOST = _env("HOST", "0.0.0.0")
PORT = int(_env("PORT", "8000"))
DATABASE_URL = _env("DATABASE_URL", f"sqlite:///{BASE_DIR / 'app.db'}")
if DATABASE_URL.startswith("sqlite:///./"):
    DATABASE_URL = f"sqlite:///{BASE_DIR / DATABASE_URL[len('sqlite:///./'):]}"
# Neon/Supabase/Heroku hay đưa chuỗi "postgres://", SQLAlchemy chỉ nhận "postgresql://"
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = "postgresql://" + DATABASE_URL[len("postgres://"):]

# Domain frontend được phép gọi API, cách nhau bằng dấu phẩy. "*" = cho tất cả (dev)
CORS_ORIGINS = [o.strip().rstrip("/") for o in _env("CORS_ORIGINS", "*").split(",") if o.strip()]

# Chạy trên Vercel (Vercel tự đặt VERCEL=1): ổ đĩa chỉ đọc, mỗi request có thể là 1 máy mới
ON_VERCEL = bool(os.getenv("VERCEL"))
if ON_VERCEL and DATABASE_URL.startswith("sqlite"):
    raise RuntimeError(
        "Chạy trên Vercel cần DATABASE_URL trỏ tới Postgres (Neon). "
        "Đặt trong Vercel > Project > Settings > Environment Variables."
    )

# --- Model AI (chạy trên trình duyệt; backend chỉ đọc metadata ở app/data/model/) ---
# Chỉ dùng khi app/data/model/model_info.json không có "version"
AI_MODEL_VERSION = _env("AI_MODEL_VERSION", "efficientnetb3_v1.0")
TOP_K = int(_env("TOP_K", "5"))
# Dưới ngưỡng này -> coi như không nhận diện được (ảnh không phải lá / không rõ)
CONFIDENCE_THRESHOLD = float(_env("CONFIDENCE_THRESHOLD", "0.6"))

# Nguồn model trên Hugging Face — chỉ scripts/sync_model_meta.py dùng
HF_REPO_ID = _env("HF_REPO_ID", "NamHai0510/plant-disease-model")
HF_TOKEN = _env("HF_TOKEN", "")  # token loại Read; cần vì repo đang private

# --- Upload ảnh kèm kết quả chẩn đoán ---
# Vercel giới hạn body request 4.5MB; frontend đã thu nhỏ ảnh (~50-300KB) trước khi gửi
MAX_UPLOAD_MB = float(_env("MAX_UPLOAD_MB", "4"))
MAX_UPLOAD_BYTES = int(MAX_UPLOAD_MB * 1024 * 1024)

# Lưu kèm ảnh đã chẩn đoán để trang Lịch sử hiển thị lại
SAVE_IMAGES = _env("SAVE_IMAGES", "true").lower() == "true"
UPLOAD_DIR = _path("UPLOAD_DIR", BASE_DIR / "uploads")
# Nơi lưu ảnh: "disk" (UPLOAD_DIR) hoặc "db" (bảng stored_images).
# Trên Vercel mặc định "db" vì ổ đĩa chỉ đọc và không bền.
IMAGE_STORAGE = _env("IMAGE_STORAGE", "db" if ON_VERCEL else "disk").lower()
IMAGE_MAX_SIDE = int(_env("IMAGE_MAX_SIDE", "1024"))  # cạnh dài nhất của ảnh lưu lại (px)

# --- Đăng nhập ---
# Số ngày một phiên đăng nhập còn hiệu lực trước khi phải đăng nhập lại
SESSION_TTL_DAYS = float(_env("SESSION_TTL_DAYS", "7"))
