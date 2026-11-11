"""Tải model + class mapping từ Hugging Face Hub về backend/ai_artifacts/.

Notebook Kaggle upload model lên HF (cell 9). Module này lấy về đúng chỗ
backend đang đọc (AI_MODEL_PATH, AI_CLASS_MAPPING_PATH).
"""
import os
import shutil

from ...config import (
    AI_CLASS_MAPPING_PATH,
    AI_METRICS_PATH,
    AI_MODEL_INFO_PATH,
    AI_MODEL_PATH,
    HF_REPO_ID,
    HF_REVISION,
    HF_TOKEN,
)


def _targets() -> dict[str, str]:
    """Tên file trên HF -> đường dẫn đích ở máy local."""
    return {
        "plant_disease_model.keras": AI_MODEL_PATH,
        "class_mapping.json": AI_CLASS_MAPPING_PATH,
    }


# Không bắt buộc: model train trước khi có các file này thì không có
OPTIONAL = {"model_info.json": AI_MODEL_INFO_PATH, "metrics.json": AI_METRICS_PATH}


def artifacts_present() -> bool:
    return all(os.path.exists(p) for p in _targets().values())


def download_artifacts(force: bool = False) -> list[str]:
    """Tải các file còn thiếu (hoặc tất cả nếu force). Trả danh sách file đã tải."""
    if not HF_REPO_ID:
        raise RuntimeError("Chưa đặt HF_REPO_ID trong backend/.env — không biết tải model từ đâu.")

    try:
        from huggingface_hub import hf_hub_download
        from huggingface_hub.utils import (
            EntryNotFoundError,
            GatedRepoError,
            RepositoryNotFoundError,
        )
    except ImportError as exc:
        raise RuntimeError("Thiếu thư viện: pip install huggingface_hub") from exc

    downloaded = []
    files = [(n, d, False) for n, d in _targets().items()]
    files += [(n, d, True) for n, d in OPTIONAL.items()]
    for filename, dest, optional in files:
        # model_info/metrics đi theo model: tải lại model thì tải lại luôn
        if os.path.exists(dest) and not force and not (optional and downloaded):
            continue
        try:
            cached = hf_hub_download(
                repo_id=HF_REPO_ID,
                filename=filename,
                revision=HF_REVISION or None,
                token=HF_TOKEN or None,
            )
        except EntryNotFoundError:
            if optional:
                # Bản trên HF không có model_info -> bỏ file cũ để khỏi báo sai phiên bản
                if os.path.exists(dest):
                    os.remove(dest)
                continue
            raise
        except (RepositoryNotFoundError, GatedRepoError) as exc:
            raise RuntimeError(
                f"Không truy cập được repo HF '{HF_REPO_ID}'. Repo đang private: "
                "kiểm tra HF_TOKEN (loại Read) và bạn đã được mời vào repo chưa."
            ) from exc
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        shutil.copyfile(cached, dest)
        downloaded.append(dest)
    return downloaded
