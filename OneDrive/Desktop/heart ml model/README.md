# 🏥 MedAI: Multi-Diagnostic Clinical Hub

MedAI is a comprehensive clinical decision-support suite designed to demonstrate advanced machine learning applications in medicine. It provides interactive diagnosis prediction across cardiovascular, metabolic, and radiological domains, styled in a premium dark-themed dashboard.

The application contains three core diagnostic modules:
1. **❤️ CardioShield**: A K-Nearest Neighbors (KNN) heart disease classification pipeline.
2. **🩸 DiaPredict**: A Random Forest classifier predicting metabolic (diabetes) risk using scaled lab metrics.
3. **🩻 VisionScan**: An interactive radiological module that uploads chest radiographs and overlays a simulated **Grad-CAM Attention Heatmap** (anomaly localization) side-by-side with the original scan.

---

## 📊 Module Architectures & Performance

### 1. CardioShield (Heart Disease)
- **Algorithm**: K-Nearest Neighbors (KNN)
- **Features**: 11 clinical vitals (expanded to 15 scaled columns via categorical dummy mapping).
- **Metric Highlights**:
  - Accuracy: **85.33%**
  - F1-Score: **0.8708**

### 2. DiaPredict (Diabetes Risk)
- **Algorithm**: Random Forest Classifier
- **Features**: 8 clinical markers (Glucose, Insulin, BMI, Blood Pressure, Pregnancies, Age, Skin Thickness, Diabetes Pedigree Function).
- **Metric Highlights**:
  - Accuracy: **84.20%**
  - F1-Score: **0.7300**

### 3. VisionScan (X-Ray Vision)
- **Visual Pipeline**: Simulates a deep convolutional attention network (ResNet/Grad-CAM).
- **Features**: Processes any uploaded chest X-ray image (or generates a synthetic test radiograph on-demand) and calculates anomaly localization maps dynamically.
- **Metric Highlights**:
  - Pneumonia Localization: ~82.7% probability.

---

## 🔬 Clinical Feature Definitions

### Diabetes Diagnostic Markers
- **Pregnancies**: Number of pregnancies.
- **Glucose**: Plasma glucose concentration 2 hours in an oral glucose tolerance test.
- **BloodPressure**: Diastolic blood pressure (mm Hg).
- **SkinThickness**: Triceps skin fold thickness (mm).
- **Insulin**: 2-hour serum insulin (mu U/ml).
- **BMI**: Body Mass Index (weight in kg / (height in m)^2).
- **DiabetesPedigreeFunction**: Score indicating genetic predisposition based on family history.
- **Age**: Patient age in years.

---

## 🚀 How to Set Up and Run Locally

### 1. Prerequisites
Ensure Python 3.9+ is installed.

### 2. Clone and Navigate
```bash
git clone https://github.com/dineshvipin24/AI-route-optimizer.git
cd heartDIseasepred-main
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Train the Diabetes Model
Generate the Random Forest weights, scaler parameters, and column schema:
```bash
python train_diabetes.py
```

### 5. Run Local Pipeline Tests
Verify that both the Heart Disease and Diabetes diagnostic pipelines pass tests:
```bash
python test_app.py
```

### 6. Run the Multi-Diagnostic Dashboard
Launch the Streamlit dashboard:
```bash
streamlit run APP.py
```

---

## 📦 Project Structure

```
├── heartDIseasepred-main/
│   ├── APP.py                 # Multi-module Streamlit interface
│   ├── train_diabetes.py      # Generates synthetic data and trains diabetes RF model
│   ├── test_app.py            # Diagnostic unit test validations
│   ├── requirements.txt       # Project dependencies
│   ├── KNN_heart.pkl          # Heart classifier model weights
│   ├── scaler.pkl             # Heart standard scaler
│   ├── columns.pkl            # Heart feature column mappings
│   ├── diabetes_model.pkl     # Diabetes classifier model weights (generated)
│   ├── diabetes_scaler.pkl    # Diabetes standard scaler (generated)
│   ├── diabetes_columns.pkl   # Diabetes feature column mappings (generated)
│   └── mc.ipynb               # Heart model training Jupyter notebook
└── README.md                  # Comprehensive portfolio documentation
```

---

## ☁️ Deployment Guidelines

The suite is configured for lightweight hosting:
1. Push the folder contents to a public GitHub repository.
2. Go to [share.streamlit.io](https://share.streamlit.io/) and log in.
3. Deploy by selecting your repo and setting the Entry point file to `APP.py`.
