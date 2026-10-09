from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models.schema import DisasterEvent

router = APIRouter(prefix="/events", tags=["events"])

@router.get("/")
def list_events(db: Session = Depends(get_db)):
    events = db.query(DisasterEvent).all()
    return events

@router.get("/{event_id}")
def get_event(event_id: str, db: Session = Depends(get_db)):
    event = db.query(DisasterEvent).filter(DisasterEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Disaster event not found")
    return event
