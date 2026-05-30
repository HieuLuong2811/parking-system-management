from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.authen.current_user import AuthUser, required_roles
from app.db.session import get_db
from app.models.parking_access_cards import ParkingAccessCardRead
from app.service.parking_access_cards import parkingAccessCardService

router = APIRouter(prefix="/parking-access-cards", tags=["parking_access_cards"])


@router.patch("/{card_id}/activate", response_model=ParkingAccessCardRead)
async def activate_parking_access_card(
    card_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("USER", "ADMIN", "SECURITY")),
):
    return await parkingAccessCardService.activate_card(card_id, db, current_user)


@router.patch("/{card_id}/report-lost", response_model=ParkingAccessCardRead)
async def report_lost_parking_access_card_client(
    card_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user),
):
    return await parkingAccessCardService.report_lost(card_id, db, current_user)

