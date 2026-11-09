"""Tải model đã train từ Hugging Face về backend/ai_artifacts/.

Chạy từ thư mục backend/ (cần HF_REPO_ID, HF_TOKEN trong backend/.env):
    python scripts/download_model.py          # chỉ tải file còn thiếu
    python scripts/download_model.py --force  # tải lại bản mới nhất
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))  # cho phép import app

from app.config import HF_REPO_ID, HF_REVISION  # noqa: E402
from app.services.ai.model_fetch import artifacts_present, download_artifacts  # noqa: E402


def main():
    parser = argparse.ArgumentParser(description="Tải model từ Hugging Face Hub")
    parser.add_argument("--force", action="store_true", help="tải lại dù đã có file")
    args = parser.parse_args()

    if artifacts_present() and not args.force:
        print("Đã có đủ model + class_mapping trong ai_artifacts/. Dùng --force để tải lại.")
        return

    print(f"Đang tải từ HF: {HF_REPO_ID} (revision: {HF_REVISION or 'main'})...")
    try:
        files = download_artifacts(force=args.force)
    except RuntimeError as exc:
        sys.exit(f"Lỗi: {exc}")
    for f in files:
        print("  -", f)
    print("Xong! Chạy backend: uvicorn app.main:app --reload")


if __name__ == "__main__":
    main()
