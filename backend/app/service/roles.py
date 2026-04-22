from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.roles import Roles, RolesCreate, RolesUpdate
from app.service.base import CRUDService


class roleService:
    crud = CRUDService(Roles)

    @staticmethod
    async def get_all_roles(db: AsyncSession) -> list[Roles]:
        return await roleService.crud.get_all(db)

    @staticmethod
    async def get_by_code(role_code: str, db: AsyncSession) -> Roles | None:
        statement = select(Roles).where(Roles.role_code == role_code)
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_or_create(role_code: str, db: AsyncSession) -> Roles:
        existing = await roleService.get_by_code(role_code, db)
        if existing:
            return existing
        return await roleService.create_role(RolesCreate(role_code=role_code), db)

    @staticmethod
    async def create_role(data: RolesCreate, db: AsyncSession):
        existing = await roleService.get_by_code(data.role_code, db)
        if existing:
            raise ValueError("Role code already exists")

        role = await roleService.crud.create(db, data)

        return role

    @staticmethod
    async def update_role(id: str, role_in: RolesUpdate, db: AsyncSession) -> Roles:
        return await roleService.crud.update(db, id, role_in)

    @staticmethod
    async def delete_role(id: str, db: AsyncSession) -> Roles:
        return await roleService.crud.delete(db, id)
