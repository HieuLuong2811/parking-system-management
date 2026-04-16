from sqlalchemy.ext.asyncio import AsyncSession

from app.models.responses import DeleteResponse
from app.models.subscriptions import (
    UserSubscriptionCreate,
    UserSubscriptionDetail,
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
    async def get_subscriptions_by_user_ctrl(user_code: str, db: AsyncSession) -> list[UserSubscriptionRead]:
        subscriptions = await subscriptionService.get_subscriptions_by_user_code(user_code, db)
        return subscriptions

    @staticmethod
    async def get_user_subscriptions_by_user_ctrl(
        user_code: str, db: AsyncSession
    ) -> list[UserSubscriptionDetail]:
        return await subscriptionService.get_user_subscriptions_with_details(user_code, db)

    @staticmethod
    async def get_all_subscription_details_ctrl(db: AsyncSession) -> list[UserSubscriptionDetail]:
        return await subscriptionService.get_all_subscriptions_with_details(db)

    @staticmethod
    async def update_subscription_ctrl(
        subscription_id: str, payload: UserSubscriptionUpdate, db: AsyncSession
    ) -> UserSubscriptionRead:
        return await subscriptionService.update_subscription(subscription_id, payload, db)

    @staticmethod
    async def delete_subscription_ctrl(subscription_id: str, db: AsyncSession) -> DeleteResponse:
        await subscriptionService.delete_subscription(subscription_id, db)
        return DeleteResponse(message="Deleted user subscription")
