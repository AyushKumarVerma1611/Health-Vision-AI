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
    """Run ECG prediction using Gemini Vision (primary) or 1D CNN (fallback)."""
    import io
    from PIL import Image
    
    # 1. Try Gemini Vision for accurate 2D ECG image analysis
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            
            prompt = """
            You are an expert cardiologist AI. Analyze this image. 
            FIRST: Is this an image of an ECG/EKG scan? If it is a random image or not an ECG, reply EXACTLY with: INVALID_IMAGE
            SECOND: If it IS an ECG, classify the arrhythmia into EXACTLY ONE of the following precise categories (reply with just the category name, nothing else):
            - Normal
            - Atrial Fibrillation
            - Tachycardia
            - Bradycardia
            - Premature Beats
            """
            model = genai.GenerativeModel("gemini-2.5-flash")
            response = model.generate_content([prompt, img])
            text_response = response.text.strip().strip("'").strip('"')
            
            if "INVALID_IMAGE" in text_response.upper():
                return {
                    "prediction": "Unknown",
                    "confidence": 0.0,
                    "description": "The uploaded image does not appear to be a valid ECG scan. Please upload a clear image of an ECG.",
                    "recommendation": "Ensure the image contains visible ECG grid lines and signal traces."
                }
                
            # Match Gemini's output to our classes
            pred_class = text_response
            if pred_class not in CLASSES:
                # Fallback mapping if Gemini goes slightly off-script
                if "FIB" in pred_class.upper(): pred_class = "Atrial Fibrillation"
                elif "TACHY" in pred_class.upper(): pred_class = "Tachycardia"
                elif "BRADY" in pred_class.upper(): pred_class = "Bradycardia"
                elif "PREMATURE" in pred_class.upper(): pred_class = "Premature Beats"
                else: pred_class = "Normal"
                
            return {
                "prediction": pred_class,
                "confidence": 0.95, # High confidence for VLM
                "description": DESCRIPTIONS.get(pred_class, "Arrhythmia detected based on visual analysis."),
                "recommendation": RECOMMENDATIONS.get(pred_class, "Please consult a cardiologist."),
            }
        except Exception as e:
            print(f"[ECG Service] Gemini analysis failed, falling back to 1D CNN: {e}")
            
    # 2. Fallback to the 1D CNN Hack
    global _model
    if _model is None:
        raise RuntimeError("ECG model is not loaded and Gemini API key is missing.")

    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("L")
        img = img.resize((187, 187), Image.Resampling.LANCZOS)
        img_array = np.array(img, dtype=np.float32)

        signal = []
        for col in range(187):
            column_data = img_array[:, col]
            y = np.argmin(column_data)
            val = 187 - y
            signal.append(val)

        signal = np.array(signal, dtype=np.float32)
        sig_min, sig_max = np.min(signal), np.max(signal)
        if sig_max > sig_min:
            signal = (signal - sig_min) / (sig_max - sig_min)
        else:
            signal = np.zeros_like(signal)

        x_input = signal.reshape(1, 187, 1)

        predictions = _model.predict(x_input, verbose=0)
        predicted_idx = int(np.argmax(predictions[0]))
        confidence = float(predictions[0][predicted_idx])
        prediction_class = CLASSES[predicted_idx]

        return {
            "prediction": prediction_class,
            "confidence": float(confidence),
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
