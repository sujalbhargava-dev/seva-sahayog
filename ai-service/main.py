from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.forecast import router as forecast_router

app = FastAPI(
    title="SewaShayog AI Service",
    description="Demand forecasting microservice for the SewaShayog cooperative gig platform",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(forecast_router, prefix="/api/forecast", tags=["Forecast"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "SewaShayog AI Service"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
