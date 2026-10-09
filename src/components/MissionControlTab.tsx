import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { AffectedZone, DamagedBuilding, DisasterEvent, MissionStep, StaticUploadResult } from '../types';
import { DEMO_AFFECTED_ZONES, DEMO_DAMAGED_BUILDINGS, SAT_PRE_IMAGE, SAT_POST_IMAGE } from '../data/demoEvents';
import { MapLegend } from './MapLegend';
import { AnalysisModeSelector } from './AnalysisModeSelector';
import { SharedPipelineFlow } from './SharedPipelineFlow';
import { StaticUploadModal } from './StaticUploadModal';
import { PrithviModelCardModal } from './PrithviModelCardModal';
import {
  Layers,
  Sliders,
  Terminal,
  Play,
  RotateCcw,
  CheckCircle,
  AlertOctagon,
  Eye,
  EyeOff,
  Crosshair,
  Building,
  Activity,
  Maximize2,
  FileText,
  Clock,
  Sparkles,
  Info,
  Flame,
  ShieldCheck,
  Upload,
  Cpu,
} from 'lucide-react';

// D3 Interpolated Color Scale from Green (Low = 0.0) -> Yellow (0.35) -> Orange (0.70) -> Red (High/Destroyed = 1.0)
const d3DamageIntensityScale = d3
  .scaleLinear<string>()
  .domain([0, 0.35, 0.70, 1.0])
  .range(['#00E676', '#FFD600', '#FF8F00', '#FF1744'])
  .interpolate(d3.interpolateRgb);

// Building coordinate map on SVG viewBox 1000 x 700
const BUILDING_POSITIONS: Record<string, { top: string; left: string; svgX: number; svgY: number }> = {
  'BLDG-NP-01': { top: '48%', left: '46%', svgX: 460, svgY: 336 },
  'BLDG-NP-02': { top: '41%', left: '52%', svgX: 520, svgY: 287 },
  'BLDG-NP-03': { top: '56%', left: '38%', svgX: 380, svgY: 392 },
  'BLDG-NP-04': { top: '63%', left: '62%', svgX: 620, svgY: 441 },
  'BLDG-NP-05': { top: '35%', left: '32%', svgX: 320, svgY: 245 },
  'BLDG-NP-06': { top: '52%', left: '58%', svgX: 580, svgY: 364 },
  'BLDG-JK-01': { top: '45%', left: '49%', svgX: 490, svgY: 315 },
  'BLDG-JK-02': { top: '58%', left: '55%', svgX: 550, svgY: 406 },
};

const getBuildingDamageScore = (bldg: DamagedBuilding): number => {
  const baseScores: Record<string, number> = {
    'no-damage': 0.08,
    'minor': 0.38,
    'major': 0.76,
    'destroyed': 0.98,
  };
  return baseScores[bldg.damage_class] ?? 0.3;
};

interface MissionControlTabProps {
  currentEvent: DisasterEvent;
  onSelectEvent: (event: DisasterEvent) => void;
  isMissionRunning: boolean;
  onRunMission: () => void;
  missionLogs: MissionStep[];
  currentStepIndex: number;
  onSelectBuilding: (building: DamagedBuilding) => void;
  onOpenReport: () => void;
}

