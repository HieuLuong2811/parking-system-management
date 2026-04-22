from app.models.pricing import PaymentPlanPricingDetail, PaymentPlanPricingResponse
from app.service.payment_plans import paymentPlanService
from app.service.plan_pricing import planPricingService
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.payment_plans import PaymentPlanController
from app.db.session import get_db
from app.models.payment_plans import PaymentPlanCreate, PaymentPlanRead, PaymentPlanUpdate
from app.models.responses import DeleteResponse

router = APIRouter(prefix="/payment_plans", tags=["payment_plans"])


@router.post("/", response_model=PaymentPlanRead)
async def create_payment_plan(payload: PaymentPlanCreate, db: AsyncSession = Depends(get_db)):
    return await PaymentPlanController.create_payment_plan_ctrl(payload, db)

@router.get("/", response_model=list[PaymentPlanRead])
async def list_payment_plans(db: AsyncSession = Depends(get_db)):
    plans = await PaymentPlanController.get_all_payment_plans_ctrl(db)
    return plans

@router.get("/pricing/", response_model=PaymentPlanPricingResponse)
async def get_payment_plans_with_pricing(plan_id: str, term_id: str, db: AsyncSession = Depends(get_db)):
    plan_pricing = await planPricingService.get_plan_pricing(plan_id, term_id, db)
    payment_plans = await paymentPlanService.get_all_payment_plans(db)

    plans_index = {str(plan.id): plan for plan in payment_plans}

    payment_plan_details: list[PaymentPlanPricingDetail] = []
    for payment_mode in plan_pricing.payment_modes:
        plan = plans_index.get(str(payment_mode.payment_plan_id))
        if not plan:
            continue
        payment_plan_details.append(
            PaymentPlanPricingDetail(
                payment_plan_id=payment_mode.payment_plan_id,
                payment_type=payment_mode.payment_type,
                discount_percent=payment_mode.discount_percent,
                is_active=plan.is_active,
                original_amount=payment_mode.original_amount,
                amount=payment_mode.amount,
            )
        )

    return PaymentPlanPricingResponse(**plan_pricing.dict(), payment_plan_details=payment_plan_details)

@router.get("/{plan_id}", response_model=PaymentPlanRead)
async def get_payment_plan(plan_id: str, db: AsyncSession = Depends(get_db)):
    return await PaymentPlanController.get_payment_plan_ctrl(plan_id, db)

@router.patch("/{plan_id}", response_model=PaymentPlanRead)
async def update_payment_plan(plan_id: str, payload: PaymentPlanUpdate, db: AsyncSession = Depends(get_db)):
    return await PaymentPlanController.update_payment_plan_ctrl(plan_id, payload, db)

@router.delete("/{plan_id}", response_model=DeleteResponse)
async def delete_payment_plan(plan_id: str, db: AsyncSession = Depends(get_db)):
    return await PaymentPlanController.delete_payment_plan_ctrl(plan_id, db)
