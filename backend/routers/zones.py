from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models.schema import AffectedZone, BuildingDamage

router = APIRouter(prefix="/zones", tags=["zones"])

@router.get("/")
def list_zones(event_id: str = None, db: Session = Depends(get_db)):
    query = db.query(AffectedZone)
    if event_id:
        query = query.filter(AffectedZone.event_id == event_id)
    return query.order_by(AffectedZone.severity_score.desc()).all()

@router.get("/{zone_id}")
def get_zone(zone_id: str, db: Session = Depends(get_db)):
    zone = db.query(AffectedZone).filter(AffectedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return zone

@router.get("/{zone_id}/buildings")
def get_zone_buildings(zone_id: str, db: Session = Depends(get_db)):
    buildings = db.query(BuildingDamage).filter(BuildingDamage.zone_id == zone_id).all()
    return buildings
