from sqlalchemy import select, func
import uuid

from app.models.payment_plans import (
    PaymentPlan,
    PaymentPlanCreate,
    PaymentPlanRead,
    PaymentPlanUpdate,
)
from app.service.base import CRUDService
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.models.subscriptions import UserSubscription

class paymentPlanService:
    crud = CRUDService(PaymentPlan)

    @staticmethod
    async def create_payment_plan(payload: PaymentPlanCreate, db: AsyncSession) -> PaymentPlan:
        payment_plan = await paymentPlanService.get_by_payment_type(db, payload.payment_type)
        if payment_plan:
            raise HTTPException(status_code=400, detail="payment_plan_already_exists")
        
        if payload.discount_percent > 70:
            raise HTTPException(status_code=400, detail="discount_percent_invalid")
        
        return await paymentPlanService.crud.create(db, payload)

    @staticmethod
    async def get_by_payment_type(db: AsyncSession, payment_type: str) -> PaymentPlan:
        result = await db.execute(
            select(PaymentPlan).where(PaymentPlan.payment_type == payment_type)
        )
        return result.scalars().first()
    
    @staticmethod
    async def get_payment_plan(plan_id: str, db: AsyncSession) -> PaymentPlan:
        return await paymentPlanService.crud.get(db, plan_id)

    @staticmethod
    async def get_all_payment_plans(db: AsyncSession) -> list[PaymentPlanRead]:
        plans = await paymentPlanService.crud.get_all(db)
        if not plans:
            return plans

        used_ids = (
            await db.execute(
                select(UserSubscription.payment_plan_id)
                .where(UserSubscription.payment_plan_id.is_not(None))
                .distinct()
            )
        ).scalars().all()
        used_set = {str(v) for v in used_ids if v is not None}

        return [
            PaymentPlanRead.model_validate(
                p,
                update={"is_in_use": str(p.id) in used_set},
            )
            for p in plans
        ]

    @staticmethod
    async def update_payment_plan(plan_id: str, payload: PaymentPlanUpdate, db: AsyncSession) -> PaymentPlan:
        payment_plan = await paymentPlanService.get_by_payment_type(db, payload.payment_type)
        if payment_plan and str(payment_plan.id) != str(plan_id):
            raise HTTPException(status_code=400, detail="payment_plan_already_exists")

        if payload.discount_percent > 70:
            raise HTTPException(status_code=400, detail="discount_percent_invalid")
        return await paymentPlanService.crud.update(db, plan_id, payload)

    @staticmethod
    async def delete_payment_plan(plan_id: str, db: AsyncSession) -> PaymentPlan:
        try:
            plan_uuid = uuid.UUID(str(plan_id))
        except ValueError as e:
            raise HTTPException(status_code=400, detail="invalid_payment_plan_id") from e

        in_use = await db.scalar(
            select(func.count())
            .select_from(UserSubscription)
            .where(UserSubscription.payment_plan_id == plan_uuid)
        )
        if int(in_use or 0) > 0:
            raise HTTPException(status_code=400, detail="payment_plan_in_use")
        return await paymentPlanService.crud.delete(db, plan_id)
