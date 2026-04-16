from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.stripe import (
    AttachPaymentMethodRequest,
    SetupIntentResponse,
    StripeController,
    StripePaymentIntentRequest,
    StripePaymentIntentResponse,
)
from app.api.deps import get_current_user
from app.authen.current_user import AuthUser
from app.db.session import get_db

router = APIRouter(prefix="/stripe", tags=["stripe"])


@router.get("/setup-intent", response_model=SetupIntentResponse)
async def create_setup_intent(
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await StripeController.create_setup_intent(current_user, db)


@router.post("/payment-method")
async def save_payment_method(
    payload: AttachPaymentMethodRequest,
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await StripeController.attach_payment_method(current_user, payload, db)


@router.post("/payment-intents", response_model=StripePaymentIntentResponse)
async def create_payment_intent(
    payload: StripePaymentIntentRequest,
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await StripeController.create_payment_intent(current_user, payload, db)
