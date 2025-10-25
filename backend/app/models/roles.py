from sqlmodel import SQLModel, Field, Relationship, Column
from datetime import datetime
from typing import List
from sqlalchemy import Enum as SQLAEnum
import uuid
from .user_roles import UserRoles
from ..enums.role_type import RoleType

class RolesBase(SQLModel):
    name: str = Field(max_length=50, unique=True)
    description: str = Field(default=None, max_length=255, nullable=True)
    created_at: datetime = Field(default_factory=datetime.now, nullable=True)
    updated_at: datetime = Field(default_factory=datetime.now, nullable=True)
    type_role: RoleType = Field(sa_column=Column(SQLAEnum(RoleType, name="role_type_enum")))

class Roles(RolesBase, table=True):
    __tablename__ = "roles"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    users: List["Users"] = Relationship(back_populates="roles", link_model=UserRoles)

class RolesCreate(SQLModel):
    name: str = Field(max_length=50, unique=True)
    description: str = Field(default=None, max_length=255, nullable=True)
    type_role: RoleType

class RolesRead(RolesBase):
    id: uuid.UUID


