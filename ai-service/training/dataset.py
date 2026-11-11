"""Nạp dữ liệu ảnh từ thư mục lớp -> tf.data.Dataset + class mapping."""
import json
import os

import tensorflow as tf
from tensorflow import keras


def _build_dataset(dir_path: str, img_size: int, batch_size: int,
                   shuffle: bool, seed=None) -> tf.data.Dataset:
    ds = keras.utils.image_dataset_from_directory(
        dir_path,
        image_size=(img_size, img_size),
        batch_size=batch_size,
        label_mode="int",  # label = category_id (int)
        shuffle=shuffle,
        seed=seed,
    )

    def normalize(x, y):
        return tf.cast(x, tf.float32) / 255.0, y

    return ds.map(normalize, num_parallel_calls=tf.data.AUTOTUNE).prefetch(
        tf.data.AUTOTUNE
    )


def get_class_names(train_dir: str) -> list:
    """Tên lớp theo thứ tự category_id (khớp image_dataset_from_directory)."""
    return sorted(os.listdir(train_dir))


def save_mapping(class_names: list, path: str) -> dict:
    """Lưu class_mapping.json — BẮT BUỘC dùng chung cho backend."""
    mapping = {
        "class_to_id": {name: i for i, name in enumerate(class_names)},
        "id_to_class": {str(i): name for i, name in enumerate(class_names)},
    }
    with open(path, "w", encoding="utf-8") as f:
        json.dump(mapping, f, indent=2, ensure_ascii=False)
    return mapping


def build_datasets(cfg: dict):
    """Trả (train_ds, valid_ds, test_ds, class_names) theo config.yaml."""
    data = cfg["data"]
    model_cfg = cfg["model"]

    def resolve(key: str) -> str:
        path = data[key]
        if data.get("base_dir"):
            return os.path.join(data["base_dir"], os.path.basename(path))
        return path

    train_dir, valid_dir, test_dir = resolve("train_dir"), resolve("valid_dir"), resolve("test_dir")
    img_size, batch_size = model_cfg["img_size"], model_cfg["batch_size"]
    seed = cfg["training"].get("seed")

    train_ds = _build_dataset(train_dir, img_size, batch_size, shuffle=True, seed=seed)
    valid_ds = _build_dataset(valid_dir, img_size, batch_size, shuffle=False)
    test_ds = _build_dataset(test_dir, img_size, batch_size, shuffle=False)
    return train_ds, valid_ds, test_ds, get_class_names(train_dir)