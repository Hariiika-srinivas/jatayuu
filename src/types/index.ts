import { DamageClass, DataSourceStatus, SeverityLevel } from '../theme';

export type AnalysisMode = 'LATEST_OBSERVATION' | 'STATIC_UPLOAD' | 'NORMAL_CONDITIONS' | 'HISTORICAL_REPLAY';

export interface DisasterEvent {
  id: string;
  name: string;
  hazard_type: 'FLASH_FLOOD' | 'RIVERINE_FLOOD' | 'GLACIAL_OUTBURST_FLOOD' | 'NORMAL_SURVEILLANCE';
  country: string;
  location_name: string;
  center_lat: number;
  center_lon: number;
  zoom: number;
  onset_date: string;
  description: string;
  headline_event?: boolean;
  nisar_available: boolean;
  nisar_notes?: string;
  vantor_coverage: boolean;
  tier_available: 'TIER_1_AND_2' | 'TIER_1_ONLY';
  satellite_latencies: {
    sentinel1: string;
    nisar?: string;
    gfm: string;
    vantor?: string;
    sentinel2: string;
  };
  // Mode & Provenance Metadata
  event_category?: AnalysisMode;
  observation_badge?: 'REAL SATELLITE OBSERVATION' | 'SIMULATED DEMO DATA' | 'HISTORICAL EVENT REPLAY';
  is_normal_no_flood?: boolean;
  data_source_meta?: {
    provider: string;
    primary_sensor: string;
    spatial_resolution: string;
    acquisition_time: string;
    retrieval_time: string;
    coverage_area_sqkm: number;
    limitations: string[];
    documentation_urls?: string[];
  };
}

export interface AffectedZone {
  id: string;
  zone_name: string;
  event_id: string;
  priority: 'P1' | 'P2' | 'P3' | 'NOMINAL';
  severity_score: number; // 0-100
  extent_score: number;   // 0-100
  population_score: number;
  infrastructure_score: number;
  accessibility_score: number;
  tier2_damage_factor?: number;
  flood_area_sqkm: number;
  exposed_population: number;
  exposed_buildings: number;
  critical_facilities: {
    hospitals: number;
    schools: number;
    bridges_submerged: number;
    fire_stations: number;
  };
  coordinates: [number, number][]; // Polygon coords [lon, lat]
  center: [number, number];
  primary_threat: string;
  plain_language_summary: string;
}

export interface DamagedBuilding {
  id: string;
  zone_id: string;
  event_id: string;
  building_id: string;
  lat: number;
  lon: number;
  damage_class: DamageClass;
  confidence: number; // 0.0 - 1.0
  source: 'YOLO_XBD' | 'HEURISTIC' | 'GEODETIC_CALCULATION';
  structure_type: 'Residential' | 'Commercial' | 'Public' | 'Bridge/Culvert';
  pre_image_url: string;
  post_image_url: string;
  crop_image_url: string;
  detected_features: string[];
  recommended_response: string;
  // Geodesic footprint & exposure separation
  footprint_area_m2?: number; // Exact geodesic area in square meters
  isInundated?: boolean;       // Water exposure does not imply structural destruction
  exposure_note?: string;      // Explicit non-inference disclaimer
}

export interface DataSourceMeta {
  id: string;
  name: string;
  satellite_constellation: string;
  instrument: string;
  spectral_band: string;
  spatial_resolution: string;
  revisit_rate: string;
  latency_hours: number;
  status: DataSourceStatus;
  license: string;
  endpoint_provider: string;
  last_acquisition: string;
  usable_in_tier: 'Tier 1' | 'Tier 2' | 'Both';
  cross_check_target?: string;
  notes: string;
}

export interface MissionStep {
  step: 'TASKED' | 'DISCOVERING' | 'ACQUIRING' | 'PREPROCESSING' | 'FLOOD_ANALYSIS' | 'EXPOSURE' | 'BUILDING_INSPECTION' | 'SCORING' | 'ALERTING' | 'COMPLETE';
  timestamp: string;
  source: string;
  acquisition_time: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'SKIPPED';
  detail: string;
}

export interface MissionState {
  mission_id: string;
  event_id: string;
  status: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  current_step_index: number;
  logs: MissionStep[];
  started_at?: string;
  completed_at?: string;
}

export interface AlertRecord {
  id: string;
  timestamp: string;
  zone_id: string;
  zone_name: string;
  priority: 'P1' | 'P2' | 'P3' | 'NOMINAL';
  severity_score: number;
  channel: 'DASHBOARD' | 'TELEGRAM' | 'SMS_MOCK';
  status: 'DISPATCHED' | 'QUEUED' | 'FAILED' | 'ROUTINE_STANDBY';
  summary: string;
  target_agency: string;
}

export interface StaticUploadResult {
  filename: string;
  format: 'GeoJSON' | 'CSV' | 'GeoTIFF' | 'Optical Image' | 'Shapefile Zip';
  feature_count?: number;
  building_count?: number;
  total_footprint_m2?: number;
  bbox?: { min_lon?: number; min_lat?: number; max_lon?: number; max_lat?: number };
  sample_buildings?: { id: string; area_m2: number; type: string }[];
  model_compatibility: {
    prithvi_multispectral_ready: boolean;
    reason: string;
    pipeline: string;
  };
}
