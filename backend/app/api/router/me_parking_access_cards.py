from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.authen.current_user import AuthUser, required_roles
from app.db.session import get_db
from app.models.parking_access_cards import ParkingAccessCardRead
from app.service.parking_access_cards import parkingAccessCardService

router = APIRouter(prefix="/me", tags=["me"])


@router.get("/parking-access-cards", response_model=list[ParkingAccessCardRead])
async def list_my_parking_access_cards(
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("USER", "ADMIN", "SECURITY")),
):
    return await parkingAccessCardService.get_cards_by_user_code(current_user.user_code, db)

