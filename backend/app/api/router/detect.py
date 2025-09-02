from fastapi import APIRouter, UploadFile, File
from app.api.controller.detect import detect_plate

router = APIRouter()

@router.post("/detect")
async def detect_route(file: UploadFile = File(...)):
    return await detect_plate(file)
