import cv2
import os
import numpy as np
from ultralytics import YOLO

# Load the Object Detection model (for finding objects/humans)
print("Loading detection model...")
try:
    detector = YOLO("yolo11n.pt") # Pretrained on COCO (includes person, bottle, cup, etc.)
except Exception as e:
    print(f"Error loading detection model: {e}")
    exit()

# Load the Custom Classification model (for classifying waste)
print("Loading waste classification model...")
try:
    # Attempt to load model from train2 (most recent simplified run)
    model_path = "runs/classify/train2/weights/best.pt"
    if not os.path.exists(model_path):
        # Fallback to train if train2 doesn't exist
        model_path = "runs/classify/train/weights/best.pt"
        if not os.path.exists(model_path):
             print(f"Error: Classification model not found at {model_path}. Please train it first.")
             exit()
    
    print(f"Loading classifier from: {model_path}")
    classifier = YOLO(model_path)
except Exception as e:
    print("Error loading classification model.")
    print(f"Error: {e}")
    exit()

# Define mapping from class names to display categories
class_mapping = {
    'A_Foods': 'Organic Waste',
    'B_Animal Dead Body': 'Biological Waste',
    'C_Cardboard': 'Recyclable Waste (Paper)',
    'D_Newspaper': 'Recyclable Waste (Paper)',
    'E_Paper Cups': 'Recyclable Waste (Paper)',
    'F_Papers': 'Recyclable Waste (Paper)',
    'G_Brown Glass': 'Recyclable Waste (Glass)',
    'H_Porcelin': 'Ceramic Waste',
    'I_Green Glass': 'Recyclable Waste (Glass)',
    'J_White Glass': 'Recyclable Waste (Glass)',
    'K_Beverage Cans': 'Recyclable Waste (Metal)',
    'L_Construction Scrap': 'Construction Waste',
    'M_Metal Containers': 'Recyclable Waste (Metal)',
    'N_Plastic Bag': 'Plastic Waste',
    'O_Plastic Bottle': 'Plastic Waste',
    'Q_Plastic Containers': 'Plastic Waste',
    'R_Plastic Cups': 'Plastic Waste',
    'S_Tetra Pak': 'Recyclable Waste (Tetra Pak)',
    'T_Clothes': 'Cloth Waste',
    'U_Shoes': 'Shoe Waste',
    'V_Gloves': 'Medical/Latex Waste',
    'W_Masks': 'Medical Waste',
    'X_Bandai': 'Medical Waste',
    'Y_Medicine and Medicine Strip': 'Medical Waste',
    'Z_A_A_Syringe': 'Medical/Hazardous Waste',
    'Z_A_Diaper': 'Sanitary Waste',
    'Z_B_Electrical Cables': 'E-Waste',
    'Z_C_Electronic Chips': 'E-Waste',
    'Z_D_Laptops': 'E-Waste',
    'Z_E_Small Appliances': 'E-Waste',
    'Z_F_Smartphones': 'E-Waste',
    'Z_G_Battery': 'Hazardous/E-Waste',
    'Z_H_Thermometer': 'Medical/Hazardous Waste',
    'Z_I_Cigarette Butt': 'General Waste',
    'Z_J_Pesticidebottle': 'Hazardous Waste',
    'Z_K_Spray cans': 'Hazardous/Metal Waste'
}

# Open webcam
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()

print("Starting inference. Press 'q' to exit.")

while True:
    ret, frame = cap.read()
    if not ret:
        print("Error: content not read")
        break

    # 1. Run Object Detection
    #    conf=0.4: Only robust detections
    det_results = detector(frame, verbose=False, conf=0.4)
    
    detections_found = False

    for result in det_results:
        boxes = result.boxes
        for box in boxes:
            # Get box coordinates
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            
            # Get class ID regarding the COCO dataset
            cls_id = int(box.cls[0])
            coco_class_name = detector.names[cls_id]
            
            # 2. Check if Human
            if coco_class_name == 'person':
                continue # Skip classification (draw nothing)
                
            detections_found = True
            
            # 3. Crop object for classification
            # Ensure coordinates are within frame bounds
            h, w, _ = frame.shape
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(w, x2), min(h, y2)
            
            # Skip if crop is too small
            if x2 - x1 < 10 or y2 - y1 < 10:
                continue
                
            crop = frame[y1:y2, x1:x2]
            
            # 4. Run Waste Classification on the crop
            cls_results = classifier(crop, verbose=False)
            
            # Process classification result
            probs = cls_results[0].probs
            top1 = probs.top1
            top1_conf = probs.top1conf.item()
            waste_class_raw = classifier.names[top1]
            waste_class_display = class_mapping.get(waste_class_raw, waste_class_raw)
            
            # Draw Green Box for Waste
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            
            # Determine label text and color
            label = f"{waste_class_display} ({top1_conf:.2f})"
            
            # Set color based on waste type for the text background/text
            text_color = (0, 255, 0)
            if "Plastic" in waste_class_display:
                text_color = (255, 100, 0) # Blue-ish
            elif "Metal" in waste_class_display:
                text_color = (0, 100, 255) # Orange-ish
            elif "Medical" in waste_class_display:
                text_color = (0, 0, 255) # Red
            
            cv2.putText(frame, label, (x1, y1 - 10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, text_color, 2)

    # Fallback if no specific objects detected (optional: scan center?)
    # For now, we only show results if an object is detected.
    
    cv2.imshow('Waste Classification (YOLO Detection + Classification)', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
