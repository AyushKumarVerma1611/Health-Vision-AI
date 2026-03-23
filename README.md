# HealthVision AI

## Project Structure
```
healthvision-ai/
├── ai-server/          # Python FastAPI - AI inference server
│   ├── models/         # Trained ML models (.h5, .pkl)
│   ├── services/       # Prediction, chatbot, brief, report services
│   ├── utils/          # Image preprocessing, Grad-CAM
│   ├── main.py         # FastAPI app entry point
│   └── requirements.txt
├── backend-node/       # Node.js Express - API backend
│   ├── config/         # Database, Cloudinary config
│   ├── controllers/    # Route controllers
│   ├── middleware/      # Auth, error, upload middleware
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes + AI proxy
│   └── server.js       # Express app entry point
├── frontend/           # React + Vite frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # React context providers
│   │   ├── hooks/      # Custom hooks
│   │   ├── pages/      # Page components
│   │   ├── services/   # API service layer
│   │   └── utils/      # Utility functions
│   └── index.html
└── notebooks/          # Jupyter notebooks for model training
```

## Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB Atlas account
- Google Gemini API key
- Cloudinary account

### 1. AI Server
```bash
cd ai-server
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # Add your GEMINI_API_KEY
python main.py               # Starts on port 8000
```

### 2. Backend
```bash
cd backend-node
npm install
cp .env.example .env         # Add your MongoDB URI, JWT secret, Cloudinary keys
node server.js               # Starts on port 5000
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env         # Set VITE_API_URL if needed
npm run dev                  # Starts on port 5173
```

## AI Models
Place trained model files in `ai-server/models/`:
- `xray_model.h5` — Chest X-Ray classification
- `brain_mri_model.h5` — Brain MRI tumor detection
- `ecg_model.h5` — ECG arrhythmia classification
- `heart_model.pkl` — Heart disease risk prediction
- `diabetes_model.pkl` — Diabetes risk prediction

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Node.js, Express, MongoDB, Cloudinary
- **AI Server**: Python, FastAPI, TensorFlow, scikit-learn, Google Gemini
- **ML Models**: CNN (X-Ray, MRI, ECG), Random Forest (Heart, Diabetes)
