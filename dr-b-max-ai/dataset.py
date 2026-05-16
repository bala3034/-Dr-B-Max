import os
import cv2
import numpy as np
import torch
from torch.utils.data import Dataset

class UBFC_rPPG_Dataset(Dataset):
    """
    Dataloader for the UBFC-rPPG dataset.
    Loads synced video frames and ground-truth BVP (Blood Volume Pulse) signals.
    """
    def __init__(self, data_dir, frames_per_clip=128, transform=None):
        self.data_dir = data_dir
        self.frames_per_clip = frames_per_clip
        
        # In a real scenario, we would parse subject folders
        # Here we mock the structure mapping for demonstration
        self.subjects = [f for f in os.listdir(data_dir) if f.startswith('subject')]
        
    def __len__(self):
        return len(self.subjects)

    def __getitem__(self, idx):
        subject = self.subjects[idx]
        vid_path = os.path.join(self.data_dir, subject, 'vid.avi')
        bvp_path = os.path.join(self.data_dir, subject, 'ground_truth.txt')
        
        # 1. Load Video
        cap = cv2.VideoCapture(vid_path)
        frames = []
        while len(frames) < self.frames_per_clip:
            ret, frame = cap.read()
            if not ret: break
            # Convert BGR to RGB
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            # Center crop / Face detection goes here...
            frame = cv2.resize(frame, (64, 64))
            frames.append(frame)
        cap.release()
        
        # Stack into [Time, H, W, C]
        video_tensor = np.array(frames, dtype=np.float32) / 255.0
        # PyTorch 3D CNN needs [C, T, H, W]
        video_tensor = np.transpose(video_tensor, (3, 0, 1, 2))
        
        # 2. Load Ground Truth Pulse Wave
        # Ground truth txt usually contains: [timestamp, raw_bvp, heart_rate]
        gt_data = np.loadtxt(bvp_path)
        # Assuming second column is the raw PPG signal synced to video frames
        bvp_signal = gt_data[:self.frames_per_clip, 1].astype(np.float32)
        
        # Normalize the ground truth signal
        bvp_signal = (bvp_signal - np.mean(bvp_signal)) / np.std(bvp_signal)
        
        return torch.tensor(video_tensor), torch.tensor(bvp_signal)
