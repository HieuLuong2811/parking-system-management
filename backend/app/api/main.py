from fastapi import APIRouter

from app.api.router import (
    auth,
    billing_event_logs,
    detect,
    holiday,
    invoices,
    parking_sessions,
    payment_transactions,
    plans,
    payment_plans,
    plan_pricing,
    notifications,
    roles,
    subscriptions,
    terms,
    training,
    user_roles,
    users,
    momo_payment,
    email,
    checkout,
    parking_access_cards,
    user_wallets,
)
router = APIRouter()

router.include_router(users.router)
router.include_router(auth.router)
router.include_router(roles.router)
router.include_router(user_roles.router)
router.include_router(terms.router)
router.include_router(plans.router)
router.include_router(subscriptions.router)
router.include_router(payment_plans.router)
router.include_router(notifications.router)
router.include_router(parking_sessions.router)
router.include_router(invoices.router)
router.include_router(payment_transactions.router)
router.include_router(billing_event_logs.router)
router.include_router(detect.router)
router.include_router(training.router)
router.include_router(holiday.router)
router.include_router(plan_pricing.router)
router.include_router(momo_payment.router)
router.include_router(email.router)
router.include_router(checkout.router)
router.include_router(parking_access_cards.router)
router.include_router(user_wallets.router)
