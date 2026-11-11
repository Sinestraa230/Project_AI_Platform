"""Số liệu tổng hợp cho trang Tổng quan (Dashboard) — tính từ bảng detections."""
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.detection import DetectionRecord
from ..schemas.predict import DiseaseCount, StatsResponse
from ..services.model_meta import split_class_name as _split
from .routes_history import _to_item

router = APIRouter(prefix="/api", tags=["stats"])


def _start_of_today_utc(tz_offset_minutes: int) -> datetime:
    """0h hôm nay theo giờ người dùng, đổi về UTC (naive, giống cột created_at)."""
    offset = timedelta(minutes=tz_offset_minutes)
    local_now = datetime.now(timezone.utc) + offset
    local_midnight = local_now.replace(hour=0, minute=0, second=0, microsecond=0)
    return (local_midnight - offset).replace(tzinfo=None)


@router.get("/stats", response_model=StatsResponse)
def stats(
    # Mặc định giờ Việt Nam (UTC+7). FE có thể gửi -new Date().getTimezoneOffset()
    tz_offset_minutes: int = Query(420, ge=-720, le=840),
    recent: int = Query(5, ge=0, le=20),
    top: int = Query(5, ge=0, le=20),
    db: Session = Depends(get_db),
) -> StatsResponse:
    count = func.count(DetectionRecord.id)
    is_healthy = DetectionRecord.is_healthy.is_(True)
    diseased_only = DetectionRecord.is_healthy.isnot(True)

    total = db.query(count).scalar() or 0
    healthy = db.query(count).filter(is_healthy).scalar() or 0
    today = (
        db.query(count)
        .filter(DetectionRecord.created_at >= _start_of_today_utc(tz_offset_minutes))
        .scalar()
        or 0
    )
    distinct_diseases = (
        db.query(func.count(func.distinct(DetectionRecord.class_name)))
        .filter(diseased_only)
        .scalar()
        or 0
    )

    top_rows = (
        db.query(DetectionRecord.class_name, count)
        .filter(diseased_only)
        .group_by(DetectionRecord.class_name)
        .order_by(count.desc(), DetectionRecord.class_name)
        .limit(top)
        .all()
    )
    top_diseases = []
    for class_name, n in top_rows:
        plant, disease = _split(class_name)
        top_diseases.append(
            DiseaseCount(class_name=class_name, plant_name=plant, disease_name=disease, count=n)
        )

    recent_rows = (
        db.query(DetectionRecord).order_by(DetectionRecord.id.desc()).limit(recent).all()
    )

    return StatsResponse(
        total=total,
        diseased=total - healthy,
        healthy=healthy,
        today=today,
        distinct_diseases=distinct_diseases,
        top_diseases=top_diseases,
        recent=[_to_item(r) for r in recent_rows],
    )
