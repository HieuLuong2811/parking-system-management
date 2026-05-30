import os
import math

from app.mappers.subscription_mapper import SubscriptionMapper
from fastapi import HTTPException
from sqlalchemy import String, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.authen.current_user import AuthUser, is_admin_user
from app.enums.parking import PaymentType, SubscriptionPlanType, SubscriptionStatus
from app.models.plans import SubscriptionPlan
from app.models.payment_plans import PaymentPlan
from app.models.subscriptions import (
    UserSubscription,
    UserSubscriptionAdminView,
    UserSubscriptionClientView,
    UserSubscriptionCreate,
    UserSubscriptionUpdate
)
from app.models.users import Users
from app.service.base import CRUDService
from app.utils.pagination import PaginatedResponse
from app.utils.search import ilike_unaccent
from app.service.parking_access_cards import parkingAccessCardService
from app.enums.parking import ParkingAccessCardHolderType

REPLACED_STATUSES = [
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.PAYMENT_DUE,
    SubscriptionStatus.OVERDUE,
    SubscriptionStatus.SUSPENDED,
]
class subscriptionService:
    crud = CRUDService(UserSubscription)

    @staticmethod
    async def _inactivate_existing_active_subscriptions(
        user_code: str, db: AsyncSession
    ) -> None:

        cancelable_statuses = [
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.PAYMENT_DUE,
            SubscriptionStatus.OVERDUE,
        ]

        inactive_statuses = [
            SubscriptionStatus.SUSPENDED,
        ]

        affected_ids = (
            await db.execute(
                select(UserSubscription.id).where(
                    UserSubscription.user_code == user_code,
                    UserSubscription.status.in_(
                        cancelable_statuses + inactive_statuses
                    ),
                )
            )
        ).scalars().all()

        if not affected_ids:
            return

        await db.execute(
            update(UserSubscription)
            .where(
                UserSubscription.id.in_(affected_ids),
                UserSubscription.status.in_(cancelable_statuses),
            )
            .values(status=SubscriptionStatus.CANCELED)
        )

        await db.execute(
            update(UserSubscription)
            .where(
                UserSubscription.id.in_(affected_ids),
                UserSubscription.status.in_(inactive_statuses),
            )
            .values(status=SubscriptionStatus.INACTIVE)
        )

    @staticmethod
    async def create_subscription(
        payload: UserSubscriptionCreate,
        db: AsyncSession,
    ) -> UserSubscription:
        await subscriptionService._inactivate_existing_active_subscriptions(
            payload.user_code,
            db,
        )

        subscription = await subscriptionService.crud.create(db, payload)
        await db.flush()

        await parkingAccessCardService.ensure_user_access_card_for_subscription(
            user_code=payload.user_code,
            subscription_id=str(subscription.id),
            db=db,
            holder_type=ParkingAccessCardHolderType.STUDENT,
        )

        return subscription

    @staticmethod
    async def create_subscription_in_tx(
        payload: UserSubscriptionCreate,
        db: AsyncSession,
    ) -> UserSubscription:
        await subscriptionService._inactivate_existing_active_subscriptions(
            payload.user_code,
            db,
        )

        subscription = UserSubscription(**payload.model_dump())
        db.add(subscription)
        await db.flush()

        await parkingAccessCardService.ensure_user_access_card_for_subscription(
            user_code=payload.user_code,
            subscription_id=str(subscription.id),
            db=db,
            holder_type=ParkingAccessCardHolderType.STUDENT,
        )

        return subscription

    @staticmethod
    def subscription_grants_parking_benefit(
        subscription: UserSubscription | None,
        *,
        at_date=None,
    ) -> bool:
        if not subscription:
            return False

        debug_enabled = os.getenv("DEBUG_PARKING_FEE", "").strip().lower() in {"1", "true", "yes", "on"}

        if subscription.status not in {
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.PAYMENT_DUE,
            SubscriptionStatus.OVERDUE
        }:
            if debug_enabled:
                print(
                    "[fee] subscription_ineligible_status",
                    str(getattr(subscription, "status", None)),
                )
            return False

        if subscription.start_date and subscription.end_date:
            from datetime import date as _date

            ref_date = at_date or _date.today()
            if ref_date < subscription.start_date or ref_date > subscription.end_date:
                if debug_enabled:
                    print(
                        "[fee] subscription_out_of_range",
                        f"today={ref_date}",
                        f"start={subscription.start_date}",
                        f"end={subscription.end_date}",
                    )
                return False

        # If it's ACTIVE and fully paid, it's definitely eligible.
        try:
            if (
                subscription.status == SubscriptionStatus.ACTIVE
                and int(getattr(subscription, "paid_amount", 0) or 0) >= int(getattr(subscription, "total_amount", 0) or 0)
            ):
                if debug_enabled:
                    print("[fee] subscription_fully_paid_active=True")
                return True
        except Exception:
            pass

        if debug_enabled:
            print("[fee] subscription_grants_parking_benefit=True")
        return True


    @staticmethod
    def _build_detail_statement(user_code: str | None = None, *, ordered: bool = True):
        statement = (
            select(
                UserSubscription,
                Users,
                PaymentPlan,
                SubscriptionPlan,
            )
            .outerjoin(Users, Users.user_code == UserSubscription.user_code)
            .outerjoin(PaymentPlan, PaymentPlan.id == UserSubscription.payment_plan_id)
            .outerjoin(SubscriptionPlan, SubscriptionPlan.id == UserSubscription.sub_plan_id)
        )
        if ordered:
            statement = statement.order_by(UserSubscription.created_at.desc())
        if user_code:
            statement = statement.where(UserSubscription.user_code == user_code)
        return statement

    @staticmethod
    async def get_user_subscriptions_with_details_paginated(
        db: AsyncSession,
        *,
        user_code: str,
        status: SubscriptionStatus | None = None,
        page: int = 1,
        limit: int = 5,
    ) -> PaginatedResponse[UserSubscriptionClientView]:
        page = max(1, int(page or 1))
        limit = max(1, int(limit or 5))

        filters = [UserSubscription.user_code == user_code]

        if status is not None:
            filters.append(UserSubscription.status == status)

        count_statement = (
            subscriptionService
            ._build_detail_statement(user_code, ordered=False)
            .where(*filters)
        )

        count_subquery = (
            count_statement
            .with_only_columns(UserSubscription.id)
            .distinct()
            .subquery()
        )

        total_count = await db.scalar(
            select(func.count()).select_from(count_subquery)
        )

        total_count = int(total_count or 0)
        total_pages = math.ceil(total_count / limit) if total_count else 0

        statement = (
            subscriptionService
            ._build_detail_statement(user_code, ordered=True)
            .where(*filters)
        )

        offset = (page - 1) * limit
        statement = statement.offset(offset).limit(limit)

        result = await db.execute(statement)
        rows = result.all()

        details: list[UserSubscriptionClientView] = []

        for subscription, _user, payment_plan, subscription_plan in rows:
            details.append(
                SubscriptionMapper.to_client_view(
                    subscription,
                    payment_plan,
                    subscription_plan,
                )
            )

        return {
            "data": details,
            "total": total_count,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
        }
    @staticmethod
    async def get_user_subscriptions_with_details(
        db: AsyncSession,
        *,
        user_code: str,
        status: SubscriptionStatus | None = None,
        statuses: list[SubscriptionStatus] | None = None,
    ) -> list[UserSubscriptionAdminView]:
        filters = [UserSubscription.user_code == user_code]

        billing_related_statuses = [
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.PAYMENT_DUE,
            SubscriptionStatus.OVERDUE,
            SubscriptionStatus.CANCELED,
        ]

        if statuses:
            filters.append(UserSubscription.status.in_(statuses))
        elif status is not None:
            filters.append(UserSubscription.status == status)
        else:
            filters.append(UserSubscription.status.in_(billing_related_statuses))

        statement = (
            subscriptionService
            ._build_detail_statement(user_code, ordered=True)
            .where(*filters)
        )

        result = await db.execute(statement)
        rows = result.all()

        details: list[UserSubscriptionAdminView] = []

        for subscription, user, payment_plan, subscription_plan in rows:
            details.append(
                SubscriptionMapper.to_admin_view(
                    subscription,
                    user,
                    payment_plan,
                    subscription_plan,
                )
            )

        return details

    @staticmethod
    async def get_all_subscriptions_with_details_paginated(
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
        page = max(1, int(page or 1))
        limit = max(1, int(limit or 5))

        filters = []
        if status is not None:
            filters.append(UserSubscription.status == status)

        trimmed_user_code = (user_code or "").strip()
        if trimmed_user_code:
            filters.append(ilike_unaccent(UserSubscription.user_code, trimmed_user_code))

        trimmed_full_name = (full_name or "").strip()
        if trimmed_full_name:
            filters.append(ilike_unaccent(Users.full_name, trimmed_full_name))

        if plan_type is not None:
            filters.append(SubscriptionPlan.plans_type == plan_type)

        if payment_type is not None:
            filters.append(PaymentPlan.payment_type == payment_type)

        trimmed_search = (search or "").strip()
        if trimmed_search:
            filters.append(
                or_(
                    ilike_unaccent(UserSubscription.user_code, trimmed_search),
                    ilike_unaccent(Users.full_name, trimmed_search),
                    ilike_unaccent(func.cast(SubscriptionPlan.plans_type, String), trimmed_search),
                    ilike_unaccent(func.cast(PaymentPlan.payment_type, String), trimmed_search),
                )
            )

        count_statement = subscriptionService._build_detail_statement(None, ordered=False)
        if filters:
            count_statement = count_statement.where(*filters)

        count_subquery = count_statement.with_only_columns(UserSubscription.id).distinct().subquery()
        total_count = await db.scalar(select(func.count()).select_from(count_subquery))
        total_count = int(total_count or 0)
        total_pages = math.ceil(total_count / limit) if total_count else 0

        statement = subscriptionService._build_detail_statement(None, ordered=True)
        if filters:
            statement = statement.where(*filters)

        offset = (page - 1) * limit
        statement = statement.offset(offset).limit(limit)

        result = await db.execute(statement)
        rows = result.all()
        details: list[UserSubscriptionAdminView] = []
        
        for subscription, user, payment_plan, subscription_plan in rows:
            details.append(
                SubscriptionMapper.to_admin_view(
                    subscription,
                    user,
                    payment_plan,
                    subscription_plan,
                )
            )

        return {
            "data": details,
            "total": total_count,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
        }

    @staticmethod
    async def update_subscription(
        subscription_id: str, payload: UserSubscriptionUpdate, db: AsyncSession
    ) -> UserSubscription:
        return await subscriptionService.crud.update(db, subscription_id, payload)

    @staticmethod
    async def delete_subscription(subscription_id: str, db: AsyncSession) -> UserSubscription:
        return await subscriptionService.crud.delete(db, subscription_id)
