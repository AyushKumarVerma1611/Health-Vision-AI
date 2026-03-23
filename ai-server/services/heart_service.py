import os
import pickle
import numpy as np

try:
    import sklearn
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "heart_model.pkl")

FEATURE_ORDER = [
    "age", "sex", "cp", "trestbps", "chol", "fbs",
    "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"
]

_model = None


def load_model():
    """Load the heart disease prediction model."""
    global _model
    try:
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, "rb") as f:
                _model = pickle.load(f)
            print(f"[Heart Service] Model loaded from {MODEL_PATH}")
            return True
        else:
            print(f"[Heart Service] Model file not found at {MODEL_PATH}.")
            return False
    except Exception as e:
        print(f"[Heart Service] Error loading model: {e}")
        return False


def predict(data: dict) -> dict:
    """
    Predict heart disease risk from clinical parameters.
    
    Expected data keys: age, sex, cp, trestbps, chol, fbs, restecg,
                        thalach, exang, oldpeak, slope, ca, thal
    """
    global _model

    if _model is None:
        raise RuntimeError("Heart disease model is not loaded. Please ensure the model file exists in the models/ directory and scikit-learn is installed.")

    try:
        features = []
        for key in FEATURE_ORDER:
            val = data.get(key, 0)
            features.append(float(val))
        features_array = np.array([features])

        probabilities = _model.predict_proba(features_array)[0]
        risk_percentage = round(float(probabilities[1]) * 100, 1)
        risk_level = _get_risk_level(risk_percentage)

        return {
            "risk_percentage": risk_percentage,
            "risk_level": risk_level,
            "confidence": float(max(probabilities)),
            "recommendations": _get_recommendations(risk_level, data),
        }
    except Exception as e:
        print(f"[Heart Service] Prediction error: {e}")
        return {
            "risk_percentage": 0.0,
            "risk_level": "Unknown",
            "confidence": 0.0,
            "recommendations": ["An error occurred. Please consult a medical professional."],
            "error": str(e),
        }


def _get_risk_level(percentage: float) -> str:
    if percentage < 33:
        return "Low Risk"
    elif percentage < 67:
        return "Moderate Risk"
    else:
        return "High Risk"


def _get_recommendations(risk_level: str, data: dict) -> list:
    recommendations = []

    if risk_level == "Low Risk":
        recommendations = [
            "Maintain your current healthy lifestyle habits.",
            "Continue regular exercise (at least 150 minutes of moderate activity per week).",
            "Keep a balanced diet low in saturated fats and sodium.",
            "Schedule routine cardiovascular checkups annually.",
            "Monitor your blood pressure and cholesterol levels regularly.",
        ]
    elif risk_level == "Moderate Risk":
        recommendations = [
            "Schedule a comprehensive cardiac evaluation with a cardiologist.",
            "Increase physical activity — aim for 30 minutes of exercise daily.",
            "Adopt a heart-healthy diet (Mediterranean or DASH diet recommended).",
            "Manage stress through relaxation techniques, yoga, or meditation.",
            "Consider regular monitoring of blood pressure and lipid profile.",
        ]
    else:
        recommendations = [
            "URGENT: Schedule an appointment with a cardiologist as soon as possible.",
            "Strictly follow a low-sodium, low-fat, heart-healthy diet.",
            "If you smoke, quitting is the single most important step you can take.",
            "Engage in medically supervised exercise programs.",
            "Discuss medication options (statins, ACE inhibitors, beta-blockers) with your doctor.",
        ]

    chol = float(data.get("chol", 0))
    if chol > 240:
        recommendations.append("Your cholesterol level is high. Consider dietary changes and possibly statin therapy.")

    trestbps = float(data.get("trestbps", 0))
    if trestbps > 140:
        recommendations.append("Your resting blood pressure is elevated. Monitor daily and consult your doctor about antihypertensive medications.")

    return recommendations
