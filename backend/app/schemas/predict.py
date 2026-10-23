"""Pydantic schema — chuẩn response cho frontend."""
from typing import List

from pydantic import BaseModel


class TopPrediction(BaseModel):
    category_id: int
    class_name: str
    confidence_score: float


class PredictionResponse(BaseModel):
    category_id: int
    class_name: str
    disease_name: str
    is_healthy: bool
    confidence_score: float
    created_at: str
    model_version: str
    top_k: List[TopPrediction]