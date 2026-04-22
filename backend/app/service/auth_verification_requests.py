from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, verify_password
from app.models.auth_verification_requests import AuthVerificationRequest
from app.service.base import CRUDService


@dataclass(frozen=True)
class VerificationPolicy:
    ttl_seconds: int = 10 * 60
    throttle_seconds: int = 60


class authVerificationRequestService:
    crud = CRUDService(AuthVerificationRequest)
    policy = VerificationPolicy()

    @staticmethod
    async def _get_latest_valid_request(
        db: AsyncSession,
        *,
        user_code: str,
        verification_type: str,
        now: datetime,
    ) -> AuthVerificationRequest | None:
        statement = (
            select(AuthVerificationRequest)
            .where(AuthVerificationRequest.user_code == user_code)
            .where(AuthVerificationRequest.verification_type == verification_type)
            .where(AuthVerificationRequest.is_used.is_(False))
            .where(AuthVerificationRequest.invalidated_at.is_(None))
            .where(AuthVerificationRequest.expires_at > now)
            .order_by(desc(AuthVerificationRequest.created_at))
            .limit(1)
        )
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    @staticmethod
    async def request_code(
        db: AsyncSession,
        *,
        user_code: str,
        verification_type: str,
        raw_code: str,
    ) -> AuthVerificationRequest:
        now = datetime.utcnow()
        existing = await authVerificationRequestService._get_latest_valid_request(
            db,
            user_code=user_code,
            verification_type=verification_type,
            now=now,
        )
        if existing:
            since_seconds = (now - existing.created_at).total_seconds()
            if since_seconds < authVerificationRequestService.policy.throttle_seconds:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Verification request throttled. Please wait and try again.",
                )
            existing.invalidated_at = now
            db.add(existing)
            await db.commit()

        expires_at = now + timedelta(seconds=authVerificationRequestService.policy.ttl_seconds)
        created = AuthVerificationRequest(
            user_code=user_code,
            verification_type=verification_type,
            code_hash=hash_password(raw_code),
            expires_at=expires_at,
            is_used=False,
            invalidated_at=None,
            created_at=now,
        )
        db.add(created)
        await db.commit()
        await db.refresh(created)
        return created

    @staticmethod
    async def verify_code(
        db: AsyncSession,
        *,
        user_code: str,
        verification_type: str,
        raw_code: str,
    ) -> bool:
        now = datetime.utcnow()
        existing = await authVerificationRequestService._get_latest_valid_request(
            db,
            user_code=user_code,
            verification_type=verification_type,
            now=now,
        )
        if not existing:
            return False
        if not verify_password(raw_code, existing.code_hash):
            return False

        existing.is_used = True
        db.add(existing)
        await db.commit()
        return True

