"""Data augmentation — chống overfitting, tăng độ bền ngoài thực tế."""
from tensorflow import keras
from tensorflow.keras import layers


def data_augmentation() -> keras.Sequential:
    return keras.Sequential([
        layers.RandomFlip("horizontal_and_vertical"),
        layers.RandomRotation(0.15),
        layers.RandomZoom(0.15),
        layers.RandomContrast(0.1),
    ])