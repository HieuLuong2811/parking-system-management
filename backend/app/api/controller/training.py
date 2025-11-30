from app.service.training import TrainService

class TrainController:
    @staticmethod
    async def start_training():
        return TrainService.train_model()
