import os
import numpy as np
from utils.image_preprocess import preprocess_image
from utils.gradcam import generate_gradcam

try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "brain_mri_model.h5")
CLASSES = ["Glioma", "Meningioma", "No Tumor", "Pituitary Tumor"]

DESCRIPTIONS = {
    "Glioma": "A glioma has been detected. Gliomas are tumors that arise from glial cells in the brain. They can vary in aggressiveness from low-grade (slow-growing) to high-grade (fast-growing). Further diagnostic imaging and biopsy are recommended.",
    "Meningioma": "A meningioma has been detected. Meningiomas are typically slow-growing tumors that arise from the meninges (the membranes surrounding the brain and spinal cord). Most meningiomas are benign but may require monitoring or treatment depending on size and location.",
    "No Tumor": "No tumor was detected in the brain MRI scan. The brain structures appear normal. Continue with routine health monitoring.",
    "Pituitary Tumor": "A pituitary tumor has been detected. Pituitary tumors (adenomas) grow in the pituitary gland and can affect hormone production. Most are benign. Endocrine evaluation and further imaging are recommended.",
}

RECOMMENDATIONS = {
    "Glioma": "Urgent consultation with a neurosurgeon is recommended. Additional imaging (contrast-enhanced MRI) and potentially a biopsy will be needed to determine the grade and plan treatment.",
    "Meningioma": "Schedule a consultation with a neurosurgeon. Regular follow-up MRIs may be recommended. Treatment depends on size, location, and growth rate.",
    "No Tumor": "No immediate action required. Continue with regular health checkups. If symptoms persist, consult your neurologist.",
    "Pituitary Tumor": "Consult an endocrinologist and neurosurgeon. Blood tests to check hormone levels are recommended. Treatment options include medication, surgery, or radiation therapy.",
}

_model = None


def load_model():
    """Load the MRI classification model."""
    global _model
    if not TF_AVAILABLE:
        print("[MRI Service] TensorFlow not available. Model will not be loaded.")
        return False

    try:
        if os.path.exists(MODEL_PATH):
            _model = tf.keras.models.load_model(MODEL_PATH)
            print(f"[MRI Service] Model loaded from {MODEL_PATH}")
            return True
        else:
            print(f"[MRI Service] Model file not found at {MODEL_PATH}.")
            return False
    except Exception as e:
        print(f"[MRI Service] Error loading model: {e}")
        return False


def predict(image_bytes: bytes) -> dict:
    """Run MRI prediction on the given image bytes."""
    global _model

    if _model is None:
        raise RuntimeError("MRI model is not loaded. Please ensure the model file exists in the models/ directory and TensorFlow is installed.")

    try:
        img_array = preprocess_image(image_bytes, target_size=(224, 224))
        predictions = _model.predict(img_array, verbose=0)
        predicted_idx = int(np.argmax(predictions[0]))
        confidence = float(predictions[0][predicted_idx])
        prediction_class = CLASSES[predicted_idx]

        heatmap_b64 = ""
        try:
            heatmap_b64 = generate_gradcam(_model, img_array)
        except Exception as he:
            print(f"[MRI Service] Heatmap generation error: {he}")

        return {
            "prediction": prediction_class,
            "confidence": round(confidence * 100, 2),
            "description": DESCRIPTIONS.get(prediction_class, "Unknown condition detected."),
            "recommendation": RECOMMENDATIONS.get(prediction_class, ""),
            "heatmap_base64": heatmap_b64,
        }
    except Exception as e:
        print(f"[MRI Service] Prediction error: {e}")
        return {
            "prediction": "Error",
            "confidence": 0.0,
            "description": f"An error occurred during analysis: {str(e)}",
            "heatmap_base64": "",
        }
