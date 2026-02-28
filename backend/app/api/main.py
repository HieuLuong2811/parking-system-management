from fastapi import APIRouter
from app.api.router import (
    billing_event_logs,
    detect,
    holiday,
    invoices,
    parking_sessions,
    payment_transactions,
    plans,
    roles,
    subscriptions,
    terms,
    training,
    user_roles,
    users,
    vehicles,
)
router = APIRouter()

router.include_router(users.router)
router.include_router(roles.router)
router.include_router(user_roles.router)
router.include_router(terms.router)
router.include_router(plans.router)
router.include_router(subscriptions.router)
router.include_router(vehicles.router)
router.include_router(parking_sessions.router)
router.include_router(invoices.router)
router.include_router(payment_transactions.router)
router.include_router(billing_event_logs.router)
router.include_router(detect.router)
router.include_router(training.router)
router.include_router(holiday.router)
