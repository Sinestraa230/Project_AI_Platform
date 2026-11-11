"""Thư viện bệnh + danh sách cây trồng — đúng các lớp mà model nhận diện được.

Danh sách lớp lấy từ app/data/model/class_mapping.json (đi theo model); tên tiếng Việt, triệu chứng,
cách phòng ngừa lấy từ app/data/diseases.json.
"""
import json
import unicodedata
from functools import lru_cache
from pathlib import Path
from typing import Optional

from .model_meta import get_mapping
from .model_meta import split_class_name as _split

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "diseases.json"


@lru_cache(maxsize=1)
def _data() -> dict:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _fold(text: str) -> str:
    """Bỏ dấu + chữ thường để tìm kiếm: 'Cà chua' -> 'ca chua'."""
    text = unicodedata.normalize("NFD", text.replace("đ", "d").replace("Đ", "D"))
    return "".join(c for c in text if unicodedata.category(c) != "Mn").lower()


def _build(category_id: int, class_name: str) -> dict:
    data = _data()
    plant_key = class_name.partition("___")[0]
    plant, disease = _split(class_name)
    plant_vi = data["plants"].get(plant_key, plant)
    is_healthy = "healthy" in class_name.lower()

    if is_healthy:
        info = {"name_vi": f"{plant_vi} khỏe mạnh", "group": "healthy", "pathogen": None,
                **data["healthy"]}
    else:
        # Model mới có lớp chưa kịp viết mô tả -> vẫn trả về, dùng tên tiếng Anh
        info = data["diseases"].get(class_name) or {
            "name_vi": disease, "group": "other", "pathogen": None,
            "symptoms": "", "prevention": "",
        }

    return {
        "category_id": category_id,
        "class_name": class_name,
        "plant": plant_key,
        "plant_name": plant,
        "plant_name_vi": plant_vi,
        "disease_name": disease,
        "name_vi": info["name_vi"],
        "group": info["group"],
        "group_name": data["groups"].get(info["group"], info["group"]),
        "is_healthy": is_healthy,
        "pathogen": info.get("pathogen"),
        "symptoms": info["symptoms"],
        "prevention": info["prevention"],
    }


def all_diseases() -> list[dict]:
    """Mọi lớp của model, theo thứ tự category_id."""
    id_to_class = get_mapping()["id_to_class"]
    return [_build(int(i), id_to_class[i]) for i in sorted(id_to_class, key=int)]


def get_diseases(
    group: Optional[str] = None,
    plant: Optional[str] = None,
    q: Optional[str] = None,
    include_healthy: bool = True,
) -> list[dict]:
    items = all_diseases()
    if not include_healthy:
        items = [d for d in items if not d["is_healthy"]]
    if group:
        items = [d for d in items if d["group"] == group]
    if plant:
        p = _fold(plant)
        items = [d for d in items
                 if p in (_fold(d["plant"]), _fold(d["plant_name"]), _fold(d["plant_name_vi"]))]
    if q:
        needle = _fold(q)
        fields = ("name_vi", "disease_name", "plant_name", "plant_name_vi", "class_name")
        items = [d for d in items if any(needle in _fold(d[f]) for f in fields)]
    return items


def get_disease(category_id: int) -> Optional[dict]:
    class_name = get_mapping()["id_to_class"].get(str(category_id))
    return _build(category_id, class_name) if class_name else None


def get_groups() -> dict:
    return _data()["groups"]


def get_crops() -> list[dict]:
    """Các loại cây model hỗ trợ, kèm số bệnh nhận diện được trên mỗi cây."""
    crops: dict[str, dict] = {}
    for d in all_diseases():
        crop = crops.setdefault(d["plant"], {
            "plant": d["plant"],
            "plant_name": d["plant_name"],
            "plant_name_vi": d["plant_name_vi"],
            "disease_count": 0,
            "has_healthy_class": False,
        })
        if d["is_healthy"]:
            crop["has_healthy_class"] = True
        else:
            crop["disease_count"] += 1
    return list(crops.values())
