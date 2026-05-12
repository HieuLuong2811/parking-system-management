from sqlalchemy.ext.asyncio import AsyncSession

from app.models.parking_access_cards import (
    ParkingAccessCardCreate,
    ParkingAccessCardRead,
    ParkingAccessCardUpdate,
)
from app.models.responses import DeleteResponse
from app.service.parking_access_cards import parkingAccessCardService


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
    async def delete_card_ctrl(
        card_id: str,
        db: AsyncSession,
    ) -> DeleteResponse:
        await parkingAccessCardService.delete_card(card_id, db)
        return DeleteResponse(message="Deleted parking access card")