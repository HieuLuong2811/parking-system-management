from ultralytics import YOLO
import cv2
import numpy as np

model = YOLO("yolov8n.pt")

def detect_plate_from_bytes(image_bytes: bytes) -> np.ndarray:
    image = np.array(bytearray(image_bytes), dtype=np.uint8)
    image = cv2.imdecode(image, -1)
    
    results = model(image)
    annotated_image = results[0].plot()
    return annotated_image
