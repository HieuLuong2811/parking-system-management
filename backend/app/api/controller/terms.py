from sqlalchemy.ext.asyncio import AsyncSession

from app.models.responses import DeleteResponse
from app.models.terms import AcademicTermCreate, AcademicTermRead, AcademicTermUpdate
from app.service.terms import termService


class TermController:
    @staticmethod
    async def create_term_ctrl(term_in: AcademicTermCreate, db: AsyncSession) -> AcademicTermRead:
        return await termService.create_term(term_in, db)

    @staticmethod
    async def get_term_ctrl(term_id: str, db: AsyncSession) -> AcademicTermRead:
        return await termService.get_term(term_id, db)

    @staticmethod
    async def get_all_terms_ctrl(db: AsyncSession) -> list[AcademicTermRead]:
        return await termService.get_all_terms(db)

    @staticmethod
    async def update_term_ctrl(term_id: str, term_in: AcademicTermUpdate, db: AsyncSession) -> AcademicTermRead:
        return await termService.update_term(term_id, term_in, db)

    @staticmethod
    async def delete_term_ctrl(term_id: str, db: AsyncSession) -> DeleteResponse:
        await termService.delete_term(term_id, db)
        return DeleteResponse(message="Deleted academic term")
