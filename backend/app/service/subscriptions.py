import math

from fastapi import HTTPException
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.authen.current_user import AuthUser, is_admin_user
from app.enums.parking import SubscriptionStatus
from app.models.plans import SubscriptionPlan
from app.models.payment_plans import PaymentPlan
from app.models.subscriptions import (
    AcademicTermSummary,
    PaymentPlanSummary,
    SubscriptionPlanSummary,
    UserSubscription,
    UserSubscriptionCreate,
    UserSubscriptionDetail,
    UserSubscriptionUpdate,
    UserSummary,
    VehicleSummary,
)
from app.models.users import Users
from app.models.terms import AcademicTerm
from app.models.vehicles import Vehicle
from app.service.base import CRUDService
from app.utils.pagination import PaginatedResponse
from app.utils.search import ilike_unaccent


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
    async def get_subscriptions_by_user_code(user_code: str, db: AsyncSession) -> list[UserSubscription]:
        statement = select(UserSubscription).where(UserSubscription.user_code == user_code)
        result = await db.execute(statement)
        return result.scalars().all()

    @staticmethod
    def _build_detail_statement(user_code: str | None = None, *, ordered: bool = True):
        statement = (
            select(
                UserSubscription,
                Users,
                Vehicle,
                PaymentPlan,
                AcademicTerm,
                SubscriptionPlan,
            )
            .outerjoin(Users, Users.user_code == UserSubscription.user_code)
            .outerjoin(Vehicle, Vehicle.id == UserSubscription.vehicle_id)
            .outerjoin(PaymentPlan, PaymentPlan.id == UserSubscription.payment_plan_id)
            .outerjoin(AcademicTerm, AcademicTerm.id == UserSubscription.term_id)
            .outerjoin(SubscriptionPlan, SubscriptionPlan.id == UserSubscription.sub_plan_id)
        )
        if ordered:
            statement = statement.order_by(UserSubscription.created_at.desc())
        if user_code:
            statement = statement.where(UserSubscription.user_code == user_code)
        return statement

    @staticmethod
    def _convert_to_detail(
        subscription: UserSubscription,
        user: Users | None,
        vehicle: Vehicle | None,
        payment_plan: PaymentPlan | None,
        term: AcademicTerm | None,
        subscription_plan: SubscriptionPlan | None,
    ) -> UserSubscriptionDetail:
        return UserSubscriptionDetail(
            id=subscription.id,
            user_code=subscription.user_code,
            user=(
                UserSummary(
                    user_code=user.user_code,
                    full_name=user.full_name,
                    email=user.email,
                    phone_number=user.phone_number,
                )
                if user
                else None
            ),
            status=subscription.status,
            start_date=subscription.start_date,
            end_date=subscription.end_date,
            total_amount=subscription.total_amount,
            paid_amount=subscription.paid_amount,
            created_at=subscription.created_at,
            updated_at=subscription.updated_at,
            subscription_plan=(
                SubscriptionPlanSummary(
                    id=subscription_plan.id,
                    plans_type=subscription_plan.plans_type,
                    price_per_day=subscription_plan.price_per_day,
                )
                if subscription_plan
                else None
            ),
            payment_plan=(
                PaymentPlanSummary(
                    id=payment_plan.id,
                    payment_type=payment_plan.payment_type,
                )
                if payment_plan
                else None
            ),
            term=(
                AcademicTermSummary(
                    id=term.id,
                    term_name=term.term_name,
                    start_date=term.start_date,
                    end_date=term.end_date,
                )
                if term
                else None
            ),
            vehicle=(
                VehicleSummary(
                    id=vehicle.id,
                    license_plate=vehicle.license_plate,
                    vehicle_type=vehicle.vehicle_type,
                )
                if vehicle
                else None
            ),
        )

    @staticmethod
    async def _fetch_subscription_details(
        db: AsyncSession, user_code: str | None = None
    ) -> list[UserSubscriptionDetail]:
        statement = subscriptionService._build_detail_statement(user_code, ordered=True)
        result = await db.execute(statement)
        rows = result.all()
        details: list[UserSubscriptionDetail] = []
        for subscription, user, vehicle, payment_plan, term, subscription_plan in rows:
            details.append(
                subscriptionService._convert_to_detail(
                    subscription, user, vehicle, payment_plan, term, subscription_plan
                )
            )
        return details

    @staticmethod
    async def get_user_subscriptions_with_details(user_code: str, db: AsyncSession) -> list[UserSubscriptionDetail]:
        return await subscriptionService._fetch_subscription_details(db, user_code)

    @staticmethod
    async def get_all_subscriptions_with_details(db: AsyncSession) -> list[UserSubscriptionDetail]:
        return await subscriptionService._fetch_subscription_details(db)

    @staticmethod
    async def get_all_subscriptions_with_details_paginated(
        db: AsyncSession,
        *,
        search: str | None = None,
        status: SubscriptionStatus | None = None,
        page: int = 1,
        limit: int = 5,
    ) -> PaginatedResponse[UserSubscriptionDetail]:
        page = max(1, int(page or 1))
        limit = max(1, int(limit or 5))

        filters = []
        if status is not None:
            filters.append(UserSubscription.status == status)

        trimmed_search = (search or "").strip()
        if trimmed_search:
            filters.append(
                or_(
                    ilike_unaccent(UserSubscription.user_code, trimmed_search),
                    ilike_unaccent(Users.full_name, trimmed_search),
                    ilike_unaccent(func.cast(SubscriptionPlan.plans_type, String), trimmed_search),
                    ilike_unaccent(func.cast(PaymentPlan.payment_type, String), trimmed_search),
                    ilike_unaccent(AcademicTerm.term_name, trimmed_search),
                    ilike_unaccent(func.coalesce(Vehicle.license_plate, ""), trimmed_search),
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
        details: list[UserSubscriptionDetail] = []
        for subscription, user, vehicle, payment_plan, term, subscription_plan in rows:
            details.append(
                subscriptionService._convert_to_detail(
                    subscription, user, vehicle, payment_plan, term, subscription_plan
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
    async def update_subscription_for_user(
        subscription_id: str, payload: UserSubscriptionUpdate, db: AsyncSession, current_user: AuthUser
    ) -> UserSubscription:
        subscription = await subscriptionService.crud.get(db, subscription_id)

        if is_admin_user(current_user):
            return await subscriptionService.crud.update(db, subscription_id, payload)

        if subscription.user_code != current_user.user_code:
            raise HTTPException(status_code=403, detail="Not allowed to update this subscription")

        update_data = (
            payload.model_dump(exclude_unset=True)
            if hasattr(payload, "model_dump")
            else payload.dict(exclude_unset=True)
        )
        allowed_fields = {"vehicle_id"}
        if any(key not in allowed_fields for key in update_data.keys()):
            raise HTTPException(status_code=403, detail="Only vehicle_id can be updated")

        vehicle_id = update_data.get("vehicle_id")
        if not vehicle_id:
            return subscription

        if subscription.status != SubscriptionStatus.ACTIVE:
            raise HTTPException(status_code=400, detail="Can only change vehicle for active subscriptions")

        current_vehicle = await db.get(Vehicle, subscription.vehicle_id)
        if not current_vehicle or not (current_vehicle.license_plate or "").strip():
            raise HTTPException(status_code=400, detail="This subscription cannot change vehicle")

        next_vehicle = await db.get(Vehicle, vehicle_id)
        if not next_vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        if next_vehicle.user_code != current_user.user_code:
            raise HTTPException(status_code=403, detail="Vehicle does not belong to current user")
        if not (next_vehicle.license_plate or "").strip():
            raise HTTPException(status_code=400, detail="Vehicle must have a license plate")

        return await subscriptionService.crud.update(
            db,
            subscription_id,
            UserSubscriptionUpdate(vehicle_id=vehicle_id),
        )

    @staticmethod
    async def delete_subscription(subscription_id: str, db: AsyncSession) -> UserSubscription:
        return await subscriptionService.crud.delete(db, subscription_id)
