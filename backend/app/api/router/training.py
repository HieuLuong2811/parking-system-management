from fastapi import APIRouter, BackgroundTasks
from app.service.training import TrainService

router = APIRouter()

def train_task():
    TrainService.train_model()

@router.post("/train")
async def train_route(background_tasks: BackgroundTasks):
    background_tasks.add_task(train_task)
    return {"status": "training started"}
