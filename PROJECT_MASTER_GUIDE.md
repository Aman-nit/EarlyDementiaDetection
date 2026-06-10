# 📘 PROJECT MASTER GUIDE: Multimodal Early Dementia Detection System

This document is the definitive technical reference for the Early Dementia Detection project. It synthesizes the project's vision, architectural design, implementation details, and interview strategy into a single comprehensive guide.

---

## 🎯 1. Project Overview & Vision

### The Big Picture
The system is a professional-grade medical diagnostic tool designed for the early detection of dementia. Instead of relying on a single diagnostic modality, it employs **Multimodal Data Fusion**, combining structural brain imaging, functional cognitive performance, and comprehensive clinical history to provide a high-precision risk assessment.

### The Core Problem: Why Multimodal?
In neurology, a single test is rarely definitive:
- **Structural MRI**: Shows physical atrophy (e.g., hippocampal shrinkage) but doesn't account for "cognitive reserve"—some patients maintain high function despite physical brain changes.
- **Cognitive Games**: Measure functional decline (how the brain actually works) but cannot pinpoint the exact location of the physical pathology.
- **Clinical History**: Provides the critical context (age, genetics, comorbidities) that determines the probability of a specific symptom being dementia-related.

**The Innovation**: By fusing these three streams, the system mimics the multidisciplinary approach of a real clinical team, reducing false positives and increasing early detection accuracy.

---

## 🧬 2. The Multimodal Strategy

The system classifies impairment into four stages: **No Impairment**, **Very Mild**, **Mild**, and **Moderate**.

### A. Structural Analysis (MRI)
- **Focus**: Identifying hippocampal atrophy, ventricular enlargement, and cortical thinning.
- **Pipeline**: Image $\rightarrow$ Grayscale $\rightarrow$ Resize ($128 \times 128$) $\rightarrow$ Z-Score Normalization.
- **Model**: A **2D-ResNet** (Residual Network). 
  - *Technical Pivot*: While 3D-ResNets are ideal for volumetric data, the system was adapted to 2D to match slice-based datasets while maintaining the ability to recognize atrophy patterns.
