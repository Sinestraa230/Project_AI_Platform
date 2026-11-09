"""Test API backend. Chạy từ backend/:  python -m pytest -q

Cần model trong ai_artifacts/ (test tự skip nếu thiếu).
"""
import io
import os

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.config import AI_MODEL_PATH, MAX_UPLOAD_BYTES
from app.services.ai.predictor import _split

pytestmark = pytest.mark.skipif(
    not os.path.exists(AI_MODEL_PATH), reason="Chưa có model trong ai_artifacts/"
)


def _img(fmt="JPEG", mode="RGB", size=(320, 240)) -> bytes:
    b = io.BytesIO()
    Image.new(mode, size, (60, 150, 60) if mode == "RGB" else None).save(b, fmt)
    return b.getvalue()


@pytest.fixture(scope="module")
def client():
    from app.main import app

    with TestClient(app) as c:
        yield c


def test_health(client):
    assert client.get("/health").json()["status"] == "ok"


@pytest.mark.parametrize("fmt,mode,ctype", [("JPEG", "RGB", "image/jpeg"), ("PNG", "RGBA", "image/png")])
def test_predict_ok(client, fmt, mode, ctype):
    r = client.post("/api/predict", files={"file": ("x", _img(fmt, mode), ctype)})
    assert r.status_code == 200
    d = r.json()
    assert len(d["top_k"]) == 5
    assert d["confidence_score"] == d["top_k"][0]["confidence_score"]
    assert len(str(d["confidence_score"]).split(".")[-1]) <= 4  # đã làm tròn gọn
    assert isinstance(d["is_confident"], bool)
    assert d["plant_name"] and d["disease_name"]


def test_empty_file(client):
    r = client.post("/api/predict", files={"file": ("e.jpg", b"", "image/jpeg")})
    assert r.status_code == 400


def test_not_an_image(client):
    r = client.post("/api/predict", files={"file": ("a.jpg", b"hello", "image/jpeg")})
    assert r.status_code == 400
    assert "BytesIO" not in r.text  # không lộ lỗi nội bộ


def test_wrong_content_type(client):
    r = client.post("/api/predict", files={"file": ("a.txt", b"hello", "text/plain")})
    assert r.status_code == 415


def test_too_large(client):
    r = client.post(
        "/api/predict",
        files={"file": ("big.jpg", b"0" * (MAX_UPLOAD_BYTES + 1), "image/jpeg")},
    )
    assert r.status_code == 413


def test_split_names():
    assert _split("Corn_(maize)___Common_rust_") == ("Corn (maize)", "Common rust")
    assert _split("Apple___healthy") == ("Apple", "healthy")


def test_history_after_predict(client):
    r = client.post("/api/predict", files={"file": ("x.jpg", _img(), "image/jpeg")})
    new_id = r.json()["id"]
    assert new_id is not None

    page = client.get("/api/history?limit=5").json()
    assert page["total"] >= 1
    first = page["items"][0]
    assert first["id"] == new_id  # mới nhất đứng đầu
    assert first["created_at"].endswith("+00:00")
    assert first["plant_name"] and first["disease_name"]

    assert client.delete(f"/api/history/{new_id}").status_code == 204
    assert client.delete(f"/api/history/{new_id}").status_code == 404


def test_model_endpoint(client):
    body = client.get("/api/model").json()
    assert body["version"]
    assert 0 < body["confidence_threshold"] <= 1
    if body["metrics"]:  # chỉ có khi model train bằng notebook mới
        assert "per_class" not in body["metrics"]
        assert "per_class" in client.get("/api/model?per_class=true").json()["metrics"]
