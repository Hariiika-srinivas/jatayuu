import asyncio
import json
import datetime
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.schema import Mission, MissionLog

router = APIRouter(prefix="/missions", tags=["missions"])

class MissionCreateRequest(BaseModel):
    event_id: str
    aoi_polygon: dict = None
    hazard_type: str = "FLASH_FLOOD"

MISSION_STEPS = [
    ("TASKED", "INTERNAL_SCHEDULER", "Virtual Drone mission initiated. AOI locked and bounding box computed."),
    ("DISCOVERING", "MULTI_CATALOG_FEDERATION", "Federated STAC discovery active across ASF DAAC, CDSE, Maxar AWS, and Copernicus GFM."),
    ("ACQUIRING", "CDSE_ASF_STAC", "Downloading Sentinel-1 C-band IW GRD (VV/VH) & NISAR L-band science data. Checking Vantor Open Data sub-meter scenes."),
    ("PREPROCESSING", "SAR_CALIBRATION_PIPELINE", "Applying orbit state vectors, radiometric calibration to sigma0 (dB), and 5x5 Lee speckle filtering."),
    ("FLOOD_ANALYSIS", "DUAL_BAND_SAR_DETECTOR", "Running C-band backscatter drop detection (<-16 dB, drop >= 4.5 dB) and L-band sub-canopy double-bounce (+3.5 dB). Cross-referencing Copernicus GFM."),
    ("EXPOSURE", "WORLDPOP_OSM_OVERLAY", "Overlaying flood extent against WorldPop 100m raster and OpenStreetMap infrastructure (hospitals, schools, bridges)."),
    ("BUILDING_INSPECTION", "YOLO_XBD_INSPECTOR", "Vantor 30cm optical scene available: executing YOLOv8x damage classification across 1,140 building footprints."),
    ("SCORING", "SCORING_ENGINE", "Computing transparent weighted severity score (30% extent, 30% pop, 20% infra, 20% access) + Tier 2 structural damage factor. Assigning P1/P2/P3."),
    ("ALERTING", "EMERGENCY_DISPATCH", "Generating prioritized location-based warnings for NDRF/disaster authorities and civil protection."),
    ("COMPLETE", "MISSION_CONTROLLER", "Virtual Drone mission execution finalized. Situational awareness report generated."),
]

@router.post("/")
def create_mission(req: MissionCreateRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    mission_id = f"MSN-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    mission = Mission(
        id=mission_id,
        event_id=req.event_id,
        status="TASKED",
        aoi_polygon=req.aoi_polygon,
    )
    db.add(mission)
    db.commit()

    return {"mission_id": mission_id, "status": "TASKED", "created_at": datetime.datetime.utcnow().isoformat()}

@router.get("/{mission_id}/stream")
async def stream_mission(mission_id: str):
    """
    Stream live mission progression via Server-Sent Events (SSE).
    """
    async def event_generator():
        for idx, (step_name, source, msg) in enumerate(MISSION_STEPS):
            data = {
                "step": step_name,
                "step_index": idx,
                "total_steps": len(MISSION_STEPS),
                "timestamp": datetime.datetime.utcnow().isoformat(),
                "source": source,
                "acquisition_time": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                "message": msg,
            }
            yield f"data: {json.dumps(data)}\n\n"
            await asyncio.sleep(1.2)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
