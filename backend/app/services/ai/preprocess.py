"""Tiền xử lý ảnh — PHẢI giống hệt lúc huấn luyện: resize + chuẩn hóa 0-1."""
import io

import numpy as np
from PIL import Image

from ...config import AI_IMG_SIZE


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Nhận bytes ảnh -> trả tensor (1, H, W, 3) float32 chuẩn hóa 0-1."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((AI_IMG_SIZE, AI_IMG_SIZE), Image.LANCZOS)
    x = np.asarray(img, dtype=np.float32) / 255.0
    return np.expand_dims(x, axis=0)