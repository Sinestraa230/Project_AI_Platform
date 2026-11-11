"""Thư viện bệnh và danh sách cây trồng — trang Thư viện bệnh của FE đọc từ đây."""
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from ..schemas.library import CropList, DiseaseInfo, DiseaseList
from ..services import crop_service

router = APIRouter(prefix="/api", tags=["library"])


@router.get("/diseases", response_model=DiseaseList)
def list_diseases(
    group: Optional[str] = Query(None, description="fungal | bacterial | viral | pest | healthy"),
    plant: Optional[str] = Query(None, description="Tên cây, VD Tomato hoặc Cà chua"),
    q: Optional[str] = Query(None, description="Tìm theo tên bệnh / tên cây (không cần dấu)"),
    include_healthy: bool = True,
) -> DiseaseList:
    """Các lớp model nhận diện được, kèm triệu chứng và cách phòng ngừa."""
    items = crop_service.get_diseases(group, plant, q, include_healthy)
    return DiseaseList(total=len(items), groups=crop_service.get_groups(), items=items)


@router.get("/diseases/{category_id}", response_model=DiseaseInfo)
def get_disease(category_id: int) -> DiseaseInfo:
    """category_id là trường cùng tên trong kết quả /api/detections và /api/history."""
    item = crop_service.get_disease(category_id)
    if item is None:
        raise HTTPException(404, "Không tìm thấy bệnh.")
    return DiseaseInfo(**item)


@router.get("/crops", response_model=CropList)
def list_crops() -> CropList:
    """Các loại cây model hỗ trợ."""
    items = crop_service.get_crops()
    return CropList(total=len(items), items=items)
