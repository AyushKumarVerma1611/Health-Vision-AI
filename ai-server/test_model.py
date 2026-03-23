import numpy as np
import tensorflow as tf
from PIL import Image

model = tf.keras.models.load_model("models/brain_mri_model.h5")

# Test with a dummy black image
img_array_black = np.zeros((1, 224, 224, 3), dtype=np.float32)

# Test with a dummy white image
img_array_white = np.ones((1, 224, 224, 3), dtype=np.float32)

print("--- BLACK IMAGE ---")
preds_black = model.predict(img_array_black)
print(preds_black)

print("--- WHITE IMAGE ---")
preds_white = model.predict(img_array_white)
print(preds_white)

# Try loading the original model before git lfs ?
# Wait, did git lfs break the h5 files?
