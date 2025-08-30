from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.user_roles import UserRoles, UserRolesCreate

class userRolesService:
    @staticmethod
    async def create_user_roles(user_in: UserRolesCreate, db: AsyncSession) -> UserRoles:
        user = UserRoles.from_orm(user_in)
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def get_all_user_roles(db: AsyncSession) -> list[UserRoles]:
        result = await db.execute(select(UserRoles))
        return result.scalars().all()
    