from __future__ import annotations

import base64
import secrets
from datetime import datetime
from app.core.config import settings

from app.models.auth import AuthUser
from app.models.notifications import NotificationCreate
from app.service.notifications import notificationService
from app.models.roles import Roles
from app.models.user_roles import UserRoles
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import or_, exists, not_

from app.enums.parking import (
    ParkingAccessCardHolderType,
    ParkingAccessCardStatus,
    UserRoleType,
)
from app.models.parking_access_cards import (
    ParkingAccessCard,
    ParkingAccessCardCreate,
    ParkingAccessCardUpdate,
)
from app.models.users import Users
from app.models.users import UsersRead
from app.models.parking_access_cards import ParkingAccessCardAdminRead
from app.utils.pagination import PaginatedResponse
from app.utils.pagination_db import paginate_rows, paginate_scalars
from app.utils.search import ilike_unaccent
from app.service.base import CRUDService
from app.utils.barcode import normalize_barcode_token
from app.utils.email import generate_parking_access_card_disabled_email, is_email_configured, send_email
import logging


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
        barcode_token = normalize_barcode_token(payload.barcode_token)

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
        token = normalize_barcode_token(barcode_token)

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
    async def get_users_by_role(
        role_code: str,
        db: AsyncSession,
    ) -> list[Users]:
        statement = (
            select(Users)
            .join(UserRoles, Users.user_code == UserRoles.user_code)
            .join(Roles, UserRoles.role_id == Roles.id)
            .where(Roles.role_code == role_code)
            .where(Users.deleted_at.is_(None))
        )
        result = await db.execute(statement)
        return result.scalars().all()

    @staticmethod
    async def report_lost(
        card_id: str,
        db: AsyncSession,
        current_user: AuthUser,
    ) -> ParkingAccessCard:
        card = await parkingAccessCardService.get_card(card_id, db)

        current_user_code = str(getattr(current_user, "user_code","") or "")

        if str(card.user_code) != current_user_code:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to report this card as lost",
            )

        if card.status == ParkingAccessCardStatus.LOST:
            return card

        if card.status != ParkingAccessCardStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only active cards can be reported lost",
            )

        card.status = ParkingAccessCardStatus.LOST
        card.updated_at = datetime.utcnow()

        admins = await parkingAccessCardService.get_users_by_role(
            str(UserRoleType.ADMIN.value).lower(),
            db,
        )

        for admin in admins:
            await notificationService.create_notification(
                NotificationCreate(
                    actor_id=card.user_code,
                    receiver_id=admin.user_code,
                    title="[PARKING ACCESS CARD] Card Reported Lost",
                    content=(
                        f"Người dùng {current_user.full_name} với mã là {current_user.user_code} đã báo mất thẻ gửi xe với mã thẻ {card.barcode_token}."
                    ),
                    is_read=False,
                    link=f"{settings.DASHBOARD_URL}/parking-access-cards/{card.id}"
                ),
                db,
            )

        await db.flush()
        return card

    @staticmethod
    async def activate_card(
        card_id: str,
        db: AsyncSession,
        current_user: AuthUser,
    ) -> ParkingAccessCard:
        card = await parkingAccessCardService.get_card(card_id, db)

        current_user_code = str(getattr(current_user, "user_code", "") or "")
        if str(card.user_code) != current_user_code:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to activate this card",
            )

        if card.status == ParkingAccessCardStatus.ACTIVE:
            return card

        if card.status == ParkingAccessCardStatus.LOST:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Lost cards cannot be activated",
            )

        if card.status != ParkingAccessCardStatus.DISABLED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only disabled cards can be activated",
            )

        card.status = ParkingAccessCardStatus.ACTIVE
        card.updated_at = datetime.utcnow()
        await db.flush()
        return card

    @staticmethod
    async def get_cards_by_user_code(
        user_code: str,
        db: AsyncSession,
    ) -> list[ParkingAccessCard]:
        result = await db.execute(
            select(ParkingAccessCard)
            .where(
                ParkingAccessCard.user_code == user_code,
                ParkingAccessCard.deleted_at.is_(None),
            )
            .order_by(ParkingAccessCard.created_at.desc(), ParkingAccessCard.id.desc())
        )
        return result.scalars().all()

    @staticmethod
    async def update_card(
        card_id: str,
        payload: ParkingAccessCardUpdate,
        db: AsyncSession,
    ) -> ParkingAccessCard:
        await parkingAccessCardService.get_card(card_id, db)

        update_data = payload.model_dump(exclude_unset=True)

        if "barcode_token" in update_data and update_data["barcode_token"]:
            barcode_token = normalize_barcode_token(str(update_data["barcode_token"]))

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
    async def disable_card_and_notify(
        card_id: str,
        db: AsyncSession,
    ) -> ParkingAccessCard:
        card = await parkingAccessCardService.get_card(card_id, db)

        if card.status == ParkingAccessCardStatus.DISABLED:
            return card

        card = await parkingAccessCardService.crud.update(
            db,
            card_id,
            ParkingAccessCardUpdate(status=ParkingAccessCardStatus.DISABLED),
        )

        user_code = str(card.user_code or "").strip()
        if not user_code:
            return card

        result = await db.execute(
            select(Users).where(
                Users.user_code == user_code,
                Users.deleted_at.is_(None),
            )
        )
        user = result.scalar_one_or_none()
        if not user or not user.email:
            return card

        if not is_email_configured():
            return card

        try:
            email_data = generate_parking_access_card_disabled_email(
                email_to=str(user.email),
                user_name=str(user.full_name or user.user_code),
                user_code=str(user.user_code),
                barcode_token=str(card.barcode_token),
                lang=getattr(user, "language_use", None),
            )
            await send_email(str(user.email), email_data)
        except Exception:
            logging.getLogger(__name__).exception(
                "Failed to send parking access card disabled email to user_code=%s",
                user_code,
            )

        return card

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
    async def get_cards_admin_paginated(
        db: AsyncSession,
        *,
        page: int = 1,
        limit: int = 20,
        barcode_token: str | None = None,
        holder_type: ParkingAccessCardHolderType | None = None,
        status: ParkingAccessCardStatus | None = None,
        user_query: str | None = None,
    ) -> PaginatedResponse[ParkingAccessCardAdminRead]:
        page = max(1, int(page or 1))
        limit = max(1, int(limit or 20))

        statement = (
            select(ParkingAccessCard, Users)
            .outerjoin(Users, Users.user_code == ParkingAccessCard.user_code)
            .where(ParkingAccessCard.deleted_at.is_(None))
            .order_by(ParkingAccessCard.created_at.desc(), ParkingAccessCard.id.desc())
        )

        if barcode_token and barcode_token.strip():
            statement = statement.where(ilike_unaccent(ParkingAccessCard.barcode_token, barcode_token.strip()))
        if holder_type is not None:
            statement = statement.where(ParkingAccessCard.holder_type == holder_type)
        if status is not None:
            statement = statement.where(ParkingAccessCard.status == status)
        if user_query and user_query.strip():
            q = user_query.strip()
            statement = statement.where(
                or_(
                    ilike_unaccent(ParkingAccessCard.user_code, q),
                    ilike_unaccent(Users.user_code, q),
                    ilike_unaccent(Users.full_name, q),
                )
            )

        rows, total, total_pages = await paginate_rows(db, statement, page=page, limit=limit)

        data: list[ParkingAccessCardAdminRead] = []
        for card, user in rows:
            data.append(
                ParkingAccessCardAdminRead(
                    id=card.id,
                    barcode_token=card.barcode_token,
                    holder_type=card.holder_type,
                    user_code=card.user_code,
                    user_subscription_id=card.user_subscription_id,
                    status=card.status,
                    current_session_id=card.current_session_id,
                    created_at=card.created_at,
                    updated_at=card.updated_at,
                    deleted_at=card.deleted_at,
                    user_full_name=(user.full_name if user else None),
                    is_in_use=bool(card.current_session_id),
                )
            )

        return {
            "data": data,
            "total": int(total or 0),
            "page": page,
            "limit": limit,
            "total_pages": int(total_pages or 0),
        }

    @staticmethod
    async def get_eligible_users_paginated(
        db: AsyncSession,
        *,
        page: int = 1,
        limit: int = 5,
        q: str | None = None,
    ) -> PaginatedResponse[UsersRead]:
        page = max(1, int(page or 1))
        limit = max(1, int(limit or 5))

        active_card_exists = (
            exists()
            .where(ParkingAccessCard.user_code == Users.user_code)
            .where(ParkingAccessCard.deleted_at.is_(None))
            .where(ParkingAccessCard.status != ParkingAccessCardStatus.LOST)
        )

        statement = (
            select(Users)
            .where(Users.deleted_at.is_(None))
            .where(not_(active_card_exists))
            .order_by(Users.user_code.asc())
        )

        if q and q.strip():
            trimmed = q.strip()
            like = f"%{trimmed}%"
            statement = statement.where(
                or_(
                    ilike_unaccent(Users.user_code, like),
                    ilike_unaccent(Users.full_name, like),
                    ilike_unaccent(Users.email, like),
                )
            )

        users, total, total_pages = await paginate_scalars(db, statement, page=page, limit=limit)

        data: list[UsersRead] = []
        for user in users:
            data.append(
                UsersRead(
                    user_code=user.user_code,
                    full_name=user.full_name,
                    email=user.email,
                    phone_number=user.phone_number,
                    language_use=user.language_use,
                    deleted_at=user.deleted_at,
                    created_at=user.created_at,
                    updated_at=user.updated_at,
                )
            )

        return {
            "data": data,
            "total": int(total or 0),
            "page": page,
            "limit": limit,
            "total_pages": int(total_pages or 0),
        }

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
