from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base, SessionLocal
from backend.models.schema import DisasterEvent, AffectedZone, BuildingDamage
from backend.routers import events, zones, missions, alerts, analysis

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="JATAYU Disaster Command Center API",
    description="Autonomous AI Virtual Drone for Multi-Satellite Disaster Discovery & Damage Assessment",
    version="2.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(events.router, prefix="/api")
app.include_router(zones.router, prefix="/api")
app.include_router(missions.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "JATAYU Command Center",
        "hackathon": "VISTERA 2026",
        "team": "IGNITE",
        "tier1_sar_engine": "ACTIVE",
        "tier2_yolo_engine": "ACTIVE",
        "nisar_lband_module": "OPERATIONAL",
        "prithvi_foundation_model": "LOADED",
        "analysis_modes": ["LATEST_SATELLITE", "STATIC_UPLOAD", "NORMAL_CONDITIONS_BASELINE", "HISTORICAL_REPLAY"],
    }
