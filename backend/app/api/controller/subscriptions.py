from sqlalchemy.ext.asyncio import AsyncSession

from app.models.responses import DeleteResponse
from app.models.subscriptions import (
    UserSubscriptionCreate,
    UserSubscriptionRead,
    UserSubscriptionUpdate,
)
from app.service.subscriptions import subscriptionService


class SubscriptionController:
    @staticmethod
    async def create_subscription_ctrl(
        payload: UserSubscriptionCreate, db: AsyncSession
    ) -> UserSubscriptionRead:
        return await subscriptionService.create_subscription(payload, db)

    @staticmethod
    async def get_subscription_ctrl(subscription_id: str, db: AsyncSession) -> UserSubscriptionRead:
        return await subscriptionService.get_subscription(subscription_id, db)

    @staticmethod
    async def get_all_subscriptions_ctrl(db: AsyncSession) -> list[UserSubscriptionRead]:
        return await subscriptionService.get_all_subscriptions(db)

    @staticmethod
    async def update_subscription_ctrl(
        subscription_id: str, payload: UserSubscriptionUpdate, db: AsyncSession
    ) -> UserSubscriptionRead:
        return await subscriptionService.update_subscription(subscription_id, payload, db)

    @staticmethod
    async def delete_subscription_ctrl(subscription_id: str, db: AsyncSession) -> DeleteResponse:
        await subscriptionService.delete_subscription(subscription_id, db)
        return DeleteResponse(message="Deleted user subscription")
