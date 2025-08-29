from sqlmodel import Relationship, SQLModel, Field
from typing import Optional, List
from datetime import datetime
import uuid
from .user_roles import UserRoles

class UsersBase(SQLModel):
    full_name: str = Field(max_length=255)
    avatar: Optional[str] = Field(default=None, nullable=True)
    phone_number: str = Field(max_length=255, nullable=False)
    address: Optional[str] = Field(default=None, max_length=255, nullable=True)
    citizen_id: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.now, nullable=True)
    updated_at: datetime = Field(default_factory=datetime.now, nullable=True)

class Users(UsersBase, table=True):
    __tablename__ = "users"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    roles: List["Roles"] = Relationship(back_populates="users", link_model=UserRoles)

class UsersCreate(SQLModel):
    full_name: str = Field(max_length=255)
    avatar: Optional[str] = Field(default=None)
    phone_number: str = Field(max_length=255)
    address: Optional[str] = Field(default=None, max_length=255)
    citizen_id: str = Field(max_length=255)

class UsersRead(UsersBase):
    id: uuid.UUID

class DeleteReponse(SQLModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    message: str