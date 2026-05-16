import torch
import torch.optim as optim
from torch.utils.data import DataLoader
from model import PhysNet
from dataset import UBFC_rPPG_Dataset
import os

def negative_pearson_loss(predictions, targets):
    """
    Loss function tailored for rPPG. Maximizes Pearson correlation between 
    predicted wave and ground-truth BVP.
    """
    pred_mean = torch.mean(predictions, dim=1, keepdim=True)
    target_mean = torch.mean(targets, dim=1, keepdim=True)
    
    pred_centered = predictions - pred_mean
    target_centered = targets - target_mean
    
    cov = torch.sum(pred_centered * target_centered, dim=1)
    var_pred = torch.sqrt(torch.sum(pred_centered ** 2, dim=1))
    var_target = torch.sqrt(torch.sum(target_centered ** 2, dim=1))
    
    correlation = cov / (var_pred * var_target + 1e-7)
    return 1.0 - torch.mean(correlation)

def train_model():
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Training on: {device}")
    
    # Init Model
    model = PhysNet(frames=128).to(device)
    optimizer = optim.Adam(model.parameters(), lr=1e-4)
    
    # Init Dataset (Mock path, replace with actual UBFC-rPPG extraction path)
    data_dir = "./data/UBFC-rPPG/"
    if not os.path.exists(data_dir):
        print(f"Warning: {data_dir} not found. Please download the dataset.")
        return
        
    dataset = UBFC_rPPG_Dataset(data_dir, frames_per_clip=128)
    dataloader = DataLoader(dataset, batch_size=4, shuffle=True)
    
    epochs = 50
    for epoch in range(epochs):
        model.train()
        total_loss = 0
        
        for batch_idx, (video, bvp_gt) in enumerate(dataloader):
            video, bvp_gt = video.to(device), bvp_gt.to(device)
            
            optimizer.zero_grad()
            pred_bvp = model(video)
            
            loss = negative_pearson_loss(pred_bvp, bvp_gt)
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
            
        avg_loss = total_loss / len(dataloader)
        print(f"Epoch {epoch+1}/{epochs} - Neg Pearson Loss: {avg_loss:.4f}")
        
        # Save checkpoint
        torch.save(model.state_dict(), f"physnet_epoch_{epoch+1}.pth")

if __name__ == "__main__":
    train_model()
