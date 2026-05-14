from sqlalchemy.ext.asyncio import AsyncSession

from app.enums.parking import PaymentType, SubscriptionPlanType, SubscriptionStatus
from app.models.responses import DeleteResponse
from app.models.subscriptions import (
    UserSubscriptionAdminView,
    UserSubscriptionClientView,
    UserSubscriptionCreate,
    UserSubscriptionRead,
)
from app.authen.current_user import AuthUser
from app.service.subscriptions import subscriptionService
from app.utils.pagination import PaginatedResponse


class SubscriptionController:
    @staticmethod
    async def create_subscription_ctrl(
        payload: UserSubscriptionCreate, db: AsyncSession
    ) -> UserSubscriptionRead:
        return await subscriptionService.create_subscription(payload, db)

    @staticmethod
    async def get_user_subscriptions_by_user_paginated_ctrl(
        user_code: str,
        db: AsyncSession,
        *,
        status: SubscriptionStatus | None = None,
        page: int = 1,
        limit: int = 5,
    ) -> PaginatedResponse[UserSubscriptionClientView]:
        return await subscriptionService.get_user_subscriptions_with_details_paginated(
            db,
            user_code=user_code,
            status=status,
            page=page,
            limit=limit,
        )

    @staticmethod
    async def get_user_subscriptions_by_user_ctrl(
        user_code: str,
        db: AsyncSession,
        *,
        status: SubscriptionStatus | None = None,
        statuses: list[SubscriptionStatus] | None = None,
    ) -> list[UserSubscriptionAdminView]:
        return await subscriptionService.get_user_subscriptions_with_details(
            db,
            user_code=user_code,
            status=status,
            statuses=statuses,
        )

    @staticmethod
    async def get_all_subscription_details_paginated_ctrl(
        db: AsyncSession,
        *,
        search: str | None = None,
        user_code: str | None = None,
        full_name: str | None = None,
        plan_type: SubscriptionPlanType | None = None,
        payment_type: PaymentType | None = None,
        status: SubscriptionStatus | None = None,
        page: int = 1,
        limit: int = 5,
    ) -> PaginatedResponse[UserSubscriptionAdminView]:
        return await subscriptionService.get_all_subscriptions_with_details_paginated(
            db,
            search=search,
            user_code=user_code,
            full_name=full_name,
            plan_type=plan_type,
            payment_type=payment_type,
            status=status,
            page=page,
            limit=limit,
        )

    @staticmethod
    async def delete_subscription_ctrl(subscription_id: str, db: AsyncSession) -> DeleteResponse:
        await subscriptionService.delete_subscription(subscription_id, db)
        return DeleteResponse(message="Deleted user subscription")
