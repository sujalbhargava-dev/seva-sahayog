import numpy as np
from sklearn.ensemble import RandomForestRegressor
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import random


class ForecastingService:
    """
    Demand forecasting service using scikit-learn RandomForestRegressor.

    In production, this would be trained on historical booking data from MongoDB.
    For the hackathon demo, it uses synthetic data generation + a trained model
    to demonstrate the forecasting pipeline.
    """

    def __init__(self):
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
        )
        self._train_on_synthetic_data()

    def _train_on_synthetic_data(self):
        """
        Generate synthetic booking data and train the model.
        Features: [day_of_week, hour, month, service_id, area_code]
        Target: demand_count
        """
        np.random.seed(42)
        n_samples = 2000

        # Generate features
        day_of_week = np.random.randint(0, 7, n_samples)
        hour = np.random.randint(6, 22, n_samples)
        month = np.random.randint(1, 13, n_samples)
        service_id = np.random.randint(0, 12, n_samples)
        area_code = np.random.randint(0, 10, n_samples)

        X = np.column_stack([day_of_week, hour, month, service_id, area_code])

        # Generate realistic demand patterns
        y = (
            5
            + 3 * np.sin(2 * np.pi * day_of_week / 7)  # Weekly pattern
            + 2 * np.sin(2 * np.pi * hour / 24)          # Daily pattern
            + 1.5 * np.sin(2 * np.pi * month / 12)       # Seasonal pattern
            + np.random.normal(0, 1, n_samples)           # Noise
        )
        y = np.maximum(y, 0).astype(int)  # Non-negative demand

        self.model.fit(X, y)

    def predict_demand(
        self,
        service_id: int = 0,
        area_code: int = 0,
        days_ahead: int = 7,
    ) -> List[Dict]:
        """
        Predict demand for the next N days.
        Returns a list of daily forecasts with hourly breakdown.
        """
        forecasts = []
        now = datetime.now()

        for day_offset in range(days_ahead):
            target_date = now + timedelta(days=day_offset)
            day_of_week = target_date.weekday()
            month = target_date.month

            daily_demand = 0
            hourly_breakdown = []

            for hour in range(6, 22):  # Working hours 6 AM - 10 PM
                X_pred = np.array([[day_of_week, hour, month, service_id, area_code]])
                predicted = max(0, int(self.model.predict(X_pred)[0]))
                daily_demand += predicted
                hourly_breakdown.append({
                    "hour": hour,
                    "predicted_demand": predicted,
                })

            forecasts.append({
                "date": target_date.strftime("%Y-%m-%d"),
                "day_name": target_date.strftime("%A"),
                "total_demand": daily_demand,
                "peak_hour": max(hourly_breakdown, key=lambda x: x["predicted_demand"])["hour"],
                "hourly_breakdown": hourly_breakdown,
            })

        return forecasts

    def get_trends(
        self,
        service_id: int = 0,
        area_code: int = 0,
    ) -> Dict:
        """
        Analyze demand trends — weekly and monthly patterns.
        """
        # Weekly pattern
        weekly = []
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        for dow in range(7):
            X_pred = np.array([[dow, 12, datetime.now().month, service_id, area_code]])
            predicted = max(0, int(self.model.predict(X_pred)[0]))
            weekly.append({"day": days[dow], "avg_demand": predicted})

        # Monthly pattern
        monthly = []
        months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ]
        for m in range(1, 13):
            X_pred = np.array([[3, 12, m, service_id, area_code]])  # Wednesday, noon
            predicted = max(0, int(self.model.predict(X_pred)[0]))
            monthly.append({"month": months[m - 1], "avg_demand": predicted})

        peak_day = max(weekly, key=lambda x: x["avg_demand"])
        peak_month = max(monthly, key=lambda x: x["avg_demand"])

        return {
            "weekly_trends": weekly,
            "monthly_trends": monthly,
            "insights": {
                "peak_day": peak_day["day"],
                "peak_day_demand": peak_day["avg_demand"],
                "peak_month": peak_month["month"],
                "peak_month_demand": peak_month["avg_demand"],
            },
        }


# Singleton instance
forecasting_service = ForecastingService()
