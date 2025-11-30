from fastapi import APIRouter, UploadFile, File
from app.api.controller.detect import DetectController
from fastapi.responses import FileResponse
from fastapi import WebSocket

router = APIRouter()

@router.post("/detect")
async def detect_route(file: UploadFile = File(...)):
    return await DetectController.detect_plate(file)

@router.post("/detect-video")
async def detect_video_route(file: UploadFile = File(...)):
    result_path = await DetectController.detect_video(file)
    return FileResponse(result_path, media_type="video/mp4", filename="annotated.mp4")

@router.post("/detect-camera")
async def detect_camera_route():
    return await DetectController.detect_camera()

@router.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await DetectController.handle_websocket(ws)

@router.get("/stream")
def stream_video():
    return DetectController.stream_camera()