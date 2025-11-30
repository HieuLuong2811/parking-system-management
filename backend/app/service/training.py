from ultralytics import YOLO
import os

class TrainService:
    @staticmethod
    def train_model():
        dataset_path = r"F:\Parking-System\backend\TongHop\YOLODataset\dataset.yaml"

        if not os.path.exists(dataset_path):
            raise FileNotFoundError(f"Dataset not found: {dataset_path}")

        model = YOLO(r"F:\Parking-System\runs\detect\plate_detector_V2\weights\last.pt")

        results = model.train(
            data=dataset_path,
            epochs=100,
            imgsz=512,
            batch=4,
            name="plate_detector_V2",
            workers=0,
            mosaic=0,
            resume=True,
            device="cpu"
        )

        return {
            "status": "success",
            "results_dir": str(results.save_dir)
        }
