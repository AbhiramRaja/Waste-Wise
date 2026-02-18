from ultralytics import YOLO
import torch

def train():
    # Check for MPS (Apple Silicon) or CUDA
    device = 'cpu'
    if torch.backends.mps.is_available():
        device = 'mps'
    elif torch.cuda.is_available():
        device = 'cuda'
    
    print(f"Using device: {device}")

    # Load a model
    model = YOLO("yolo11n-cls.pt")  # load a pretrained model

    # Train the model
    # reduced epochs and image size for faster training
    results = model.train(data="yolo_dataset", epochs=1, imgsz=128, device=device)

if __name__ == "__main__":
    train()
