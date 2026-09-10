from pydantic import BaseModel
from typing import List, Dict, Optional


class ForecastRequest(BaseModel):
    service_id: int = 0
    area_code: int = 0
    days_ahead: int = 7


class HourlyForecast(BaseModel):
    hour: int
    predicted_demand: int


class DailyForecast(BaseModel):
    date: str
    day_name: str
    total_demand: int
    peak_hour: int
    hourly_breakdown: List[HourlyForecast]


class ForecastResponse(BaseModel):
    success: bool = True
    forecasts: List[DailyForecast]


class TrendItem(BaseModel):
    day: Optional[str] = None
    month: Optional[str] = None
    avg_demand: int


class TrendInsights(BaseModel):
    peak_day: str
    peak_day_demand: int
    peak_month: str
    peak_month_demand: int


class TrendResponse(BaseModel):
    success: bool = True
    weekly_trends: List[Dict]
    monthly_trends: List[Dict]
    insights: TrendInsights
