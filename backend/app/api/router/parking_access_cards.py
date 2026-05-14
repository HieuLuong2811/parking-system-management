from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.parking_access_cards import ParkingAccessCardController
from app.authen.current_user import AuthUser, required_roles
from app.db.session import get_db
from app.models.parking_access_cards import (
    ParkingAccessCardCreate,
    ParkingAccessCardRead,
    ParkingAccessCardUpdate,
)
from app.models.responses import DeleteResponse

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


@router.delete("/{card_id}", response_model=DeleteResponse)
async def delete_parking_access_card(
    card_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("ADMIN")),
):
    return await ParkingAccessCardController.delete_card_ctrl(card_id, db)
