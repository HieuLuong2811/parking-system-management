from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.notifications import NotificationController
from app.authen.current_user import required_roles
from app.db.session import get_db
from app.models.auth import AuthUser
from app.models.notifications import NotificationCreate, NotificationRead, NotificationUpdate
from app.models.responses import DeleteResponse

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.post("/", response_model=NotificationRead)
async def create_notification(payload: NotificationCreate, db: AsyncSession = Depends(get_db)):
    return await NotificationController.create_notification_ctrl(payload, db)


@router.get("/", response_model=list[NotificationRead])
async def list_notifications(
    receiver_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("ADMIN")),
):
    return await NotificationController.get_all_notifications_ctrl(db, receiver_id)


@router.get("/me", response_model=list[NotificationRead])
async def list_my_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("USER", "ADMIN", "SECURITY")),
):
    return await NotificationController.get_notifications_for_user_ctrl(current_user.user_code, db)


@router.get("/{notification_id}", response_model=NotificationRead)
async def get_notification(notification_id: str, db: AsyncSession = Depends(get_db)):
    return await NotificationController.get_notification_ctrl(notification_id, db)


@router.patch("/{notification_id}", response_model=NotificationRead)
async def update_notification(notification_id: str, payload: NotificationUpdate, db: AsyncSession = Depends(get_db)):
    return await NotificationController.update_notification_ctrl(notification_id, payload, db)


@router.delete("/{notification_id}", response_model=DeleteResponse)
async def delete_notification(notification_id: str, db: AsyncSession = Depends(get_db)):
    return await NotificationController.delete_notification_ctrl(notification_id, db)
