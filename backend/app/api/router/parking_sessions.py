from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.parking_sessions import ParkingSessionController
from app.authen.current_user import required_roles
from app.db.session import get_db
from app.models.auth import AuthUser
from app.models.responses import DeleteResponse
from app.models.parking_sessions import (
    ParkingSessionCreate,
    ParkingSessionRead,
    ParkingSessionUpdate,
    ParkingSessionQRCheckIn,
)

router = APIRouter(prefix="/parking_sessions", tags=["parking_sessions"])


@router.post("/", response_model=ParkingSessionRead)
async def create_session(payload: ParkingSessionCreate, db: AsyncSession = Depends(get_db)):
    return await ParkingSessionController.create_session_ctrl(payload, db)


@router.post("/qr_checkin", response_model=ParkingSessionRead)
async def qr_checkin(payload: ParkingSessionQRCheckIn, db: AsyncSession = Depends(get_db)):
    return await ParkingSessionController.create_session_via_qr_ctrl(payload, db)


@router.get("/", response_model=list[ParkingSessionRead])
async def list_sessions(
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("ADMIN")),
):
    return await ParkingSessionController.get_all_sessions_ctrl(db)


@router.get("/me", response_model=list[ParkingSessionRead])
async def list_my_sessions(
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("USER", "ADMIN", "SECURITY")),
):
    return await ParkingSessionController.get_sessions_by_user_ctrl(current_user.user_code, db)


@router.get("/{session_id}", response_model=ParkingSessionRead)
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    return await ParkingSessionController.get_session_ctrl(session_id, db)


@router.patch("/{session_id}", response_model=ParkingSessionRead)
async def update_session(
    session_id: str, payload: ParkingSessionUpdate, db: AsyncSession = Depends(get_db)
):
    return await ParkingSessionController.update_session_ctrl(session_id, payload, db)


@router.delete("/{session_id}", response_model=DeleteResponse)
async def delete_session(session_id: str, db: AsyncSession = Depends(get_db)):
    return await ParkingSessionController.delete_session_ctrl(session_id, db)
