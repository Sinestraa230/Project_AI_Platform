"""Bảng lưu lịch sử dự đoán (SAVE_TO_DB=true) — trang History đọc qua GET /api/history."""
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String

from ..database import Base


class DetectionRecord(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, nullable=False)
    class_name = Column(String(200), nullable=False)
    disease_name = Column(String(200), nullable=False)
    is_healthy = Column(Boolean, default=False)
    confidence_score = Column(Float, nullable=False)
    model_version = Column(String(50), default="")
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )