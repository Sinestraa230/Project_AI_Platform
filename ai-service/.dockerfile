FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Thư viện hệ thống mà OpenCV (ultralytics dùng) cần để chạy
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Cài PyTorch bản CPU trước (nhẹ hơn nhiều so với bản CUDA mặc định, ~200MB thay vì ~2GB).
# Nếu server có GPU thì xóa dòng này.
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt

COPY . .

# Chạy bằng user thường, không dùng root
RUN useradd --create-home appuser && chown -R appuser /app
USER appuser

EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]