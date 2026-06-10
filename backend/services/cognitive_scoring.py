from typing import List, Dict, Any
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from backend.models.database import CognitiveResults

class CognitiveProfile(BaseModel):
    """
    Summary of a patient's cognitive performance across different domains.
    Scores are normalized from 0.0 (No Impairment) to 1.0 (Severe Impairment).
    """
    working_memory_score: float = Field(..., description="Normalized score for Sequence Mimic game")
    cognitive_flexibility_score: float = Field(..., description="Normalized score for Connect-the-Dots game")
    inhibitory_control_score: float = Field(..., description="Normalized score for Rapid-Fire Color game")
    overall_cognitive_index: float = Field(..., description="Aggregate index of cognitive impairment")
    game_metrics: Dict[str, Any] = Field(..., description="The raw metrics used for calculation")

class CognitiveScoringService:
    """
    Service responsible for transforming raw game metrics into normalized cognitive impairment scores.
    """

    # Reference Ranges (Baselines)
    # These values define the "Normal" (min) and "Impaired" (max) thresholds for normalization.
    # In a real clinical setting, these would be derived from normative datasets based on age/education.
    RANGES = {
        "sequence_mimic": {
            "max_span": {"min": 8, "max": 3},  # Higher span is better
            "accuracy": {"min": 1.0, "max": 0.6}, # Higher accuracy is better
        },
        "connect_dots": {
            "completion_time": {"min": 60, "max": 300}, # Lower time is better
            "error_count": {"min": 0, "max": 15},     # Lower errors are better
        },
        "rapid_fire_color": {
            "interference_time": {"min": 10, "max": 100}, # Lower interference is better
            "error_rate": {"min": 0.0, "max": 0.3},       # Lower error rate is better
        }
    }

    @staticmethod
    def _normalize(value: float, min_val: float, max_val: float, inverse: bool = False) -> float:
        """
        Normalizes a value between 0.0 and 1.0.
        If inverse=True, a higher raw value results in a lower impairment score.
        """
        if inverse:
            # Higher is better (e.g., Max Span)
            # If value >= min_val (best), score = 0.0
            # If value <= max_val (worst), score = 1.0
            if value >= min_val: return 0.0
            if value <= max_val: return 1.0
            return (min_val - value) / (min_val - max_val)
        else:
            # Lower is better (e.g., Completion Time)
            # If value <= min_val (best), score = 0.0
            # If value >= max_val (worst), score = 1.0
            if value <= min_val: return 0.0
            if value >= max_val: return 1.0
            return (value - min_val) / (max_val - min_val)

    def calculate_sequence_mimic_score(self, span: float, accuracy: float) -> float:
        """Measures Working Memory & Executive Dysfunction."""
        span_score = self._normalize(span, self.RANGES["sequence_mimic"]["max_span"]["min"], self.RANGES["sequence_mimic"]["max_span"]["max"], inverse=True)
        acc_score = self._normalize(accuracy, self.RANGES["sequence_mimic"]["accuracy"]["min"], self.RANGES["sequence_mimic"]["accuracy"]["max"], inverse=True)
        return (span_score * 0.7) + (acc_score * 0.3)

    def calculate_connect_dots_score(self, time: float, errors: float) -> float:
        """Measures Cognitive Flexibility (Frontal Lobe)."""
        time_score = self._normalize(time, self.RANGES["connect_dots"]["completion_time"]["min"], self.RANGES["connect_dots"]["completion_time"]["max"])
        err_score = self._normalize(errors, self.RANGES["connect_dots"]["error_count"]["min"], self.RANGES["connect_dots"]["error_count"]["max"])
        return (time_score * 0.6) + (err_score * 0.4)

    def calculate_rapid_fire_color_score(self, interference: float, errors: float) -> float:
        """Measures Inhibitory Control."""
        int_score = self._normalize(interference, self.RANGES["rapid_fire_color"]["interference_time"]["min"], self.RANGES["rapid_fire_color"]["interference_time"]["max"])
        err_score = self._normalize(errors, self.RANGES["rapid_fire_color"]["error_rate"]["min"], self.RANGES["rapid_fire_color"]["error_rate"]["max"])
        return (int_score * 0.8) + (err_score * 0.2)

    def get_cognitive_profile(self, db: Session, patient_id: int) -> CognitiveProfile:
        """
        Fetches raw game results and computes the normalized cognitive profile.
        """
        results = db.query(CognitiveResults).filter(CognitiveResults.patient_id == patient_id).all()

        # Organise results by game
        game_data = {r.game_name: r for r in results}

        # Extract raw values (with defaults if game not played)
        seq_data = game_data.get("Sequence Mimic")
        con_data = game_data.get("Connect-the-Dots")
        rap_data = game_data.get("Rapid-Fire Color")

        # Calculate individual scores
        # Using defaults (0.5) if data is missing to avoid crashing, though in prod we'd handle missing data better
        wm_score = self.calculate_sequence_mimic_score(
            seq_data.score if seq_data else 5,
            (seq_data.score / 10) if seq_data else 0.8 # Mock accuracy derivation
        )

        cf_score = self.calculate_connect_dots_score(
            con_data.completion_time if con_data else 120,
            con_data.error_count if con_data else 2
        )

        ic_score = self.calculate_rapid_fire_color_score(
            rap_data.score if rap_data else 30, # Assuming score = interference time
            (rap_data.error_count / 100) if rap_data else 0.05
        )

        overall_index = (wm_score + cf_score + ic_score) / 3

        return CognitiveProfile(
            working_memory_score=round(wm_score, 3),
            cognitive_flexibility_score=round(cf_score, 3),
            inhibitory_control_score=round(ic_score, 3),
            overall_cognitive_index=round(overall_index, 3),
            game_metrics={
                "sequence_mimic": {"span": seq_data.score if seq_data else None, "accuracy": "Calculated"},
                "connect_dots": {"time": con_data.completion_time if con_data else None, "errors": con_data.error_count if con_data else None},
                "rapid_fire_color": {"interference": rap_data.score if rap_data else None, "errors": rap_data.error_count if rap_data else None}
            }
        )
