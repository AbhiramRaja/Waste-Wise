import os
import shutil
import random
from pathlib import Path

# Define paths
# Use absolute paths for symlinks to work reliably
base_dir = Path(os.getcwd())
source_dir = base_dir / "dataset/archive 3/Dataset_ThirdStage/Dataset"
dest_dir = base_dir / "yolo_dataset"
train_dir = dest_dir / "train"
val_dir = dest_dir / "val"
split_ratio = 0.8  # 80% train, 20% validation

def prepare_data():
    if dest_dir.exists():
        shutil.rmtree(dest_dir)
    
    train_dir.mkdir(parents=True, exist_ok=True)
    val_dir.mkdir(parents=True, exist_ok=True)

    # Get all class directories
    classes = [d for d in source_dir.iterdir() if d.is_dir()]
    
    print(f"Found {len(classes)} classes: {[c.name for c in classes]}")

    for class_dir in classes:
        class_name = class_dir.name
        
        # Create class directories in train and val
        (train_dir / class_name).mkdir(exist_ok=True)
        (val_dir / class_name).mkdir(exist_ok=True)
        
        # Get all images
        images = list(class_dir.glob("*"))
        # Filter for valid image extensions
        images = [img for img in images if img.suffix.lower() in ['.jpg', '.jpeg', '.png', '.bmp']]
        
        random.shuffle(images)
        
        split_idx = int(len(images) * split_ratio)
        train_images = images[:split_idx]
        val_images = images[split_idx:]
        
        print(f"Processing {class_name}: {len(train_images)} train, {len(val_images)} val")
        
        # Create symlinks
        for img in train_images:
            try:
                os.symlink(img, train_dir / class_name / img.name)
            except OSError as e:
                print(f"Error creating symlink for {img.name}: {e}")
            
        for img in val_images:
            try:
                os.symlink(img, val_dir / class_name / img.name)
            except OSError as e:
                print(f"Error creating symlink for {img.name}: {e}")

    print("Data preparation complete (using symlinks)!")

if __name__ == "__main__":
    prepare_data()
