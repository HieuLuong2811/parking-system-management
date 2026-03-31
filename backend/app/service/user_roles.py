from fastapi import HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.roles import Roles
from app.models.user_roles import UserRoles, UserRolesCreate


class userRolesService:
    @staticmethod
    async def assign_role(user_in: UserRolesCreate, db: AsyncSession) -> UserRoles:
        statement = select(UserRoles).where(
            UserRoles.user_code == user_in.user_code,
            UserRoles.role_id == user_in.role_id,
        )
        result = await db.execute(statement)
        if result.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Role already assigned")

        user_role = UserRoles(**user_in.dict())
        db.add(user_role)
        await db.commit()
        await db.refresh(user_role)
        return user_role

    @staticmethod
    async def get_all_user_roles(db: AsyncSession) -> list[UserRoles]:
        statement = select(UserRoles)
        result = await db.execute(statement)
        return result.scalars().all()

    @staticmethod
    async def revoke_role(user_code: str, role_id: str, db: AsyncSession) -> None:
        statement = delete(UserRoles).where(
            UserRoles.user_code == user_code,
            UserRoles.role_id == role_id
        )
        result = await db.execute(statement)
        if result.rowcount == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
        await db.commit()

    @staticmethod
    async def get_roles_for_user(user_code: str, db: AsyncSession) -> list[str]:
        statement = (
            select(Roles.role_code)
            .join(UserRoles, Roles.id == UserRoles.role_id)
            .where(UserRoles.user_code == user_code)
        )
        result = await db.execute(statement)
        return result.scalars().all()
