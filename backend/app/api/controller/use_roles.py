from sqlalchemy.ext.asyncio import AsyncSession
from app.service.user_roles import userRolesService
from app.models.user_roles import UserRolesCreate

class UserRolesController:
    @staticmethod
    async def get_all_user_roles_ctrl(db: AsyncSession):
        return await userRolesService.get_all_user_roles(db)
    
    @staticmethod
    async def create_user_roles_ctrl(userRoles_in: UserRolesCreate, db: AsyncSession):
        return await userRolesService.create_user_roles(userRoles_in, db)
