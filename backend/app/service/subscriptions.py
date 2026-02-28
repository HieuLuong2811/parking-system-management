from app.models.subscriptions import UserSubscription, UserSubscriptionCreate, UserSubscriptionUpdate
from app.service.base import CRUDService
from sqlalchemy.ext.asyncio import AsyncSession


class subscriptionService:
    crud = CRUDService(UserSubscription)

    @staticmethod
    async def create_subscription(payload: UserSubscriptionCreate, db: AsyncSession) -> UserSubscription:
        return await subscriptionService.crud.create(db, payload)

    @staticmethod
    async def get_subscription(subscription_id: str, db: AsyncSession) -> UserSubscription:
        return await subscriptionService.crud.get(db, subscription_id)

    @staticmethod
    async def get_all_subscriptions(db: AsyncSession) -> list[UserSubscription]:
        return await subscriptionService.crud.get_all(db)

    @staticmethod
    async def update_subscription(
        subscription_id: str, payload: UserSubscriptionUpdate, db: AsyncSession
    ) -> UserSubscription:
        return await subscriptionService.crud.update(db, subscription_id, payload)

    @staticmethod
    async def delete_subscription(subscription_id: str, db: AsyncSession) -> UserSubscription:
        return await subscriptionService.crud.delete(db, subscription_id)
