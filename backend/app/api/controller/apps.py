from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.apps import AppCreate, AppRead, AppUpdate
from app.service.apps import appService


class AppController:
    @staticmethod
    async def create_app(payload: AppCreate, db: AsyncSession) -> AppRead:
        return await appService.create_app(payload, db)

    @staticmethod
    async def get_app(app_id: str, db: AsyncSession) -> AppRead:
        return await appService.get_app(app_id, db)

    @staticmethod
    async def list_apps(db: AsyncSession) -> list[AppRead]:
        return await appService.list_apps(db)

    @staticmethod
    async def update_app(app_id: str, payload: AppUpdate, db: AsyncSession) -> AppRead:
        return await appService.update_app(app_id, payload, db)

    @staticmethod
    async def delete_app(app_id: str, db: AsyncSession) -> None:
        await appService.delete_app(app_id, db)

    @staticmethod
    async def sync_apps_from_env(db: AsyncSession) -> list[AppRead]:
        return await appService.sync_apps_from_env(db)
