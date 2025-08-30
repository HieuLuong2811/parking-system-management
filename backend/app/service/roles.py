from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.roles import Roles, RolesCreate
import uuid
from fastapi import HTTPException, status
from datetime import datetime

class roleService:
    @staticmethod
    async def get_all_roles(db: AsyncSession) -> list[Roles]:
        result = await db.execute(select(Roles))
        return result.scalars().all()
    
    @staticmethod 
    async def create_role(role_in: RolesCreate, db: AsyncSession) -> Roles:
        role = Roles.from_orm(role_in)
        db.add(role)
        await db.commit()
        await db.refresh(role)
        return role
    
    @staticmethod 
    async def update_role(role_in: RolesCreate, db: AsyncSession, id: uuid.UUID) -> Roles:
        result = await db.execute(select(Roles).where(Roles.id == id))
        role = result.scalar_one_or_none()
        if not role:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
        
        role.name = role_in.name
        role.description = role_in.description

        await db.commit()
        await db.refresh(role)
        return role