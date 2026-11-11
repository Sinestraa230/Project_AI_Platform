"""Lịch sử chẩn đoán — trang History của FE đọc từ đây."""
from datetime import timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.detection import DetectionRecord
from ..schemas.predict import HistoryItem, HistoryPage
from ..services.ai.predictor import _split

router = APIRouter(prefix="/api", tags=["history"])


def _to_item(r: DetectionRecord) -> HistoryItem:
    plant, disease = _split(r.class_name)
    created = r.created_at
    if created.tzinfo is None:  # SQLite không lưu múi giờ -> giá trị gốc là UTC
        created = created.replace(tzinfo=timezone.utc)
    return HistoryItem(
        id=r.id,
        category_id=r.category_id,
        class_name=r.class_name,
        plant_name=plant,
        disease_name=disease,
        is_healthy=r.is_healthy,
        confidence_score=r.confidence_score,
        model_version=r.model_version or "",
        created_at=created.isoformat(timespec="seconds"),
    )


@router.get("/history", response_model=HistoryPage)
def list_history(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
) -> HistoryPage:
    """Các lần chẩn đoán, mới nhất trước."""
    q = db.query(DetectionRecord)
    rows = q.order_by(DetectionRecord.id.desc()).offset(offset).limit(limit).all()
    return HistoryPage(total=q.count(), items=[_to_item(r) for r in rows])


@router.delete("/history/{record_id}", status_code=204)
def delete_history(record_id: int, db: Session = Depends(get_db)) -> None:
    record = db.get(DetectionRecord, record_id)
    if record is None:
        raise HTTPException(404, "Không tìm thấy bản ghi.")
    db.delete(record)
    db.commit()
