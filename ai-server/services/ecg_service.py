import os
import numpy as np
from utils.image_preprocess import preprocess_image

try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "ecg_model.h5")
CLASSES = ["Normal", "Atrial Fibrillation", "Tachycardia", "Bradycardia", "Premature Beats"]

DESCRIPTIONS = {
    "Normal": "Your ECG shows a normal sinus rhythm. The heart is beating regularly at a normal rate. All intervals and segments appear within normal ranges.",
    "Atrial Fibrillation": "Irregular and often rapid heart rate detected. The atria are beating chaotically and out of coordination with the ventricles. Consult a cardiologist promptly.",
    "Tachycardia": "Heart rate is faster than normal (above 100 bpm). This could be sinus tachycardia or another type. Consider medical evaluation to determine the underlying cause.",
    "Bradycardia": "Heart rate is slower than normal (below 60 bpm). While this can be normal in athletes, it may indicate an underlying condition. Monitor symptoms and consult a doctor.",
    "Premature Beats": "Premature heartbeats (extra beats) detected. These are common and often harmless but may occasionally indicate an underlying heart condition. Monitor frequency and symptoms.",
}

RECOMMENDATIONS = {
    "Normal": "No immediate cardiac concerns. Continue regular exercise and healthy lifestyle habits. Schedule routine cardiac checkups as recommended by your physician.",
    "Atrial Fibrillation": "Seek immediate medical attention. AFib increases stroke risk. Treatment may include blood thinners, heart rate medications, or cardioversion. Avoid caffeine and alcohol.",
    "Tachycardia": "Monitor your heart rate regularly. Avoid stimulants (caffeine, nicotine). Practice stress management. If episodes are frequent or accompanied by dizziness/shortness of breath, seek medical evaluation.",
    "Bradycardia": "If experiencing dizziness, fainting, or fatigue, consult a cardiologist. A pacemaker may be needed in severe cases. Continue monitoring your heart rate.",
    "Premature Beats": "Usually benign, but note the frequency. Reduce caffeine, alcohol, and stress. If frequent or accompanied by other symptoms, consult a cardiologist for Holter monitoring.",
}

_model = None


def load_model():
    """Load the ECG classification model."""
    global _model
    if not TF_AVAILABLE:
        print("[ECG Service] TensorFlow not available. Model will not be loaded.")
        return False

    try:
        if os.path.exists(MODEL_PATH):
            _model = tf.keras.models.load_model(MODEL_PATH)
            print(f"[ECG Service] Model loaded from {MODEL_PATH}")
            return True
        else:
            print(f"[ECG Service] Model file not found at {MODEL_PATH}.")
            return False
    except Exception as e:
        print(f"[ECG Service] Error loading model: {e}")
        return False


def predict(image_bytes: bytes) -> dict:
    """Run ECG prediction on the given image bytes."""
    global _model

    if _model is None:
        raise RuntimeError("ECG model is not loaded. Please ensure the model file exists in the models/ directory and TensorFlow is installed.")

    try:
        img_array = preprocess_image(image_bytes, target_size=(224, 224))
        predictions = _model.predict(img_array, verbose=0)
        predicted_idx = int(np.argmax(predictions[0]))
        confidence = float(predictions[0][predicted_idx])
        prediction_class = CLASSES[predicted_idx]

        return {
            "prediction": prediction_class,
            "confidence": round(confidence * 100, 2),
            "description": DESCRIPTIONS.get(prediction_class, "Unknown condition detected."),
            "recommendation": RECOMMENDATIONS.get(prediction_class, "Please consult a cardiologist."),
        }
    except Exception as e:
        print(f"[ECG Service] Prediction error: {e}")
        return {
            "prediction": "Error",
            "confidence": 0.0,
            "description": f"An error occurred during analysis: {str(e)}",
            "recommendation": "Please try again or consult a medical professional.",
        }
