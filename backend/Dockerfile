FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    APP_ENV=production \
    PORT=8000

WORKDIR /app

# Cài dependency trước để cache tốt hơn
COPY requirements.txt ./requirements.txt
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy source code
COPY . .

# Tạo user non-root cho production
RUN useradd --create-home --shell /bin/bash appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]