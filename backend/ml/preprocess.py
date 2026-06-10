import os
import numpy as np
import torch
import SimpleITK as sitk
from monai.transforms import (
    Compose,
    LoadImaged,
    EnsureChannelFirstd,
    NormalizeIntensityd,
    Resized,
    ToTensord,
)

class MRIPreprocessor:
    """
    MRI Preprocessing pipeline for Dementia Detection.
    Adapted for 2D image slices (.jpg).
    """
    def __init__(self, target_shape=(128, 128)):
        self.target_shape = target_shape

    def n4_bias_correction(self, image_path):
        """
        Attempts to remove intensity inhomogeneities.
        For .jpg files, we skip N4 (not applicable) and use standard loading.
        """
        try:
            if image_path.lower().endswith(('.jpg', '.jpeg', '.png')):
                import cv2
                img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
                if img is None:
                    raise ValueError("Could not read image file")
                return img

            input_image = sitk.ReadImage(image_path, sitk.sitkFloat32)
            if input_image.GetDimension() == 3:
                corrector = sitk.N4BiasFieldCorrectionC()
                corrected_image = corrector.Execute(input_image)
                return sitk.GetArrayViewFromImage(corrected_image)
            else:
                return sitk.GetArrayViewFromImage(input_image)
        except Exception as e:
            print(f"Preprocessing failed for {image_path}: {e}")
            return np.zeros((128, 128))

    def skull_strip(self, image_array):
        """
        Removes non-brain tissue via basic threshold masking.
        """
        mask = image_array > np.mean(image_array) * 0.5
        return image_array * mask

    def get_monai_pipeline(self):
        """
        Returns the MONAI transform composition for the ML pipeline.
        Adapted for 2D slices.
        """
        return Compose([
            LoadImaged(keys=["image"]),
            EnsureChannelFirstd(keys=["image"]),
            # Resize to 128x128 for the model
            Resized(keys=["image"], spatial_size=self.target_shape, mode="bilinear"),
            # Intensity Normalization (Z-Score)
            NormalizeIntensityd(keys=["image"]),
            ToTensord(keys=["image"]),
        ])

    def preprocess_single_file(self, file_path):
        """
        Full preprocessing sequence for a single MRI slice (used during inference).
        """
        # 1. Intensity Correction / Loading
        img_array = self.n4_bias_correction(file_path)

        # 2. Skull Stripping
        img_array = self.skull_strip(img_array)

        # 3. Convert to Torch Tensor (B, C, H, W)
        # Handle grayscale or multi-channel
        if len(img_array.shape) == 2:
            tensor_img = torch.from_numpy(img_array).float().unsqueeze(0).unsqueeze(0)
        elif len(img_array.shape) == 3:
            tensor_img = torch.from_numpy(img_array).float().unsqueeze(0)
        else:
            tensor_img = torch.from_numpy(img_array).float()

        # 4. Manual Z-Score normalization and Resizing
        # Simple resize if needed
        import torch.nn.functional as F
        tensor_img = F.interpolate(tensor_img, size=self.target_shape, mode='bilinear', align_corners=False)

        mean = torch.mean(tensor_img)
        std = torch.std(tensor_img)
        tensor_img = (tensor_img - mean) / (std + 1e-8)

        return tensor_img

if __name__ == "__main__":
    preprocessor = MRIPreprocessor()
    print("MRI Preprocessor initialized. Ready for 2D pipeline integration.")
