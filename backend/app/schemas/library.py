"""Schema cho thư viện bệnh và danh sách cây trồng."""
from typing import List, Optional

from pydantic import BaseModel


class DiseaseInfo(BaseModel):
    category_id: int  # trùng category_id trong kết quả /api/detections
    class_name: str
    plant: str  # khoá gốc trong tên lớp, VD "Corn_(maize)"
    plant_name: str
    plant_name_vi: str
    disease_name: str
    name_vi: str
    group: str  # fungal | bacterial | viral | pest | healthy | other
    group_name: str
    is_healthy: bool
    pathogen: Optional[str] = None
    symptoms: str
    prevention: str


class DiseaseList(BaseModel):
    total: int
    groups: dict[str, str]  # mã nhóm -> tên tiếng Việt, để FE dựng bộ lọc
    items: List[DiseaseInfo]


class CropInfo(BaseModel):
    plant: str
    plant_name: str
    plant_name_vi: str
    disease_count: int
    has_healthy_class: bool


class CropList(BaseModel):
    total: int
    items: List[CropInfo]
