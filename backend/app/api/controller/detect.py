from fastapi import UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from app.service.detect import DetectService


class DetectController:
    @staticmethod
    async def detect(file: UploadFile):
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File phải là ảnh")

        image_bytes = await file.read()
        result = DetectService.detect_from_image_bytes(image_bytes)
        return result

    @staticmethod
    def stream():
        return StreamingResponse(
            DetectService.generate_stream(),
            media_type="multipart/x-mixed-replace; boundary=frame"
        )