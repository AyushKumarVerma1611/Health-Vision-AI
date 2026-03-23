import io
import numpy as np
from PIL import Image


def decode_image(image_bytes: bytes) -> Image.Image:
    """Convert raw bytes to a PIL Image object."""
    return Image.open(io.BytesIO(image_bytes)).convert("RGB")


def preprocess_image(image_bytes: bytes, target_size: tuple = (224, 224)) -> np.ndarray:
    """
    Preprocess an image for model input.
    1. Open image from bytes
    2. Resize to target size
    3. Convert to RGB
    4. Normalize pixel values to [0, 1]
    5. Return as numpy array with batch dimension
    """
    img = decode_image(image_bytes)
    img = img.resize(target_size, Image.Resampling.LANCZOS)
    img_array = np.array(img, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)
    return img_array


def preprocess_for_display(image_bytes: bytes, target_size: tuple = (224, 224)) -> np.ndarray:
    """Preprocess image for display/heatmap overlay (no batch dimension, uint8)."""
    img = decode_image(image_bytes)
    img = img.resize(target_size, Image.Resampling.LANCZOS)
    return np.array(img, dtype=np.uint8)
