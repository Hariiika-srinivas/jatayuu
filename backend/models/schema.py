import datetime
from sqlalchemy import (
    Column, String, Integer, Float, DateTime, Text, JSON, Boolean, ForeignKey
)
from sqlalchemy.orm import relationship
from backend.database import Base

class DisasterEvent(Base):
    __tablename__ = "disaster_events"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    hazard_type = Column(String, nullable=False)
    country = Column(String, nullable=False)
    location_name = Column(String, nullable=False)
    center_lat = Column(Float, nullable=False)
    center_lon = Column(Float, nullable=False)
    onset_date = Column(DateTime, default=datetime.datetime.utcnow)
    description = Column(Text, nullable=True)
    tier_available = Column(String, default="TIER_1_ONLY")

    zones = relationship("AffectedZone", back_populates="event")
    scenes = relationship("Scene", back_populates="event")
    missions = relationship("Mission", back_populates="event")

class AffectedZone(Base):
    __tablename__ = "affected_zones"

    id = Column(String, primary_key=True, index=True)
    event_id = Column(String, ForeignKey("disaster_events.id"), nullable=False)
    zone_name = Column(String, nullable=False)
    priority = Column(String, nullable=False)  # P1, P2, P3
    severity_score = Column(Float, nullable=False)  # 0-100
    extent_score = Column(Float, nullable=False)
    population_score = Column(Float, nullable=False)
    infrastructure_score = Column(Float, nullable=False)
    accessibility_score = Column(Float, nullable=False)
    tier2_damage_factor = Column(Float, default=0.0)
    flood_area_sqkm = Column(Float, nullable=False)
    exposed_population = Column(Integer, default=0)
    exposed_buildings = Column(Integer, default=0)
    critical_facilities = Column(JSON, default=dict)  # hospitals, schools, bridges
    score_breakdown = Column(JSON, default=dict)     # detailed weights
    polygon_geojson = Column(JSON, nullable=True)
    plain_language_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    event = relationship("DisasterEvent", back_populates="zones")
    buildings = relationship("BuildingDamage", back_populates="zone")
    alerts = relationship("Alert", back_populates="zone")

class Scene(Base):
    __tablename__ = "scenes"

    id = Column(String, primary_key=True, index=True)
    event_id = Column(String, ForeignKey("disaster_events.id"), nullable=False)
    provider = Column(String, nullable=False)  # NISAR, SENTINEL_1, GFM, VANTOR, SENTINEL_2
    acquisition_time = Column(DateTime, nullable=False)
    resolution_meters = Column(Float, nullable=False)
    cloud_cover_percent = Column(Float, default=0.0)
    stac_item_id = Column(String, nullable=True)
    status = Column(String, default="CACHED")  # REAL, CACHED, MOCK
    metadata_json = Column(JSON, default=dict)

    event = relationship("DisasterEvent", back_populates="scenes")

class BuildingDamage(Base):
    __tablename__ = "buildings_damage"

    id = Column(String, primary_key=True, index=True)
    zone_id = Column(String, ForeignKey("affected_zones.id"), nullable=False)
    building_osm_id = Column(String, nullable=True)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    damage_class = Column(String, nullable=False)  # no-damage, minor, major, destroyed
    confidence = Column(Float, nullable=False)
    source_method = Column(String, default="YOLO_XBD")  # YOLO_XBD, HEURISTIC
    structure_type = Column(String, default="Residential")
    crop_path = Column(String, nullable=True)
    features_detected = Column(JSON, default=list)

    zone = relationship("AffectedZone", back_populates="buildings")

class Mission(Base):
    __tablename__ = "missions"

    id = Column(String, primary_key=True, index=True)
    event_id = Column(String, ForeignKey("disaster_events.id"), nullable=False)
    status = Column(String, default="TASKED")
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    aoi_polygon = Column(JSON, nullable=True)
    tier_executed = Column(String, default="TIER_1_AND_2")
    summary = Column(Text, nullable=True)

    event = relationship("DisasterEvent", back_populates="missions")
    logs = relationship("MissionLog", back_populates="mission")

class MissionLog(Base):
    __tablename__ = "mission_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    mission_id = Column(String, ForeignKey("missions.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    step = Column(String, nullable=False)
    data_source = Column(String, nullable=True)
    acquisition_time = Column(String, nullable=True)
    message = Column(Text, nullable=False)

    mission = relationship("Mission", back_populates="logs")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, index=True)
    zone_id = Column(String, ForeignKey("affected_zones.id"), nullable=False)
    priority = Column(String, nullable=False)  # P1, P2, P3
    channel = Column(String, nullable=False)   # DASHBOARD, TELEGRAM, SMS_MOCK
    dispatched_at = Column(DateTime, default=datetime.datetime.utcnow)
    target_agency = Column(String, nullable=False)
    message_text = Column(Text, nullable=False)
    status = Column(String, default="DISPATCHED")

    zone = relationship("AffectedZone", back_populates="alerts")

class ModelRun(Base):
    __tablename__ = "model_runs"

    id = Column(String, primary_key=True, index=True)
    model_name = Column(String, nullable=False)
    executed_at = Column(DateTime, default=datetime.datetime.utcnow)
    input_scene_id = Column(String, nullable=True)
    execution_tier = Column(String, nullable=False)  # TIER_1, TIER_2
    metrics_summary = Column(JSON, default=dict)
