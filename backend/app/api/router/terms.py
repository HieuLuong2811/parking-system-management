from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.terms import TermController
from app.db.session import get_db
from app.models.responses import DeleteResponse
from app.models.terms import AcademicTermCreate, AcademicTermRead, AcademicTermUpdate

router = APIRouter(prefix="/terms", tags=["academic_terms"])


@router.post("/", response_model=AcademicTermRead)
async def create_term(term_in: AcademicTermCreate, db: AsyncSession = Depends(get_db)):
    return await TermController.create_term_ctrl(term_in, db)


@router.get("/", response_model=list[AcademicTermRead])
async def list_terms(db: AsyncSession = Depends(get_db)):
    terms = await TermController.get_all_terms_ctrl(db)
    if not terms:
        raise HTTPException(status_code=404, detail="No academic terms found")
    return terms


@router.get("/{term_id}", response_model=AcademicTermRead)
async def get_term(term_id: str, db: AsyncSession = Depends(get_db)):
    return await TermController.get_term_ctrl(term_id, db)


@router.patch("/{term_id}", response_model=AcademicTermRead)
async def update_term(term_id: str, term_in: AcademicTermUpdate, db: AsyncSession = Depends(get_db)):
    return await TermController.update_term_ctrl(term_id, term_in, db)


@router.delete("/{term_id}", response_model=DeleteResponse)
async def delete_term(term_id: str, db: AsyncSession = Depends(get_db)):
    return await TermController.delete_term_ctrl(term_id, db)
