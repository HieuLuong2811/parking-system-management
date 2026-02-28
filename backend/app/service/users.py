from app.models.users import Users, UsersCreate, UsersUpdate
from app.service.base import CRUDService
from sqlalchemy.ext.asyncio import AsyncSession


class userService:
    crud = CRUDService(Users, pk_field="user_code")

    @staticmethod
    async def create_user(user_in: UsersCreate, db: AsyncSession) -> Users:
        return await userService.crud.create(db, user_in)

    @staticmethod
    async def get_all_users(db: AsyncSession) -> list[Users]:
        return await userService.crud.get_all(db)

    @staticmethod
    async def update_user(id: str, user_in: UsersUpdate, db: AsyncSession) -> Users:
        return await userService.crud.update(db, id, user_in)

    @staticmethod
    async def delete_user(id: str, db: AsyncSession) -> Users:
        return await userService.crud.delete(db, id)
