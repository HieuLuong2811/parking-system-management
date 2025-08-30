from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.roles import roleService
from app.models.roles import RolesCreate
import uuid

class RoleController:
    @staticmethod 
    async def create_role_ctrl(role_in: RolesCreate, db: AsyncSession):
        return await roleService.create_role(role_in, db)
    
    @staticmethod 
    async def get_all_roles_ctrl(db: AsyncSession):
        return await roleService.get_all_roles(db)
    
    @staticmethod 
    async def update_role_ctrl(db: AsyncSession, id: uuid.UUID, role_in: RolesCreate):
        return await roleService.update_role(role_in, db, id)