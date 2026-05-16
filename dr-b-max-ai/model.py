import torch
import torch.nn as nn

class PhysNet(nn.Module):
    """
    3D Convolutional Neural Network (PhysNet) for rPPG extraction.
    Takes Spatio-temporal video frames [Batch, Channels, Time, Height, Width]
    and outputs a continuous 1D pulse wave signal.
    """
    def __init__(self, frames=128):
        super(PhysNet, self).__init__()
        
        # Spatial-Temporal Convolutions
        self.conv1 = nn.Conv3d(3, 32, kernel_size=(1, 5, 5), stride=1, padding=(0, 2, 2))
        self.pool1 = nn.MaxPool3d(kernel_size=(1, 2, 2), stride=(1, 2, 2))
        
        self.conv2 = nn.Conv3d(32, 64, kernel_size=(3, 3, 3), stride=1, padding=(1, 1, 1))
        self.pool2 = nn.MaxPool3d(kernel_size=(2, 2, 2), stride=(2, 2, 2))
        
        self.conv3 = nn.Conv3d(64, 64, kernel_size=(3, 3, 3), stride=1, padding=(1, 1, 1))
        self.pool3 = nn.MaxPool3d(kernel_size=(2, 2, 2), stride=(2, 2, 2))
        
        self.conv4 = nn.Conv3d(64, 64, kernel_size=(3, 3, 3), stride=1, padding=(1, 1, 1))
        self.pool4 = nn.MaxPool3d(kernel_size=(2, 2, 2), stride=(2, 2, 2))
        
        # Global Average Pooling collapses Spatial dims, keeps Time
        self.gap = nn.AdaptiveAvgPool3d((frames, 1, 1))
        
        # Final projection to 1D signal
        self.fc = nn.Conv3d(64, 1, kernel_size=(1, 1, 1))
        
    def forward(self, x):
        # x shape: [B, 3, T, H, W]
        x = torch.relu(self.conv1(x))
        x = self.pool1(x)
        
        x = torch.relu(self.conv2(x))
        x = self.pool2(x)
        
        x = torch.relu(self.conv3(x))
        x = self.pool3(x)
        
        x = torch.relu(self.conv4(x))
        x = self.pool4(x)
        
        x = self.gap(x) # [B, 64, T, 1, 1]
        x = self.fc(x)  # [B, 1, T, 1, 1]
        
        # Output shape [B, T] representing the blood volume pulse wave over time
        return x.view(x.size(0), -1)

if __name__ == "__main__":
    # Test forward pass with a dummy 60fps video snippet
    dummy_video = torch.randn(1, 3, 128, 64, 64) # [Batch, C, Time, H, W]
    model = PhysNet(frames=128)
    pulse_wave = model(dummy_video)
    print("Output Pulse Wave Shape:", pulse_wave.shape) # Expected: [1, 128]
