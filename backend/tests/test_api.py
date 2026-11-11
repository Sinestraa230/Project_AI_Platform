"""Test API backend. Chạy từ backend/:  python -m pytest -q

Model chạy trên trình duyệt nên backend không cần model: mọi test chạy được ở CI.
"""
import io
import json

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.config import MAX_UPLOAD_BYTES
from app.services.model_meta import split_class_name as _split

DISEASED = 1  # Apple___Black_rot
HEALTHY = 3  # Apple___healthy


def _img(fmt="JPEG", mode="RGB", size=(320, 240)) -> bytes:
    b = io.BytesIO()
    Image.new(mode, size, (60, 150, 60) if mode == "RGB" else None).save(b, fmt)
    return b.getvalue()


def _detect(client, category_id=DISEASED, score=0.9825, file=None, top_k=None, version="test-v1",
            ctype="image/jpeg"):
    data = {"category_id": str(category_id), "confidence_score": str(score), "model_version": version}
    if top_k is not None:
        data["top_k"] = top_k if isinstance(top_k, str) else json.dumps(top_k)
    files = {"file": ("x.jpg", file, ctype)} if file is not None else None
    return client.post("/api/detections", data=data, files=files)


@pytest.fixture(scope="module")
def client():
    from app.main import app

    with TestClient(app) as c:
        yield c


def test_health(client):
    h = client.get("/health").json()
    assert h["status"] == "ok" and h["model_version"]


def test_detection_ok(client):
    top_k = [{"category_id": DISEASED, "confidence_score": 0.98251},
             {"category_id": 0, "confidence_score": 0.0108}]
    r = _detect(client, top_k=top_k, file=_img())
    assert r.status_code == 201
    d = r.json()
    # Tên lớp/cây/bệnh do server suy ra từ category_id, không lấy từ client
    assert d["class_name"] == "Apple___Black_rot"
    assert (d["plant_name"], d["disease_name"]) == ("Apple", "Black rot")
    assert d["is_healthy"] is False and d["is_confident"] is True
    assert [t["class_name"] for t in d["top_k"]] == ["Apple___Black_rot", "Apple___Apple_scab"]
    assert d["top_k"][0]["confidence_score"] == 0.9825  # làm tròn 4 chữ số
    assert d["id"] and d["image_url"].startswith("/api/uploads/")
    assert d["created_at"].endswith("+00:00")


def test_detection_without_image_and_low_confidence(client):
    d = _detect(client, category_id=HEALTHY, score=0.31).json()
    assert d["is_healthy"] is True and d["is_confident"] is False
    assert d["image_url"] is None and d["top_k"][0]["category_id"] == HEALTHY


@pytest.mark.parametrize("kwargs", [
    {"category_id": 38}, {"category_id": -1}, {"score": 1.5}, {"score": -0.1},
    {"top_k": "khong-phai-json"}, {"top_k": [{"category_id": 99, "confidence_score": 0.1}]},
    {"top_k": [{"category_id": 1}]}, {"version": "x" * 51},
])
def test_detection_rejects_bad_input(client, kwargs):
    assert _detect(client, **kwargs).status_code == 422


def test_detection_missing_fields(client):
    assert client.post("/api/detections", data={"category_id": "1"}).status_code == 422


def test_not_an_image(client):
    r = _detect(client, file=b"hello")
    assert r.status_code == 400
    assert "Traceback" not in r.text  # không lộ lỗi nội bộ


def test_wrong_content_type(client):
    assert _detect(client, file=b"hello", ctype="text/plain").status_code == 415


def test_too_large(client):
    assert _detect(client, file=b"0" * (MAX_UPLOAD_BYTES + 1)).status_code == 413


def test_split_names():
    assert _split("Corn_(maize)___Common_rust_") == ("Corn (maize)", "Common rust")
    assert _split("Apple___healthy") == ("Apple", "healthy")


def test_history_after_detection(client):
    new_id = _detect(client).json()["id"]

    page = client.get("/api/history?limit=5").json()
    assert page["total"] >= 1
    first = page["items"][0]
    assert first["id"] == new_id  # mới nhất đứng đầu
    assert first["created_at"].endswith("+00:00")
    assert first["plant_name"] and first["disease_name"]

    assert client.delete(f"/api/history/{new_id}").status_code == 204
    assert client.delete(f"/api/history/{new_id}").status_code == 404


@pytest.mark.parametrize("storage", ["disk", "db"])
def test_image_saved_and_served(client, monkeypatch, storage):
    monkeypatch.setattr("app.config.IMAGE_STORAGE", storage)
    new = _detect(client, file=_img(size=(3000, 1500))).json()
    url = new["image_url"]
    assert url.startswith("/api/uploads/") and url.endswith(".jpg")

    img = client.get(url)
    assert img.status_code == 200
    assert img.headers["content-type"] == "image/jpeg"
    assert Image.open(io.BytesIO(img.content)).size == (1024, 512)  # đã thu nhỏ, giữ tỉ lệ

    assert client.get("/api/history?limit=1").json()["items"][0]["image_url"] == url

    # Xoá bản ghi -> file ảnh cũng mất
    assert client.delete(f"/api/history/{new['id']}").status_code == 204
    assert client.get(url).status_code == 404


