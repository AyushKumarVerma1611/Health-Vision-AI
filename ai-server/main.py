import os
import sys
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services import xray_service, mri_service, ecg_service, heart_service, diabetes_service
from services import chatbot_service, brief_service, report_service

# Track model loading status
models_status = {
    "xray": False,
    "mri": False,
    "ecg": False,
    "heart": False,
    "diabetes": False,
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models on startup."""
    print("=" * 60)
    print("HealthVision AI - Python AI Server Starting...")
    print("=" * 60)

    models_status["xray"] = xray_service.load_model()
    models_status["mri"] = mri_service.load_model()
    models_status["ecg"] = ecg_service.load_model()
    models_status["heart"] = heart_service.load_model()
    models_status["diabetes"] = diabetes_service.load_model()

    loaded = sum(1 for v in models_status.values() if v)
    print(f"\nModels loaded: {loaded}/{len(models_status)}")
    for name, status in models_status.items():
        emoji = "✅" if status else "❌"
        print(f"  {emoji} {name}: {'Loaded' if status else 'NOT LOADED - predictions will fail'}")
    print("=" * 60)

    yield
    print("Shutting down AI server...")


app = FastAPI(
    title="HealthVision AI Server",
    description="AI-powered health analysis API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Pydantic Models ---

class HeartPredictionRequest(BaseModel):
    age: float
    sex: float
    cp: float
    trestbps: float
    chol: float
    fbs: float
    restecg: float
    thalach: float
    exang: float
    oldpeak: float
    slope: float
    ca: float
    thal: float


class DiabetesPredictionRequest(BaseModel):
    Pregnancies: float
    Glucose: float
    BloodPressure: float
    SkinThickness: float
    Insulin: float
    BMI: float
    DiabetesPedigreeFunction: float
    Age: float


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []


class ChatMessage(BaseModel):
    role: str
    content: str


class BriefRequest(BaseModel):
    chats: Optional[List[dict]] = []
    analyses: Optional[List[dict]] = []
    report_names: Optional[List[str]] = []


class ReportRequest(BaseModel):
    patient_name: Optional[str] = "Patient"
    analysis_type: Optional[str] = "General"
    prediction: Optional[str] = "N/A"
    confidence: Optional[float] = 0.0
    description: Optional[str] = ""
    recommendation: Optional[str] = ""
    risk_percentage: Optional[float] = None
    risk_level: Optional[str] = None
    recommendations: Optional[List[str]] = []


# --- Routes ---

@app.get("/")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "HealthVision AI Server",
        "models_loaded": models_status,
    }


@app.post("/predict/ecg")
async def predict_ecg(file: UploadFile = File(...)):
    """Predict ECG arrhythmia from uploaded image."""
    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Empty file uploaded")

        result = ecg_service.predict(contents)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ECG prediction error: {str(e)}")


@app.post("/predict/xray")
async def predict_xray(file: UploadFile = File(...)):
    """Predict chest X-ray conditions from uploaded image."""
    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Empty file uploaded")

        result = xray_service.predict(contents)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"X-Ray prediction error: {str(e)}")


@app.post("/predict/mri")
async def predict_mri(file: UploadFile = File(...)):
    """Predict brain MRI tumor classification from uploaded image."""
    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Empty file uploaded")

        result = mri_service.predict(contents)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MRI prediction error: {str(e)}")


@app.post("/predict/heart")
async def predict_heart(data: HeartPredictionRequest):
    """Predict heart disease risk from clinical parameters."""
    try:
        result = heart_service.predict(data.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Heart prediction error: {str(e)}")


@app.post("/predict/diabetes")
async def predict_diabetes(data: DiabetesPredictionRequest):
    """Predict diabetes risk from clinical parameters."""
    try:
        result = diabetes_service.predict(data.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diabetes prediction error: {str(e)}")


@app.post("/chat")
async def chat_endpoint(data: ChatRequest):
    """Chat with the AI health assistant."""
    try:
        if not data.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")

        response = chatbot_service.chat(data.message, data.history)
        return {"response": response}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


@app.post("/generate-brief")
async def generate_brief(data: BriefRequest):
    """Generate a medical history brief from user data."""
    try:
        brief = brief_service.generate_brief(data.dict())
        return {"brief": brief}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Brief generation error: {str(e)}")


@app.post("/generate-pdf")
async def generate_pdf(data: ReportRequest):
    """Generate a PDF report from analysis data."""
    try:
        pdf_base64 = report_service.generate_pdf(data.dict())
        return {"pdf_base64": pdf_base64}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
