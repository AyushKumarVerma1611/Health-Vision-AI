import numpy as np
import tensorflow as tf

model = tf.keras.models.load_model("models/brain_mri_model.h5")

# Test with a dummy black image
img_array_black = np.zeros((1, 224, 224, 3), dtype=np.float32)

# Test with a dummy white image (255)
img_array_white = np.ones((1, 224, 224, 3), dtype=np.float32) * 255.0

print("--- BLACK IMAGE ---")
preds_black = model.predict(img_array_black)
print(preds_black)

print("--- WHITE IMAGE (255) ---")
preds_white = model.predict(img_array_white)
print(preds_white)

# Random noise [0, 255]
np.random.seed(42)
img_array_random = np.random.randint(0, 256, (1, 224, 224, 3)).astype(np.float32)
print("--- RANDOM IMAGE [0, 255] ---")
preds_random = model.predict(img_array_random)
print(preds_random)
