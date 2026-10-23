"""Load model + class mapping một lần khi khởi động (singleton)."""
import json
import os

import tensorflow as tf

from ...config import AI_CLASS_MAPPING_PATH, AI_MODEL_PATH

_model = None
_mapping = None


def get_model():
    global _model
    if _model is None:
        if not os.path.exists(AI_MODEL_PATH):
            raise RuntimeError(
                f"Không tìm thấy model: {AI_MODEL_PATH}. "
                "Hãy train trên Kaggle rồi đặt plant_disease_model.keras "
                "và class_mapping.json vào backend/ai_artifacts/."
            )
        _model = tf.keras.models.load_model(AI_MODEL_PATH)
    return _model


def get_mapping() -> dict:
    global _mapping
    if _mapping is None:
        with open(AI_CLASS_MAPPING_PATH, "r", encoding="utf-8") as f:
            _mapping = json.load(f)
    return _mapping