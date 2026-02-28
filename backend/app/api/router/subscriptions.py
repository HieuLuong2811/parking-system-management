from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.subscriptions import SubscriptionController
from app.db.session import get_db
from app.models.responses import DeleteResponse
from app.models.subscriptions import (
    UserSubscriptionCreate,
    UserSubscriptionRead,
    UserSubscriptionUpdate,
)

router = APIRouter(prefix="/subscriptions", tags=["user_subscriptions"])


@router.post("/", response_model=UserSubscriptionRead)
async def create_subscription(payload: UserSubscriptionCreate, db: AsyncSession = Depends(get_db)):
    return await SubscriptionController.create_subscription_ctrl(payload, db)


@router.get("/", response_model=list[UserSubscriptionRead])
async def list_subscriptions(db: AsyncSession = Depends(get_db)):
    subscriptions = await SubscriptionController.get_all_subscriptions_ctrl(db)
    if not subscriptions:
        raise HTTPException(status_code=404, detail="No subscriptions found")
    return subscriptions


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
