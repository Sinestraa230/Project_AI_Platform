"""Điểm vào cho Vercel (Python runtime tìm biến `app` trong index.py ở gốc project).

Chạy local vẫn dùng:  uvicorn app.main:app --reload
"""
from app.main import app  # noqa: F401
