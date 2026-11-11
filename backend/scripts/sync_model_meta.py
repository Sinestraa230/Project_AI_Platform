"""Đổi phiên bản model AI mà cả frontend lẫn backend dùng.

Tải class_mapping.json, model_info.json, metrics.json của 1 phiên bản (tag) trên
Hugging Face về app/data/model/. Commit 3 file đó -> lần deploy sau:
  - backend (/health, /api/model, thư viện bệnh) báo đúng phiên bản mới;
  - frontend build tải đúng file .tflite có tag = model_info.json["version"].

Chạy từ thư mục backend/ (HF_TOKEN loại Read đặt trong .env ở gốc project — chỉ cần khi repo model private):
    python scripts/sync_model_meta.py                 # bản mới nhất trên nhánh main
    python scripts/sync_model_meta.py --tag efficientnetb3-20261109-1859
"""
import argparse
import json
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))  # cho phép import app

from app.config import HF_REPO_ID, HF_TOKEN  # noqa: E402
from app.services.model_meta import META_DIR  # noqa: E402

FILES = ["class_mapping.json", "model_info.json", "metrics.json"]


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--tag", help="tag/phiên bản trên HF (mặc định: main)")
    args = parser.parse_args()

    from huggingface_hub import hf_hub_download, list_repo_refs

    revision = args.tag or "main"
    print(f"Đang tải metadata từ {HF_REPO_ID}@{revision} ...")
    tmp = {}
    for name in FILES:
        tmp[name] = hf_hub_download(HF_REPO_ID, name, revision=revision, token=HF_TOKEN or None)

    info = json.loads(Path(tmp["model_info.json"]).read_text(encoding="utf-8"))
    version = info.get("version")
    tags = {t.name for t in list_repo_refs(HF_REPO_ID, token=HF_TOKEN or None).tags}
    if version not in tags:
        sys.exit(
            f"Lỗi: model_info.json ghi version '{version}' nhưng repo không có tag đó -> "
            "frontend sẽ không tải được model. Kiểm tra lại notebook đã gắn tag chưa."
        )

    META_DIR.mkdir(parents=True, exist_ok=True)
    for name, src in tmp.items():
        shutil.copyfile(src, META_DIR / name)
    print(f"Xong: app/data/model/ đang ở phiên bản {version}. Commit 3 file này để deploy.")


if __name__ == "__main__":
    main()
