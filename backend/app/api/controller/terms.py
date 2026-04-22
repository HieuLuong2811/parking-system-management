from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.auth import AuthUser
from app.models.notifications import NotificationCreate
from app.models.responses import DeleteResponse
from app.models.terms import AcademicTermCreate, AcademicTermRead, AcademicTermUpdate
from app.models.subscriptions import UserSubscription
from app.models.users import Users
from app.service.notifications import notificationService
from app.service.terms import termService
from app.utils.email import generate_term_updated_email, is_email_configured, send_email


class TermController:
    @staticmethod
    async def create_term_ctrl(term_in: AcademicTermCreate, db: AsyncSession) -> AcademicTermRead:
        return await termService.create_term(term_in, db)

    @staticmethod
    async def get_term_ctrl(term_id: str, db: AsyncSession) -> AcademicTermRead:
        return await termService.get_term(term_id, db)

    @staticmethod
    async def get_all_terms_ctrl(db: AsyncSession) -> list[AcademicTermRead]:
        return await termService.get_all_terms(db)

    @staticmethod
    async def update_term_ctrl(
        term_id: str,
        term_in: AcademicTermUpdate,
        db: AsyncSession,
        current_user: AuthUser,
    ) -> AcademicTermRead:
        existing = await termService.crud.get(db, term_id)
        updated = await termService.update_term(term_id, term_in, db)

        changed = term_in.dict(exclude_unset=True, exclude_none=True)
        if not changed:
            return updated

        old_name = existing.term_name
        new_name = changed.get("term_name", old_name)
        name_changed = new_name != old_name

        start_changed = "start_date" in changed and changed["start_date"] != existing.start_date
        end_changed = "end_date" in changed and changed["end_date"] != existing.end_date

        if name_changed:
            statement = (
                select(Users)
                .join(UserSubscription, Users.user_code == UserSubscription.user_code)
                .where(UserSubscription.term_id == existing.id)
                .where(Users.deleted_at.is_(None))
                .distinct()
            )
            result = await db.execute(statement)
            users = result.scalars().all()

            for user in users:
                await notificationService.create_notification(
                    NotificationCreate(
                        actor_id=current_user.user_code,
                        receiver_id=user.user_code,
                        title="Cập nhật học kỳ",
                        content=f"Học kỳ '{old_name}' đã được đổi tên thành '{new_name}'.",
                        is_read=False,
                    ),
                    db,
                )

            if is_email_configured() and users:
                for user in users:
                    try:
                        email = generate_term_updated_email(
                            user_name=user.full_name,
                            old_term_name=old_name,
                            new_term_name=new_name,
                            lang=getattr(user, "language_use", None),
                        )
                        await send_email(str(user.email), email)
                    except Exception:
                        pass
        elif start_changed or end_changed:
            parts: list[str] = []
            if start_changed:
                parts.append("ngày bắt đầu")
            if end_changed:
                parts.append("ngày kết thúc")
            await notificationService.create_notification(
                NotificationCreate(
                    actor_id=current_user.user_code,
                    receiver_id=current_user.user_code,
                    title="Cập nhật học kỳ",
                    content=f"Đã cập nhật {', '.join(parts)} của học kỳ '{existing.term_name}'.",
                    is_read=False,
                ),
                db,
            )

        return updated

    @staticmethod
    async def delete_term_ctrl(term_id: str, db: AsyncSession) -> DeleteResponse:
        if await termService.is_in_use(term_id, db):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Academic term is in use")
        await termService.delete_term(term_id, db)
        return DeleteResponse(message="Deleted academic term")
