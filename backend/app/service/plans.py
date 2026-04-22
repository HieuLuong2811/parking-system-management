from __future__ import annotations

from sqlalchemy import func, select
from app.service.base import CRUDService
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.plans import SubscriptionPlan, SubscriptionPlanCreate, SubscriptionPlanRead, SubscriptionPlanUpdate
from app.models.subscriptions import UserSubscription

class planService:
    crud = CRUDService(SubscriptionPlan)

    @staticmethod
    async def _usage_map(db: AsyncSession) -> dict[str, bool]:
        statement = (
            select(UserSubscription.sub_plan_id, func.count(UserSubscription.id))
            .group_by(UserSubscription.sub_plan_id)
        )
        result = await db.execute(statement)
        return {str(plan_id): (count or 0) > 0 for plan_id, count in result.all()}

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
            deleted_at=getattr(plan, "deleted_at", None),
            created_at=plan.created_at,
            updated_at=plan.updated_at,
            is_in_use=in_use,
        )

    @staticmethod
    async def create_plan(plan_in: SubscriptionPlanCreate, db: AsyncSession) -> SubscriptionPlan:
        return await planService.crud.create(db, plan_in)

    @staticmethod
    async def get_all_plans(db: AsyncSession) -> list[SubscriptionPlanRead]:
        plans = await planService.crud.get_all(db)
        usage = await planService._usage_map(db)
        return [planService._to_read(plan, usage.get(str(plan.id), False)) for plan in plans]

    @staticmethod
    async def get_plan(plan_id: str, db: AsyncSession) -> SubscriptionPlanRead:
        plan = await planService.crud.get(db, plan_id)
        usage = await planService._usage_map(db)
        return planService._to_read(plan, usage.get(str(plan.id), False))

    @staticmethod
    async def update_plan(plan_id: str, plan_in: SubscriptionPlanUpdate, db: AsyncSession) -> SubscriptionPlanRead:
        plan = await planService.crud.update(db, plan_id, plan_in)
        usage = await planService._usage_map(db)
        return planService._to_read(plan, usage.get(str(plan.id), False))

    @staticmethod
    async def delete_plan(plan_id: str, db: AsyncSession) -> SubscriptionPlan:
        return await planService.crud.delete(db, plan_id)
