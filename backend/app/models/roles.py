from sqlmodel import SQLModel, Field
from datetime import datetime
import uuid

class RolesBase(SQLModel):
    name: str = Field(max_length=50, unique=True)
    description: str = Field(default=None, max_length=255, nullable=True)
    created_at: datetime = Field(default_factory=datetime.now, nullable=True)
    updated_at: datetime = Field(default_factory=datetime.now, nullable=True)

class Roles(RolesBase, table=True):
    __tablename__ = "roles"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)

class RolesCreate(SQLModel):
    name: str = Field(max_length=50, unique=True)
    description: str = Field(default=None, max_length=255, nullable=True)

class RolesRead(RolesBase):
    id: uuid.UUID


