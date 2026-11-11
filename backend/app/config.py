"""Cấu hình backend — đọc từ biến môi trường / file backend/.env (xem .env.example)."""
import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent  # thư mục backend/

# Đọc backend/.env (nếu có); biến môi trường thật vẫn được ưu tiên
load_dotenv(BASE_DIR / ".env")


def _env(key: str, default: str) -> str:
    return os.getenv(key, default)


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

# --- AI ---
AI_MODEL_PATH = _path("AI_MODEL_PATH", BASE_DIR / "ai_artifacts" / "plant_disease_model.keras")
AI_CLASS_MAPPING_PATH = _path(
    "AI_CLASS_MAPPING_PATH", BASE_DIR / "ai_artifacts" / "class_mapping.json"
)
AI_MODEL_INFO_PATH = _path("AI_MODEL_INFO_PATH", BASE_DIR / "ai_artifacts" / "model_info.json")
# Kết quả đánh giá lúc train (độ đo từng lớp, gợi ý ngưỡng) — GET /api/model
AI_METRICS_PATH = _path("AI_METRICS_PATH", BASE_DIR / "ai_artifacts" / "metrics.json")
# Chỉ dùng khi model cũ chưa có model_info.json (phiên bản thật đọc từ file đó)
AI_MODEL_VERSION = _env("AI_MODEL_VERSION", "efficientnetb3_v1.0")
AI_IMG_SIZE = int(_env("AI_IMG_SIZE", "300"))  # khớp kích thước huấn luyện
TOP_K = int(_env("TOP_K", "5"))
# Dưới ngưỡng này -> coi như không nhận diện được (ảnh không phải lá / không rõ)
CONFIDENCE_THRESHOLD = float(_env("CONFIDENCE_THRESHOLD", "0.6"))

# --- Nguồn model (Hugging Face Hub) ---
HF_REPO_ID = _env("HF_REPO_ID", "")
HF_TOKEN = _env("HF_TOKEN", "")  # token loại Read; cần vì repo đang private
HF_REVISION = _env("HF_REVISION", "")  # rỗng = main; đặt tag/commit để ghim phiên bản
# Thiếu model khi khởi động -> tự tải từ HF (nếu có HF_REPO_ID)
AUTO_DOWNLOAD_MODEL = _env("AUTO_DOWNLOAD_MODEL", "true").lower() == "true"

# --- Upload ---
MAX_UPLOAD_MB = float(_env("MAX_UPLOAD_MB", "10"))
MAX_UPLOAD_BYTES = int(MAX_UPLOAD_MB * 1024 * 1024)

# Lưu lịch sử dự đoán vào DB (trang History của FE đọc từ đây)
SAVE_TO_DB = _env("SAVE_TO_DB", "true").lower() == "true"
