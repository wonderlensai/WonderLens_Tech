# Python Worker (YOLO/Tracking)

This is a separate (non-Next.js) worker intended for real-time CCTV workloads:
- decode RTSP/HLS streams
- run YOLO person detection
- run tracking (ByteTrack)
- emit events back to the control plane (Next.js + Postgres)

## Run (stub mode)

```bash
cd backend/worker_py
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

Health:
- `GET http://localhost:8001/health`

## Run (with YOLO)

```bash
pip install -r requirements-yolo.txt
export YOLO_MODEL=yolov8n.pt
uvicorn app.main:app --reload --port 8001
```

Detection:
- `POST http://localhost:8001/detect/persons` (multipart field: `image`)

