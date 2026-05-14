from __future__ import annotations

from app.models.auth import AuthUser
from sqlalchemy import func, select
from app.service.base import CRUDService
from sqlalchemy.ext.asyncio import AsyncSession

from app.enums.parking import SubscriptionStatus
from app.models.plans import (
    SubscriptionPlan,
    SubscriptionPlanCreate,
    SubscriptionPlanRead,
    SubscriptionPlanUpdate,
)
from app.models.subscriptions import UserSubscription


class planService:
    crud = CRUDService(SubscriptionPlan)

    @staticmethod
    async def _ensure_unique_plan_type(
        db: AsyncSession,
        *,
        plans_type,
        exclude_plan_id: str | None = None,
    ) -> None:
        if plans_type is None:
            return

        stmt = select(SubscriptionPlan.id).where(
            SubscriptionPlan.plans_type == plans_type,
            SubscriptionPlan.deleted_at.is_(None),
        )
        if exclude_plan_id:
            stmt = stmt.where(SubscriptionPlan.id != exclude_plan_id)

        existing = (await db.execute(stmt.limit(1))).scalar_one_or_none()
        if existing is not None:
            from fastapi import HTTPException, status

            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Subscription plan type '{getattr(plans_type, 'value', plans_type)}' already exists",
            )

    @staticmethod
    async def _usage_map(db: AsyncSession) -> dict[str, bool]:
        statement = (
            select(UserSubscription.sub_plan_id, func.count(UserSubscription.id))
            .group_by(UserSubscription.sub_plan_id)
        )

        result = await db.execute(statement)

        return {
            str(plan_id): (count or 0) > 0
            for plan_id, count in result.all()
        }

    @staticmethod
    async def _usage_map_by_user(
        db: AsyncSession,
        user_code: str,
    ) -> dict[str, bool]:
        statement = (
            select(UserSubscription.sub_plan_id, func.count(UserSubscription.id))
            .where(UserSubscription.user_code == user_code)
            .group_by(UserSubscription.sub_plan_id)
        )

        result = await db.execute(statement)

        return {
            str(plan_id): (count or 0) > 0
            for plan_id, count in result.all()
        }

    @staticmethod
    async def _active_usage_map_by_user(
        db: AsyncSession,
        user_code: str,
    ) -> dict[str, bool]:
        statement = (
            select(UserSubscription.sub_plan_id, func.count(UserSubscription.id))
            .where(UserSubscription.user_code == user_code)
            .where(
                UserSubscription.status.in_(
                    [
                        SubscriptionStatus.ACTIVE,
                        SubscriptionStatus.PAYMENT_DUE,
                        SubscriptionStatus.OVERDUE,
                    ]
                )
            )
            .group_by(UserSubscription.sub_plan_id)
        )

        result = await db.execute(statement)

        return {
            str(plan_id): (count or 0) > 0
            for plan_id, count in result.all()
        }

    @staticmethod
    async def is_in_use(plan_id: str, db: AsyncSession) -> bool:
        usage = await planService._usage_map(db)
        return usage.get(str(plan_id), False)

    @staticmethod
    def _to_read(plan: SubscriptionPlan, in_use: bool) -> SubscriptionPlanRead:
        return SubscriptionPlanRead(
            id=plan.id,
            plans_type=plan.plans_type,
            price_per_day=plan.price_per_day,
            allow_monthly_payment=plan.allow_monthly_payment,
            allow_full_payment=plan.allow_full_payment,
            after_18_fee=plan.after_18_fee,
            waive_after_18_fee=plan.waive_after_18_fee,
            status=plan.status,
            deleted_at=getattr(plan, "deleted_at", None),
            created_at=plan.created_at,
            updated_at=plan.updated_at,
            is_in_use=in_use,
        )
    
    @staticmethod
    async def create_plan(
        plan_in: SubscriptionPlanCreate,
        db: AsyncSession,
    ) -> SubscriptionPlan:
        await planService._ensure_unique_plan_type(db, plans_type=plan_in.plans_type)
        return await planService.crud.create(db, plan_in)

    @staticmethod
    async def get_all_plans(db: AsyncSession) -> list[SubscriptionPlanRead]:
        plans = await planService.crud.get_all(db)
        usage = await planService._usage_map(db)

        return [
            planService._to_read(plan, usage.get(str(plan.id), False))
            for plan in plans
        ]

    @staticmethod
    async def get_plans_me(
        current_user: AuthUser,
        db: AsyncSession,
    ) -> list[SubscriptionPlanRead]:
        plans = await planService.crud.get_all(db)

        usage = await planService._active_usage_map_by_user(
            db=db,
            user_code=current_user.user_code,
        )

        return [
            planService._to_read(plan, usage.get(str(plan.id), False))
            for plan in plans
        ]

    @staticmethod
    async def get_plan(
        plan_id: str,
        db: AsyncSession,
    ) -> SubscriptionPlanRead:
        plan = await planService.crud.get(db, plan_id)
        usage = await planService._usage_map(db)

        return planService._to_read(plan, usage.get(str(plan.id), False))

    @staticmethod
    async def update_plan(
        plan_id: str,
        plan_in: SubscriptionPlanUpdate,
        db: AsyncSession,
    ) -> SubscriptionPlanRead:
        changed = plan_in.dict(exclude_unset=True, exclude_none=True)
        if "plans_type" in changed:
            await planService._ensure_unique_plan_type(
                db,
                plans_type=changed.get("plans_type"),
                exclude_plan_id=str(plan_id),
            )
        plan = await planService.crud.update(db, plan_id, plan_in)
        usage = await planService._usage_map(db)

        return planService._to_read(plan, usage.get(str(plan.id), False))

    @staticmethod
    async def delete_plan(
        plan_id: str,
        db: AsyncSession,
    ) -> SubscriptionPlan:
        return await planService.crud.delete(db, plan_id)
