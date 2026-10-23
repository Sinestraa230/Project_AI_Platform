"""FastAPI app — Project AI Platform backend (gộp AI service).

Chạy từ thư mục backend/:
    uvicorn app.main:app --reload
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import routes_crop, routes_predict
from .config import AI_MODEL_VERSION, APP_ENV
from .database import init_db
from .services.ai.model_loader import get_mapping, get_model


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Khởi tạo DB (tạo bảng nếu chưa có) và load model trước khi nhận request
    init_db()
    get_model()
    get_mapping()
    yield


app = FastAPI(
    title="Project AI Platform Backend",
    description="Nhận ảnh lá cây -> trả về bệnh + độ tin cậy (category_id, "
    "confidence_score, created_at...).",
    version=AI_MODEL_VERSION,
    lifespan=lifespan,
)

# Thu hẹp allow_origins về domain frontend khi lên production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes_predict.router)
app.include_router(routes_crop.router)


@app.get("/health")
def health():
    return {"status": "ok", "model_version": AI_MODEL_VERSION, "env": APP_ENV}