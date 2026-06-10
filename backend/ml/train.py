import os
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from monai.data import Dataset, CacheDataset, DataLoader as MonaiDataLoader
from monai.transforms import Compose, LoadImaged, EnsureChannelFirstd, NormalizeIntensityd, Resized, ToTensord
import glob

from preprocess import MRIPreprocessor
from model import get_model

# Configuration
DATASET_DIR = "backend/Datasets/Combined Dataset"
MODEL_PATH = "backend/ml/dementia_resnet2d.pth"
BATCH_SIZE = 4
EPOCHS = 50
LEARNING_RATE = 1e-4
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Mapping of folders to class labels
CLASS_MAP = {
    "No Impairment": 0,
    "Very Mild Impairment": 1,
    "Mild Impairment": 2,
    "Moderate Impairment": 3
}

def prepare_data():
    """
    Crawls the dataset directory and creates a list of image-label pairs.
    Looks for .jpg files in both 'train' and 'test' subfolders.
    """
    data_list = []
    subfolders = ["train", "test"]

    for sub in subfolders:
        subfolder_path = os.path.join(DATASET_DIR, sub)
        if not os.path.exists(subfolder_path):
            continue

        for class_name, class_idx in CLASS_MAP.items():
            class_folder = os.path.join(subfolder_path, class_name)
            # Search for .jpg images
            image_files = glob.glob(os.path.join(class_folder, "*.jpg"))

            for img_path in image_files:
                data_list.append({"image": img_path, "label": class_idx})

    return data_list

def train():
    print(f"Training started on device: {DEVICE}")

    # 1. Prepare Data
    data_list = prepare_data()
    if not data_list:
        print(f"No data found in {DATASET_DIR}. Please check if the path and .jpg files exist.")
        return

    print(f"Found {len(data_list)} images.")

    # Split into train/val (80/20)
    split_idx = int(len(data_list) * 0.8)
    train_files = data_list[:split_idx]
    val_files = data_list[split_idx:]

    # 2. Preprocessing Pipeline
    preprocessor = MRIPreprocessor()
    transforms = preprocessor.get_monai_pipeline()

    # 3. Efficient Loading with CacheDataset
    train_ds = CacheDataset(data=train_files, transform=transforms, cache_num=0)
    train_loader = MonaiDataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True, num_workers=0) # num_workers=0 for Windows stability

    val_ds = CacheDataset(data=val_files, transform=transforms, cache_num=0)
    val_loader = MonaiDataLoader(val_ds, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

    # 4. Model, Loss, Optimizer
    model = get_model().to(DEVICE)
    loss_function = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE)

    # Early Stopping configuration
    best_acc = 0.0
    patience = 7
    epochs_without_improvement = 0

    # 5. Training Loop
    for epoch in range(EPOCHS):
        model.train()
        epoch_loss = 0

        for batch in train_loader:
            images = batch["image"].to(DEVICE)
            labels = torch.tensor(batch["label"]).to(DEVICE)

            optimizer.zero_grad()
            outputs = model(images)
            loss = loss_function(outputs, labels)
            loss.backward()
            optimizer.step()

            epoch_loss += loss.item()

        print(f"Epoch {epoch+1}/{EPOCHS}, Loss: {epoch_loss/len(train_loader):.4f}")

        # Validation
        model.eval()
        correct = 0
        total = 0
        with torch.no_grad():
            for batch in val_loader:
                images = batch["image"].to(DEVICE)
                labels = torch.tensor(batch["label"]).to(DEVICE)
                outputs = model(images)
                _, predicted = torch.max(outputs.data, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()

        accuracy = 100 * correct / total if total > 0 else 0
        print(f"Validation Accuracy: {accuracy:.2f}%")

        # Early Stopping Logic
        if accuracy > best_acc:
            best_acc = accuracy
            torch.save(model.state_dict(), MODEL_PATH)
            print(f"New best model saved! Acc: {best_acc:.2f}%")
            epochs_without_improvement = 0
        else:
            epochs_without_improvement += 1
            if epochs_without_improvement >= patience:
                print(f"Early stopping triggered after {epoch+1} epochs. Best Acc: {best_acc:.2f}%")
                break


if __name__ == "__main__":
    train()
