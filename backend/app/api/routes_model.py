"""Thông tin model đang chạy: phiên bản + kết quả đánh giá lúc train."""
from fastapi import APIRouter

from ..config import CONFIDENCE_THRESHOLD
from ..services.model_meta import get_metrics, get_model_info, get_model_version

router = APIRouter(prefix="/api", tags=["model"])


@router.get("/model")
def model_info(per_class: bool = False) -> dict:
    """Phiên bản, độ chính xác, lớp yếu nhất, gợi ý ngưỡng tin cậy.

    ?per_class=true để lấy thêm precision/recall/F1 của từng lớp (38 lớp).
    """
    metrics = dict(get_metrics())
    if not per_class:
        metrics.pop("per_class", None)
    return {
        "version": get_model_version(),
        "info": get_model_info(),
        "confidence_threshold": CONFIDENCE_THRESHOLD,
        "metrics": metrics or None,  # None: model cũ chưa có metrics.json
    }
