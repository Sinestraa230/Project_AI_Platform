"""Endpoint nhận ảnh -> dự đoán -> trả JSON + (tùy chọn) lưu DB."""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..config import SAVE_TO_DB
from ..database import get_db
from ..models.detection import DetectionRecord
from ..schemas.predict import PredictionResponse
from ..services.ai.predictor import predict

router = APIRouter(prefix="/api", tags=["predict"])


@router.post("/predict", response_model=PredictionResponse)
async def predict_endpoint(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> PredictionResponse:
    # 1. Đọc ảnh từ request
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="File rỗng.")

    # 2. Dự đoán (preprocess + inference) — lỗi ảnh/thiếu model ném ở đây
    try:
        result = predict(raw)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Lỗi khi dự đoán: {exc}")

    # 3. Gắn thời gian tạo (timestamp ISO 8601 UTC)
    result["created_at"] = datetime.now(timezone.utc).isoformat(timespec="seconds")

    # 4. (Tùy chọn) lưu lịch sử vào DB — bật SAVE_TO_DB=true
    if SAVE_TO_DB:
        db.add(
            DetectionRecord(
                category_id=result["category_id"],
                class_name=result["class_name"],
                disease_name=result["disease_name"],
                is_healthy=result["is_healthy"],
                confidence_score=result["confidence_score"],
                model_version=result["model_version"],
            )
        )
        db.commit()

    return PredictionResponse(**result)