from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.apps import AppController
from app.db.session import get_db
from app.models.apps import AppCreate, AppRead, AppUpdate

router = APIRouter(prefix="/apps", tags=["apps"])


@router.post("/", response_model=AppRead)
async def create_app(payload: AppCreate, db: AsyncSession = Depends(get_db)):
    return await AppController.create_app(payload, db)


@router.get("/", response_model=list[AppRead])
async def list_apps(db: AsyncSession = Depends(get_db)):
    return await AppController.list_apps(db)


@router.get("/{app_id}", response_model=AppRead)
async def get_app(app_id: str, db: AsyncSession = Depends(get_db)):
    return await AppController.get_app(app_id, db)


@router.patch("/{app_id}", response_model=AppRead)
async def update_app(app_id: str, payload: AppUpdate, db: AsyncSession = Depends(get_db)):
    return await AppController.update_app(app_id, payload, db)


@router.delete("/{app_id}")
async def delete_app(app_id: str, db: AsyncSession = Depends(get_db)):
    await AppController.delete_app(app_id, db)
    return {"detail": "Deleted"}


@router.post("/generate", response_model=list[AppRead])
async def generate_apps(db: AsyncSession = Depends(get_db)):
    return await AppController.sync_apps_from_env(db)
