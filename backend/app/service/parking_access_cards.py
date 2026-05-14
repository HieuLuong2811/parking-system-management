from __future__ import annotations

import base64
import secrets
from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.enums.parking import (
    ParkingAccessCardHolderType,
    ParkingAccessCardStatus,
)
from app.models.parking_access_cards import (
    ParkingAccessCard,
    ParkingAccessCardCreate,
    ParkingAccessCardUpdate,
)
from app.service.base import CRUDService


class parkingAccessCardService:
    crud = CRUDService(ParkingAccessCard)

    @staticmethod
    def generate_barcode_token() -> str:
        raw = secrets.token_bytes(8)
        return base64.b32encode(raw).decode("ascii").rstrip("=").upper()

    @staticmethod
    async def generate_unique_barcode_token(db: AsyncSession) -> str:
        for _ in range(10):
            token = parkingAccessCardService.generate_barcode_token()

            result = await db.execute(
                select(ParkingAccessCard.id).where(
                    ParkingAccessCard.barcode_token == token
                )
            )

            if result.scalar_one_or_none() is None:
                return token

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to generate unique parking access card token",
        )

    @staticmethod
    async def create_card(
        payload: ParkingAccessCardCreate,
        db: AsyncSession,
    ) -> ParkingAccessCard:
        barcode_token = (payload.barcode_token or "").strip().upper()

        if not barcode_token:
            barcode_token = await parkingAccessCardService.generate_unique_barcode_token(db)

        existing = await db.execute(
            select(ParkingAccessCard.id).where(
                ParkingAccessCard.barcode_token == barcode_token,
                ParkingAccessCard.deleted_at.is_(None),
            )
        )

        if existing.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parking access card barcode already exists",
            )

        create_payload = payload.model_copy(
            update={
                "barcode_token": barcode_token,
            }
        )

        return await parkingAccessCardService.crud.create(db, create_payload)

    @staticmethod
    async def get_card(
        card_id: str,
        db: AsyncSession,
    ) -> ParkingAccessCard:
        card = await parkingAccessCardService.crud.get(db, card_id)

        if card.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parking access card not found",
            )

        return card

    @staticmethod
    async def get_by_barcode_token(
        barcode_token: str,
        db: AsyncSession,
    ) -> ParkingAccessCard:
        token = (barcode_token or "").strip().upper()

        result = await db.execute(
            select(ParkingAccessCard).where(
                ParkingAccessCard.barcode_token == token,
                ParkingAccessCard.deleted_at.is_(None),
            )
        )

        card = result.scalar_one_or_none()

        if card is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parking access card not found",
            )

        return card

    @staticmethod
    async def update_card(
        card_id: str,
        payload: ParkingAccessCardUpdate,
        db: AsyncSession,
    ) -> ParkingAccessCard:
        await parkingAccessCardService.get_card(card_id, db)

        update_data = payload.model_dump(exclude_unset=True)

        if "barcode_token" in update_data and update_data["barcode_token"]:
            barcode_token = str(update_data["barcode_token"]).strip().upper()

            existing = await db.execute(
                select(ParkingAccessCard.id).where(
                    ParkingAccessCard.barcode_token == barcode_token,
                    ParkingAccessCard.id != card_id,
                    ParkingAccessCard.deleted_at.is_(None),
                )
            )

            if existing.scalar_one_or_none() is not None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Parking access card barcode already exists",
                )

            update_data["barcode_token"] = barcode_token

        update_payload = ParkingAccessCardUpdate(**update_data)

        return await parkingAccessCardService.crud.update(
            db,
            card_id,
            update_payload,
        )

    @staticmethod
    async def delete_card(
        card_id: str,
        db: AsyncSession,
    ) -> ParkingAccessCard:
        await parkingAccessCardService.get_card(card_id, db)
        return await parkingAccessCardService.crud.delete(db, card_id)

    @staticmethod
    async def get_available_guest_card(
        db: AsyncSession,
    ) -> ParkingAccessCard | None:
        result = await db.execute(
            select(ParkingAccessCard)
            .where(
                ParkingAccessCard.holder_type == ParkingAccessCardHolderType.GUEST,
                ParkingAccessCard.status == ParkingAccessCardStatus.AVAILABLE,
                ParkingAccessCard.deleted_at.is_(None),
            )
            .order_by(ParkingAccessCard.created_at.asc())
        )

        return result.scalars().first()

    @staticmethod
    async def ensure_user_access_card_for_subscription(
        user_code: str,
        subscription_id: str,
        db: AsyncSession,
        *,
        holder_type: ParkingAccessCardHolderType = ParkingAccessCardHolderType.STUDENT,
    ) -> ParkingAccessCard:
        result = await db.execute(
            select(ParkingAccessCard)
            .where(
                ParkingAccessCard.user_code == user_code,
                ParkingAccessCard.holder_type.in_(
                    [
                        ParkingAccessCardHolderType.STUDENT,
                        ParkingAccessCardHolderType.TEACHER,
                    ]
                ),
                ParkingAccessCard.deleted_at.is_(None),
            )
            .order_by(ParkingAccessCard.created_at.desc())
        )

        existing_card = result.scalars().first()

        if existing_card:
            existing_card.user_subscription_id = subscription_id

            if existing_card.status != ParkingAccessCardStatus.ACTIVE:
                existing_card.status = ParkingAccessCardStatus.ASSIGNED

            existing_card.updated_at = datetime.utcnow()

            await db.flush()
            return existing_card

        token = await parkingAccessCardService.generate_unique_barcode_token(db)

        card = ParkingAccessCard(
            barcode_token=token,
            holder_type=holder_type,
            user_code=user_code,
            user_subscription_id=subscription_id,
            status=ParkingAccessCardStatus.ASSIGNED,
            issued_at=datetime.utcnow(),
        )

        db.add(card)
        await db.flush()

        return card
    
    @staticmethod
    async def ensure_user_access_card(
        user_code: str,
        db: AsyncSession,
        *,
        holder_type: ParkingAccessCardHolderType = ParkingAccessCardHolderType.STUDENT,
        initial_status: ParkingAccessCardStatus = ParkingAccessCardStatus.DISABLED,
    ) -> ParkingAccessCard:
        result = await db.execute(
            select(ParkingAccessCard).where(
                ParkingAccessCard.user_code == user_code,
                ParkingAccessCard.holder_type == holder_type,
                ParkingAccessCard.deleted_at.is_(None),
            )
        )

        existing_card = result.scalar_one_or_none()

        if existing_card:
            return existing_card

        token = await parkingAccessCardService.generate_unique_barcode_token(db)

        card = ParkingAccessCard(
            barcode_token=token,
            holder_type=holder_type,
            user_code=user_code,
            user_subscription_id=None,
            status=initial_status,
            issued_at=datetime.utcnow(),
        )

        db.add(card)
        await db.flush()

        return card

    @staticmethod
    async def get_by_user_code(
        user_code: str,
        db: AsyncSession,
    ) -> ParkingAccessCard:
        result = await db.execute(
            select(ParkingAccessCard).where(
                ParkingAccessCard.user_code == user_code,
                ParkingAccessCard.deleted_at.is_(None),
            )
        )

        card = result.scalars().first()

        if card is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parking access card not found",
            )

        return card
