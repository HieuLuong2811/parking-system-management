from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.subscriptions import SubscriptionController
from app.authen.current_user import AuthUser, is_admin_user, required_roles
from app.db.session import get_db
from app.enums.parking import PaymentType, SubscriptionPlanType, SubscriptionStatus
from app.models.responses import DeleteResponse
from app.models.subscriptions import (
    UserSubscriptionCreate,
    UserSubscriptionClientView,
    UserSubscriptionAdminView,
    UserSubscriptionRead,
)
from app.utils.pagination import PaginatedResponse

router = APIRouter(prefix="/subscriptions", tags=["user_subscriptions"])


@router.post("/", response_model=UserSubscriptionRead)
async def create_subscription(payload: UserSubscriptionCreate, db: AsyncSession = Depends(get_db)):
    return await SubscriptionController.create_subscription_ctrl(payload, db)

@router.get("/me/paginated", response_model=PaginatedResponse[UserSubscriptionClientView])
async def get_current_user_subscriptions_paginated(
    current_user: AuthUser = Depends(required_roles("USER")),
    db: AsyncSession = Depends(get_db),
    status: SubscriptionStatus | None = Query(None, description="Filter by subscription status"),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    limit: int = Query(5, ge=1, le=100, description="Number of items per page"),
):
    return await SubscriptionController.get_user_subscriptions_by_user_paginated_ctrl(
        current_user.user_code,
        db,
        status=status,
        page=page,
        limit=limit,
    )

@router.get("/me", response_model=list[UserSubscriptionAdminView])
async def get_current_user_subscriptions(
    current_user: AuthUser = Depends(required_roles("USER")),
    db: AsyncSession = Depends(get_db),
    status: SubscriptionStatus | None = Query(
        None,
        description="Filter by one subscription status",
    ),
    statuses: list[SubscriptionStatus] | None = Query(
        None,
        description="Filter by multiple subscription statuses",
    ),
):
    return await SubscriptionController.get_user_subscriptions_by_user_ctrl(
        current_user.user_code,
        db,
        status=status,
        statuses=statuses,
    )

@router.get("/details/paginated", response_model=PaginatedResponse[UserSubscriptionAdminView])
async def get_subscription_details_paginated(
    current_user: AuthUser = Depends(required_roles("ADMIN")),
    db: AsyncSession = Depends(get_db),
    search: str | None = Query(None, description="Legacy search (user, plan, plate, term)"),
    user_code: str | None = Query(None, description="Search by user code"),
    full_name: str | None = Query(None, description="Search by full name"),
    plan_type: SubscriptionPlanType | None = Query(None, description="Filter by plan type"),
    payment_type: PaymentType | None = Query(None, description="Filter by payment plan"),
    status: SubscriptionStatus | None = Query(None, description="Filter by subscription status"),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    limit: int = Query(5, ge=1, le=100, description="Number of items per page"),
):
    return await SubscriptionController.get_all_subscription_details_paginated_ctrl(
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

@router.delete("/{subscription_id}", response_model=DeleteResponse)
async def delete_subscription(subscription_id: str, db: AsyncSession = Depends(get_db)):
    return await SubscriptionController.delete_subscription_ctrl(subscription_id, db)
