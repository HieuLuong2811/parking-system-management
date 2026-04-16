from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

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
    VehicleSummary,
)
from app.models.terms import AcademicTerm
from app.models.vehicles import Vehicle
from app.service.base import CRUDService


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
    def _build_detail_statement(user_code: str | None = None):
        statement = (
            select(
                UserSubscription,
                Vehicle,
                PaymentPlan,
                AcademicTerm,
                SubscriptionPlan,
            )
            .outerjoin(Vehicle, Vehicle.id == UserSubscription.vehicle_id)
            .outerjoin(PaymentPlan, PaymentPlan.id == UserSubscription.payment_plan_id)
            .outerjoin(AcademicTerm, AcademicTerm.id == UserSubscription.term_id)
            .outerjoin(SubscriptionPlan, SubscriptionPlan.id == UserSubscription.sub_plan_id)
            .order_by(UserSubscription.created_at.desc())
        )
        if user_code:
            statement = statement.where(UserSubscription.user_code == user_code)
        return statement

    @staticmethod
    def _convert_to_detail(
        subscription: UserSubscription,
        vehicle: Vehicle | None,
        payment_plan: PaymentPlan | None,
        term: AcademicTerm | None,
        subscription_plan: SubscriptionPlan | None,
    ) -> UserSubscriptionDetail:
        return UserSubscriptionDetail(
            id=subscription.id,
            user_code=subscription.user_code,
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
                    plan_name=subscription_plan.plan_name,
                    price_per_day=subscription_plan.price_per_day,
                )
                if subscription_plan
                else None
            ),
            payment_plan=(
                PaymentPlanSummary(
                    id=payment_plan.id,
                    plan_name=payment_plan.plan_name,
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
        statement = subscriptionService._build_detail_statement(user_code)
        result = await db.execute(statement)
        rows = result.all()
        details: list[UserSubscriptionDetail] = []
        for subscription, vehicle, payment_plan, term, subscription_plan in rows:
            details.append(
                subscriptionService._convert_to_detail(
                    subscription, vehicle, payment_plan, term, subscription_plan
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
    async def update_subscription(
        subscription_id: str, payload: UserSubscriptionUpdate, db: AsyncSession
    ) -> UserSubscription:
        return await subscriptionService.crud.update(db, subscription_id, payload)

    @staticmethod
    async def delete_subscription(subscription_id: str, db: AsyncSession) -> UserSubscription:
        return await subscriptionService.crud.delete(db, subscription_id)
