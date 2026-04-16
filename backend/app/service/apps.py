from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import DBAPIError

from app.core.config import settings
from app.models.apps import App, AppCreate, AppUpdate


class appService:
    @staticmethod
    async def create_app(payload: AppCreate, db: AsyncSession) -> App:
        instance = App(**payload.dict(exclude_none=True))
        db.add(instance)
        try:
            await db.commit()
        except Exception as exc:
            await db.rollback()
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="App already exists") from exc
        await db.refresh(instance)
        return instance

    @staticmethod
    async def get_app(app_id: str, db: AsyncSession) -> App:
        statement = select(App).where(App.app_id == app_id)
        result = await db.execute(statement)
        instance = result.scalar_one_or_none()
        if not instance:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="App not found")
        return instance

    @staticmethod
    async def list_apps(db: AsyncSession) -> list[App]:
        statement = select(App)
        result = await db.execute(statement)
        return result.scalars().all()

    @staticmethod
    async def update_app(app_id: str, payload: AppUpdate, db: AsyncSession) -> App:
        app = await appService.get_app(app_id, db)
        update_data = payload.dict(exclude_unset=True, exclude_none=True)
        for field, value in update_data.items():
            setattr(app, field, value)
        app.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(app)
        return app

    @staticmethod
    async def store_app_token(app_id: str, token_value: str, db: AsyncSession) -> App:
        try:
            return await appService.update_app(app_id, AppUpdate(token=token_value), db)
        except DBAPIError:
            await db.rollback()
            raise

    @staticmethod
    async def delete_app(app_id: str, db: AsyncSession) -> None:
        app = await appService.get_app(app_id, db)
        await db.delete(app)
        await db.commit()

    @staticmethod
    async def sync_apps_from_env(db: AsyncSession) -> list[App]:
        configs = [
            {
                "name": settings.DASHBOARD_APP_NAME,
                "app_id": settings.DASHBOARD_APP_ID,
                "domain": str(settings.DASHBOARD_URL).rstrip("/"),
                "token": settings.DASHBOARD_APP_TOKEN,
            },
            {
                "name": settings.CLIENT_WEB_APP_NAME,
                "app_id": settings.CLIENT_WEB_APP_ID,
                "domain": str(settings.CLIENT_WEB_URL).rstrip("/"),
                "token": settings.CLIENT_WEB_APP_TOKEN,
            },
            {
                "name": settings.LOGIN_APP_NAME,
                "app_id": settings.LOGIN_APP_ID,
                "domain": str(settings.LOGIN_URL).rstrip("/"),
                "token": settings.LOGIN_APP_TOKEN,
            },
        ]

        result_apps: list[App] = []
        for config in configs:
            stmt = select(App).where(App.domain == config["domain"])
            result = await db.execute(stmt)
            instance = result.scalar_one_or_none()
            if instance:
                instance.name = config["name"]
                instance.app_id = config["app_id"]
                instance.token = config["token"]
                instance.is_active = True
                instance.updated_at = datetime.utcnow()
            else:
                instance = App(
                    name=config["name"],
                    app_id=config["app_id"],
                    domain=config["domain"],
                    token=config["token"],
                    is_active=True,
                )
                db.add(instance)
            result_apps.append(instance)

        await db.commit()
        for app in result_apps:
            await db.refresh(app)
        return result_apps
