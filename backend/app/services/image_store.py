"""Lưu ảnh đã chẩn đoán để trang Lịch sử hiển thị lại.

Ảnh được thu nhỏ và mã hoá lại thành JPEG: file nhẹ hơn nhiều so với ảnh gốc,
đồng thời bỏ luôn EXIF (toạ độ GPS, thông tin máy) của ảnh chụp từ điện thoại.

Nơi lưu chọn bằng IMAGE_STORAGE: "disk" (thư mục UPLOAD_DIR) hoặc "db" (bảng stored_images).
"""
import io
import os
import uuid
from typing import Optional

from PIL import Image, ImageOps

from .. import config
from ..database import SessionLocal
from ..models.image import StoredImage

URL_PREFIX = "/api/uploads"  # nằm dưới /api để đi qua proxy của Vite khi dev


def _use_db() -> bool:
    return config.IMAGE_STORAGE == "db"


def _file(name: str) -> str:
    return os.path.join(config.UPLOAD_DIR, os.path.basename(name))  # basename: chặn ../


def ensure_dir() -> None:
    if not _use_db():
        os.makedirs(config.UPLOAD_DIR, exist_ok=True)


def save_image(image_bytes: bytes) -> str:
    """Lưu ảnh, trả tên file (không kèm đường dẫn)."""
    img = Image.open(io.BytesIO(image_bytes))
    img = ImageOps.exif_transpose(img).convert("RGB")
    img.thumbnail((config.IMAGE_MAX_SIDE, config.IMAGE_MAX_SIDE))  # giữ tỉ lệ, chỉ thu nhỏ
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=85)
    name = f"{uuid.uuid4().hex}.jpg"
    if _use_db():
        with SessionLocal() as db:
            db.add(StoredImage(name=name, data=buf.getvalue()))
            db.commit()
    else:
        ensure_dir()
        with open(_file(name), "wb") as f:
            f.write(buf.getvalue())
    return name


def load_image(name: str) -> Optional[bytes]:
    """Nội dung JPEG của ảnh, None nếu không có."""
    if _use_db():
        with SessionLocal() as db:
            row = db.get(StoredImage, name)
            return bytes(row.data) if row else None
    try:
        with open(_file(name), "rb") as f:
            return f.read()
    except (FileNotFoundError, IsADirectoryError, PermissionError):
        return None


def delete_image(name: Optional[str]) -> None:
    if not name:
        return
    if _use_db():
        with SessionLocal() as db:
            row = db.get(StoredImage, name)
            if row:
                db.delete(row)
                db.commit()
        return
    try:
        os.remove(_file(name))
    except FileNotFoundError:
        pass


def url_for(name: Optional[str]) -> Optional[str]:
    return f"{URL_PREFIX}/{name}" if name else None
