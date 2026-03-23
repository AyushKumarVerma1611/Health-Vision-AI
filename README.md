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

## Setup Instructions (Single Source of Truth)

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key
- Cloudinary account

### 1. AI Server Setup (Python)
First, create a virtual environment in the root folder, then install details:
```bash
# From the root of the project:
python -m venv .venv

# Activate the virtual environment
.venv\Scripts\activate       # Windows
source .venv/bin/activate    # Mac/Linux

# Install all AI dependencies
cd ai-server
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env         # Add your GEMINI_API_KEY inside the .env file

# Start the server
python main.py               # Starts on port 8000
```

### 2. Backend Setup (Node.js)
Open a new terminal and navigate to the backend-node directory:
```bash
cd backend-node
npm install

# Configure environment variables
cp .env.example .env         # Add your MongoDB URI, JWT secret, Cloudinary keys

# Start the Node.js API server
npm run dev                  # Starts on port 5000
```

### 3. Frontend Setup (React)
Open a third terminal and navigate to the frontend directory:
```bash
cd frontend
npm install

# Configure environment variables
cp .env.example .env         # Ensure VITE_API_URL is set if using a different port

# Start the React app
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
