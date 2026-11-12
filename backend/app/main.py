"""FastAPI app — Project AI Platform backend (gộp AI service).

Chạy từ thư mục backend/:
    uvicorn app.main:app --reload
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import routes_crop, routes_history, routes_model, routes_predict
from .config import APP_ENV, CORS_ORIGINS
from .database import init_db
from .services.ai.model_loader import get_mapping, get_model, get_model_info, get_model_version


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Khởi tạo DB (tạo bảng nếu chưa có) và load model trước khi nhận request
    init_db()
    get_model()
    get_mapping()
    get_model_info()
    yield


app = FastAPI(
    title="Project AI Platform Backend",
    description="Nhận ảnh lá cây -> trả về bệnh + độ tin cậy (category_id, "
    "confidence_score, created_at...).",
    version="1.0.0",
    lifespan=lifespan,
)

# Thu hẹp allow_origins về domain frontend khi lên production
allowed_origins = CORS_ORIGINS if CORS_ORIGINS and CORS_ORIGINS != ["*"] else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes_predict.router)
app.include_router(routes_history.router)
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