"""Endpoint nhận ảnh -> dự đoán -> trả JSON + (tùy chọn) lưu DB."""
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session

from ..config import MAX_UPLOAD_BYTES, MAX_UPLOAD_MB, SAVE_TO_DB
from ..database import get_db
from ..models.detection import DetectionRecord
from ..schemas.predict import PredictionResponse
from ..services.ai.predictor import predict
from ..services.ai.preprocess import InvalidImageError

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["predict"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp", "image/gif"}


async def _read_limited(file: UploadFile) -> bytes:
    """Đọc file theo từng khúc, dừng ngay khi vượt giới hạn (không nạp hết vào RAM)."""
    chunks, size = [], 0
    while chunk := await file.read(1024 * 1024):
        size += len(chunk)
        if size > MAX_UPLOAD_BYTES:
            raise HTTPException(413, f"Ảnh vượt quá {MAX_UPLOAD_MB:g}MB.")
        chunks.append(chunk)
    return b"".join(chunks)


@router.post(
    "/predict",
    response_model=PredictionResponse,
    responses={400: {}, 413: {}, 415: {}, 500: {}},
)
async def predict_endpoint(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> PredictionResponse:
    # 1. Kiểm tra loại file + đọc có giới hạn dung lượng
    if file.content_type and file.content_type not in ALLOWED_TYPES:
        raise HTTPException(415, f"Định dạng không hỗ trợ: {file.content_type}.")
    raw = await _read_limited(file)
    if not raw:
        raise HTTPException(400, "File rỗng.")

    # 2. Dự đoán trong threadpool để không chặn event loop
    try:
        result = await run_in_threadpool(predict, raw)
    except InvalidImageError as exc:
        raise HTTPException(400, str(exc))
    except Exception:
        logger.exception("Lỗi khi dự đoán")
        raise HTTPException(500, "Lỗi nội bộ khi dự đoán.")

    # 3. Thời gian tạo — dùng chung cho response và DB
    now = datetime.now(timezone.utc)
    result["created_at"] = now.isoformat(timespec="seconds")

    # 4. (Tùy chọn) lưu lịch sử vào DB — bật SAVE_TO_DB=true
    if SAVE_TO_DB:
        record = DetectionRecord(
            category_id=result["category_id"],
            class_name=result["class_name"],
            disease_name=result["disease_name"],
            is_healthy=result["is_healthy"],
            confidence_score=result["confidence_score"],
            model_version=result["model_version"],
            created_at=now,
        )
        db.add(record)
        db.commit()
        result["id"] = record.id

    return PredictionResponse(**result)
