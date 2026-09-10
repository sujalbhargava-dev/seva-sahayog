from fastapi import APIRouter, Query
from services.forecasting_service import forecasting_service

router = APIRouter()


@router.get("/demand")
async def get_demand_forecast(
    service_id: int = Query(0, description="Service type ID (0-11)"),
    area_code: int = Query(0, description="Area code (0-9)"),
    days_ahead: int = Query(7, description="Number of days to forecast", ge=1, le=30),
):
    """
    Get demand forecast for the next N days.
    Returns daily totals with hourly breakdown.
    """
    forecasts = forecasting_service.predict_demand(
        service_id=service_id,
        area_code=area_code,
        days_ahead=days_ahead,
    )

    return {
        "success": True,
        "message": "Demand forecast generated",
        "data": {
            "service_id": service_id,
            "area_code": area_code,
            "days_ahead": days_ahead,
            "forecasts": forecasts,
        },
    }


@router.get("/trends")
async def get_trends(
    service_id: int = Query(0, description="Service type ID (0-11)"),
    area_code: int = Query(0, description="Area code (0-9)"),
):
    """
    Get weekly and monthly demand trends with insights.
    """
    trends = forecasting_service.get_trends(
        service_id=service_id,
        area_code=area_code,
    )

    return {
        "success": True,
        "message": "Demand trends generated",
        "data": trends,
    }
