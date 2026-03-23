import numpy as np
import tensorflow as tf

model = tf.keras.models.load_model("models/xray_model.h5")

# Test with a dummy black image
img_array_black = np.zeros((1, 224, 224, 3), dtype=np.float32)
# Test with a dummy white image (255)
img_array_white = np.ones((1, 224, 224, 3), dtype=np.float32) * 255.0

print("--- BLACK IMAGE [0.0] ---")
preds_black = model.predict(img_array_black, verbose=0)
print(preds_black)

print("--- WHITE IMAGE [255.0] ---")
preds_white = model.predict(img_array_white, verbose=0)
print(preds_white)

print("--- WHITE IMAGE SCALED [1.0] ---")
preds_scaled = model.predict(np.ones((1, 224, 224, 3), dtype=np.float32), verbose=0)
print(preds_scaled)

np.random.seed(42)
img_array_random_255 = np.random.randint(0, 256, (1, 224, 224, 3)).astype(np.float32)
print("--- RANDOM IMAGE [0, 255] ---")
print(model.predict(img_array_random_255, verbose=0))

img_array_random_1 = np.random.rand(1, 224, 224, 3).astype(np.float32)
print("--- RANDOM IMAGE [0, 1] ---")
print(model.predict(img_array_random_1, verbose=0))
