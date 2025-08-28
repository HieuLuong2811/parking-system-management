from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.users import Users, UsersCreate, DeleteReponse
import uuid
from fastapi import HTTPException, status
from datetime import datetime

class userService:
    @staticmethod
    async def create_user(user_in: UsersCreate, db: AsyncSession) -> Users:
        user = Users.from_orm(user_in)
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def get_all_users(db: AsyncSession) -> list[Users]:
        result = await db.execute(select(Users))
        return result.scalars().all()

    @staticmethod
    async def update_user(user_in: UsersCreate, db: AsyncSession, id: uuid.UUID) -> Users:
        result = await db.execute(select(Users).where(Users.id == id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
        user.full_name = user_in.full_name
        user.avatar = user_in.avatar
        user.phone_number = user_in.phone_number
        user.address = user_in.address
        user.citizen_id = user_in.citizen_id
        user.updated_at = datetime.now()

        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def delete_user(id: uuid.UUID, db: AsyncSession) -> DeleteReponse:
        result = await db.execute(select(Users).where(Users.id == id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
        db.delete(user)
        await db.commit()
        return DeleteReponse(message="Delete user successfully")