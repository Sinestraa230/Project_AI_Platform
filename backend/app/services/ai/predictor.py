"""Logic inference: ảnh bytes -> kết quả dự đoán (top-1 + top-k)."""
import numpy as np

from ...config import AI_MODEL_VERSION, CONFIDENCE_THRESHOLD, TOP_K
from .model_loader import get_mapping, get_model
from .preprocess import preprocess_image


def _split(class_name: str) -> tuple[str, str]:
    """'Corn_(maize)___Common_rust_' -> ('Corn (maize)', 'Common rust')"""
    plant, _, disease = class_name.partition("___")
    clean = lambda s: " ".join(s.replace("_", " ").split())  # noqa: E731
    return clean(plant), clean(disease or plant)


def predict(image_bytes: bytes) -> dict:
    """Trả dict: category_id, class_name, plant_name, disease_name, is_healthy,
    confidence_score, is_confident, model_version, top_k (list)."""
    x = preprocess_image(image_bytes)
    probs = np.asarray(get_model()(x, training=False))[0]

    id_to_class = get_mapping()["id_to_class"]  # {"0": "Apple___Apple_scab", ...}
    top_idx = np.argsort(probs)[::-1][:TOP_K]

    top_k = [
        {
            "category_id": int(i),
            "class_name": id_to_class[str(i)],
            # ép về float Python trước rồi mới làm tròn -> tránh 0.9739000201225281
            "confidence_score": round(float(probs[i]), 4),
        }
        for i in top_idx
    ]

    top1 = top_k[0]
    plant, disease = _split(top1["class_name"])
    return {
        "category_id": top1["category_id"],
        "class_name": top1["class_name"],
        "plant_name": plant,
        "disease_name": disease,
        "is_healthy": "healthy" in top1["class_name"].lower(),
        "confidence_score": top1["confidence_score"],
        "is_confident": top1["confidence_score"] >= CONFIDENCE_THRESHOLD,
        "model_version": AI_MODEL_VERSION,
        "top_k": top_k,
    }
