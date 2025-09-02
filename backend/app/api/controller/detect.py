from fastapi import UploadFile
from app.service.detect import detect_plate_from_bytes
import cv2
from io import BytesIO
from fastapi.responses import StreamingResponse

async def detect_plate(file: UploadFile):
    image_data = await file.read()
    annotated_image = detect_plate_from_bytes(image_data)

    _, buffer = cv2.imencode('.jpg', annotated_image)
    return StreamingResponse(BytesIO(buffer.tobytes()), media_type="image/jpeg")
