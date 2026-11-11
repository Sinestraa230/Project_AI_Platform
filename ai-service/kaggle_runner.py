"""kaggle_runner.py — điều khiển kernel Kaggle từ máy local.

Cách dùng:
  # Lần đầu: push notebook lên Kaggle, chờ chạy xong, tải output về
  python ai-service/kaggle_runner.py --kernel <username>/<slug>

  # Kernel ĐÃ chạy trên Kaggle: chỉ chờ + tải output (không push lại)
  python ai-service/kaggle_runner.py --kernel <username>/<slug> --no-push

Đường dẫn mặc định tính theo vị trí file này (chạy từ thư mục nào cũng được):
  ai-service/kernel/        notebook + kernel-metadata.json
  ai-service/kaggle_output/ output tải từ Kaggle (chỉ giữ lại log)
  backend/ai_artifacts/     model + class_mapping.json cho backend
"""
import argparse
import os
import shutil
import subprocess
import sys
import time
import zipfile
from pathlib import Path

AI_DIR = Path(__file__).resolve().parent          # ai-service/
ROOT_DIR = AI_DIR.parent                           # gốc project
# File trùng với nội dung zip (đã giải nén sang backend) -> xoá sau khi tải để đỡ tốn ổ
DUPLICATE_OUTPUTS = ("plant_disease_best.keras", "plant_disease_model.keras",
                     "plant_disease_model.tflite", "class_mapping.json", "model_info.json",
                     "metrics.json", "history.json", "confusion_matrix.png",
                     "plant_disease_export.zip")


def run(cmd):
    print("$", " ".join(cmd))
    return subprocess.run(cmd, check=True)


def kernel_status(kernel):
    out = subprocess.run(
        ["kaggle", "kernels", "status", kernel],
        capture_output=True,
        text=True,
    )
    lines = [ln.strip() for ln in out.stdout.strip().splitlines() if ln.strip()]
    return lines[-1] if lines else "unknown"


def main():
    parser = argparse.ArgumentParser(description="Điều khiển kernel Kaggle từ máy local")
    parser.add_argument("--kernel", required=True,
                        help="kernel trên Kaggle: <username>/<slug>")
    parser.add_argument("--kernel-dir", default=str(AI_DIR / "kernel"),
                        help="thư mục chứa notebook .ipynb + kernel-metadata.json")
    parser.add_argument("--out", default=str(ROOT_DIR / "backend" / "ai_artifacts"),
                        help="thư mục đích cho model + class_mapping.json")
    parser.add_argument("--no-push", action="store_true",
                        help="không push, chỉ chờ + tải output của kernel đang chạy trên Kaggle")
    args = parser.parse_args()

    if shutil.which("kaggle") is None:
        sys.exit("Chưa cài kaggle CLI. Chạy: pip install kaggle")

    if not args.no_push:
        meta = os.path.join(args.kernel_dir, "kernel-metadata.json")
        if not os.path.exists(meta):
            sys.exit(f"Thiếu {meta}")
        print("==> [1/4] Push notebook lên Kaggle và kích hoạt chạy (GPU)...")
        run(["kaggle", "kernels", "push", "-p", args.kernel_dir])
    else:
        print("==> [1/4] Bỏ qua push (--no-push) — dùng kernel đang chạy trên Kaggle...")

    print("==> [2/4] Chờ kernel chạy xong (có thể mất 30-60 phút)...")
    while True:
        status = kernel_status(args.kernel)
        print("    Status:", status)
        low = status.lower()
        if "complete" in low:
            break
        if any(k in low for k in ("error", "failed", "cancel")):
            sys.exit(f"Kernel gặp lỗi: {status}")
        time.sleep(60)

    print("==> [3/4] Tải output từ Kaggle về máy...")
    out_dir = str(AI_DIR / "kaggle_output")
    os.makedirs(out_dir, exist_ok=True)
    run(["kaggle", "kernels", "output", args.kernel, "-p", out_dir])

    print("==> [4/4] Giải nén model + mapping vào backend/ai_artifacts/...")
    os.makedirs(args.out, exist_ok=True)
    zip_path = os.path.join(out_dir, "plant_disease_export.zip")
    if os.path.exists(zip_path):
        with zipfile.ZipFile(zip_path) as z:
            z.extractall(args.out)
        print("    Đã đặt:", args.out)
        for name in os.listdir(args.out):
            print("      -", name)
        for name in DUPLICATE_OUTPUTS:
            p = os.path.join(out_dir, name)
            if os.path.exists(p):
                os.remove(p)
        print(f"    Đã dọn file trùng trong {out_dir}/ (chỉ giữ log)")
    else:
        print(f"    Không thấy plant_disease_export.zip — xem thư mục {out_dir}/")

    print("XONG! Chạy backend: cd backend && uvicorn app.main:app --reload")


if __name__ == "__main__":
    main()
