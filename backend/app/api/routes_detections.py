"""Lưu một lần chẩn đoán do trình duyệt thực hiện (model chạy ở frontend).

Frontend gửi multipart/form-data:
  - category_id, confidence_score, model_version : kết quả top-1
  - top_k        : JSON [{"category_id": int, "confidence_score": float}, ...] (tuỳ chọn)
  - file         : ảnh đã thu nhỏ (JPEG) để trang Lịch sử hiển thị lại (tuỳ chọn)

Backend không tin tên lớp / cờ healthy từ client: tự suy ra từ category_id theo
class_mapping, và tự tính is_confident theo CONFIDENCE_THRESHOLD của server.
"""
import json
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session

from ..config import CONFIDENCE_THRESHOLD, MAX_UPLOAD_BYTES, MAX_UPLOAD_MB, SAVE_IMAGES, TOP_K
from ..database import get_db
from ..models.detection import DetectionRecord
from ..schemas.predict import PredictionResponse, TopPrediction
from ..services.image_store import save_image, url_for
from ..services.model_meta import class_name_of, split_class_name

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["detections"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}


def _check_score(x: float) -> float:
    if not 0.0 <= x <= 1.0:
        raise HTTPException(422, "confidence_score phải nằm trong [0, 1].")
    return round(x, 4)


def _check_class(category_id: int) -> str:
    name = class_name_of(category_id)
    if name is None:
        raise HTTPException(422, f"category_id {category_id} không thuộc model.")
    return name


def _parse_top_k(raw: Optional[str], top1: TopPrediction) -> list[TopPrediction]:
    if not raw:
        return [top1]
    try:
        items = json.loads(raw)
        assert isinstance(items, list)
        parsed = [
            TopPrediction(
                category_id=int(it["category_id"]),
                class_name=_check_class(int(it["category_id"])),
                confidence_score=_check_score(float(it["confidence_score"])),
            )
            for it in items[:TOP_K]
        ]
    except HTTPException:
        raise
    except (ValueError, TypeError, KeyError, AssertionError):
        raise HTTPException(422, "top_k không đúng định dạng.")
    return parsed or [top1]


async def _read_limited(file: UploadFile) -> bytes:
    """Đọc từng khúc, dừng ngay khi vượt giới hạn."""
    chunks, size = [], 0
    while chunk := await file.read(1024 * 1024):
        size += len(chunk)
        if size > MAX_UPLOAD_BYTES:
            raise HTTPException(413, f"Ảnh vượt quá {MAX_UPLOAD_MB:g}MB.")
        chunks.append(chunk)
    return b"".join(chunks)


@router.post(
    "/detections",
    response_model=PredictionResponse,
    status_code=201,
    responses={400: {}, 413: {}, 415: {}, 422: {}},
)
async def create_detection(
    category_id: int = Form(...),
    confidence_score: float = Form(...),
    model_version: str = Form(..., max_length=50),
    top_k: Optional[str] = Form(None, max_length=4000),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
) -> PredictionResponse:
    class_name = _check_class(category_id)
    score = _check_score(confidence_score)
    top1 = TopPrediction(category_id=category_id, class_name=class_name, confidence_score=score)
    ranked = _parse_top_k(top_k, top1)

    image_name = None
    if file is not None and SAVE_IMAGES:
        if file.content_type and file.content_type not in ALLOWED_TYPES:
            raise HTTPException(415, f"Định dạng không hỗ trợ: {file.content_type}.")
        raw = await _read_limited(file)
        if raw:
            try:
                image_name = await run_in_threadpool(save_image, raw)
            except OSError:  # Pillow không đọc được -> không phải ảnh
                raise HTTPException(400, "File không phải ảnh hợp lệ.")

    plant, disease = split_class_name(class_name)
    is_healthy = "healthy" in class_name.lower()
    now = datetime.now(timezone.utc)
    record = DetectionRecord(
        image_path=image_name,
        category_id=category_id,
        class_name=class_name,
        disease_name=disease,
        is_healthy=is_healthy,
        confidence_score=score,
        model_version=model_version.strip(),
        created_at=now,
    )
    db.add(record)
    db.commit()

    return PredictionResponse(
        id=record.id,
        category_id=category_id,
        class_name=class_name,
        plant_name=plant,
        disease_name=disease,
        is_healthy=is_healthy,
        confidence_score=score,
        is_confident=score >= CONFIDENCE_THRESHOLD,
        created_at=now.isoformat(timespec="seconds"),
        model_version=record.model_version,
        top_k=ranked,
        image_url=url_for(image_name),
    )
