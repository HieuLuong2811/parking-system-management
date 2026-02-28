from app.models.parking_sessions import ParkingSession, ParkingSessionCreate, ParkingSessionUpdate
from app.service.base import CRUDService
from sqlalchemy.ext.asyncio import AsyncSession


class parkingSessionService:
    crud = CRUDService(ParkingSession)

    @staticmethod
    async def create_session(payload: ParkingSessionCreate, db: AsyncSession) -> ParkingSession:
        return await parkingSessionService.crud.create(db, payload)

    @staticmethod
    async def get_session(session_id: str, db: AsyncSession) -> ParkingSession:
        return await parkingSessionService.crud.get(db, session_id)

    @staticmethod
    async def get_all_sessions(db: AsyncSession) -> list[ParkingSession]:
        return await parkingSessionService.crud.get_all(db)

    @staticmethod
    async def update_session(
        session_id: str, payload: ParkingSessionUpdate, db: AsyncSession
    ) -> ParkingSession:
        return await parkingSessionService.crud.update(db, session_id, payload)

    @staticmethod
    async def delete_session(session_id: str, db: AsyncSession) -> ParkingSession:
        return await parkingSessionService.crud.delete(db, session_id)
