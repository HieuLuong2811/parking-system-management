from datetime import datetime
from app.service.holiday import HolidayService

class HolidayController:

    @staticmethod
    def get_holidays_by_month_and_year(month: int, year: int):
        holidays = HolidayService.get_holidays_by_month_and_year(month=month, year=year)
        return holidays

    @staticmethod
    def get_all_holidays_in_a_year(year: int):
        return HolidayService.get_holidays_by_year(year=year)