"""
kaggle_runner.py — "trạm trung chuyển" giữa máy local và Kaggle.

Máy local CHỈ điều khiển: đẩy notebook lên Kaggle, chờ chạy xong (GPU cloud),
tải output về, giải nén model + mapping vào backend/ai_artifacts/.
"""
import argparse
import os
import shutil
import subprocess
import sys
import time
import zipfile


def run(cmd: list) -> subprocess.CompletedProcess:
    print("$", " ".join(cmd))
    return subprocess.run(cmd, check=True)


def kernel_status(kernel: str) -> str:
    out = subprocess.run(
        ["kaggle", "kernels", "status", kernel],
        capture_output=True,
        text=True,
    )
    lines = [ln.strip() for ln in out.stdout.strip().splitlines() if ln.strip()]
    return lines[-1] if lines else "unknown"


def main() -> None:
    parser = argparse.ArgumentParser(description="Điều khiển Kaggle từ máy local")
    parser.add_argument("--kernel", required=True,
                        help="kernel trên Kaggle, dạng: <username>/<slug>")
    parser.add_argument("--kernel-dir", default="kernel",
                        help="thư mục chứa notebook .ipynb + kernel-metadata.json")
    parser.add_argument("--out", default="backend/ai_artifacts",
                        help="thư mục đích cho model + class_mapping.json")
    args = parser.parse_args()

    if shutil.which("kaggle") is None:
        sys.exit("Chưa cài kaggle CLI. Chạy: pip install kaggle  (hoặc pipx install kaggle)")

    if not os.path.exists(os.path.join(args.kernel_dir, "kernel-metadata.json")):
        sys.exit(f"Thiếu {args.kernel_dir}/kernel-metadata.json")

    print("==> [1/4] Push notebook lên Kaggle và kích hoạt chạy (GPU)...")
    run(["kaggle", "kernels", "push", "-p", args.kernel_dir])

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
    out_dir = "kaggle_output"
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
    else:
        print(f"    Không thấy plant_disease_export.zip — hãy xem thư mục {out_dir}/")

    print("XONG! Giờ chạy backend: cd backend && uvicorn app.main:app --reload")


if __name__ == "__main__":
    main()
