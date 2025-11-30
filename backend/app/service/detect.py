from ultralytics import YOLO
import cv2
import numpy as np
import json
import asyncio
import pytesseract
# connected_clients = set()
# model = YOLO("yolov8n.pt")

model_path = r"F:\Parking-System\runs\detect\plate_detector_V2\weights\best.pt"
model = YOLO(model_path)
class DetectService():

    def segment_image(plate):
        # # Chuyen anh bien so ve gray
        # plate = cv2.cvtColor(plate, cv2.COLOR_RGB2GRAY)
        
        # # # Ap dung threshold de phan tach so va nen
        # ret, threshold = cv2.threshold(plate, 255, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        text = pytesseract.image_to_string(plate, lang="eng", config="--psm 7")
        # text = fine_tune(text)
        return text

    @staticmethod
    def detect_plate_from_bytes(image_bytes: bytes) -> np.ndarray:
        image = np.array(bytearray(image_bytes), dtype=np.uint8)
        image = cv2.imdecode(image, -1)
        
        results = model(image)
        annotated_image = results[0].plot()

        text = DetectService.segment_image(annotated_image)

        return text
    


    @staticmethod
    def detect_video(video_path: str, output_path: str = 'results.mp4'):
        cap = cv2.VideoCapture(video_path)
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        out = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            results = model(frame)
            annotated_frame = results[0].plot()

            out.write(annotated_frame)

        cap.release()
        out.release()
        print("Video saved to", output_path)
        return output_path
    
    @staticmethod
    async def detect_from_camera(camera_index=1):
        cap = cv2.VideoCapture(camera_index)
        if not cap.isOpened:
            raise Exception("Failed to open camera")
        
        while True:
            ret, frame = cap.read()
            if not ret:
                await asyncio.sleep(0.1)
                continue

            results = model(frame)
            annotated_frame = results[0].plot()

            cv2.imshow('Object Detection', annotated_frame)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()

    @staticmethod
    def generate_frames():
        cap = cv2.VideoCapture(0)
        prev_objects = set()

        while True:
            success, frame = cap.read()
            if not success:
                break

            results = model(frame)
            labels = {results[0].names[int(c)] for c in results[0].boxes.cls}
            new_objects = labels - prev_objects

            if new_objects:
                event = {
                    "type": "object_detected",
                    "objects": list(new_objects)
                }
                try:
                    loop = asyncio.get_running_loop()
                except RuntimeError:
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)

                for ws in list(connected_clients):
                    loop.create_task(ws.send_text(json.dumps(event)))

            prev_objects = labels

            annotated_frame = results[0].plot()
            _, buffer = cv2.imencode('.jpg', annotated_frame)
            frame_bytes = buffer.tobytes()

            yield (
                b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n'
            )

        cap.release()

    @staticmethod
    async def register_client(ws):
        connected_clients.add(ws)

    @staticmethod
    async def unregister_client(ws):
        connected_clients.remove(ws)

