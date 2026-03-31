from sqlalchemy.ext.asyncio import AsyncSession

from app.models.auth import UserBulkImportRequest
from app.models.responses import DeleteResponse
from app.models.users import UsersCreate, UsersRead, UsersUpdate
from app.service.users import userService


class UserController:
    @staticmethod
    async def get_all_users_ctrl(db: AsyncSession) -> list[UsersRead]:
        return await userService.get_all_users(db)
    
    async def get_user_by_user_code_ctrl(user_code: str, db: AsyncSession) -> UsersRead:
        return await userService.get_user_by_user_code(user_code, db)

    @staticmethod
    async def create_user_ctrl(user_in: UsersCreate, db: AsyncSession) -> UsersRead:
        return await userService.create_user(user_in, db)

    @staticmethod
    async def update_user_ctrl(user_code: str, user_in: UsersUpdate, db: AsyncSession) -> UsersRead:
        return await userService.update_user(user_code, user_in, db)

    @staticmethod
    async def delete_user_ctrl(user_code: str, db: AsyncSession) -> DeleteResponse:
        await userService.delete_user(user_code, db)
        return DeleteResponse(message="Deleted user")

    @staticmethod
    async def import_users_ctrl(role_code: str, payload: UserBulkImportRequest, db: AsyncSession) -> list[UsersRead]:
        return await userService.import_users(payload.entries, role_code, db)
