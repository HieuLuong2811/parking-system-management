import holidays

class HolidayService:

    @staticmethod
    def get_holidays_by_month_and_year(month: int, year: int):
        vn_holidays = holidays.Vietnam(years=year)

        result = []

        for holiday_date, name in vn_holidays.items():
            if holiday_date.month == month:
                result.append({"name": name, "date": holiday_date})

        return result
    
    @staticmethod
    def get_holidays_by_year(year: int):
        vn_holidays = holidays.Vietnam(years=year)

        result = []

        for holiday_date, name in vn_holidays.items():
            result.append({"name": name, "date": holiday_date})

        return result