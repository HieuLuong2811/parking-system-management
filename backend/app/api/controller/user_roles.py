from sqlalchemy.ext.asyncio import AsyncSession

from app.models.responses import DeleteResponse
from app.models.user_roles import UserRolesCreate, UserRolesRead
from app.service.user_roles import userRolesService


class UserRolesController:
    @staticmethod
    async def get_all_user_roles_ctrl(db: AsyncSession) -> list[UserRolesRead]:
        return await userRolesService.get_all_user_roles(db)

    @staticmethod
    async def assign_user_role_ctrl(userRoles_in: UserRolesCreate, db: AsyncSession) -> UserRolesRead:
        return await userRolesService.assign_role(userRoles_in, db)

    @staticmethod
    async def revoke_user_role_ctrl(user_code: str, role_id: int, db: AsyncSession) -> DeleteResponse:
        await userRolesService.revoke_role(user_code, role_id, db)
        return DeleteResponse(message="Revoked user role")
