"""Stripe SDK initialization helpers."""

from __future__ import annotations

from typing import Final

import stripe

from app.core.config import settings

stripe_client: Final = stripe
stripe_client.api_base = settings.STRIPE_API_URL

if settings.STRIPE_SECRET_KEY:
    stripe_client.api_key = settings.STRIPE_SECRET_KEY


def is_stripe_configured() -> bool:
    """Return True if a secret key is available for Stripe API calls."""
    return bool(settings.STRIPE_SECRET_KEY)


def ensure_stripe_configured() -> None:
    """Raise if Stripe can not be used because the secret key is missing."""
    if not settings.STRIPE_SECRET_KEY:
        raise RuntimeError("Stripe is not configured; set STRIPE_SECRET_KEY to continue.")
