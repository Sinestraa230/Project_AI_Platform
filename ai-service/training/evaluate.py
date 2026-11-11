"""Đánh giá model trên test set: accuracy, precision, recall, F1, confusion matrix.

Cách chạy:
    python ai-service/training/evaluate.py --config ai-service/training/config.yaml
"""
import argparse

import numpy as np
import yaml
from sklearn.metrics import classification_report, confusion_matrix

try:
    from .dataset import build_datasets, get_class_names
except ImportError:
    from dataset import build_datasets, get_class_names


def main(config_path: str) -> None:
    with open(config_path, "r", encoding="utf-8") as f:
        cfg = yaml.safe_load(f)

    _, _, test_ds, class_names = build_datasets(cfg)
    num_classes = len(class_names)

    import tensorflow as tf

    model = tf.keras.models.load_model(cfg["output"]["model_path"])
    print(f">>> Test accuracy: {model.evaluate(test_ds, verbose=0)[1]:.4f}")

    y_true, y_pred = [], []
    for x, y in test_ds:
        y_pred.extend(np.argmax(model.predict(x, verbose=0), axis=1))
        y_true.extend(y.numpy())

    print(classification_report(y_true, y_pred, target_names=class_names,
                                zero_division=0, digits=4))

    cm = confusion_matrix(y_true, y_pred, labels=range(num_classes))
    np.save("confusion_matrix.npy", cm)
    print(">>> Đã lưu confusion_matrix.npy")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default="config.yaml")
    args = parser.parse_args()
    main(args.config)