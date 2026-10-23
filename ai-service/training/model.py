"""Kiến trúc model — EfficientNetB3 transfer learning."""
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import EfficientNetB3

from transforms import data_augmentation


def build_model(img_size: int, num_classes: int, dropout: float = 0.3) -> keras.Model:
    base = EfficientNetB3(
        weights="imagenet",
        include_top=False,
        input_shape=(img_size, img_size, 3),
    )
    base.trainable = False  # đóng băng — mở khóa ở bước fine-tune

    inputs = keras.Input(shape=(img_size, img_size, 3))
    x = data_augmentation()(inputs)
    x = base(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(dropout)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    return keras.Model(inputs, outputs)