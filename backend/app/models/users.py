from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid

# Base class chứa các trường chung
class UsersBase(SQLModel):
    full_name: str = Field(max_length=255)
    avatar: Optional[str] = Field(default=None, nullable=True)
    phone_number: str = Field(max_length=255, nullable=False)
    address: Optional[str] = Field(default=None, max_length=255, nullable=True)
    citizen_id: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.now, nullable=True)
    updated_at: datetime = Field(default_factory=datetime.now, nullable=True)

# Model tạo table
class Users(UsersBase, table=True):
    __tablename__ = "users"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)

# Schema dùng để tạo user
class UsersCreate(SQLModel):
    full_name: str = Field(max_length=255)
    avatar: Optional[str] = Field(default=None)
    phone_number: str = Field(max_length=255)
    address: Optional[str] = Field(default=None, max_length=255)
    citizen_id: str = Field(max_length=255)

# Schema dùng để trả về user
class UsersRead(UsersBase):
    id: uuid.UUID

class DeleteReponse(SQLModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    message: str