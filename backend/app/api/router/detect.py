from fastapi import APIRouter, UploadFile, File
from app.api.controller.detect import DetectController

router = APIRouter(prefix="/detect", tags=["Detect"])

@router.post("/plate-image")
async def detect_plate_image(file: UploadFile = File(...)):
    return await DetectController.detect(file)

@router.post("/plate-only-image")
async def detect_plate_only_image(file: UploadFile = File(...)):
    return await DetectController.detect_plate_only(file)

@router.get("/stream")
def stream_plate_camera():
    return DetectController.stream()
