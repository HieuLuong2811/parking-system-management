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
        include_deleted: bool = True,
    ) -> list[Notification]:
        statement = select(Notification).order_by(Notification.created_at.desc(), Notification.id.desc())
        if receiver_id:
            statement = statement.where(Notification.receiver_id == receiver_id)
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
