import os
from typing import Any, Dict, List

import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image
import io

app = FastAPI(title="WonderLens Worker", version="0.1.0")


def _load_yolo():
    try:
        from ultralytics import YOLO  # type: ignore
    except Exception:
        return None

    model_name = os.getenv("YOLO_MODEL", "yolov8n.pt")
    try:
        return YOLO(model_name)
    except Exception:
        return None


YOLO_MODEL = _load_yolo()


@app.get("/health")
def health():
    return {"ok": True, "yolo_loaded": YOLO_MODEL is not None}


def _read_image(file_bytes: bytes) -> np.ndarray:
    try:
        img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {e}")
    return np.array(img)


def _person_detections_from_ultralytics(res) -> List[Dict[str, Any]]:
    dets: List[Dict[str, Any]] = []
    # Ultralytics result structure differs across versions; keep this defensive.
    boxes = getattr(res, "boxes", None)
    if boxes is None:
        return dets
    xyxy = getattr(boxes, "xyxy", None)
    conf = getattr(boxes, "conf", None)
    cls = getattr(boxes, "cls", None)
    if xyxy is None or conf is None or cls is None:
        return dets

    xyxy = xyxy.cpu().numpy()
    conf = conf.cpu().numpy()
    cls = cls.cpu().numpy()

    for i in range(xyxy.shape[0]):
        c = int(cls[i])
        # COCO: person class id == 0 for most YOLO models.
        if c != 0:
            continue
        x1, y1, x2, y2 = [float(v) for v in xyxy[i].tolist()]
        dets.append({"bbox": [x1, y1, x2, y2], "conf": float(conf[i]), "class_id": c})
    return dets


@app.post("/detect/persons")
async def detect_persons(image: UploadFile = File(...)):
    if YOLO_MODEL is None:
        raise HTTPException(
            status_code=503,
            detail="YOLO not available. Install requirements-yolo.txt and set YOLO_MODEL if needed.",
        )

    b = await image.read()
    if not b:
        raise HTTPException(status_code=400, detail="Empty image")

    arr = _read_image(b)
    # Ultralytics expects images as numpy arrays (H,W,3) in RGB.
    results = YOLO_MODEL.predict(arr, verbose=False)
    if not results:
        return {"detections": []}

    dets = _person_detections_from_ultralytics(results[0])
    return {"detections": dets, "count": len(dets)}
