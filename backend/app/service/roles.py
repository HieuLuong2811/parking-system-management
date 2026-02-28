from app.models.roles import Roles, RolesCreate, RolesUpdate
from app.service.base import CRUDService
from sqlalchemy.ext.asyncio import AsyncSession


class roleService:
    crud = CRUDService(Roles)

    @staticmethod
    async def get_all_roles(db: AsyncSession) -> list[Roles]:
        return await roleService.crud.get_all(db)

    @staticmethod
    async def create_role(role_in: RolesCreate, db: AsyncSession) -> Roles:
        return await roleService.crud.create(db, role_in)

    @staticmethod
    async def update_role(id: int, role_in: RolesUpdate, db: AsyncSession) -> Roles:
        return await roleService.crud.update(db, id, role_in)

    @staticmethod
    async def delete_role(id: int, db: AsyncSession) -> Roles:
        return await roleService.crud.delete(db, id)
