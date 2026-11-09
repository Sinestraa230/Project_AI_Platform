"""Load model + class mapping một lần khi khởi động (singleton)."""
import json
import logging
import zipfile

import keras

from ...config import (
    AI_CLASS_MAPPING_PATH,
    AI_METRICS_PATH,
    AI_MODEL_INFO_PATH,
    AI_MODEL_PATH,
    AI_MODEL_VERSION,
    AUTO_DOWNLOAD_MODEL,
    HF_REPO_ID,
)
from .model_fetch import artifacts_present, download_artifacts

logger = logging.getLogger(__name__)

_model = None
_mapping = None
_info = None
_metrics = None


def ensure_artifacts():
    """Thiếu model/mapping -> tự tải từ Hugging Face (nếu đã cấu hình)."""
    if artifacts_present():
        return
    if AUTO_DOWNLOAD_MODEL and HF_REPO_ID:
        download_artifacts()
        return
    raise RuntimeError(
        f"Không tìm thấy model: {AI_MODEL_PATH}. Đặt HF_REPO_ID + HF_TOKEN trong "
        "backend/.env rồi chạy: python scripts/download_model.py"
    )


def _ver(s: str) -> tuple:
    return tuple(int(p) for p in s.split(".")[:2] if p.isdigit())


def saved_keras_version(path: str) -> str | None:
    """File .keras là zip, có metadata.json ghi keras_version lúc lưu."""
    try:
        with zipfile.ZipFile(path) as z:
            return json.loads(z.read("metadata.json")).get("keras_version")
    except (zipfile.BadZipFile, KeyError, ValueError):
        return None


def check_keras_compat(path: str) -> None:
    """Cảnh báo nếu model được lưu bằng Keras mới hơn bản đang cài."""
    saved = saved_keras_version(path)
    if saved and _ver(saved) > _ver(keras.__version__):
        logger.warning(
            "Model lưu bằng Keras %s nhưng backend đang dùng Keras %s — có thể load lỗi. "
            "Nâng keras trong backend/requirements.txt.", saved, keras.__version__,
        )


def get_model():
    global _model
    if _model is None:
        ensure_artifacts()
        check_keras_compat(AI_MODEL_PATH)
        try:
            _model = keras.models.load_model(AI_MODEL_PATH)
        except Exception as exc:
            raise RuntimeError(
                f"Không load được model (lưu bằng Keras {saved_keras_version(AI_MODEL_PATH)}, "
                f"backend dùng Keras {keras.__version__}): {exc}"
            ) from exc
    return _model


def get_mapping() -> dict:
    global _mapping
    if _mapping is None:
        ensure_artifacts()
        with open(AI_CLASS_MAPPING_PATH, "r", encoding="utf-8") as f:
            _mapping = json.load(f)
    return _mapping


def get_model_info() -> dict:
    """Nội dung model_info.json do notebook sinh ra; {} nếu model cũ chưa có file này."""
    global _info
    if _info is None:
        try:
            with open(AI_MODEL_INFO_PATH, "r", encoding="utf-8") as f:
                _info = json.load(f)
        except FileNotFoundError:
            logger.warning(
                "Không có %s — dùng AI_MODEL_VERSION=%s trong .env.",
                AI_MODEL_INFO_PATH, AI_MODEL_VERSION,
            )
            _info = {}
        n_info = _info.get("num_classes")
        if n_info and _mapping is not None and n_info != len(_mapping["id_to_class"]):
            logger.warning(
                "model_info ghi %s lớp nhưng class_mapping có %s lớp — file không cùng 1 lần train?",
                n_info, len(_mapping["id_to_class"]),
            )
    return _info


def get_model_version() -> str:
    return get_model_info().get("version") or AI_MODEL_VERSION


def get_metrics() -> dict:
    """metrics.json do notebook sinh ra; {} nếu model cũ chưa có file này."""
    global _metrics
    if _metrics is None:
        try:
            with open(AI_METRICS_PATH, "r", encoding="utf-8") as f:
                _metrics = json.load(f)
        except FileNotFoundError:
            _metrics = {}
    return _metrics