export const MissionControlTab: React.FC<MissionControlTabProps> = ({
  currentEvent,
  onSelectEvent,
  isMissionRunning,
  onRunMission,
  missionLogs,
  currentStepIndex,
  onSelectBuilding,
  onOpenReport,
}) => {
  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPrithviModalOpen, setIsPrithviModalOpen] = useState(false);

  // Layer Toggles
  const [showSentinel1, setShowSentinel1] = useState(true);
  const [showNisar, setShowNisar] = useState(true);
  const [showGFM, setShowGFM] = useState(true);
  const [showVantor, setShowVantor] = useState(true);
  const [showDamagedBuildings, setShowDamagedBuildings] = useState(true);
  const [showDamageHeatmap, setShowDamageHeatmap] = useState(true);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.70);
  const [heatmapRadius, setHeatmapRadius] = useState(85);
  const [hoveredHeatmapBldg, setHoveredHeatmapBldg] = useState<DamagedBuilding | null>(null);
  const [showOSMInfra, setShowOSMInfra] = useState(true);
  const [showSeverityZones, setShowSeverityZones] = useState(true);
  const [isLegendVisible, setIsLegendVisible] = useState(true);

  // Before/After Optical Swipe Slider
  const [isSwipeMode, setIsSwipeMode] = useState(false);
  const [swipePosition, setSwipePosition] = useState(50); // percentage

  // Selected Zone for detail panel
  const eventZones = DEMO_AFFECTED_ZONES[currentEvent.id] || [];
  const [selectedZone, setSelectedZone] = useState<AffectedZone | null>(eventZones[0] || null);

  // Buildings for current event
  const eventBuildings = DEMO_DAMAGED_BUILDINGS.filter((b) => b.event_id === currentEvent.id);

  // Update selected zone when event changes
  useEffect(() => {
    if (eventZones.length > 0) {
      setSelectedZone(eventZones[0]);
    } else {
      setSelectedZone(null);
    }
  }, [currentEvent.id]);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [missionLogs]);

  // Handle uploaded dataset integration
  const handleApplyUpload = (res: StaticUploadResult) => {
    const customUploadEvent: DisasterEvent = {
      id: `UPLOAD_${Date.now()}`,
      name: `User Dataset: ${res.filename}`,
      hazard_type: 'FLASH_FLOOD',
      country: 'Custom AOI',
      location_name: `Static Upload (${res.format})`,
      center_lat: currentEvent.center_lat,
      center_lon: currentEvent.center_lon,
      zoom: 14,
      onset_date: new Date().toISOString(),
      description: `Static upload dataset: ${res.filename}. Format: ${res.format}. ${res.model_compatibility.reason}`,
      event_category: 'STATIC_UPLOAD',
      observation_badge: 'SIMULATED DEMO DATA',
      nisar_available: false,
      vantor_coverage: true,
      tier_available: 'TIER_1_AND_2',
      satellite_latencies: {
        sentinel1: 'User Upload (Local)',
        gfm: 'Local Processing',
        sentinel2: 'Optical Frame',
      },
      data_source_meta: {
        provider: `User File (${res.format})`,
        primary_sensor: res.format,
        spatial_resolution: 'Vector / GeoTIFF',
        acquisition_time: 'Uploaded at runtime',
        retrieval_time: new Date().toISOString(),
        coverage_area_sqkm: res.total_footprint_m2 ? Math.round(res.total_footprint_m2 / 100000) / 10 : 25.0,
        limitations: [
          'User provided dataset; ground accuracy contingent on source registration.',
          res.model_compatibility.reason,
        ],
      },
    };

    onSelectEvent(customUploadEvent);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* 1. Interactive Analysis Mode Selector (Mode A, Mode B, Mode C, Mode D) */}
      <AnalysisModeSelector
        currentEvent={currentEvent}
        onSelectEvent={onSelectEvent}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenPrithviModal={() => setIsPrithviModalOpen(true)}
      />

      {/* 2. Shared 10-Stage Pipeline Flow */}
      <SharedPipelineFlow
        currentEvent={currentEvent}
        currentStepIndex={currentStepIndex}
        onOpenPrithviCard={() => setIsPrithviModalOpen(true)}
      />

      {/* 3. Main Command Center Grid: Map Viewport (8 Cols) & Live Terminal (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-210px)] min-h-[640px]">
        {/* LEFT / CENTER: Interactive Map Viewport (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col bg-[#0F0F12] border border-[#26262E] rounded-xl overflow-hidden relative shadow-2xl">
          {/* Map Top Bar Controls */}
          <div className="h-11 bg-[#17171C] border-b border-[#26262E] px-4 flex items-center justify-between text-xs z-30">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-[#F4F4F5] uppercase tracking-wider font-display flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-[#E10600]" />
                Virtual Drone AOI: {currentEvent.location_name}
              </span>
              <span className="text-[#A1A1AA] hidden md:inline">·</span>
              <span className="font-mono-code text-[11px] text-[#A1A1AA] hidden md:inline">
                {currentEvent.center_lat.toFixed(4)}°N, {currentEvent.center_lon.toFixed(4)}°E
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Map Legend Toggle */}
              <button
                onClick={() => setIsLegendVisible(!isLegendVisible)}
                title={isLegendVisible ? 'Hide Map Legend' : 'Show Map Legend'}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  isLegendVisible
                    ? 'bg-[#17171C] border border-[#E10600] text-white shadow-[0_0_8px_rgba(225,6,0,0.3)]'
                    : 'bg-[#0F0F12] border border-[#26262E] text-[#A1A1AA] hover:text-white'
                }`}
              >
                {isLegendVisible ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-[#E10600]" />
                    <span>Hide Legend</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Show Legend</span>
                  </>
                )}
              </button>

              {/* Swipe Mode Toggle Button */}
              {currentEvent.vantor_coverage && !currentEvent.is_normal_no_flood && (
                <button
                  onClick={() => setIsSwipeMode(!isSwipeMode)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                    isSwipeMode
                      ? 'bg-[#E10600] text-white shadow-[0_0_12px_rgba(225,6,0,0.5)]'
                      : 'bg-[#0F0F12] border border-[#26262E] text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{isSwipeMode ? 'Exit Pre/Post Swipe' : '30cm Optical Swipe'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Map Surface Viewport */}
          <div className="flex-1 relative overflow-hidden bg-[#070708] select-none">
            {/* Mode C: Normal Conditions / No Flood Prominent Status Banner */}
            {currentEvent.is_normal_no_flood && (
              <div className="absolute top-3 left-4 right-4 z-40 bg-[#0F0F12]/95 border border-[#00E676] rounded-lg p-3 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/40">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-white uppercase tracking-wider block text-xs">
                      NO FLOOD DETECTED IN THE ANALYZED AREA.
                    </span>
                    <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                      Observation: {currentEvent.data_source_meta?.acquisition_time || '2026-10-08 05:30 UTC'} · Sensor: {currentEvent.data_source_meta?.primary_sensor || 'Sentinel-1 C-SAR (10m)'} · River Stage: Nominal Safe Flow (9.8 ft, Danger: 18.0 ft)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded bg-[#00E676]/20 border border-[#00E676] text-[#00E676] font-mono-code font-bold text-[10px]">
                    ROUTINE MONITORING: NOMINAL
                  </span>
                </div>
              </div>
            )}

            {/* Drone Scan Line Animation (When Mission Running) */}
            {isMissionRunning && (
              <div className="absolute inset-0 pointer-events-none z-20">
                <div className="drone-scan-line" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-[#E10600]/40 rounded-full animate-ping pointer-events-none" />
                <div className="absolute top-4 left-4 bg-[#7A0A0A]/90 border border-[#E10600] px-3 py-1.5 rounded-md text-xs font-mono-code text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E10600] animate-ping" />
                  <span>VIRTUAL DRONE SCANNING AOI CORRIDOR...</span>
                </div>
              </div>
            )}

            {/* Before/After Optical Swipe Mode */}
            {isSwipeMode && currentEvent.vantor_coverage && !currentEvent.is_normal_no_flood ? (
              <div className="relative w-full h-full overflow-hidden">
                {/* Pre-disaster Base Image */}
                <img
                  src={SAT_PRE_IMAGE}
                  alt="Pre-disaster optical"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Post-disaster Flooded Overlay with Clip Path */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `polygon(${swipePosition}% 0, 100% 0, 100% 100%, ${swipePosition}% 100%)` }}
                >
                  <img
                    src={SAT_POST_IMAGE}
                    alt="Post-disaster optical flood"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>

                {/* Slider Divider Line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-[#E10600] shadow-[0_0_12px_#E10600] z-20 pointer-events-none"
                  style={{ left: `${swipePosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 bg-[#17171C] border border-[#E10600] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                    ⇄
                  </div>
                </div>

                {/* Interactive Range Input Overlay */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={swipePosition}
                  onChange={(e) => setSwipePosition(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                />

                {/* Labels on Swipe View */}
                <div className="absolute top-3 left-3 bg-[#0F0F12]/80 border border-[#26262E] px-2.5 py-1 rounded text-[11px] font-mono-code text-[#F4F4F5] z-10">
                  PRE-DISASTER (BASE)
                </div>
                <div className="absolute top-3 right-3 bg-[#0F0F12]/80 border border-[#26262E] px-2.5 py-1 rounded text-[11px] font-mono-code text-[#FF1744] z-10">
                  POST-DISASTER (FLOODED)
                </div>
              </div>
            ) : (
              /* Standard Map Canvas */
              <div className="relative w-full h-full bg-[#09090C] flex items-center justify-center">
                {/* Base Satellite Imagery */}
                <img
                  src={SAT_POST_IMAGE}
                  alt="Earth Observation Satellite Frame"
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover filter contrast-125 ${
                    currentEvent.is_normal_no_flood ? 'opacity-85 brightness-95' : 'opacity-75'
                  }`}
                />

                {/* SVG Vector Overlays */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 700">
                  <defs>
                    <filter id="red-zone-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>

                    {/* D3 Interpolated Damage Heatmap Gradients */}
                    {eventBuildings.map((bldg) => {
                      const score = getBuildingDamageScore(bldg);
                      const cCenter = d3DamageIntensityScale(score);
                      const cMid = d3DamageIntensityScale(score * 0.70);
                      const cOuter = d3DamageIntensityScale(score * 0.35);

                      return (
                        <radialGradient
                          key={`d3-heat-grad-${bldg.id}`}
                          id={`d3-heat-grad-${bldg.id}`}
                          cx="50%"
                          cy="50%"
                          r="50%"
                        >
                          <stop offset="0%" stopColor={cCenter} stopOpacity="0.90" />
                          <stop offset="40%" stopColor={cMid} stopOpacity="0.60" />
                          <stop offset="75%" stopColor={cOuter} stopOpacity="0.25" />
                          <stop offset="100%" stopColor={cOuter} stopOpacity="0" />
                        </radialGradient>
                      );
                    })}
                  </defs>

                  {/* 1. Sentinel-1 Flood Water Polygon (Only shown if NOT normal baseline) */}
                  {showSentinel1 && !currentEvent.is_normal_no_flood && (
                    <g id="sentinel1-layer">
                      <path
                        d="M 120 320 Q 300 370 480 340 T 820 420 L 890 540 Q 640 580 430 520 T 110 460 Z"
                        fill="rgba(0, 184, 212, 0.45)"
                        stroke="#4DD0E1"
                        strokeWidth="2.5"
                      />
                      <path
                        d="M 220 450 Q 360 490 520 470 L 640 590 L 310 580 Z"
                        fill="rgba(0, 184, 212, 0.40)"
                        stroke="#00E5FF"
                        strokeWidth="1.8"
                      />
                    </g>
                  )}

                  {/* 2. NISAR L-band SAR Extent (Only if not normal baseline) */}
                  {showNisar && currentEvent.nisar_available && !currentEvent.is_normal_no_flood && (
                    <g id="nisar-layer">
                      <path
                        d="M 260 270 Q 420 320 620 290 T 780 360 L 740 430 Q 510 390 320 380 Z"
                        fill="rgba(179, 136, 255, 0.35)"
                        stroke="#B388FF"
                        strokeWidth="2"
                        strokeDasharray="6 3"
                      />
                    </g>
                  )}

                  {/* 3. Copernicus GFM Official Layer */}
                  {showGFM && !currentEvent.is_normal_no_flood && (
                    <g id="gfm-layer">
                      <path
                        d="M 130 330 Q 310 380 490 350 T 830 430 L 870 530 Q 630 570 420 510 T 120 450 Z"
                        fill="none"
                        stroke="#00BFA5"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                    </g>
                  )}

                  {/* 4. D3 Building Damage Intensity Heatmap Layer */}
                  {showDamageHeatmap && currentEvent.vantor_coverage && !currentEvent.is_normal_no_flood && (
                    <g id="d3-damage-heatmap-layer" opacity={heatmapOpacity}>
                      {eventBuildings.map((bldg) => {
                        const pos = BUILDING_POSITIONS[bldg.id] ?? { svgX: 500, svgY: 350 };
                        return (
                          <circle
                            key={`d3-heat-${bldg.id}`}
                            cx={pos.svgX}
                            cy={pos.svgY}
                            r={heatmapRadius}
                            fill={`url(#d3-heat-grad-${bldg.id})`}
                            style={{ mixBlendMode: 'screen' }}
                          />
                        );
                      })}
                    </g>
                  )}

                  {/* 5. OSM Infrastructure Lifelines */}
                  {showOSMInfra && (
                    <g id="osm-infrastructure-layer">
                      {/* Arterial Road Highway Corridor */}
                      <path
                        d="M 80 180 Q 340 280 620 240 T 940 380"
                        fill="none"
                        stroke="#F4F4F5"
                        strokeWidth="3.5"
                        strokeDasharray="8 4"
                      />
                      {/* Secondary Link Bridge Road */}
                      <path
                        d="M 380 120 L 520 620"
                        fill="none"
                        stroke="#A1A1AA"
                        strokeWidth="2.5"
                      />
                    </g>
                  )}

                  {/* 6. Priority Severity Zone Outlines (Only if not normal baseline) */}
                  {showSeverityZones && !currentEvent.is_normal_no_flood && (
                    <g id="severity-zones-layer">
                      <polygon
                        points="310,240 680,250 710,510 330,500"
                        fill="rgba(225, 6, 0, 0.12)"
                        stroke="#FF1744"
                        strokeWidth="2.5"
                        filter="url(#red-zone-glow)"
                      />
                    </g>
                  )}
                </svg>

                {/* Building Markers Pin Layer (Only if not normal baseline) */}
                {showDamagedBuildings && currentEvent.vantor_coverage && !currentEvent.is_normal_no_flood && (
                  <div className="absolute inset-0 pointer-events-auto">
                    {eventBuildings.map((bldg) => {
                      const pos = BUILDING_POSITIONS[bldg.id] ?? { top: '50%', left: '50%' };
                      const color =
                        bldg.damage_class === 'destroyed'
                          ? '#FF1744'
                          : bldg.damage_class === 'major'
                          ? '#FF8F00'
                          : bldg.damage_class === 'minor'
                          ? '#FFD600'
                          : '#00E676';

                      return (
                        <button
                          key={bldg.id}
                          onClick={() => onSelectBuilding(bldg)}
                          style={{ top: pos.top, left: pos.left }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus:outline-none"
                        >
                          <div
                            className="w-4 h-4 rounded-xs flex items-center justify-center font-bold text-[9px] text-black shadow-lg"
                            style={{ backgroundColor: color }}
                          >
                            {bldg.damage_class === 'destroyed' ? '!' : '■'}
                          </div>
                          {/* Hover Tooltip with calculated geodesic m² footprint */}
                          <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-[#0F0F12] border border-[#26262E] text-white text-[11px] p-2 rounded-md shadow-xl whitespace-nowrap z-50">
                            <p className="font-semibold text-white">{bldg.building_id}</p>
                            <p className="text-[10px] uppercase font-bold" style={{ color }}>
                              Class: {bldg.damage_class} ({(bldg.confidence * 100).toFixed(1)}%)
                            </p>
                            <p className="text-[10px] text-[#4DD0E1] font-mono-code">
                              Footprint: {bldg.footprint_area_m2 ? `${bldg.footprint_area_m2} m²` : '142 m²'}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Dynamic Map Legend Component */}
                <MapLegend
                  currentEvent={currentEvent}
                  showSentinel1={showSentinel1 && !currentEvent.is_normal_no_flood}
                  showNisar={showNisar && !currentEvent.is_normal_no_flood}
                  showGFM={showGFM && !currentEvent.is_normal_no_flood}
                  showVantor={showVantor}
                  showDamagedBuildings={showDamagedBuildings && !currentEvent.is_normal_no_flood}
                  showSeverityZones={showSeverityZones && !currentEvent.is_normal_no_flood}
                  showHeatmap={showDamageHeatmap && !currentEvent.is_normal_no_flood}
                  heatmapOpacity={Math.round(heatmapOpacity * 100)}
                  showOSMInfra={showOSMInfra}
                  isVisible={isLegendVisible}
                  onToggleVisibility={() => setIsLegendVisible(!isLegendVisible)}
                  buildingCount={currentEvent.is_normal_no_flood ? 0 : eventBuildings.length}
                />

                {/* Map Layer Controls Floating Menu (Top Right) */}
                <div className="absolute top-3 right-3 bg-[#0F0F12]/92 backdrop-blur-md border border-[#26262E] p-2.5 rounded-lg shadow-xl text-xs z-30 pointer-events-auto">
                  <p className="font-semibold text-white mb-2 font-display text-[11px] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#E10600]" />
                    Toggle GIS Overlays
                  </p>
                  <div className="space-y-1.5 text-[11px]">
                    <label className="flex items-center gap-2 cursor-pointer hover:text-white text-[#F4F4F5]">
                      <input
                        type="checkbox"
                        checked={showSentinel1}
                        onChange={(e) => setShowSentinel1(e.target.checked)}
                        className="accent-[#E10600]"
                      />
                      <span>Sentinel-1 Flood Water</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer hover:text-white text-[#F4F4F5]">
                      <input
                        type="checkbox"
                        checked={showNisar}
                        onChange={(e) => setShowNisar(e.target.checked)}
                        disabled={!currentEvent.nisar_available}
                        className="accent-[#E10600] disabled:opacity-40"
                      />
                      <span className={!currentEvent.nisar_available ? 'text-[#71717A] line-through' : ''}>
                        NISAR L-band SAR
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer hover:text-white text-[#F4F4F5]">
                      <input
                        type="checkbox"
                        checked={showGFM}
                        onChange={(e) => setShowGFM(e.target.checked)}
                        className="accent-[#E10600]"
                      />
                      <span>Copernicus GFM Outline</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer hover:text-white text-[#F4F4F5]">
                      <input
                        type="checkbox"
                        checked={showDamageHeatmap}
                        onChange={(e) => setShowDamageHeatmap(e.target.checked)}
                        disabled={!currentEvent.vantor_coverage}
                        className="accent-[#E10600] disabled:opacity-40"
                      />
                      <span className={!currentEvent.vantor_coverage ? 'text-[#71717A]' : 'text-white font-medium flex items-center gap-1'}>
                        <Flame className="w-3 h-3 text-[#FF1744]" />
                        Damage Heatmap (D3)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer hover:text-white text-[#F4F4F5]">
                      <input
                        type="checkbox"
                        checked={showDamagedBuildings}
                        onChange={(e) => setShowDamagedBuildings(e.target.checked)}
                        disabled={!currentEvent.vantor_coverage}
                        className="accent-[#E10600] disabled:opacity-40"
                      />
                      <span className={!currentEvent.vantor_coverage ? 'text-[#71717A]' : ''}>
                        Building Footprints {currentEvent.vantor_coverage ? `(${eventBuildings.length})` : '(No VHR)'}
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer hover:text-white text-[#F4F4F5]">
                      <input
                        type="checkbox"
                        checked={showSeverityZones}
                        onChange={(e) => setShowSeverityZones(e.target.checked)}
                        className="accent-[#E10600]"
                      />
                      <span>Priority Severity Zones</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Selected Zone Quick Context Strip (Bottom) */}
          {selectedZone && (
            <div className="bg-[#17171C] border-t border-[#26262E] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-2 py-0.5 rounded font-mono-code font-bold text-xs ${
                    selectedZone.priority === 'P1'
                      ? 'bg-[#FF1744] text-white animate-pulse'
                      : selectedZone.priority === 'NOMINAL'
                      ? 'bg-[#00E676] text-black font-semibold'
                      : 'bg-[#FF8F00] text-black font-semibold'
                  }`}
                >
                  {selectedZone.priority} {selectedZone.priority === 'P1' ? '!' : ''}
                </span>
                <span className="font-semibold text-white">{selectedZone.zone_name}</span>
                <span className="text-[#A1A1AA] hidden sm:inline">·</span>
                <span className="text-[#A1A1AA] font-mono-code hidden sm:inline">
                  Severity: <strong className="text-white">{selectedZone.severity_score}</strong>/100
                </span>
              </div>

              <div className="flex items-center gap-4 text-[11px] font-mono-code text-[#A1A1AA]">
                <span>Flood Area: <strong className="text-[#00E5FF]">{selectedZone.flood_area_sqkm} km²</strong></span>
                <span>Exposed Pop: <strong className="text-white">{selectedZone.exposed_population.toLocaleString()}</strong></span>
                <span>Facilities Submerged: <strong className="text-[#FF1744]">{selectedZone.critical_facilities.hospitals + selectedZone.critical_facilities.bridges_submerged}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Live Terminal Mission Log & Execution Controller (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col bg-[#0F0F12] border border-[#26262E] rounded-xl overflow-hidden shadow-2xl">
          {/* Terminal Header */}
          <div className="h-11 bg-[#17171C] border-b border-[#26262E] px-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#E10600]" />
              <span className="font-semibold text-white uppercase tracking-wider font-display">
                Autonomous Mission Log
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isMissionRunning ? 'bg-[#00E676] animate-ping' : 'bg-[#26262E]'}`} />
              <span className="font-mono-code text-[11px] text-[#A1A1AA]">
                {isMissionRunning ? 'STREAMING (SSE)' : 'STANDBY'}
              </span>
            </div>
          </div>

          {/* Live Mission Progression Steps Tracker */}
          <div className="p-3 bg-[#0A0A0D] border-b border-[#26262E]">
            <div className="flex items-center justify-between text-[11px] font-mono-code text-[#A1A1AA] mb-1.5">
              <span>PIPELINE PROGRESS</span>
              <span className="text-white font-bold">{currentStepIndex + 1} / 10 STEPS</span>
            </div>
            <div className="w-full bg-[#17171C] h-2 rounded-full overflow-hidden border border-[#26262E]">
              <div
                className="bg-[#E10600] h-full transition-all duration-300 mission-bar-glow"
                style={{ width: `${((currentStepIndex + 1) / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Terminal Monospace Logs Body */}
          <div className="flex-1 bg-[#070708] p-3 overflow-y-auto font-mono-code text-[11px] leading-relaxed space-y-2 select-text">
            {missionLogs.map((log, i) => {
              const isLatest = i === missionLogs.length - 1;
              return (
                <div
                  key={i}
                  className={`p-2 rounded border transition-colors ${
                    isLatest
                      ? 'bg-[#17171C] border-[#E10600]/40 text-[#F4F4F5]'
                      : 'bg-[#0F0F12]/60 border-[#26262E]/60 text-[#A1A1AA]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[10px] mb-1">
                    <span className="text-[#FF2A1F] font-bold">[{log.timestamp}]</span>
                    <span className="text-[#A1A1AA] truncate">{log.source}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-[#00E676] font-bold select-none">&gt;</span>
                    <div>
                      <span className="text-white font-semibold">[{log.step}]</span>{' '}
                      <span>{log.detail}</span>
                    </div>
                  </div>
                  {log.acquisition_time && (
                    <p className="text-[10px] text-[#71717A] mt-1">
                      Sensor ACQ: {log.acquisition_time}
                    </p>
                  )}
                </div>
              );
            })}
            <div ref={terminalEndRef} />
          </div>

          {/* Mission Control Trigger Bar */}
          <div className="p-3 bg-[#17171C] border-t border-[#26262E] space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[#A1A1AA]">
              <span>Mode: {currentEvent.tier_available === 'TIER_1_AND_2' ? 'Tier 1 SAR + Tier 2 YOLO' : 'Tier 1 SAR (Wide-Area)'}</span>
              <span>Latency: ~{currentEvent.satellite_latencies.sentinel1.split(' ')[0]}</span>
            </div>

            <button
              onClick={onRunMission}
              disabled={isMissionRunning}
              className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                isMissionRunning
                  ? 'bg-[#7A0A0A] text-white cursor-wait opacity-80'
                  : 'bg-[#E10600] hover:bg-[#FF2A1F] text-white hover:shadow-[0_0_20px_rgba(225,6,0,0.6)] active:scale-98'
              }`}
            >
              <Play className={`w-3.5 h-3.5 ${isMissionRunning ? 'animate-spin' : ''}`} />
              <span>{isMissionRunning ? 'Virtual Drone Analyzing Scene...' : 'Trigger Virtual Drone Search'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Static Upload Modal (Mode B) */}
      {isUploadModalOpen && (
        <StaticUploadModal
          onClose={() => setIsUploadModalOpen(false)}
          onApplyUpload={handleApplyUpload}
        />
      )}

      {/* Prithvi-EO Model Card Modal */}
      {isPrithviModalOpen && (
        <PrithviModelCardModal
          onClose={() => setIsPrithviModalOpen(false)}
        />
      )}
    </div>
  );
};
