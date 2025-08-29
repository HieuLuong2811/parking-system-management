from sqlmodel import SQLModel, Field
from datetime import datetime
import uuid

class UserRoleBase(SQLModel):
    user_id: uuid.UUID = Field(foreign_key="users.id", nullable=False)
    role_id: uuid.UUID = Field(foreign_key="roles.id", nullable=False)
    created_at: datetime = Field(default_factory=datetime.now, nullable=True)

class UserRoles(UserRoleBase, table=True):
    __tablename__ = "user_roles"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)

class UserRolesCreate(SQLModel):
    user_id: uuid.UUID
    role_id: uuid.UUID

class UserRolesRead(UserRoleBase):
    id: uuid.UUID
