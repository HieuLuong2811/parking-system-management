from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notifications import Notification, NotificationCreate, NotificationUpdate
from app.service.base import CRUDService


class notificationService:
    crud = CRUDService(Notification)

    @staticmethod
    async def create_notification(payload: NotificationCreate, db: AsyncSession) -> Notification:
        return await notificationService.crud.create(db, payload)

    @staticmethod
    async def get_notification(notification_id: str, db: AsyncSession) -> Notification:
        return await notificationService.crud.get(db, notification_id)

    @staticmethod
    async def get_all_notifications(
        db: AsyncSession,
        receiver_id: Optional[str] = None,
        *,
        limit: int | None = None,
        offset: int | None = None,
        is_read: bool | None = None,
        type: str | None = None,
        created_from: datetime | None = None,
        created_to: datetime | None = None,
        include_deleted: bool = True,
    ) -> list[Notification]:
        if created_from is not None and created_from.tzinfo is not None:
            created_from = created_from.astimezone(timezone.utc).replace(tzinfo=None)
        if created_to is not None and created_to.tzinfo is not None:
            created_to = created_to.astimezone(timezone.utc).replace(tzinfo=None)

        statement = select(Notification).order_by(Notification.created_at.desc(), Notification.id.desc())
        if receiver_id:
            statement = statement.where(Notification.receiver_id == receiver_id)
        if is_read is not None:
            statement = statement.where(Notification.is_read.is_(is_read))
        if type:
            type_prefix = f"[{type.strip().upper()}]"
            statement = statement.where(Notification.title.startswith(type_prefix))
        if created_from is not None:
            statement = statement.where(Notification.created_at >= created_from)
        if created_to is not None:
            statement = statement.where(Notification.created_at <= created_to)
        if not include_deleted:
            statement = statement.where(Notification.deleted_at.is_(None))
        if offset:
            statement = statement.offset(offset)
        if limit:
            statement = statement.limit(limit)
        result = await db.execute(statement)
        return result.scalars().all()

    @staticmethod
    async def update_notification(notification_id: str, payload: NotificationUpdate, db: AsyncSession) -> Notification:
        return await notificationService.crud.update(db, notification_id, payload)

    @staticmethod
    async def delete_notification(notification_id: str, db: AsyncSession) -> Notification:
        return await notificationService.crud.delete(db, notification_id)
