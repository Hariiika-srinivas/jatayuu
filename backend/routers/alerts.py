import os
import datetime
import urllib.request
import urllib.parse
import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.schema import Alert

router = APIRouter(prefix="/alerts", tags=["alerts"])

class AlertDispatchRequest(BaseModel):
    zone_id: str
    priority: str
    target_agency: str
    message_text: str
    channel: str = "DASHBOARD"

@router.get("/")
def list_alerts(db: Session = Depends(get_db)):
    return db.query(Alert).order_by(Alert.dispatched_at.desc()).all()

@router.post("/dispatch")
def dispatch_alert(req: AlertDispatchRequest, db: Session = Depends(get_db)):
    alert_id = f"ALT-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

    telegram_sent = False
    telegram_bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    telegram_chat_id = os.getenv("TELEGRAM_CHAT_ID")

    if telegram_bot_token and telegram_chat_id and req.channel in ["TELEGRAM", "ALL"]:
        try:
            tg_url = f"https://api.telegram.org/bot{telegram_bot_token}/sendMessage"
            payload = json.dumps({
                "chat_id": telegram_chat_id,
                "text": f"🚨 [JATAYU {req.priority} ALERT]\n{req.message_text}\nAgency: {req.target_agency}",
                "parse_mode": "Markdown"
            }).encode("utf-8")
            request = urllib.request.Request(tg_url, data=payload, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(request, timeout=5) as response:
                if response.status == 200:
                    telegram_sent = True
        except Exception as e:
            telegram_sent = False

    alert = Alert(
        id=alert_id,
        zone_id=req.zone_id,
        priority=req.priority,
        channel=req.channel,
        target_agency=req.target_agency,
        message_text=req.message_text,
        status="DISPATCHED",
    )
    db.add(alert)
    db.commit()

    return {
        "alert_id": alert_id,
        "status": "DISPATCHED",
        "telegram_dispatched": telegram_sent,
        "channel": req.channel,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
