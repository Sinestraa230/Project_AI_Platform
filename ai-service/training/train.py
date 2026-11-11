"""Pipeline huấn luyện hoàn chỉnh — chạy trên Kaggle (hoặc local có GPU).

Cách chạy (từ repo root):
    pip install tensorflow pyyaml
    python ai-service/training/train.py --config ai-service/training/config.yaml

Sau khi chạy xong, tải về plant_disease_export.zip (gồm model .keras,
.tflite, class_mapping.json) -> giải nén vào backend/ai_artifacts/.
"""
import argparse
import time
import zipfile

import tensorflow as tf
import yaml
from tensorflow import keras

# Cho phép chạy trực tiếp file lẫn dưới dạng module
try:
    from .dataset import build_datasets, save_mapping
    from .model import build_model
except ImportError:
    from dataset import build_datasets, save_mapping
    from model import build_model


def main(config_path: str) -> None:
    with open(config_path, "r", encoding="utf-8") as f:
        cfg = yaml.safe_load(f)

    print(">>> Nạp dữ liệu...")
    train_ds, valid_ds, test_ds, class_names = build_datasets(cfg)
    num_classes = len(class_names)
    print(f">>> {num_classes} lớp: {class_names[:5]}...")

    m_cfg, t_cfg, o_cfg = cfg["model"], cfg["training"], cfg["output"]

    # Lưu mapping sớm — backend cần file này đi kèm model
    save_mapping(class_names, o_cfg["mapping_path"])
    print(f">>> Đã lưu class_mapping.json ({o_cfg['mapping_path']})")

    print(">>> Xây dựng model EfficientNetB3...")
    model = build_model(m_cfg["img_size"], num_classes, m_cfg["dropout"])

    callbacks = [
        keras.callbacks.ModelCheckpoint(
            o_cfg["best_model_path"], monitor="val_accuracy", save_best_only=True
        ),
        keras.callbacks.EarlyStopping(
            monitor="val_accuracy", patience=3, restore_best_weights=True
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss", factor=0.2, patience=2, min_lr=1e-6
        ),
    ]

    # ---- Bước 1: huấn luyện head (backbone đóng băng) ----
    model.compile(
        optimizer=keras.optimizers.Adam(t_cfg["lr_head"]),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    t0 = time.time()
    print(f">>> Huấn luyện head {t_cfg['epochs_head']} epochs...")
    model.fit(train_ds, validation_data=valid_ds, epochs=t_cfg["epochs_head"],
              callbacks=callbacks)
    print(f"    xong sau {(time.time() - t0) / 60:.1f} phút")

    # ---- Bước 2: fine-tune (mở khóa backbone, lr nhỏ) ----
    base_model = model.get_layer("efficientnetb3")
    base_model.trainable = True
    for layer in base_model.layers[: t_cfg["freeze_first_n"]]:
        layer.trainable = False

    model.compile(
        optimizer=keras.optimizers.Adam(t_cfg["lr_finetune"]),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    t0 = time.time()
    print(f">>> Fine-tune {t_cfg['epochs_finetune']} epochs...")
    model.fit(train_ds, validation_data=valid_ds, epochs=t_cfg["epochs_finetune"],
              callbacks=callbacks)
    print(f"    xong sau {(time.time() - t0) / 60:.1f} phút")

    # ---- Xuất model ----
    best = keras.models.load_model(o_cfg["best_model_path"])
    print(f">>> Test accuracy: {best.evaluate(test_ds, verbose=0)[1]:.4f}")

    best.save(o_cfg["model_path"])  # .keras — dùng cho backend

    converter = tf.lite.TFLiteConverter.from_keras_model(best)
    with open(o_cfg["tflite_path"], "wb") as f:
        f.write(converter.convert())

    with zipfile.ZipFile(o_cfg["zip_path"], "w", zipfile.ZIP_DEFLATED) as z:
        z.write(o_cfg["model_path"], arcname="plant_disease_model.keras")
        z.write(o_cfg["tflite_path"], arcname="plant_disease_model.tflite")
        z.write(o_cfg["mapping_path"], arcname="class_mapping.json")

    print(f">>> XONG! Tải về: {o_cfg['zip_path']}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default="config.yaml")
    args = parser.parse_args()
    main(args.config)