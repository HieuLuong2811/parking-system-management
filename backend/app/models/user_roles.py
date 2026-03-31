from datetime import datetime
import uuid
from sqlmodel import Field, SQLModel


class UserRolesBase(SQLModel):
    user_code: str = Field(foreign_key="users.user_code", max_length=50)
    role_id: uuid.UUID = Field(foreign_key="roles.id")
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class UserRoles(UserRolesBase, table=True):
    __tablename__ = "user_roles"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)


class UserRolesCreate(SQLModel):
    user_code: str = Field(max_length=50)
    role_id: uuid.UUID


class UserRolesRead(UserRolesBase):
    id: uuid.UUID
