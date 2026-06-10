import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Tuple, Dict, Any
from pydantic import BaseModel, Field
from backend.services.cognitive_scoring import CognitiveProfile
from backend.models.database import Patient

class RiskAssessment(BaseModel):
    """
    The final diagnosis outcome from the Attention-Based Fusion Engine.
    """
    final_impairment_level: str = Field(..., description="The predicted dementia level (No, Very Mild, Mild, Moderate)")
    confidence_score: float = Field(..., description="Confidence of the prediction (0-100%)")
    primary_driver: str = Field(..., description="Clinical reasoning explaining the primary driver of the risk")

class FusionNetwork(nn.Module):
    """
    A small PyTorch network that implements the attention-inspired fusion.
    It uses clinical and cognitive data to 'attend' to specific MRI features.
    """
    def __init__(self, clinical_dim: int, cognitive_dim: int, mri_dim: int = 128, num_classes: int = 4):
        super(FusionNetwork, self).__init__()

        # Attention Generator: (Clinical + Cognitive) -> Weight Vector for MRI Features
        self.attention_layer = nn.Sequential(
            nn.Linear(clinical_dim + cognitive_dim, 64),
            nn.ReLU(),
            nn.Linear(64, mri_dim),
            nn.Sigmoid() # Weights between 0 and 1
        )

        # Final Classifier: Weighted MRI Features -> Impairment Level
        self.classifier = nn.Sequential(
            nn.Linear(mri_dim, 32),
            nn.ReLU(),
            nn.Linear(32, num_classes)
        )

    def forward(self, clinical_vec, cognitive_vec, mri_vec):
        # 1. Generate attention weights based on patient's profile
        combined_profile = torch.cat([clinical_vec, cognitive_vec], dim=1)
        attention_weights = self.attention_layer(combined_profile)

        # 2. Apply attention to MRI features (Element-wise multiplication)
        weighted_mri = mri_vec * attention_weights

        # 3. Predict final level
        logits = self.classifier(weighted_mri)
        return logits, attention_weights

class FusionEngine:
    """
    Decision Engine that fuses Clinical Data, Cognitive Scores, and MRI Features.
    """
    IMPAIRMENT_LEVELS = ["No Impairment", "Very Mild Impairment", "Mild Impairment", "Moderate Impairment"]

    def __init__(self):
        # Dimensions:
        # Clinical: age, hypertension, heart_disease, diabetes, family_history, sleep_quality (6)
        # Cognitive: wm, cf, ic, overall (4)
        self.model = FusionNetwork(clinical_dim=6, cognitive_dim=4)
        self.model.eval() # Set to evaluation mode

    def _prepare_clinical_vector(self, patient: Patient) -> torch.Tensor:
        """
        Normalizes patient clinical data into a tensor.
        """
        # Simple normalization: Age / 100, Booleans as 1.0/0.0, Sleep / 10
        vec = [
            patient.age / 100.0 if patient.age else 0.5,
            1.0 if patient.hypertension else 0.0,
            1.0 if patient.heart_disease else 0.0,
            1.0 if patient.diabetes else 0.0,
            1.0 if patient.family_history_apoe else 0.0,
            (patient.sleep_quality or 5) / 10.0
        ]
        return torch.tensor([vec], dtype=torch.float32)

    def _prepare_cognitive_vector(self, profile: CognitiveProfile) -> torch.Tensor:
        """
        Transforms CognitiveProfile into a tensor.
        """
        vec = [
            profile.working_memory_score,
            profile.cognitive_flexibility_score,
            profile.inhibitory_control_score,
            profile.overall_cognitive_index
        ]
        return torch.tensor([vec], dtype=torch.float32)

    def assess_risk(self, patient: Patient, cognitive_profile: CognitiveProfile, mri_features: torch.Tensor) -> RiskAssessment:
        """
        Performs the final fusion and risk assessment.
        """
        clinical_vec = self._prepare_clinical_vector(patient)
        cognitive_vec = self._prepare_cognitive_vector(cognitive_profile)

        # mri_features should already be a 128d bottleneck vector
        if mri_features.dim() == 1:
            mri_features = mri_features.unsqueeze(0)

        with torch.no_grad():
            logits, weights = self.model(clinical_vec, cognitive_vec, mri_features)
            probs = F.softmax(logits, dim=1)
            conf, pred_class = torch.max(probs, dim=1)

        prediction = self.IMPAIRMENT_LEVELS[pred_class.item()]
        confidence = conf.item() * 100

        # Generate human-readable primary driver
        driver = self._generate_driver_explanation(prediction, confidence, cognitive_profile, weights)

        return RiskAssessment(
            final_impairment_level=prediction,
            confidence_score=round(confidence, 2),
            primary_driver=driver
        )

    def _generate_driver_explanation(self, level: str, confidence: float, cognitive: CognitiveProfile, weights: torch.Tensor) -> str:
        """
        Creates a medical explanation based on which factors contributed most.
        """
        # Logic: If cognitive scores are high (impaired) and MRI features are heavily weighted,
        # it's a combined structural and cognitive driver.

        drivers = []
        if cognitive.overall_cognitive_index > 0.6:
            drivers.append("significant cognitive deficit (especially in memory/flexibility)")
        else:
            drivers.append("relatively stable cognitive performance")

        # MRI weight analysis: find if any high-variance features were strongly attended to
        # In this mock version, we just check the mean attention weight
        avg_attn = weights.mean().item()
        if avg_attn > 0.5:
            drivers.append("pronounced structural MRI markers (e.g., hippocampal atrophy)")
        else:
            drivers.append("mild or non-specific structural changes")

        driver_text = f"Risk assessment is {level} ({round(confidence)}% confidence). "
        driver_text += f"Primary drivers include {', '.join(drivers)}."

        return driver_text
