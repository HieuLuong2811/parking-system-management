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
    