- **Output**: A 128-dimensional **bottleneck feature vector** (the brain's structural fingerprint).

### B. Functional Analysis (Cognitive Game Suite)
The system implements three scientifically-backed games targeting specific cognitive domains:

| Game | Scientific Basis | Mechanic | Metric | Targeted Domain |
| :--- | :--- | :--- | :--- | :--- |
| **Sequence Mimic** | Digit Span | Mimicking sequences of tiles | Max Span & Accuracy | Working Memory |
| **Connect-the-Dots** | Trail Making Test | Connecting dots in sequence | Time & Error Count | Executive Function |
| **Rapid-Fire Color** | Stroop Test | Clicking ink color vs text | Interference Time | Inhibitory Control |

- **Normalization**: Raw metrics are mapped to a $0.0$ (Healthy) $\rightarrow$ $1.0$ (Impaired) scale.

### C. Clinical Risk Profiling
The system collects a high-predictive-value profile:
- **Demographics**: Age, Gender, Education Level (proxy for cognitive reserve).
- **Clinical/Comorbid**: Hypertension, Heart Disease, Type 2 Diabetes, Family History (APOE-ε4 status).
- **Lifestyle**: Sleep Quality, Physical Activity, Dietary Habits.

---

## 🛠️ 3. Technical Architecture & Stack

### High-Level Stack
| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **React + Vite + Tailwind CSS** | Responsive UI, Canvas-based games, Clinical Aesthetic. |
| **Backend** | **FastAPI (Python)** | Asynchronous API for data ingestion and model serving. |
| **Database** | **PostgreSQL (via SQLAlchemy)** | Persistent relational storage for patient records. |
| **ML Core** | **PyTorch + MONAI** | Deep learning and specialized medical imaging transforms. |
| **Security** | **JWT + Bcrypt** | Secure, stateless clinician authentication. |

### Detailed Infrastructure
- **FastAPI**: Chosen for its asynchronous nature, high performance, and automatic OpenAPI (Swagger) documentation.
- **SQLAlchemy ORM**: Manages strict relationships: `Patient` $\rightarrow$ `MRIAnalysis` and `Patient` $\rightarrow$ `CognitiveResults`.
- **Clinical Aesthetic**: The frontend uses Tailwind CSS to implement a high-contrast, clean, professional look designed for medical environments.
- **Bcrypt Hashing**: Passwords are never stored in plain text; they are hashed with a 72-byte limit check to ensure server stability.

---

## 🔄 4. The End-to-End Pipeline

### Step 1: Clinical Intake (`/api/patient-info`)
The patient's demographics and comorbidities are collected, forming the **Clinical Vector**.

### Step 2: Structural Analysis (`/api/analysis/upload-mri`)
The uploaded MRI scan undergoes preprocessing (Normalization/Resizing) and is passed through the ResNet. Instead of just a class, the model extracts a **bottleneck vector** representing raw structural features.

### Step 3: Functional Analysis (`/api/analysis/cognitive-results`)
The user completes the three cognitive games. The `Cognitive Scoring Service` normalizes these results into a **Functional Vector**.

### Step 4: The Fusion Engine (`/api/analysis/full-risk`)
The "Brain" of the system. It uses **Attention-Based Fusion**:
- **Mechanism**: Clinical and functional data act as the **Query (Q)**, while MRI features act as **Keys (K)** and **Values (V)**.
- **Logic**: The model "attends" to specific brain regions (e.g., the hippocampus) more heavily if the clinical profile (e.g., high age + APOE-ε4 positive) indicates a higher baseline risk.
- **Final Output**: Impairment Level + Confidence Score + Medical Reasoning.

---

## 🎓 5. Interview Playbook (Q&A)

### AI & Machine Learning
**Q: How did you achieve high accuracy (98%)? Is it overfitting?**
- **A:** "I used a well-curated dataset and implemented **Early Stopping** (patience=7). By monitoring validation loss and halting training the moment performance on unseen data peaked, I ensured the model generalized rather than memorizing the training set."

**Q: Why use a Bottleneck Vector instead of just the final classification?**
- **A:** "A final class (e.g., 'Mild') is too reductive. By extracting the 128d feature vector from the last pooling layer, we preserve the raw structural patterns. This allows the Fusion Engine to combine these raw features with clinical context, leading to a more nuanced and personalized diagnosis."

**Q: Why 2D-ResNet instead of 3D?**
- **A:** "While 3D-CNNs are the gold standard for volumetric MRIs, my available dataset consisted of 2D slices. I pivoted the architecture to 2D to ensure compatibility with the data while utilizing the residual learning (skip connections) of ResNet to capture deep atrophy patterns without vanishing gradients."

### Full-Stack & Security
**Q: How do you ensure the security of sensitive medical data?**
- **A:** "I implemented a multi-layered approach: 1) **Bcrypt** for secure password hashing, 2) **JWT (JSON Web Tokens)** for stateless, time-limited session management, and 3) **Role-Based Access Control (RBAC)** on the backend to ensure only authorized clinicians can access the Admin Dashboard."

**Q: What was the most challenging bug you solved?**
- **A:** "The '405 Method Not Allowed' and 'CORS' errors during frontend-backend integration. I resolved this by implementing `CORSMiddleware` in FastAPI to explicitly allow the Vite development server's origin. This taught me a lot about browser security and cross-origin resource sharing."

### General Engineering & Scaling
**Q: If you had more time, how would you scale this?**
- **A:** "I would implement an **Asynchronous Task Queue (Celery + Redis)**. MRI processing is computationally heavy; moving it out of the request-response cycle would prevent timeouts. The user would upload the image and receive a notification/websocket update once the AI analysis is complete."

---

## 📝 Summary for Portfolio / Resume

**"Developed a Multimodal AI diagnostic system for early dementia detection. Integrated a 2D-ResNet (98% accuracy) for structural MRI analysis with a functional cognitive scoring engine and clinical profiling. Engineered an Attention-Based Fusion layer to combine disparate data streams into a final risk assessment. Built a secure, professional full-stack application using FastAPI, React, and PostgreSQL, focusing on medical-grade security and explainability."**

---

## 🚀 Future Roadmap

- **Longitudinal Tracking**: Analyzing the *slope* of decline over time rather than a single snapshot.
- **Voice Biomarkers**: Integrating speech pattern analysis (vocabulary, pauses) for early Alzheimer's markers.
- **Eye-Tracking**: Using webcam-based tracking during cognitive games to measure saccadic latency.
- **Explainability (XAI)**: Implementing **Grad-CAM** to generate heatmaps, highlighting the exact brain regions that triggered a high-risk alert.
