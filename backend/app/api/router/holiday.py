from app.api.controller.holiday import HolidayController
from fastapi import APIRouter

router = APIRouter(prefix="/holidays", tags=["Holidays"])

@router.get("/{month}/{year}")
def get_holidays(month: int, year: int):
    return HolidayController.get_holidays_by_month_and_year(month, year)

@router.get("/{year}")
def get_holidays_by_year(year: int):
    return HolidayController.get_all_holidays_in_a_year(year=year)
