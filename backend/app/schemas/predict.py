"""Pydantic schema — chuẩn response cho frontend."""
from typing import List

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
