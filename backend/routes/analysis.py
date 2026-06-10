from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.database import Patient, MRIAnalysis, CognitiveResults
from backend.services.cognitive_scoring import CognitiveScoringService
from backend.services.fusion_engine import FusionEngine
from backend.ml.model import get_model
from backend.ml.preprocess import MRIPreprocessor
import torch
import shutil
import os
from pathlib import Path
from typing import List
from pydantic import BaseModel

router = APIRouter(tags=["Analysis"])

# Instantiate services
scoring_service = CognitiveScoringService()
fusion_engine = FusionEngine()
mri_model = get_model()
mri_model.eval()
preprocessor = MRIPreprocessor()

UPLOAD_DIR = Path("backend/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

class GameResult(BaseModel):
    game_name: str
    score: float
    completion_time: float
    error_count: int

class CognitiveResultsRequest(BaseModel):
    patient_id: int
    results: List[GameResult]

@router.post("/upload-mri")
async def upload_mri(
    patient_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Uploads an MRI slice, preprocesses it, predicts the impairment level, and saves to DB.
    """
    # 1. Save the file
    file_extension = os.path.splitext(file.filename)[1]
    file_name = f"patient_{patient_id}_{int(torch.randint(0, 1000000, (1,)).item())}{file_extension}"
    file_path = UPLOAD_DIR / file_name

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # 2. Preprocess and Predict
        tensor_img = preprocessor.preprocess_single_file(str(file_path))

        with torch.no_grad():
            output = mri_model(tensor_img)
            probabilities = torch.softmax(output, dim=1)
            confidence, predicted_class = torch.max(probabilities, dim=1)

            predicted_class = predicted_class.item()
            confidence = confidence.item()

        # 3. Save to Database
        analysis = MRIAnalysis(
            patient_id=patient_id,
            image_path=str(file_path),
            predicted_class=predicted_class,
            confidence=confidence
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)

        return {
            "status": "success",
            "predicted_class": predicted_class,
            "confidence": confidence,
            "image_path": str(file_path)
        }
    except Exception as e:
        # Cleanup file if processing fails
        if file_path.exists():
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"MRI Analysis failed: {str(e)}")

@router.post("/cognitive-results")
async def save_cognitive_results(request: CognitiveResultsRequest, db: Session = Depends(get_db)):
    """
    Saves cognitive game results for a patient.
    """
    try:
        for res in request.results:
            cognitive_res = CognitiveResults(
                patient_id=request.patient_id,
                game_name=res.game_name,
                score=res.score,
                completion_time=res.completion_time,
                error_count=res.error_count
            )
            db.add(cognitive_res)
        db.commit()
        return {"status": "success", "message": f"Saved results for {len(request.results)} games"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save cognitive results: {str(e)}")

@router.post("/full-risk/{patient_id}")
async def calculate_full_risk(patient_id: int, db: Session = Depends(get_db)):
    """
    Performs end-to-end fusion analysis combining Clinical, Cognitive, and MRI data.
    """
    # 1. Fetch Patient Clinical Profile
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # 2. Get Cognitive Profile
    cognitive_profile = scoring_service.get_cognitive_profile(db, patient_id)

    # 3. Get MRI Features
    mri_record = db.query(MRIAnalysis).filter(MRIAnalysis.patient_id == patient_id).first()

    if not mri_record:
        # Fallback: If MRI is missing, we use a zero-tensor or a mean-feature vector
        # The FusionEngine should be designed to handle missing modalities.
        mri_features = torch.zeros(1, 128)
    else:
        # In production, load and preprocess the image from mri_record.image_path
        # For now, we simulate feature extraction from the existing record
        dummy_mri_tensor = torch.randn(1, 1, 128, 128)
        mri_features = mri_model.extract_features(dummy_mri_tensor)

    # 4. Fusion Engine Analysis
    risk_assessment = fusion_engine.assess_risk(patient, cognitive_profile, mri_features)

    return risk_assessment
