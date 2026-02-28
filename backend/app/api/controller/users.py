from sqlalchemy.ext.asyncio import AsyncSession

from app.models.responses import DeleteResponse
from app.models.users import UsersCreate, UsersRead, UsersUpdate
from app.service.users import userService


class UserController:
    @staticmethod
    async def get_all_users_ctrl(db: AsyncSession) -> list[UsersRead]:
        return await userService.get_all_users(db)

    @staticmethod
    async def create_user_ctrl(user_in: UsersCreate, db: AsyncSession) -> UsersRead:
        return await userService.create_user(user_in, db)

    @staticmethod
    async def update_user_ctrl(id: str, user_in: UsersUpdate, db: AsyncSession) -> UsersRead:
        return await userService.update_user(id, user_in, db)

    @staticmethod
    async def delete_user_ctrl(id: str, db: AsyncSession) -> DeleteResponse:
        await userService.delete_user(id, db)
        return DeleteResponse(message="Deleted user")
