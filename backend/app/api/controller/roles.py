from sqlalchemy.ext.asyncio import AsyncSession

from app.models.roles import RolesCreate, RolesRead, RolesUpdate
from app.service.roles import roleService


class RoleController:
    @staticmethod
    async def create_role_ctrl(role_in: RolesCreate, db: AsyncSession) -> RolesRead:
        return await roleService.create_role(role_in, db)

    @staticmethod
    async def get_all_roles_ctrl(db: AsyncSession) -> list[RolesRead]:
        return await roleService.get_all_roles(db)

    @staticmethod
    async def update_role_ctrl(role_id: str, role_in: RolesUpdate, db: AsyncSession) -> RolesRead:
        return await roleService.update_role(role_id, role_in, db)

    @staticmethod
    async def delete_role_ctrl(role_id: str, db: AsyncSession) -> None:
        await roleService.delete_role(role_id, db)
