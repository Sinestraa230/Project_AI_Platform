"""Endpoint nghiệp vụ crop (placeholder — điền dần theo yêu cầu team)."""
from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["crop"])


@router.get("/crops")
def list_crops():
    # TODO: tích hợp nghiệp vụ crop (SQLAlchemy queries) khi có yêu cầu
    return {"message": "Crop endpoints — sẽ bổ sung"}