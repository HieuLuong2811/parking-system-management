from sqlalchemy.ext.asyncio import AsyncSession

from app.models.responses import DeleteResponse
from app.models.parking_sessions import ParkingSessionCreate, ParkingSessionRead, ParkingSessionUpdate
from app.service.parking_sessions import parkingSessionService


class ParkingSessionController:
    @staticmethod
    async def create_session_ctrl(payload: ParkingSessionCreate, db: AsyncSession) -> ParkingSessionRead:
        return await parkingSessionService.create_session(payload, db)

    @staticmethod
    async def get_session_ctrl(session_id: str, db: AsyncSession) -> ParkingSessionRead:
        return await parkingSessionService.get_session(session_id, db)

    @staticmethod
    async def get_all_sessions_ctrl(db: AsyncSession) -> list[ParkingSessionRead]:
        return await parkingSessionService.get_all_sessions(db)

    @staticmethod
    async def update_session_ctrl(session_id: str, payload: ParkingSessionUpdate, db: AsyncSession) -> ParkingSessionRead:
        return await parkingSessionService.update_session(session_id, payload, db)

    @staticmethod
    async def delete_session_ctrl(session_id: str, db: AsyncSession) -> DeleteResponse:
        await parkingSessionService.delete_session(session_id, db)
        return DeleteResponse(message="Deleted parking session")
