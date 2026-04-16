from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.subscriptions import SubscriptionController
from app.authen.current_user import AuthUser, is_admin_user, required_roles
from app.db.session import get_db
from app.models.responses import DeleteResponse
from app.models.subscriptions import (
    UserSubscriptionCreate,
    UserSubscriptionDetail,
    UserSubscriptionRead,
    UserSubscriptionUpdate,
)

router = APIRouter(prefix="/subscriptions", tags=["user_subscriptions"])


@router.post("/", response_model=UserSubscriptionRead)
async def create_subscription(payload: UserSubscriptionCreate, db: AsyncSession = Depends(get_db)):
    return await SubscriptionController.create_subscription_ctrl(payload, db)


@router.get("/", response_model=list[UserSubscriptionRead])
async def list_subscriptions(
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("USER", "ADMIN")),
):
    if is_admin_user(current_user):
        return await SubscriptionController.get_all_subscriptions_ctrl(db)
    return await SubscriptionController.get_subscriptions_by_user_ctrl(current_user.user_code, db)


@router.get("/me", response_model=list[UserSubscriptionDetail])
async def get_current_user_subscriptions(
    current_user: AuthUser = Depends(required_roles("USER")),
    db: AsyncSession = Depends(get_db),
):
    return await SubscriptionController.get_user_subscriptions_by_user_ctrl(
        current_user.user_code, db
    )


@router.get("/details", response_model=list[UserSubscriptionDetail])
async def get_subscription_details(
    current_user: AuthUser = Depends(required_roles("ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    return await SubscriptionController.get_all_subscription_details_ctrl(db)


@router.get("/{subscription_id}", response_model=UserSubscriptionRead)
async def get_subscription(subscription_id: str, db: AsyncSession = Depends(get_db)):
    return await SubscriptionController.get_subscription_ctrl(subscription_id, db)


@router.patch("/{subscription_id}", response_model=UserSubscriptionRead)
async def update_subscription(
    subscription_id: str, payload: UserSubscriptionUpdate, db: AsyncSession = Depends(get_db)
):
    return await SubscriptionController.update_subscription_ctrl(subscription_id, payload, db)


@router.delete("/{subscription_id}", response_model=DeleteResponse)
async def delete_subscription(subscription_id: str, db: AsyncSession = Depends(get_db)):
    return await SubscriptionController.delete_subscription_ctrl(subscription_id, db)
