from app.models.subscriptions import (
    UserSubscriptionClientView,
    UserSubscriptionAdminView,
    UserSummary,
    PaymentPlanSummary,
    SubscriptionPlanSummary,
)


class SubscriptionMapper:

    @staticmethod
    def to_client_view(
        subscription,
        payment_plan,
        subscription_plan,
    ):
        return UserSubscriptionClientView(
            id=subscription.id,
            status=subscription.status,
            start_date=subscription.start_date,
            end_date=subscription.end_date,
            total_amount=subscription.total_amount,
            paid_amount=subscription.paid_amount,
            created_at=subscription.created_at,
            plan=subscription_plan.plans_type if subscription_plan else None,
            payment=(
                PaymentPlanSummary(payment_type=payment_plan.payment_type)
                if payment_plan
                else None
            ),
        )

    @staticmethod
    def to_admin_view(
        subscription,
        user,
        payment_plan,
        subscription_plan,
    ):
        return UserSubscriptionAdminView(
            id=subscription.id,
            user_code=subscription.user_code,
            user=(
                UserSummary(
                    user_code=user.user_code,
                    full_name=user.full_name,
                    email=user.email,
                    phone_number=user.phone_number,
                )
                if user
                else None
            ),
            status=subscription.status,
            start_date=subscription.start_date,
            end_date=subscription.end_date,
            total_amount=subscription.total_amount,
            paid_amount=subscription.paid_amount,
            created_at=subscription.created_at,
            updated_at=subscription.updated_at,
            subscription_plan=(
                SubscriptionPlanSummary(
                    plans_type=subscription_plan.plans_type,
                )
                if subscription_plan
                else None
            ),
            payment_plan=(
                PaymentPlanSummary(payment_type=payment_plan.payment_type)
                if payment_plan
                else None
            ),
        )