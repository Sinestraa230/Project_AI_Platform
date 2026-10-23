"""Logic inference: ảnh bytes -> kết quả dự đoán (top-1 + top-k)."""
import numpy as np

from ...config import AI_MODEL_VERSION, TOP_K
from .model_loader import get_mapping, get_model
from .preprocess import preprocess_image


def _clean_name(class_name: str) -> str:
    """'Apple___Apple_scab' -> 'Apple scab'"""
    parts = class_name.split("___")
    name = parts[1] if len(parts) > 1 else parts[0]
    return name.replace("_", " ").strip()


def predict(image_bytes: bytes) -> dict:
    """Trả dict: category_id, class_name, disease_name, is_healthy,
    confidence_score, model_version, top_k (list)."""
    x = preprocess_image(image_bytes)
    probs = get_model().predict(x, verbose=0)[0]

    id_to_class = get_mapping()["id_to_class"]  # {"0": "Apple___Apple_scab", ...}
    top_idx = np.argsort(probs)[::-1][:TOP_K]

    top_k = [
        {
            "category_id": int(i),
            "class_name": id_to_class[str(i)],
            "confidence_score": float(np.round(probs[i], 4)),
        }
        for i in top_idx
    ]

    top1 = top_k[0]
    return {
        "category_id": top1["category_id"],
        "class_name": top1["class_name"],
        "disease_name": _clean_name(top1["class_name"]),
        "is_healthy": "healthy" in top1["class_name"].lower(),
        "confidence_score": top1["confidence_score"],
        "model_version": AI_MODEL_VERSION,
        "top_k": top_k,
    }