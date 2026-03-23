import os
import pickle
import numpy as np

try:
    import sklearn
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "diabetes_model.pkl")

FEATURE_ORDER = [
    "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
    "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"
]

_model = None


def load_model():
    """Load the diabetes prediction model."""
    global _model
    try:
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, "rb") as f:
                _model = pickle.load(f)
            print(f"[Diabetes Service] Model loaded from {MODEL_PATH}")
            return True
        else:
            print(f"[Diabetes Service] Model file not found at {MODEL_PATH}.")
            return False
    except Exception as e:
        print(f"[Diabetes Service] Error loading model: {e}")
        return False


def predict(data: dict) -> dict:
    """
    Predict diabetes risk from clinical parameters.

    Expected data keys: Pregnancies, Glucose, BloodPressure, SkinThickness,
                        Insulin, BMI, DiabetesPedigreeFunction, Age
    """
    global _model

    if _model is None:
        raise RuntimeError("Diabetes model is not loaded. Please ensure the model file exists in the models/ directory and scikit-learn is installed.")

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
            "confidence": round(float(max(probabilities)) * 100, 2),
            "recommendations": _get_recommendations(risk_level, data),
        }
    except Exception as e:
        print(f"[Diabetes Service] Prediction error: {e}")
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
            "Maintain a balanced diet with controlled sugar intake.",
            "Stay physically active — aim for 30 minutes of moderate exercise daily.",
            "Monitor your blood glucose levels during routine checkups.",
            "Maintain a healthy weight (BMI between 18.5 and 24.9).",
        ]
    elif risk_level == "Moderate Risk":
        recommendations = [
            "Consider getting an HbA1c test for better glucose monitoring.",
            "Reduce refined carbohydrates and sugary foods.",
            "Increase physical activity to at least 150 minutes per week.",
            "Monitor blood glucose levels more frequently.",
            "Consult a dietitian for a personalized meal plan.",
        ]
    else:
        recommendations = [
            "Schedule an appointment with an endocrinologist promptly.",
            "Begin regular blood glucose monitoring (fasting and post-meal).",
            "Follow a strict low-glycemic diet and limit carbohydrate intake.",
            "Engage in daily exercise — even short walks can help.",
            "Discuss medication options (metformin, insulin) with your doctor.",
        ]

    bmi = float(data.get("BMI", 0))
    if bmi > 30:
        recommendations.append("Your BMI indicates obesity. Weight reduction is strongly recommended to lower diabetes risk.")

    glucose = float(data.get("Glucose", 0))
    if glucose > 140:
        recommendations.append("Your glucose level is elevated. Regular fasting glucose tests and HbA1c monitoring are recommended.")

    return recommendations
