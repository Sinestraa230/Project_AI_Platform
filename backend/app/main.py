"""FastAPI app — Project AI Platform backend.

Model AI chạy trên trình duyệt (frontend); backend lo đăng nhập, lưu lịch sử,
thống kê, thư viện bệnh. Chạy từ thư mục backend/:
    uvicorn app.main:app --reload
Trên Vercel: index.py import `app` từ module này.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware

from .api import (
    routes_auth,
    routes_crop,
    routes_detections,
    routes_history,
    routes_model,
    routes_stats,
)
from .config import APP_ENV, CORS_ORIGINS
from .database import init_db
from .services import image_store
from .services.model_meta import get_mapping, get_model_info, get_model_version


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Tạo bảng nếu chưa có + đọc sẵn metadata model (Vercel: chạy mỗi lần khởi động lạnh)
    init_db()
    get_mapping()
    get_model_info()
    yield


app = FastAPI(
    title="Project AI Platform Backend",
    description="Lưu và thống kê kết quả chẩn đoán bệnh lá cây (model chạy trên "
    "trình duyệt), đăng nhập, thư viện bệnh.",
    version="1.0.0",
    lifespan=lifespan,
)

# Production: đặt CORS_ORIGINS=<domain frontend> (xem .env.example ở gốc project)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

image_store.ensure_dir()


@app.get(image_store.URL_PREFIX + "/{name}", tags=["history"])
def get_upload(name: str):
    """Ảnh đã chẩn đoán (từ ổ đĩa hoặc DB tuỳ IMAGE_STORAGE)."""
    data = image_store.load_image(name)
    if data is None:
        raise HTTPException(404, "Không tìm thấy ảnh.")
    # Tên file là uuid, nội dung không bao giờ đổi -> cho trình duyệt cache lâu
    return Response(data, media_type="image/jpeg",
                    headers={"Cache-Control": "public, max-age=31536000, immutable"})


app.include_router(routes_auth.router)
app.include_router(routes_detections.router)
app.include_router(routes_history.router)
app.include_router(routes_stats.router)
app.include_router(routes_model.router)
app.include_router(routes_crop.router)


@app.get("/health")
def health():
    info = get_model_info()
    return {
        "status": "ok",
        "env": APP_ENV,
        "model_version": get_model_version(),
        "trained_at": info.get("trained_at"),
        "eval_accuracy": info.get("eval_accuracy"),
    }