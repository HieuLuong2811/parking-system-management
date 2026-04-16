from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Generic, TypeVar

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import SQLModel

ModelType = TypeVar("ModelType", bound=SQLModel)
CreateSchemaType = TypeVar("CreateSchemaType", bound=SQLModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=SQLModel)


def _drop_tz(value: Any) -> Any:
    if isinstance(value, datetime) and value.tzinfo is not None:
        return value.astimezone(timezone.utc).replace(tzinfo=None)
    return value


class CRUDService(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: type[ModelType], pk_field: str = "id"):
        self.model = model
        self.pk_field = pk_field

    async def create(self, db: AsyncSession, payload: CreateSchemaType) -> ModelType:
        data = payload.dict(exclude_none=True)
        instance = self.model(**data)
        db.add(instance)
        await db.commit()
        await db.refresh(instance)
        return instance

    async def get_all(self, db: AsyncSession) -> list[ModelType]:
        statement = select(self.model)
        result = await db.execute(statement)
        return result.scalars().all()

    async def get(self, db: AsyncSession, identifier: Any) -> ModelType:
        statement = select(self.model).where(getattr(self.model, self.pk_field) == identifier)
        result = await db.execute(statement)
        instance = result.scalar_one_or_none()
        if not instance:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{self.model.__name__} not found")
        return instance

    async def update(self, db: AsyncSession, identifier: Any, payload: UpdateSchemaType) -> ModelType:
        instance = await self.get(db, identifier)
        update_data = payload.dict(exclude_unset=True, exclude_none=True)
        for field, value in update_data.items():
            setattr(instance, field, _drop_tz(value))
        await db.commit()
        await db.refresh(instance)
        return instance

    async def delete(self, db: AsyncSession, identifier: Any) -> ModelType:
        instance = await self.get(db, identifier)
        await db.delete(instance)
        await db.commit()
        return instance
