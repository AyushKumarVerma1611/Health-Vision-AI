# 📓 HealthVision AI — Training Notebooks

All 5 ML modules are here. Run each notebook once, download the saved model, and place it in `ai-server/models/`.

---

## 📁 Where These Files Go in the Full Project

```
healthvision-ai/
├── notebooks/                         ← ✅ THIS FOLDER (new addition)
│   ├── 01_heart_disease.ipynb         → trains  heart_model.pkl
│   ├── 02_diabetes.ipynb              → trains  diabetes_model.pkl
│   ├── 03_chest_xray.ipynb            → trains  xray_model.h5
│   ├── 04_brain_mri.ipynb             → trains  brain_mri_model.h5
│   ├── 05_ecg_arrhythmia.ipynb        → trains  ecg_model.h5
│   └── README.md                      ← (this file)
│
└── ai-server/
    └── models/                        ← ✅ PUT TRAINED MODELS HERE
        ├── heart_model.pkl
        ├── diabetes_model.pkl
        ├── xray_model.h5
        ├── brain_mri_model.h5
        ├── brain_mri_classes.json
        ├── ecg_model.h5
        ├── ecg_meta.json
        └── .gitkeep
```

---

## 🚀 Quick Start — 3 Steps

### Step 1: Set Up Kaggle API

1. Go to [kaggle.com](https://kaggle.com) → Account → **Create New API Token**
2. Download `kaggle.json`
3. Place it at `~/.kaggle/kaggle.json`

```bash
mkdir -p ~/.kaggle
mv ~/Downloads/kaggle.json ~/.kaggle/
chmod 600 ~/.kaggle/kaggle.json
```

### Step 2: Choose Where to Run

| Notebook | GPU Needed? | Best Platform |
|---|---|---|
| 01_heart_disease | ❌ No | Local / Colab / Kaggle |
| 02_diabetes | ❌ No | Local / Colab / Kaggle |
| 03_chest_xray | ✅ Yes (T4+) | Kaggle Notebooks (dataset pre-linked) |
| 04_brain_mri | ✅ Yes (T4+) | Kaggle Notebooks (dataset pre-linked) |
| 05_ecg_arrhythmia | ⚡ Optional | Colab / Kaggle |

> 💡 **Free GPU tip:** Kaggle gives 30 GPU hrs/week free. All datasets are already available inside Kaggle Notebooks — no download step needed!

### Step 3: Copy Outputs to ai-server

After each notebook completes, copy from `./output/` to `ai-server/models/`:

```bash
# After running notebook 01
cp notebooks/output/heart_model.pkl       ai-server/models/

# After running notebook 02
cp notebooks/output/diabetes_model.pkl    ai-server/models/

# After running notebook 03
cp notebooks/output/xray_model.h5         ai-server/models/

# After running notebook 04
cp notebooks/output/brain_mri_model.h5    ai-server/models/
cp notebooks/output/brain_mri_classes.json ai-server/models/

# After running notebook 05
cp notebooks/output/ecg_model.h5          ai-server/models/
cp notebooks/output/ecg_meta.json         ai-server/models/
```

---

## 📊 Expected Model Performance

| Module | Model | Expected Accuracy | AUC |
|---|---|---|---|
| Heart Disease | Voting Ensemble (RF+XGB+GB) | ~85–87% | ~0.92 |
| Diabetes | XGBoost + SMOTE | ~80–83% | ~0.87 |
| Chest X-Ray | EfficientNetB3 Fine-Tuned | ~94–96% | ~0.98 |
| Brain MRI | EfficientNetB4 Fine-Tuned | ~96–98% | ~0.99 |
| ECG | 1D-CNN + BiLSTM | ~97–99% | ~0.99 |

---

## 🔌 How Models Connect to ai-server Services

Each model file maps directly to a service in `ai-server/services/`:

```
heart_model.pkl         → heart_service.py     → /api/analysis/heart
diabetes_model.pkl      → diabetes_service.py  → /api/analysis/diabetes
xray_model.h5           → xray_service.py      → /api/analysis/xray
brain_mri_model.h5      → mri_service.py       → /api/analysis/mri
ecg_model.h5            → ecg_service.py       → /api/analysis/ecg
```

---

## ⚠️ Notes

- Models are **not committed to git** (too large). Use `.gitkeep` as placeholder.
- Consider hosting models on **Hugging Face Hub** or **Google Drive** for team sharing.
- All notebooks output a `./data/` folder with EDA images for debugging.
- Re-run notebooks periodically to retrain on updated datasets.
