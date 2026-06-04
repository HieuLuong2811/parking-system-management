from app.api.deps import get_current_user
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.parking_access_cards import ParkingAccessCardController
from app.authen.current_user import AuthUser, required_roles
from app.db.session import get_db
from app.enums.parking import ParkingAccessCardHolderType, ParkingAccessCardStatus
from app.models.parking_access_cards import (
    ParkingAccessCardCreate,
    ParkingAccessCardAdminRead,
    ParkingAccessCardRead,
    ParkingAccessCardUpdate,
)
from app.models.users import UsersRead
from app.models.responses import DeleteResponse
from app.utils.pagination import PaginatedResponse

router = APIRouter(
    prefix="/parking_access_cards",
    tags=["parking_access_cards"],
)


@router.post("/", response_model=ParkingAccessCardRead)
async def create_parking_access_card(
    payload: ParkingAccessCardCreate,
    db: AsyncSession = Depends(get_db),
    # current_user: AuthUser = Depends(required_roles("ADMIN")),
):
    return await ParkingAccessCardController.create_card_ctrl(payload, db)


@router.get("/lookup", response_model=ParkingAccessCardRead)
async def lookup_parking_access_card(
    barcode_token: str = Query(...),
    db: AsyncSession = Depends(get_db),
    # current_user: AuthUser = Depends(required_roles("ADMIN", "SECURITY")),
):
    return await ParkingAccessCardController.lookup_card_ctrl(
        barcode_token,
        db,
    )


@router.get("", response_model=PaginatedResponse[ParkingAccessCardAdminRead])
async def list_parking_access_cards_paginated(
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("ADMIN", "SECURITY")),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    limit: int = Query(20, ge=1, le=100, description="Number of items per page"),
    barcode_token: str | None = Query(None, description="Search by barcode token"),
    holder_type: ParkingAccessCardHolderType | None = Query(None, description="Filter by holder type"),
    status: ParkingAccessCardStatus | None = Query(None, description="Filter by card status"),
    user_query: str | None = Query(None, description="Search by user code or full name"),
):
    return await ParkingAccessCardController.get_cards_paginated_ctrl(
        db,
        page=page,
        limit=limit,
        barcode_token=barcode_token,
        holder_type=holder_type,
        status=status,
        user_query=user_query,
    )


@router.get("/eligible_users", response_model=PaginatedResponse[UsersRead])
async def list_eligible_users_for_card(
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("ADMIN")),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    limit: int = Query(5, ge=1, le=50, description="Number of items per page"),
    q: str | None = Query(None, description="Search by user code, full name, or email"),
):
    return await ParkingAccessCardController.get_eligible_users_paginated_ctrl(
        db,
        page=page,
        limit=limit,
        q=q,
    )


@router.get("/me", response_model=ParkingAccessCardRead)
async def get_my_parking_access_card(
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("USER", "ADMIN", "SECURITY")),
):
    return await ParkingAccessCardController.get_my_card_ctrl(
        current_user.user_code,
        db,
    )


@router.get("/{card_id}", response_model=ParkingAccessCardRead)
async def get_parking_access_card(
    card_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("ADMIN")),
):
    return await ParkingAccessCardController.get_card_ctrl(card_id, db)


@router.patch("/{card_id}/report_lost", response_model=ParkingAccessCardRead)
async def report_lost_parking_access_card(
    card_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user),
):
    return await ParkingAccessCardController.report_lost_ctrl(card_id, db, current_user)


@router.patch("/{card_id}", response_model=ParkingAccessCardRead)
async def update_parking_access_card(
    card_id: str,
    payload: ParkingAccessCardUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("ADMIN")),
):
    return await ParkingAccessCardController.update_card_ctrl(
        card_id,
        payload,
        db,
    )


@router.patch("/{card_id}/disable", response_model=ParkingAccessCardRead)
async def disable_parking_access_card(
    card_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("ADMIN")),
):
    return await ParkingAccessCardController.disable_card_ctrl(card_id, db)


@router.delete("/{card_id}", response_model=DeleteResponse)
async def delete_parking_access_card(
    card_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("ADMIN")),
):
    return await ParkingAccessCardController.delete_card_ctrl(card_id, db)
