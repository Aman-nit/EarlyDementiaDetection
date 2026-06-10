import torch
import numpy as np
import os
from model import get_model
from preprocess import MRIPreprocessor

# Path to the trained model weights
MODEL_PATH = "backend/ml/dementia_resnet2d.pth"

# Impairment level mapping
IMPAIRMENT_LEVELS = {
    0: "No Impairment",
    1: "Very Mild Impairment",
    2: "Mild Impairment",
    3: "Moderate Impairment"
}

class DementiaPredictor:
    """
    Inference class to predict dementia impairment level from a 2D MRI slice.
    """
    def __init__(self, model_path=MODEL_PATH):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = get_model().to(self.device)

        if os.path.exists(model_path):
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        else:
            print(f"Warning: Model weights not found at {model_path}. Using randomly initialized weights.")

        self.model.eval()
        self.preprocessor = MRIPreprocessor()

    def predict(self, image_path):
        """
        Processes a single MRI slice and returns the predicted class and confidence.
        """
        # 1. Preprocess
        processed_tensor = self.preprocessor.preprocess_single_file(image_path)
        processed_tensor = processed_tensor.to(self.device)

        # 2. Inference
        with torch.no_grad():
            outputs = self.model(processed_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            conf, pred_idx = torch.max(probabilities, 1)

        # 3. Result mapping
        prediction = IMPAIRMENT_LEVELS.get(pred_idx.item(), "Unknown")
        confidence = conf.item()

        return {
            "prediction": prediction,
            "confidence": confidence,
            "class_index": pred_idx.item()
        }

if __name__ == "__main__":
    # Example usage
    try:
        predictor = DementiaPredictor()
        # Replace with a real path for testing
        test_path = "backend/Datasets/Combined Dataset/train/No Impairment/sample.jpg"
        if os.path.exists(test_path):
            result = predictor.predict(test_path)
            print(f"Prediction: {result['prediction']} (Confidence: {result['confidence']:.2%})")
        else:
            print("Test image not found. Please provide a valid .jpg MRI slice path.")
    except Exception as e:
        print(f"Prediction failed: {e}")