def test_old_db_gets_image_column(tmp_path):
    """DB tạo từ bản cũ (chưa có cột image_path) được tự thêm cột khi khởi động."""
    from sqlalchemy import create_engine, inspect, text

    from app import database

    old = create_engine(f"sqlite:///{tmp_path / 'old.db'}")
    with old.begin() as conn:
        conn.execute(text("CREATE TABLE detections (id INTEGER PRIMARY KEY, class_name VARCHAR)"))
        conn.execute(text("INSERT INTO detections (class_name) VALUES ('Apple___healthy')"))

    real = database.engine
    database.engine = old
    try:
        database._add_missing_columns()
        database._add_missing_columns()  # chạy lại không lỗi
    finally:
        database.engine = real
    assert "image_path" in {c["name"] for c in inspect(old).get_columns("detections")}
    with old.connect() as conn:
        assert conn.execute(text("SELECT image_path FROM detections")).scalar() is None


def test_disease_library(client):
    body = client.get("/api/diseases").json()
    assert body["total"] == len(body["items"]) == 38
    assert [d["category_id"] for d in body["items"]] == list(range(38))
    for d in body["items"]:  # lớp nào cũng phải có mô tả tiếng Việt
        assert d["group"] != "other", d["class_name"]
        assert d["name_vi"] and d["symptoms"] and d["prevention"] and d["plant_name_vi"]
        assert d["group"] in body["groups"]
        assert d["is_healthy"] == (d["group"] == "healthy")

    viral = client.get("/api/diseases?group=viral").json()["items"]
    assert {d["class_name"] for d in viral} == {
        "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato___Tomato_mosaic_virus"}

    # Tìm không dấu, lọc theo tên cây tiếng Việt
    assert client.get("/api/diseases?q=moc suong").json()["total"] == 2
    tomato = client.get("/api/diseases?plant=Cà chua&include_healthy=false").json()
    assert tomato["total"] == 9 and all(d["plant"] == "Tomato" for d in tomato["items"])
    assert client.get("/api/diseases?q=khongcobenhnay").json()["total"] == 0


def test_disease_detail_matches_prediction(client):
    r = _detect(client).json()
    d = client.get(f"/api/diseases/{r['category_id']}").json()
    assert d["class_name"] == r["class_name"]
    assert d["plant_name"] == r["plant_name"] and d["disease_name"] == r["disease_name"]
    client.delete(f"/api/history/{r['id']}")

    assert client.get("/api/diseases/999").status_code == 404


def test_crops(client):
    body = client.get("/api/crops").json()
    assert body["total"] == 14
    by_plant = {c["plant"]: c for c in body["items"]}
    assert by_plant["Tomato"]["disease_count"] == 9
    assert by_plant["Tomato"]["plant_name_vi"] == "Cà chua"
    assert by_plant["Blueberry"]["disease_count"] == 0  # chỉ có lớp healthy
    assert by_plant["Orange"]["has_healthy_class"] is False
    assert sum(c["disease_count"] for c in body["items"]) == 26


def test_stats(client):
    before = client.get("/api/stats").json()
    new = _detect(client).json()

    s = client.get("/api/stats?recent=3").json()
    assert s["total"] == before["total"] + 1
    assert s["today"] == before["today"] + 1
    assert s["diseased"] + s["healthy"] == s["total"]
    assert s["recent"][0]["id"] == new["id"]  # mới nhất đứng đầu
    assert len(s["recent"]) <= 3
    assert sum(d["count"] for d in s["top_diseases"]) <= s["diseased"]
    if not new["is_healthy"]:
        assert s["distinct_diseases"] >= 1
        assert new["class_name"] in [d["class_name"] for d in s["top_diseases"]]

    # Múi giờ lệch xa: "hôm nay" không được vượt quá tổng
    assert client.get("/api/stats?tz_offset_minutes=-720").json()["today"] <= s["total"]
    assert client.get("/api/stats?tz_offset_minutes=9999").status_code == 422

    client.delete(f"/api/history/{new['id']}")
    assert client.get("/api/stats").json()["total"] == before["total"]


def test_model_endpoint(client):
    body = client.get("/api/model").json()
    assert body["version"]
    assert 0 < body["confidence_threshold"] <= 1
    if body["metrics"]:  # chỉ có khi model train bằng notebook mới
        assert "per_class" not in body["metrics"]
        assert "per_class" in client.get("/api/model?per_class=true").json()["metrics"]
