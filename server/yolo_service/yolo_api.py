import io
import os
import time
import base64
import requests
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
from ultralytics import YOLO

app = FastAPI(title="MinMiu YOLOv8 Pet Detection Service", version="1.0.0")

# Enable CORS for local cross-service communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLOv8 pre-trained model (COCO dataset)
# Class 15 = cat, Class 16 = dog
MODEL_PATH = os.environ.get("YOLO_MODEL_PATH", "yolov8n.pt")
print(f"[*] Loading YOLOv8 model from '{MODEL_PATH}'...")
model = YOLO(MODEL_PATH)
print("[+] YOLOv8 model loaded successfully.")

COCO_PET_CLASSES = {
    15: {"name": "cat", "species": "Cat"},
    16: {"name": "dog", "species": "Dog"},
}

class DetectUrlRequest(BaseModel):
    image_url: Optional[str] = None
    image_base64: Optional[str] = None
    service_type: Optional[str] = "General Checkup"

def load_image_from_bytes_or_url(file_bytes: Optional[bytes] = None, image_url: Optional[str] = None, image_base64: Optional[str] = None) -> Image.Image:
    if file_bytes:
        return Image.open(io.BytesIO(file_bytes)).convert("RGB")
    
    if image_base64:
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]
        decoded = base64.b64decode(image_base64)
        return Image.open(io.BytesIO(decoded)).convert("RGB")

    if image_url:
        resp = requests.get(image_url, timeout=10)
        resp.raise_for_status()
        return Image.open(io.BytesIO(resp.content)).convert("RGB")

    raise ValueError("No image source provided (file, image_url, or image_base64 required)")

@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "YOLOv8 Pet Detection Microservice",
        "model": MODEL_PATH,
        "classes": COCO_PET_CLASSES
    }

@app.post("/detect")
async def detect_pet(
    file: Optional[UploadFile] = File(None),
    image_url: Optional[str] = Form(None),
    image_base64: Optional[str] = Form(None),
    service_type: Optional[str] = Form("General Checkup"),
):
    try:
        file_bytes = await file.read() if file else None
        image = load_image_from_bytes_or_url(file_bytes=file_bytes, image_url=image_url, image_base64=image_base64)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Cannot read image: {str(e)}")

    img_width, img_height = image.size

    # Run actual YOLOv8 inference
    start_time = time.time()
    results = model.predict(source=image, conf=0.25, verbose=False)
    elapsed_total_ms = round((time.time() - start_time) * 1000, 2)

    result = results[0]
    inference_ms = round(float(result.speed.get("inference", 0.0)), 2)

    pet_detections = []
    other_detections = []

    for box in result.boxes:
        cls_id = int(box.cls[0].item())
        conf = round(float(box.conf[0].item()), 4)
        xyxy = box.xyxy[0].tolist()  # [x1, y1, x2, y2] in pixels

        x1_px, y1_px, x2_px, y2_px = xyxy
        x1_pct = round((x1_px / img_width) * 100, 2)
        y1_pct = round((y1_px / img_height) * 100, 2)
        x2_pct = round((x2_px / img_width) * 100, 2)
        y2_pct = round((y2_px / img_height) * 100, 2)
        width_pct = round(x2_pct - x1_pct, 2)
        height_pct = round(y2_pct - y1_pct, 2)
        area_pct = round((width_pct * height_pct) / 100, 2)

        detection_item = {
            "class_id": cls_id,
            "class_name": result.names.get(cls_id, f"class_{cls_id}"),
            "confidence": conf,
            "confidence_score": f"{round(conf * 100, 1)}%",
            "bbox_pixels": {
                "x1": round(x1_px, 1),
                "y1": round(y1_px, 1),
                "x2": round(x2_px, 1),
                "y2": round(y2_px, 1),
                "width": round(x2_px - x1_px, 1),
                "height": round(y2_px - y1_px, 1),
            },
            "bbox_percent": {
                "x1": max(0.0, min(100.0, x1_pct)),
                "y1": max(0.0, min(100.0, y1_pct)),
                "x2": max(0.0, min(100.0, x2_pct)),
                "y2": max(0.0, min(100.0, y2_pct)),
                "width": max(1.0, min(100.0, width_pct)),
                "height": max(1.0, min(100.0, height_pct)),
                "area_percent": max(0.1, min(100.0, area_pct)),
            }
        }

        if cls_id in COCO_PET_CLASSES:
            detection_item["species"] = COCO_PET_CLASSES[cls_id]["species"]
            pet_detections.append(detection_item)
        else:
            other_detections.append(detection_item)

    # If no dog or cat is detected by YOLO
    if not pet_detections:
        return {
            "success": True,
            "detected": False,
            "message": "No pet (dog or cat) detected in the image. Please upload a clearer photo of your pet!",
            "inference_time_ms": inference_ms or elapsed_total_ms,
            "other_objects_found": [o["class_name"] for o in other_detections]
        }

    # Sort pet detections by confidence descending, pick the best detection
    pet_detections.sort(key=lambda d: d["confidence"], reverse=True)
    best_pet = pet_detections[0]

    return {
        "success": True,
        "detected": True,
        "species": best_pet["species"],
        "class_name": best_pet["class_name"],
        "class_id": best_pet["class_id"],
        "confidence": best_pet["confidence"],
        "confidence_score": best_pet["confidence_score"],
        "bbox": best_pet["bbox_percent"],
        "bbox_pixels": best_pet["bbox_pixels"],
        "inference_time_ms": inference_ms or elapsed_total_ms,
        "all_pet_detections": pet_detections,
        "model_version": "YOLOv8n-COCO"
    }
