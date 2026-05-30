from __future__ import annotations

from datetime import date, datetime
from typing import Optional
import uuid

from sqlmodel import Field, SQLModel

from .mixins import TimestampMixin


class AcademicTermBase(SQLModel):
    term_name: str = Field(max_length=255, nullable=False)
    start_date: date
    end_date: date


class AcademicTerm(AcademicTermBase, TimestampMixin, table=True):
    __tablename__ = "academic_terms"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)


class AcademicTermCreate(AcademicTermBase):
    pass


class AcademicTermRead(AcademicTermBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class AcademicTermUpdate(SQLModel):
    term_code: Optional[str] = Field(default=None, max_length=50)
    term_name: Optional[str] = Field(default=None, max_length=255)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
