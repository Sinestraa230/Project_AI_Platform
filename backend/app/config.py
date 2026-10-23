"""Cấu hình backend — đọc từ biến môi trường (xem .env.example)."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent  # thư mục backend/


def _env(key: str, default: str) -> str:
    return os.getenv(key, default)


APP_ENV = _env("APP_ENV", "development")
HOST = _env("HOST", "0.0.0.0")
PORT = int(_env("PORT", "8000"))
DATABASE_URL = _env("DATABASE_URL", f"sqlite:///{BASE_DIR / 'app.db'}")

# --- AI ---
AI_MODEL_PATH = _env(
    "AI_MODEL_PATH", str(BASE_DIR / "ai_artifacts" / "plant_disease_model.keras")
)
AI_CLASS_MAPPING_PATH = _env(
    "AI_CLASS_MAPPING_PATH", str(BASE_DIR / "ai_artifacts" / "class_mapping.json")
)
AI_MODEL_VERSION = _env("AI_MODEL_VERSION", "efficientnetb3_v1.0")
AI_IMG_SIZE = int(_env("AI_IMG_SIZE", "300"))  # khớp kích thước huấn luyện
TOP_K = int(_env("TOP_K", "5"))

# Lưu lịch sử dự đoán vào DB? (true khi đã sẵn sàng DB)
SAVE_TO_DB = _env("SAVE_TO_DB", "false").lower() == "true"