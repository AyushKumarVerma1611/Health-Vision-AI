import os
import numpy as np
from utils.image_preprocess import preprocess_image
from utils.gradcam import generate_gradcam

# Attempt to load TensorFlow
try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "xray_model.h5")
CLASSES = ["Normal", "Pneumonia", "Tuberculosis", "COVID-19"]

DESCRIPTIONS = {
    "Normal": "No abnormalities detected in the chest X-ray. The lungs appear clear with no signs of infection, consolidation, or other pathological findings.",
    "Pneumonia": "Signs of pneumonia detected in the chest X-ray. There appear to be areas of consolidation or opacity in the lung fields, suggesting an active infection.",
    "Tuberculosis": "Possible tuberculosis indicators found. The X-ray shows patterns consistent with TB, such as upper lobe infiltrates or cavities. Further testing with sputum culture is recommended.",
    "COVID-19": "Patterns consistent with COVID-19 pneumonia detected. Ground-glass opacities and bilateral involvement are visible. PCR testing is recommended for confirmation.",
}

RECOMMENDATIONS = {
    "Normal": "No immediate action required. Continue regular health checkups. Maintain a healthy lifestyle with regular exercise and balanced diet.",
    "Pneumonia": "Seek medical attention promptly. Antibiotics may be needed if bacterial. Rest, stay hydrated, and monitor temperature. Follow up with a pulmonologist.",
    "Tuberculosis": "Urgent medical consultation required. TB requires a specific antibiotic regimen (typically 6-9 months). Contact tracing and isolation may be necessary.",
    "COVID-19": "Self-isolate immediately and consult a healthcare provider. Monitor oxygen levels. Seek emergency care if experiencing difficulty breathing.",
}

_model = None


def load_model():
    """Load the X-ray classification model."""
    global _model
    if not TF_AVAILABLE:
        print("[X-Ray Service] TensorFlow not available. Model will not be loaded.")
        return False

    try:
        if os.path.exists(MODEL_PATH):
            _model = tf.keras.models.load_model(MODEL_PATH)
            print(f"[X-Ray Service] Model loaded from {MODEL_PATH}")
            return True
        else:
            print(f"[X-Ray Service] Model file not found at {MODEL_PATH}.")
            return False
    except Exception as e:
        print(f"[X-Ray Service] Error loading model: {e}")
        return False


def predict(image_bytes: bytes) -> dict:
    """Run X-ray prediction on the given image bytes."""
    global _model

    if _model is None:
        raise RuntimeError("X-Ray model is not loaded. Please ensure the model file exists in the models/ directory and TensorFlow is installed.")

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
            print(f"[X-Ray Service] Heatmap generation error: {he}")

        return {
            "prediction": prediction_class,
            "confidence": round(confidence * 100, 2),
            "description": DESCRIPTIONS.get(prediction_class, "Unknown condition detected."),
            "recommendation": RECOMMENDATIONS.get(prediction_class, "Please consult a medical professional."),
            "heatmap_base64": heatmap_b64,
            "highlighted_region": f"AI has highlighted regions associated with {prediction_class} indicators.",
        }
    except Exception as e:
        print(f"[X-Ray Service] Prediction error: {e}")
        return {
            "prediction": "Error",
            "confidence": 0.0,
            "description": f"An error occurred during analysis: {str(e)}",
            "recommendation": "Please try again or consult a medical professional.",
            "heatmap_base64": "",
            "highlighted_region": "",
        }
