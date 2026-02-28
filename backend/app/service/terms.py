from app.models.terms import AcademicTerm, AcademicTermCreate, AcademicTermUpdate
from app.service.base import CRUDService
from sqlalchemy.ext.asyncio import AsyncSession


class termService:
    crud = CRUDService(AcademicTerm)

    @staticmethod
    async def create_term(term_in: AcademicTermCreate, db: AsyncSession) -> AcademicTerm:
        return await termService.crud.create(db, term_in)

    @staticmethod
    async def get_term(term_id: str, db: AsyncSession) -> AcademicTerm:
        return await termService.crud.get(db, term_id)

    @staticmethod
    async def get_all_terms(db: AsyncSession) -> list[AcademicTerm]:
        return await termService.crud.get_all(db)

    @staticmethod
    async def update_term(term_id: str, term_in: AcademicTermUpdate, db: AsyncSession) -> AcademicTerm:
        return await termService.crud.update(db, term_id, term_in)

    @staticmethod
    async def delete_term(term_id: str, db: AsyncSession) -> AcademicTerm:
        return await termService.crud.delete(db, term_id)
