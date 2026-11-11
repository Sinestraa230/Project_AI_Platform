"""Ảnh đã chẩn đoán lưu thẳng trong DB (IMAGE_STORAGE=db) — dùng khi server không có ổ đĩa bền."""
from sqlalchemy import Column, LargeBinary, String

from ..database import Base


class StoredImage(Base):
    __tablename__ = "stored_images"

    name = Column(String(100), primary_key=True)  # trùng detections.image_path
    data = Column(LargeBinary, nullable=False)  # JPEG đã thu nhỏ
