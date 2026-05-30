from app.models.auth import AuthUser
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.parking_access_cards import (
    ParkingAccessCardCreate,
    ParkingAccessCardAdminRead,
    ParkingAccessCardRead,
    ParkingAccessCardUpdate,
)
from app.models.responses import DeleteResponse
from app.utils.pagination import PaginatedResponse
from app.service.parking_access_cards import parkingAccessCardService
from app.enums.parking import ParkingAccessCardHolderType, ParkingAccessCardStatus
from app.models.users import UsersRead


class ParkingAccessCardController:
    @staticmethod
    async def create_card_ctrl(
        payload: ParkingAccessCardCreate,
        db: AsyncSession,
    ) -> ParkingAccessCardRead:
        return await parkingAccessCardService.create_card(payload, db)

    @staticmethod
    async def get_card_ctrl(
        card_id: str,
        db: AsyncSession,
    ) -> ParkingAccessCardRead:
        return await parkingAccessCardService.get_card(card_id, db)

    @staticmethod
    async def lookup_card_ctrl(
        barcode_token: str,
        db: AsyncSession,
    ) -> ParkingAccessCardRead:
        return await parkingAccessCardService.get_by_barcode_token(
            barcode_token,
            db,
        )

    @staticmethod
    async def get_my_card_ctrl(
        user_code: str,
        db: AsyncSession,
    ) -> ParkingAccessCardRead:
        return await parkingAccessCardService.get_by_user_code(user_code, db)

    @staticmethod
    async def report_lost_ctrl(
        card_id: str,
        db: AsyncSession,
        current_user: AuthUser,
    ) -> ParkingAccessCardRead:
        return await parkingAccessCardService.report_lost(card_id, db, current_user)

    @staticmethod
    async def update_card_ctrl(
        card_id: str,
        payload: ParkingAccessCardUpdate,
        db: AsyncSession,
    ) -> ParkingAccessCardRead:
        return await parkingAccessCardService.update_card(
            card_id,
            payload,
            db,
        )

    @staticmethod
    async def disable_card_ctrl(
        card_id: str,
        db: AsyncSession,
    ) -> ParkingAccessCardRead:
        return await parkingAccessCardService.disable_card_and_notify(card_id, db)

    @staticmethod
    async def delete_card_ctrl(
        card_id: str,
        db: AsyncSession,
    ) -> DeleteResponse:
        await parkingAccessCardService.delete_card(card_id, db)
        return DeleteResponse(message="Deleted parking access card")

    @staticmethod
    async def get_cards_paginated_ctrl(
        db: AsyncSession,
        *,
        page: int = 1,
        limit: int = 20,
        barcode_token: str | None = None,
        holder_type: ParkingAccessCardHolderType | None = None,
        status: ParkingAccessCardStatus | None = None,
        user_query: str | None = None,
    ) -> PaginatedResponse[ParkingAccessCardAdminRead]:
        return await parkingAccessCardService.get_cards_admin_paginated(
            db,
            page=page,
            limit=limit,
            barcode_token=barcode_token,
            holder_type=holder_type,
            status=status,
            user_query=user_query,
        )

    @staticmethod
    async def get_eligible_users_paginated_ctrl(
        db: AsyncSession,
        *,
        page: int = 1,
        limit: int = 5,
        q: str | None = None,
    ) -> PaginatedResponse[UsersRead]:
        return await parkingAccessCardService.get_eligible_users_paginated(
            db,
            page=page,
            limit=limit,
            q=q,
        )
