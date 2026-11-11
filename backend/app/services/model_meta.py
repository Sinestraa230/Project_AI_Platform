"""Thông tin về model AI — backend KHÔNG chạy model (model chạy trên trình duyệt).

Bản chụp metadata của model đang dùng nằm ở app/data/model/ (commit vào git):
  - class_mapping.json : 38 lớp, id <-> tên lớp
  - model_info.json    : phiên bản (= tag trên Hugging Face), ngày train, độ chính xác...
  - metrics.json       : kết quả đánh giá chi tiết (tuỳ chọn)

`version` trong model_info.json là nguồn chuẩn duy nhất: frontend build tải đúng
model .tflite có tag này (frontend/scripts/prepare-model.mjs). Đổi model = chạy
scripts/sync_model_meta.py rồi commit.
"""
import json
from functools import lru_cache
from pathlib import Path

from ..config import AI_MODEL_VERSION

META_DIR = Path(__file__).resolve().parent.parent / "data" / "model"


def _read(name: str) -> dict:
    try:
        with open(META_DIR / name, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


@lru_cache(maxsize=1)
def get_mapping() -> dict:
    mapping = _read("class_mapping.json")
    if not mapping.get("id_to_class"):
        raise RuntimeError(f"Thiếu {META_DIR / 'class_mapping.json'}")
    return mapping


@lru_cache(maxsize=1)
def get_model_info() -> dict:
    return _read("model_info.json")


@lru_cache(maxsize=1)
def get_metrics() -> dict:
    return _read("metrics.json")


def get_model_version() -> str:
    return get_model_info().get("version") or AI_MODEL_VERSION


def class_name_of(category_id: int) -> str | None:
    return get_mapping()["id_to_class"].get(str(category_id))


def split_class_name(class_name: str) -> tuple[str, str]:
    """'Corn_(maize)___Common_rust_' -> ('Corn (maize)', 'Common rust')"""
    plant, _, disease = class_name.partition("___")
    clean = lambda s: " ".join(s.replace("_", " ").split())  # noqa: E731
    return clean(plant), clean(disease or plant)
