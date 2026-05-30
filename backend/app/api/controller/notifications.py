from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notifications import NotificationCreate, NotificationRead, NotificationUpdate
from app.models.responses import DeleteResponse
from app.service.notifications import notificationService


class NotificationController:
    @staticmethod
    async def create_notification_ctrl(payload: NotificationCreate, db: AsyncSession) -> NotificationRead:
        return await notificationService.create_notification(payload, db)

    @staticmethod
    async def get_notification_ctrl(notification_id: str, db: AsyncSession) -> NotificationRead:
        return await notificationService.get_notification(notification_id, db)

    @staticmethod
    async def get_all_notifications_ctrl(
        db: AsyncSession,
        receiver_id: Optional[str] = None,
        *,
        limit: int | None = None,
        offset: int | None = None,
        is_read: bool | None = None,
        type: str | None = None,
        created_from=None,
        created_to=None,
        include_deleted: bool = True,
    ) -> list[NotificationRead]:
        return await notificationService.get_all_notifications(
            db,
            receiver_id,
            limit=limit,
            offset=offset,
            is_read=is_read,
            type=type,
            created_from=created_from,
            created_to=created_to,
            include_deleted=include_deleted,
        )

    @staticmethod
    async def get_notifications_for_user_ctrl(
        user_code: str,
        db: AsyncSession,
        *,
        limit: int | None = None,
        offset: int | None = None,
        is_read: bool | None = None,
        type: str | None = None,
        created_from=None,
        created_to=None,
        include_deleted: bool = False,
    ) -> list[NotificationRead]:
        return await notificationService.get_all_notifications(
            db,
            user_code,
            limit=limit,
            offset=offset,
            is_read=is_read,
            type=type,
            created_from=created_from,
            created_to=created_to,
            include_deleted=include_deleted,
        )

    @staticmethod
    async def update_notification_ctrl(notification_id: str, payload: NotificationUpdate, db: AsyncSession) -> NotificationRead:
        return await notificationService.update_notification(notification_id, payload, db)

    @staticmethod
    async def delete_notification_ctrl(notification_id: str, db: AsyncSession) -> DeleteResponse:
        await notificationService.delete_notification(notification_id, db)
        return DeleteResponse(message="Deleted notification")
