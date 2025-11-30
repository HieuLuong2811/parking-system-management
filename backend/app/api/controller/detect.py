from fastapi import UploadFile
from app.service.detect import DetectService
import cv2
from io import BytesIO
from fastapi.responses import StreamingResponse
import tempfile
import shutil
from fastapi import WebSocket
class DetectController:
    @staticmethod
    async def detect_plate(file: UploadFile):
        image_data = await file.read()
        annotated_image = DetectService.detect_plate_from_bytes(image_data)

        _, buffer = cv2.imencode('.jpg', annotated_image)
        return StreamingResponse(BytesIO(buffer.tobytes()), media_type="image/jpeg")
    
    @staticmethod
    async def detect_video(file: UploadFile):
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name
        output_path = tmp_path.replace('.mp4', '_annotated.mp4')
        result = DetectService.detect_video(tmp_path, output_path)
        return result
    
    @staticmethod
    async def detect_camera():
        await DetectService.detect_from_camera()
        return {"status": "success"}
    
    @staticmethod
    async def handle_websocket(ws: WebSocket):
        await ws.accept()
        await DetectService.register_client(ws)
        try:
            while True:
                await ws.receive_text() 
        except Exception:
            pass
        finally:
            await DetectService.unregister_client(ws)

    @staticmethod
    def stream_camera():
        return StreamingResponse(
            DetectService.generate_frames(),
            media_type='multipart/x-mixed-replace; boundary=frame'
        )



