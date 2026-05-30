from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.service.base import CRUDService
from app.models.terms import (
    AcademicTerm,
    AcademicTermCreate,
    AcademicTermRead,
    AcademicTermUpdate,
)


class termService:
    crud = CRUDService(AcademicTerm)

    @staticmethod
    def _to_read(term: AcademicTerm) -> AcademicTermRead:
        return AcademicTermRead(
            id=term.id,
            term_name=term.term_name,
            start_date=term.start_date,
            end_date=term.end_date,
            created_at=term.created_at,
            updated_at=term.updated_at,
        )

    @staticmethod
    async def create_term(
        term_in: AcademicTermCreate,
        db: AsyncSession,
    ) -> AcademicTermRead:
        term = await termService.crud.create(db, term_in)
        return termService._to_read(term)

    @staticmethod
    async def get_term(
        term_id: str,
        db: AsyncSession,
    ) -> AcademicTermRead:
        term = await termService.crud.get(db, term_id)
        return termService._to_read(term)

    @staticmethod
    async def get_all_terms(
        db: AsyncSession,
    ) -> list[AcademicTermRead]:
        terms = await termService.crud.get_all(db)
        return [termService._to_read(term) for term in terms]

    @staticmethod
    async def update_term(
        term_id: str,
        term_in: AcademicTermUpdate,
        db: AsyncSession,
    ) -> AcademicTermRead:
        term = await termService.crud.update(db, term_id, term_in)
        return termService._to_read(term)

    @staticmethod
    async def delete_term(
        term_id: str,
        db: AsyncSession,
    ) -> AcademicTerm:
        return await termService.crud.delete(db, term_id)