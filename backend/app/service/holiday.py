import holidays

class HolidayService:
    _cache: dict[int, dict] = {}

    @classmethod
    def _get_year_holidays(cls, year: int) -> dict:
        if year not in cls._cache:
            cls._cache[year] = {date: name for date, name in holidays.Vietnam(years=year).items()}
        return cls._cache[year]

    @classmethod
    def get_holidays_in_range(cls, start, end):
        result = []
        for year in range(start.year, end.year + 1):
            for holiday_date, name in cls._get_year_holidays(year).items():
                if start <= holiday_date <= end:
                    result.append({"date": holiday_date, "name": name})
        return result

    @classmethod
    def get_holidays_by_month_and_year(cls, month: int, year: int):
        holidays = [
            {"name": name, "date": date}
            for date, name in cls._get_year_holidays(year).items()
            if date.month == month
        ]
        return holidays

    @classmethod
    def get_holidays_by_year(cls, year: int):
        return [{"name": name, "date": date} for date, name in cls._get_year_holidays(year).items()]
