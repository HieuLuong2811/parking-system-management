from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.parking_sessions import ParkingSessionController
from app.db.session import get_db
from app.models.responses import DeleteResponse
from app.models.parking_sessions import ParkingSessionCreate, ParkingSessionRead, ParkingSessionUpdate

router = APIRouter(prefix="/parking_sessions", tags=["parking_sessions"])


@router.post("/", response_model=ParkingSessionRead)
async def create_session(payload: ParkingSessionCreate, db: AsyncSession = Depends(get_db)):
    return await ParkingSessionController.create_session_ctrl(payload, db)


@router.get("/", response_model=list[ParkingSessionRead])
async def list_sessions(db: AsyncSession = Depends(get_db)):
    sessions = await ParkingSessionController.get_all_sessions_ctrl(db)
    if not sessions:
        raise HTTPException(status_code=404, detail="No parking sessions found")
    return sessions


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
