from app.models.subscriptions import (
    UserSubscriptionClientView,
    UserSubscriptionAdminView,
    UserSummary,
    VehicleSummary,
    PaymentPlanSummary,
    SubscriptionPlanSummary,
    AcademicTermSummary,
)

class SubscriptionMapper:

    @staticmethod
    def to_client_view(subscription, vehicle, payment_plan, subscription_plan, term, covered_vehicles=None):
        covered_summaries = None
        if covered_vehicles is not None:
            covered_summaries = [
                VehicleSummary(
                    id=item.id,
                    vehicle_type=item.vehicle_type,
                    license_plate=item.license_plate,
                    qr_code=getattr(item, "barcode_payload", None),
                )
                for item in covered_vehicles
                if item is not None
            ]
        return UserSubscriptionClientView(
            id=subscription.id,
            status=subscription.status,
            start_date=subscription.start_date,
            end_date=subscription.end_date,
            total_amount=subscription.total_amount,
            paid_amount=subscription.paid_amount,
            created_at=subscription.created_at,
            vehicle=(
                VehicleSummary(
                    id=vehicle.id,
                    vehicle_type=vehicle.vehicle_type,
                    license_plate=vehicle.license_plate,
                    qr_code=getattr(vehicle, "barcode_payload", None),
                )
                if vehicle
                else None
            ),
            plan=(subscription_plan.plans_type if subscription_plan else None),
            payment=(
                PaymentPlanSummary(payment_type=payment_plan.payment_type)
                if payment_plan
                else None
            ),
            term=(AcademicTermSummary(term_name=term.term_name) if term else None),
            covered_vehicles=covered_summaries,
        )

    @staticmethod
    def to_admin_view(subscription, user, vehicle, payment_plan, term, subscription_plan, covered_vehicles=None):
        covered_summaries = None
        if covered_vehicles is not None:
            covered_summaries = [
                VehicleSummary(
                    id=item.id,
                    vehicle_type=item.vehicle_type,
                    license_plate=item.license_plate,
                    qr_code=getattr(item, "barcode_payload", None),
                )
                for item in covered_vehicles
                if item is not None
            ]
        return UserSubscriptionAdminView(
            id=subscription.id,
            user_code=subscription.user_code,
            user=(
                UserSummary(
                    user_code=user.user_code,
                    full_name=user.full_name,
                    email=user.email,
                    phone_number=user.phone_number,
                ) if user else None
            ),
            status=subscription.status,
            start_date=subscription.start_date,
            end_date=subscription.end_date,
            total_amount=subscription.total_amount,
            paid_amount=subscription.paid_amount,
            created_at=subscription.created_at,
            updated_at=subscription.updated_at,
            subscription_plan=(
                SubscriptionPlanSummary(plans_type=subscription_plan.plans_type) if subscription_plan else None
            ),
            payment_plan=(PaymentPlanSummary(payment_type=payment_plan.payment_type) if payment_plan else None),
            term=(AcademicTermSummary(term_name=term.term_name) if term else None),
            vehicle=(
                VehicleSummary(
                    id=vehicle.id,
                    vehicle_type=vehicle.vehicle_type,
                    license_plate=vehicle.license_plate,
                    qr_code=getattr(vehicle, "barcode_payload", None),
                )
                if vehicle
                else None
            ),
            covered_vehicles=covered_summaries,
        )
