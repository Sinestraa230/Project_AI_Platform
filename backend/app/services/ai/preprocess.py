"""Tiền xử lý ảnh — PHẢI giống hệt lúc huấn luyện: resize bilinear + chuẩn hóa 0-1.

Notebook dùng keras.utils.image_dataset_from_directory (mặc định bilinear) rồi /255.
"""
import io

import numpy as np
from PIL import Image, ImageOps, UnidentifiedImageError

from ...config import AI_IMG_SIZE


class InvalidImageError(ValueError):
    """Dữ liệu gửi lên không phải ảnh hợp lệ."""


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Nhận bytes ảnh -> trả tensor (1, H, W, 3) float32 chuẩn hóa 0-1."""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img = ImageOps.exif_transpose(img)  # xoay đúng ảnh chụp từ điện thoại
        img = img.convert("RGB")
    except (UnidentifiedImageError, OSError) as exc:
        raise InvalidImageError("File không phải ảnh hợp lệ.") from exc

    img = img.resize((AI_IMG_SIZE, AI_IMG_SIZE), Image.BILINEAR)
    x = np.asarray(img, dtype=np.float32) / 255.0
    return np.expand_dims(x, axis=0)
