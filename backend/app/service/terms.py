from __future__ import annotations

from sqlalchemy import func, select
from app.service.base import CRUDService
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.terms import AcademicTerm, AcademicTermCreate, AcademicTermRead, AcademicTermUpdate
from app.models.subscriptions import UserSubscription


class termService:
    crud = CRUDService(AcademicTerm)

    @staticmethod
    async def _usage_map(db: AsyncSession) -> dict[str, bool]:
        statement = (
            select(UserSubscription.term_id, func.count(UserSubscription.id))
            .group_by(UserSubscription.term_id)
        )
        result = await db.execute(statement)
        return {str(term_id): (count or 0) > 0 for term_id, count in result.all()}

    @staticmethod
    async def is_in_use(term_id: str, db: AsyncSession) -> bool:
        usage = await termService._usage_map(db)
        return usage.get(str(term_id), False)

    @staticmethod
    def _to_read(term: AcademicTerm, in_use: bool) -> AcademicTermRead:
        return AcademicTermRead(
            id=term.id,
            term_name=term.term_name,
            start_date=term.start_date,
            end_date=term.end_date,
            created_at=term.created_at,
            updated_at=term.updated_at,
            is_in_use=in_use,
        )

    @staticmethod
    async def create_term(term_in: AcademicTermCreate, db: AsyncSession) -> AcademicTerm:
        return await termService.crud.create(db, term_in)

    @staticmethod
    async def get_term(term_id: str, db: AsyncSession) -> AcademicTermRead:
        term = await termService.crud.get(db, term_id)
        usage = await termService._usage_map(db)
        return termService._to_read(term, usage.get(str(term.id), False))

    @staticmethod
    async def get_all_terms(db: AsyncSession) -> list[AcademicTermRead]:
        terms = await termService.crud.get_all(db)
        usage = await termService._usage_map(db)
        return [termService._to_read(term, usage.get(str(term.id), False)) for term in terms]

    @staticmethod
    async def update_term(term_id: str, term_in: AcademicTermUpdate, db: AsyncSession) -> AcademicTermRead:
        term = await termService.crud.update(db, term_id, term_in)
        usage = await termService._usage_map(db)
        return termService._to_read(term, usage.get(str(term.id), False))

    @staticmethod
    async def delete_term(term_id: str, db: AsyncSession) -> AcademicTerm:
        return await termService.crud.delete(db, term_id)
