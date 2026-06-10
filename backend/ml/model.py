import torch
import torch.nn as nn

class DementiaResNet2D(nn.Module):
    """
    2D ResNet architecture for brain MRI slice classification into 4 impairment levels.
    Designed to capture structural changes in 2D image slices.
    """
    def __init__(self, num_classes=4):
        super(DementiaResNet2D, self).__init__()
        self._setup_resnet(num_classes)

    def _setup_resnet(self, num_classes):
        # A simplified 2D ResNet implementation using custom layers
        # To ensure stability and performance on 128x128 slices, we use a moderately deep network.

        class ResidualBlock2D(nn.Module):
            def __init__(self, in_channels, out_channels, stride=1):
                super(ResidualBlock2D, self).__init__()
                self.conv1 = nn.Conv2d(in_channels, out_channels, kernel_size=3, stride=stride, padding=1, bias=False)
                self.bn1 = nn.BatchNorm2d(out_channels)
                self.relu = nn.ReLU(inplace=True)
                self.conv2 = nn.Conv2d(out_channels, out_channels, kernel_size=3, stride=1, padding=1, bias=False)
                self.bn2 = nn.BatchNorm2d(out_channels)

                self.shortcut = nn.Sequential()
                if stride != 1 or in_channels != out_channels:
                    self.shortcut = nn.Sequential(
                        nn.Conv2d(in_channels, out_channels, kernel_size=1, stride=stride, bias=False),
                        nn.BatchNorm2d(out_channels)
                    )

            def forward(self, x):
                residual = self.shortcut(x)
                out = self.relu(self.bn1(self.conv1(x)))
                out = self.bn2(self.conv2(out))
                out += residual
                return self.relu(out)

        # Architecture: 2D-ResNet inspired
        # Input: (Batch, 1, 128, 128)

        # We split the model into feature extractor and classifier
        self.features = nn.Sequential(
            # Initial layer
            nn.Conv2d(1, 16, kernel_size=7, stride=2, padding=3, bias=False),
            nn.BatchNorm2d(16),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=3, stride=2, padding=1),

            # ResNet Stages
            ResidualBlock2D(16, 32, stride=1),
            ResidualBlock2D(32, 32),
            ResidualBlock2D(32, 64, stride=2),
            ResidualBlock2D(64, 64),
            ResidualBlock2D(64, 128, stride=2),
            ResidualBlock2D(128, 128),

            # Final Pooling and Flattening
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten(),
        )

        self.classifier = nn.Linear(128, num_classes)

    def extract_features(self, x):
        """
        Returns the 128-dimensional bottleneck vector from the pooling layer.
        """
        with torch.no_grad():
            return self.features(x)

    def forward(self, x):
        feat = self.features(x)
        return self.classifier(feat)

def get_model():
    """
    Utility function to instantiate the model.
    """
    return DementiaResNet2D(num_classes=4)

if __name__ == "__main__":
    # Test with a dummy tensor
    model = get_model()
    dummy_input = torch.randn(1, 1, 128, 128)
    output = model(dummy_input)
    print(f"Model output shape: {output.shape}") # Expected: [1, 4]
