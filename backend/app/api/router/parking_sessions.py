from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.parking_sessions import ParkingSessionController
from app.authen.current_user import required_roles
from app.db.session import get_db
from app.enums.parking import ParkingSessionStatus, VehicleType
from app.models.auth import AuthUser
from app.models.responses import DeleteResponse
from app.models.parking_sessions import (
    ParkingSessionCreate,
    ParkingSessionAdminRead,
    ParkingSessionRead,
    ParkingSessionUpdate,
    ParkingSessionQRCheckIn,
)
from app.utils.pagination import PaginatedResponse

router = APIRouter(prefix="/parking_sessions", tags=["parking_sessions"])


@router.post("/", response_model=ParkingSessionRead)
async def create_session(payload: ParkingSessionCreate, db: AsyncSession = Depends(get_db)):
    return await ParkingSessionController.create_session_ctrl(payload, db)


@router.post("/qr_checkin", response_model=ParkingSessionRead)
async def qr_checkin(payload: ParkingSessionQRCheckIn, db: AsyncSession = Depends(get_db)):
    return await ParkingSessionController.create_session_via_qr_ctrl(payload, db)


@router.get("/", response_model=PaginatedResponse[ParkingSessionAdminRead])
async def list_sessions(
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("ADMIN")),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    limit: int = Query(20, ge=1, le=100, description="Number of items per page"),
    query: str | None = Query(None, description="Search by session, vehicle, plate, user"),
    user_code: str | None = Query(None, description="Filter by user code"),
    vehicle_type: VehicleType | None = Query(None, description="Filter by vehicle type"),
    status: ParkingSessionStatus | None = Query(None, description="Filter by session status"),
    from_time: datetime | None = Query(None, description="Filter by check-in time (from)"),
    to_time: datetime | None = Query(None, description="Filter by check-in time (to)"),
):
    return await ParkingSessionController.get_sessions_paginated_ctrl(
        db,
        page=page,
        limit=limit,
        query=query,
        user_code=user_code,
        vehicle_type=vehicle_type,
        status=status,
        from_time=from_time,
        to_time=to_time,
    )


@router.get("/me", response_model=PaginatedResponse[ParkingSessionRead])
async def list_my_sessions(
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("USER", "ADMIN", "SECURITY")),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    limit: int = Query(20, ge=1, le=100, description="Number of items per page"),
    query: str | None = Query(None, description="Search by session, vehicle, plate"),
    status: ParkingSessionStatus | None = Query(None, description="Filter by session status"),
    from_time: datetime | None = Query(None, description="Filter by check-in time (from)"),
    to_time: datetime | None = Query(None, description="Filter by check-in time (to)"),
):
    return await ParkingSessionController.get_sessions_paginated_ctrl(
        db,
        scope_user_code=current_user.user_code,
        page=page,
        limit=limit,
        query=query,
        status=status,
        from_time=from_time,
        to_time=to_time,
    )


@router.get("/me/export")
async def export_my_sessions_xlsx(
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("USER", "ADMIN", "SECURITY")),
    query: str | None = Query(None, description="Search by session, vehicle, plate"),
    status: ParkingSessionStatus | None = Query(None, description="Filter by session status"),
    from_time: datetime | None = Query(None, description="Filter by check-in time (from)"),
    to_time: datetime | None = Query(None, description="Filter by check-in time (to)"),
):
    return await ParkingSessionController.export_my_sessions_xlsx_ctrl(
        db,
        user_code=current_user.user_code,
        query=query,
        status=status,
        from_time=from_time,
        to_time=to_time,
    )


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
