from sqlmodel import Field, SQLModel


class UserRolesBase(SQLModel):
    user_code: str = Field(foreign_key="users.user_code", max_length=50, primary_key=True)
    role_id: int = Field(foreign_key="roles.id", primary_key=True)


class UserRoles(UserRolesBase, table=True):
    __tablename__ = "user_roles"


class UserRolesCreate(SQLModel):
    user_code: str = Field(max_length=50)
    role_id: int


class UserRolesRead(UserRolesBase):
    pass
