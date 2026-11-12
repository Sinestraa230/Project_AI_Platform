# =====================================================================
# Image backend (FastAPI). Model AI chạy trên trình duyệt nên image này
# KHÔNG cần TensorFlow, chỉ đọc metadata model trong app/data/model/.
#
# Build:  docker build -t plant-backend ./backend
# Chạy:   docker run -p 8000:8000 -e DATABASE_URL=postgresql://... -e IMAGE_STORAGE=db plant-backend
# =====================================================================
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PORT=8000

WORKDIR /app

# Cài thư viện trước để tận dụng cache layer khi chỉ đổi code
COPY requirements.txt .
RUN pip install -r requirements.txt

# Code backend (tests/, .env, app.db... đã bị loại bởi .dockerignore)
COPY . .

# Chạy bằng user thường; uploads/ là nơi lưu ảnh khi IMAGE_STORAGE=disk
RUN useradd --system --uid 1000 --no-create-home appuser \
    && mkdir -p /app/uploads \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Container tự báo healthy khi /health trả 200 (compose / Render / Koyeb dùng tín hiệu này)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD python -c "import os, sys, urllib.request; \
        r = urllib.request.urlopen(f\"http://127.0.0.1:{os.environ.get('PORT', '8000')}/health\", timeout=4); \
        sys.exit(0 if r.status == 200 else 1)"

# ${PORT}: Render/Koyeb tự đặt biến này; mặc định 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
