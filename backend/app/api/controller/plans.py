from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.auth import AuthUser
from app.models.notifications import NotificationCreate
from app.models.responses import DeleteResponse
from app.models.plans import SubscriptionPlanCreate, SubscriptionPlanRead, SubscriptionPlanUpdate
from app.models.subscriptions import UserSubscription
from app.models.users import Users
from app.service.notifications import notificationService
from app.service.plans import planService
from app.utils.email import generate_subscription_plan_updated_email, is_email_configured, send_email


class PlanController:
    @staticmethod
    async def create_plan_ctrl(plan_in: SubscriptionPlanCreate, db: AsyncSession) -> SubscriptionPlanRead:
        return await planService.create_plan(plan_in, db)

    @staticmethod
    async def get_plan_ctrl(plan_id: str, db: AsyncSession) -> SubscriptionPlanRead:
        return await planService.get_plan(plan_id, db)

    @staticmethod
    async def get_all_plans_ctrl(db: AsyncSession) -> list[SubscriptionPlanRead]:
        return await planService.get_all_plans(db)

    @staticmethod
    async def update_plan_ctrl(
        plan_id: str,
        plan_in: SubscriptionPlanUpdate,
        db: AsyncSession,
        current_user: AuthUser,
    ) -> SubscriptionPlanRead:
        existing = await planService.crud.get(db, plan_id)
        updated = await planService.update_plan(plan_id, plan_in, db)

        changed = plan_in.dict(exclude_unset=True, exclude_none=True)
        if not changed:
            return updated

        old_type = getattr(existing, "plans_type", None)
        new_type = changed.get("plans_type", old_type)
        type_changed = new_type != old_type

        price_changed = "price_per_day" in changed and changed["price_per_day"] != existing.price_per_day

        if type_changed:
            statement = (
                select(Users)
                .join(UserSubscription, Users.user_code == UserSubscription.user_code)
                .where(UserSubscription.sub_plan_id == existing.id)
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
                        title="Cập nhật gói đăng ký",
                        content=f"Gói đã được đổi loại từ '{old_type}' thành '{new_type}'.",
                        is_read=False,
                    ),
                    db,
                )

            if is_email_configured() and users:
                for user in users:
                    try:
                        email = generate_subscription_plan_updated_email(
                            user_name=user.full_name,
                            old_plan_type=getattr(old_type, "value", str(old_type) if old_type is not None else ""),
                            new_plan_type=getattr(new_type, "value", str(new_type) if new_type is not None else ""),
                            lang=getattr(user, "language_use", None),
                        )
                        await send_email(str(user.email), email)
                    except Exception:
                        # Do not block the update if email fails/misconfigured.
                        pass
        elif price_changed:
            await notificationService.create_notification(
                NotificationCreate(
                    actor_id=current_user.user_code,
                    receiver_id=current_user.user_code,
                    title="Cập nhật gói đăng ký",
                    content=f"Đã cập nhật giá/ngày của gói '{existing.plans_type}'.",
                    is_read=False,
                ),
                db,
            )


        return updated

    @staticmethod
    async def delete_plan_ctrl(plan_id: str, db: AsyncSession) -> DeleteResponse:
        if await planService.is_in_use(plan_id, db):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Subscription plan is in use")
        await planService.delete_plan(plan_id, db)
        return DeleteResponse(message="Deleted subscription plan")
