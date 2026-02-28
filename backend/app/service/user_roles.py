from fastapi import HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user_roles import UserRoles, UserRolesCreate


class userRolesService:
    @staticmethod
    async def assign_role(user_in: UserRolesCreate, db: AsyncSession) -> UserRoles:
        user_role = UserRoles(**user_in.dict())
        db.add(user_role)
        try:
            await db.commit()
        except IntegrityError as exc:
            await db.rollback()
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Role already assigned") from exc
        await db.refresh(user_role)
        return user_role

    @staticmethod
    async def get_all_user_roles(db: AsyncSession) -> list[UserRoles]:
        statement = select(UserRoles)
        result = await db.execute(statement)
        return result.scalars().all()

    @staticmethod
    async def revoke_role(user_code: str, role_id: int, db: AsyncSession) -> None:
        statement = delete(UserRoles).where(
            UserRoles.user_code == user_code,
            UserRoles.role_id == role_id
        )
        result = await db.execute(statement)
        if result.rowcount == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
        await db.commit()
