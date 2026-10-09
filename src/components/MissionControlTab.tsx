import React, { useState, useEffect, useRef } from 'react';
import { AffectedZone, DamagedBuilding, DisasterEvent, MissionStep } from '../types';
import { DEMO_AFFECTED_ZONES, DEMO_DAMAGED_BUILDINGS, SAT_PRE_IMAGE, SAT_POST_IMAGE } from '../data/demoEvents';
import { MapLegend } from './MapLegend';
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
} from 'lucide-react';

interface MissionControlTabProps {
  currentEvent: DisasterEvent;
  isMissionRunning: boolean;
  onRunMission: () => void;
  missionLogs: MissionStep[];
  currentStepIndex: number;
  onSelectBuilding: (building: DamagedBuilding) => void;
  onOpenReport: () => void;
}

export const MissionControlTab: React.FC<MissionControlTabProps> = ({
  currentEvent,
  isMissionRunning,
  onRunMission,
  missionLogs,
  currentStepIndex,
  onSelectBuilding,
  onOpenReport,
}) => {
  // Layer Toggles
  const [showSentinel1, setShowSentinel1] = useState(true);
  const [showNisar, setShowNisar] = useState(true);
  const [showGFM, setShowGFM] = useState(true);
  const [showVantor, setShowVantor] = useState(true);
  const [showDamagedBuildings, setShowDamagedBuildings] = useState(true);
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-120px)] min-h-[720px] pb-4">
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
                <Eye className="w-3 h-3 text-[#E10600]" />
              ) : (
                <EyeOff className="w-3 h-3 text-[#A1A1AA]" />
              )}
              <span>Legend</span>
            </button>

            {/* Before / After Swipe Toggle */}
            <button
              onClick={() => setIsSwipeMode(!isSwipeMode)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                isSwipeMode
                  ? 'bg-[#E10600] text-white shadow-[0_0_10px_rgba(225,6,0,0.5)]'
                  : 'bg-[#0F0F12] border border-[#26262E] text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>{isSwipeMode ? 'Exit Swipe' : 'Optical Swipe (30cm)'}</span>
            </button>

            {/* Printable Report Trigger */}
            <button
              onClick={onOpenReport}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0F0F12] border border-[#26262E] text-[#A1A1AA] hover:text-white text-[11px] font-medium"
            >
              <FileText className="w-3 h-3 text-[#E10600]" />
              <span>Report</span>
            </button>
          </div>
        </div>

        {/* The Map Canvas Area */}
        <div className="relative flex-1 bg-[#070708] overflow-hidden select-none">
          {/* Radar Scanner Sweep Line */}
          {isMissionRunning && (
            <>
              <div className="drone-scan-line" />
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-[#E10600]/40 pointer-events-none radar-ring"
              />
              <div className="absolute top-4 right-4 z-30 bg-[#7A0A0A]/90 border border-[#E10600] px-3 py-1.5 rounded-lg text-xs font-mono-code text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF2A1F] animate-ping" />
                VIRTUAL DRONE SWEEP IN PROGRESS
              </div>
            </>
          )}

          {/* Swipe Mode: Dual Layer Overlay */}
          {isSwipeMode ? (
            <div className="relative w-full h-full">
              {/* Pre Disaster Layer (Left side) */}
              <img
                src={SAT_PRE_IMAGE}
                alt="Pre-disaster optical"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Post Disaster Layer (Right side with clip-path) */}
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
            /* Standard Map Canvas (Simulated high-res satellite GIS viewport) */
            <div className="relative w-full h-full bg-[#09090C] flex items-center justify-center">
              {/* Base Satellite Imagery */}
              <img
                src={SAT_POST_IMAGE}
                alt="Earth Observation Satellite Frame"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-75 filter contrast-125"
              />

              {/* SVG Vector Overlays for SAR, NISAR, GFM, Infrastructure & Severity Polygons */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 700">
                <defs>
                  {/* Subtle red glow for critical zones */}
                  <filter id="red-zone-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  {/* Water fill pattern */}
                  <pattern id="flood-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="20" x2="20" y2="0" stroke="#00B8D4" strokeWidth="1" strokeOpacity="0.3" />
                  </pattern>
                </defs>

                {/* 1. Sentinel-1 Flood Water Polygon (Cyan #00B8D4 fill at 45%, #4DD0E1 outline) */}
                {showSentinel1 && (
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

                {/* 2. NISAR L-band SAR Extent (Violet #B388FF, detects under vegetation) */}
                {showNisar && currentEvent.nisar_available && (
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

                {/* 3. Copernicus GFM Official Layer (Teal dashed outline #00BFA5) */}
                {showGFM && (
                  <g id="gfm-layer">
                    <path
                      d="M 140 330 Q 310 380 490 350 T 800 430 L 860 530 Q 620 570 420 510 Z"
                      fill="none"
                      stroke="#00BFA5"
                      strokeWidth="2"
                      strokeDasharray="8 4"
                    />
                  </g>
                )}

                {/* 4. Affected Zones Boundaries by Severity */}
                {showSeverityZones && (
                  <g id="zones-layer">
                    {eventZones.map((zone, idx) => {
                      const isCritical = zone.priority === 'P1';
                      const strokeColor = isCritical ? '#FF1744' : '#FF8F00';
                      const isSelected = selectedZone?.id === zone.id;

                      // Polygon positions calculated for demo representation
                      const polyPaths = [
                        'M 280 260 L 590 240 L 660 420 L 320 440 Z',
                        'M 420 430 L 740 410 L 810 590 L 480 610 Z',
                        'M 110 380 L 360 360 L 410 530 L 140 550 Z',
                        'M 680 200 L 910 220 L 940 380 L 710 370 Z',
                      ];
                      const d = polyPaths[idx % polyPaths.length];

                      return (
                        <g key={zone.id}>
                          <path
                            d={d}
                            fill={isCritical ? 'rgba(255, 23, 68, 0.12)' : 'rgba(255, 143, 0, 0.08)'}
                            stroke={strokeColor}
                            strokeWidth={isSelected ? '3.5' : '2'}
                            filter={isCritical ? 'url(#red-zone-glow)' : undefined}
                          />
                        </g>
                      );
                    })}
                  </g>
                )}
              </svg>

              {/* Clickable Damaged Buildings Overlay Markers (Tier 2) */}
              {showDamagedBuildings && (
                <div className="absolute inset-0 pointer-events-auto">
                  {eventBuildings.map((bldg) => {
                    // Position mapping
                    const positions: Record<string, { top: string; left: string }> = {
                      'BLDG-NP-01': { top: '48%', left: '46%' },
                      'BLDG-NP-02': { top: '41%', left: '52%' },
                      'BLDG-NP-03': { top: '56%', left: '38%' },
                      'BLDG-NP-04': { top: '63%', left: '62%' },
                      'BLDG-NP-05': { top: '35%', left: '32%' },
                      'BLDG-NP-06': { top: '52%', left: '58%' },
                    };
                    const pos = positions[bldg.id] || { top: '50%', left: '50%' };

                    const colorMap = {
                      'no-damage': '#00E676',
                      'minor': '#FFD600',
                      'major': '#FF8F00',
                      'destroyed': '#FF1744',
                    };
                    const color = colorMap[bldg.damage_class];

                    return (
                      <button
                        key={bldg.id}
                        onClick={() => onSelectBuilding(bldg)}
                        style={{ top: pos.top, left: pos.left }}
                        title={`${bldg.building_id}: ${bldg.damage_class.toUpperCase()} (${(bldg.confidence * 100).toFixed(1)}%)`}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 p-1 rounded-sm border cursor-pointer transition-transform hover:scale-125 z-20 group ${
                          bldg.damage_class === 'destroyed' ? 'ring-2 ring-white ring-offset-1 ring-offset-black' : ''
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-xs flex items-center justify-center font-bold text-[9px] text-black"
                          style={{ backgroundColor: color }}
                        >
                          {bldg.damage_class === 'destroyed' ? '!' : '■'}
                        </div>
                        {/* Hover Tooltip */}
                        <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-[#0F0F12] border border-[#26262E] text-white text-[11px] p-2 rounded-md shadow-xl whitespace-nowrap z-50">
                          <p className="font-semibold text-white">{bldg.building_id}</p>
                          <p className="text-[10px] uppercase font-bold" style={{ color }}>
                            Class: {bldg.damage_class} ({(bldg.confidence * 100).toFixed(1)}%)
                          </p>
                          <p className="text-[10px] text-[#A1A1AA]">{bldg.structure_type} · Click for Crop</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Collapsible Dynamic Map Legend Component */}
              <MapLegend
                currentEvent={currentEvent}
                showSentinel1={showSentinel1}
                showNisar={showNisar}
                showGFM={showGFM}
                showVantor={showVantor}
                showDamagedBuildings={showDamagedBuildings}
                showSeverityZones={showSeverityZones}
                showOSMInfra={showOSMInfra}
                isVisible={isLegendVisible}
                onToggleVisibility={() => setIsLegendVisible(!isLegendVisible)}
                buildingCount={eventBuildings.length}
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
                      checked={showDamagedBuildings}
                      onChange={(e) => setShowDamagedBuildings(e.target.checked)}
                      disabled={!currentEvent.vantor_coverage}
                      className="accent-[#E10600] disabled:opacity-40"
                    />
                    <span className={!currentEvent.vantor_coverage ? 'text-[#71717A]' : ''}>
                      YOLO Building Damage {currentEvent.vantor_coverage ? `(${eventBuildings.length})` : '(No VHR)'}
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
                    : 'bg-[#FF8F00] text-black font-semibold'
                }`}
              >
                {selectedZone.priority} {selectedZone.priority === 'P1' ? '!' : ''}
              </span>
              <span className="font-semibold text-white">{selectedZone.zone_name}</span>
              <span className="text-[#A1A1AA] hidden sm:inline">·</span>
              <span className="text-[#A1A1AA] font-mono-code hidden sm:inline">
                Severity Score: <strong className="text-white">{selectedZone.severity_score}</strong>/100
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono-code text-[#A1A1AA]">
              <span>Flood: <strong className="text-[#00E5FF]">{selectedZone.flood_area_sqkm} km²</strong></span>
              <span>Exposed Pop: <strong className="text-white">{selectedZone.exposed_population.toLocaleString()}</strong></span>
              <span>Hospitals Submerged: <strong className="text-[#FF1744]">{selectedZone.critical_facilities.hospitals}</strong></span>
              <span>Bridges Cut: <strong className="text-[#FF8F00]">{selectedZone.critical_facilities.bridges_submerged}</strong></span>
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
                    Sensor ACQ Datetime: {log.acquisition_time}
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
  );
};
