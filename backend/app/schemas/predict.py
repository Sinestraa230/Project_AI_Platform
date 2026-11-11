"""Pydantic schema — chuẩn response cho frontend."""
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class TopPrediction(BaseModel):
    category_id: int
    class_name: str
    confidence_score: float


class PredictionResponse(BaseModel):
    # cho phép field bắt đầu bằng "model_" (model_version)
    model_config = ConfigDict(protected_namespaces=())

    category_id: int
    class_name: str
    plant_name: str
    disease_name: str
    is_healthy: bool
    confidence_score: float
    # False khi độ tin cậy < CONFIDENCE_THRESHOLD -> FE nên báo "chưa chắc chắn"
    is_confident: bool
    created_at: str
    model_version: str
    top_k: List[TopPrediction]
    # id bản ghi lịch sử
    id: Optional[int] = None
    # Đường dẫn ảnh đã lưu, VD /api/uploads/<tên>.jpg (None khi không lưu ảnh)
    image_url: Optional[str] = None


class HistoryItem(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    id: int
    category_id: int
    class_name: str
    plant_name: str
    disease_name: str
    is_healthy: bool
    confidence_score: float
    model_version: str
    created_at: str
    image_url: Optional[str] = None


class HistoryPage(BaseModel):
    total: int
    items: List[HistoryItem]


class DiseaseCount(BaseModel):
    class_name: str
    plant_name: str
    disease_name: str
    count: int


class StatsResponse(BaseModel):
    total: int
    diseased: int
    healthy: int
    # Số lượt từ 0h hôm nay theo múi giờ người dùng (tz_offset_minutes)
    today: int
    # Số loại bệnh khác nhau đã từng phát hiện (không tính "healthy")
    distinct_diseases: int
    top_diseases: List[DiseaseCount]
    recent: List[HistoryItem]
