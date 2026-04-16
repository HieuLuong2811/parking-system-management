from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.pricing import PlanPricingResponse
from app.service.plan_pricing import planPricingService
from app.db.session import get_db


router = APIRouter(prefix="/plan_pricing", tags=["plan_pricing"])


@router.get("/", response_model=PlanPricingResponse)
async def get_plan_pricing(plan_id: str, term_id: str, db: AsyncSession = Depends(get_db)):
    return await planPricingService.get_plan_pricing(plan_id, term_id, db)

