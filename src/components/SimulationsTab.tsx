import React, { useState, useEffect } from 'react';
import { DisasterEvent } from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  AlertTriangle,
  Waves,
  Users,
  ShieldAlert,
  Building,
  Clock,
  Compass,
  ArrowRight,
  TrendingUp,
  Cpu,
  Satellite,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface SimulationsTabProps {
  currentEvent: DisasterEvent;
  onOpenReport?: () => void;
}

export type ScenarioPreset = 'cloudburst' | 'glof' | 'monsoon' | 'dam_release';

export const SimulationsTab: React.FC<SimulationsTabProps> = ({ currentEvent, onOpenReport }) => {
  // Simulation Controls State
  const [selectedScenario, setSelectedScenario] = useState<ScenarioPreset>('cloudburst');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeStepHours, setTimeStepHours] = useState<number>(6); // 0 to 48 hours
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 4x

  // Interactive Hydraulic Parameters
  const [rainfallMm, setRainfallMm] = useState<number>(180); // 0 - 300 mm
  const [runoffCoeff, setRunoffCoeff] = useState<number>(0.75); // 0.2 - 0.95
  const [breachWidthMeters, setBreachWidthMeters] = useState<number>(45); // 0 - 120 m
  const [drainagePumpCapacity, setDrainagePumpCapacity] = useState<number>(40); // m3/s

  // Preset Configurations
  const applyPreset = (preset: ScenarioPreset) => {
    setSelectedScenario(preset);
    setTimeStepHours(0);
    setIsPlaying(false);

    if (preset === 'cloudburst') {
      setRainfallMm(240);
      setRunoffCoeff(0.85);
      setBreachWidthMeters(60);
      setDrainagePumpCapacity(30);
    } else if (preset === 'glof') {
      setRainfallMm(90);
      setRunoffCoeff(0.92);
      setBreachWidthMeters(95);
      setDrainagePumpCapacity(20);
    } else if (preset === 'monsoon') {
      setRainfallMm(150);
      setRunoffCoeff(0.65);
      setBreachWidthMeters(30);
      setDrainagePumpCapacity(60);
    } else if (preset === 'dam_release') {
      setRainfallMm(70);
      setRunoffCoeff(0.70);
      setBreachWidthMeters(50);
      setDrainagePumpCapacity(50);
    }
  };

  // Playback timer loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTimeStepHours((prev) => {
        if (prev >= 48) {
          setIsPlaying(false);
          return 48;
        }
        return Math.min(48, prev + 1);
      });
    }, 700 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Derived Simulation Calculations
  // Peak inundation calculation based on rain, runoff, breach width
  const effectiveInflow = (rainfallMm * runoffCoeff * 1.8) + (breachWidthMeters * 2.2);
  const timeFactor = Math.sin((Math.min(24, timeStepHours) / 24) * Math.PI); // surge crests around 12-18h
  const decayFactor = timeStepHours > 24 ? Math.max(0.4, 1 - (timeStepHours - 24) * 0.025) : 1;

  const currentSurgeHeightMeters = Math.max(0.4, Math.round(((effectiveInflow / 90) * timeFactor * decayFactor) * 10) / 10);
  const projectedFloodAreaSqKm = Math.round((currentSurgeHeightMeters * 3.4 + (breachWidthMeters * 0.05)) * 10) / 10;
  const exposedCiviliansCount = Math.round(projectedFloodAreaSqKm * 2150);
  const evacuatedCount = Math.min(exposedCiviliansCount, Math.round(exposedCiviliansCount * Math.min(0.95, (timeStepHours * 0.035) + 0.15)));
  const strandedCount = Math.max(0, exposedCiviliansCount - evacuatedCount);

  // Dynamic hydrograph data points for Recharts
  const hydrographData = [
    { time: 'T+0h', waterLevel: 0.8, inflow: 45, safeCapacity: 2.2 },
    { time: 'T+4h', waterLevel: 1.6, inflow: 110, safeCapacity: 2.2 },
    { time: 'T+8h', waterLevel: 2.9, inflow: 220, safeCapacity: 2.2 },
    { time: 'T+12h', waterLevel: 4.3, inflow: 340, safeCapacity: 2.2 },
    { time: 'T+16h', waterLevel: 5.1, inflow: 390, safeCapacity: 2.2 },
    { time: 'T+20h', waterLevel: 4.8, inflow: 320, safeCapacity: 2.2 },
    { time: 'T+24h', waterLevel: 3.9, inflow: 240, safeCapacity: 2.2 },
    { time: 'T+30h', waterLevel: 3.1, inflow: 170, safeCapacity: 2.2 },
    { time: 'T+36h', waterLevel: 2.5, inflow: 120, safeCapacity: 2.2 },
    { time: 'T+48h', waterLevel: 1.8, inflow: 80, safeCapacity: 2.2 },
  ];

  // Cascading Infrastructure Failure Timeline
  const infrastructureFailures = [
    {
      timeH: 2.0,
      name: 'Nakkhu River Walkway & Culvert #4',
      status: timeStepHours >= 2.0 ? 'FAILED' : 'AT_RISK',
      threat: 'Erosion scouring overtopped embankment footings',
      impact: 'Pedestrian evacuation cut off',
    },
    {
      timeH: 5.5,
      name: 'Arterial Link Bridge (Galchhi / Nakkhu Axis)',
      status: timeStepHours >= 5.5 ? 'FAILED' : 'AT_RISK',
      threat: 'Debris wave shear stress exceeds 340 kN',
      impact: 'Heavy rescue vehicle access severed',
    },
    {
      timeH: 9.0,
      name: 'Primary District Medical Sub-Depot',
      status: timeStepHours >= 9.0 ? 'FAILED' : 'AT_RISK',
      threat: 'Ground-floor submersion > 1.8m',
      impact: 'Emergency medical triage must relocate to upper ridge',
    },
    {
      timeH: 14.0,
      name: 'Sector B Electrical Power Substation',
      status: timeStepHours >= 14.0 ? 'FAILED' : 'AT_RISK',
      threat: 'Transformer yard inundated by muddy silt',
      impact: 'Regional power grid automatic isolation trip',
    },
    {
      timeH: 22.0,
      name: 'Ring Road Lowland Highway Underpass',
      status: timeStepHours >= 22.0 ? 'FAILED' : 'AT_RISK',
      threat: 'Ponding backwater exceeds 2.8m depth',
      impact: 'Supply corridor closed; diversion via bypass required',
    },
  ];

  // Satellite Revisit Schedule Prediction
  const satelliteRevisits = [
    {
      satellite: 'Emergency UAV Swarm',
      eta: 'Immediate (0.4h)',
      type: 'Sub-meter Video/Optical',
      resolution: '5 cm GSD',
      cloudProof: false,
      ready: true,
    },
    {
      satellite: 'Sentinel-1D C-SAR',
      eta: 'In +4.8h (Descending pass)',
      type: 'C-band SAR (VV/VH)',
      resolution: '10 m GSD',
      cloudProof: true,
      ready: true,
    },
    {
      satellite: 'WorldView-3 / Vantor',
      eta: 'In +9.2h (Targeted task)',
      type: 'Sub-meter Optical',
      resolution: '30 cm GSD',
      cloudProof: false,
      ready: false,
    },
    {
      satellite: 'NISAR L-band SAR',
      eta: 'In +14.5h (Ascending pass)',
      type: 'L-band (Canopy Penetration)',
      resolution: '6 m GSD',
      cloudProof: true,
      ready: true,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER & SCENARIO SELECTOR */}
      <div className="bg-[#0F0F12] border border-[#26262E] p-4 rounded-xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#E10600]" />
            <h2 className="text-base font-bold text-white font-heading tracking-wide">
              Hydrodynamic Surge & Disaster Impact Simulation Sandbox
            </h2>
            <span className="text-[10px] font-mono-code uppercase px-2 py-0.5 rounded bg-[#17171C] text-[#00E5FF] border border-[#26262E]">
              Hydraulic Engine v2.4
            </span>
          </div>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Forward-model cascading inundation, infrastructure isolation points, and evacuation bottlenecks before they occur.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-[#A1A1AA] font-mono-code mr-1">SCENARIO:</span>
          <button
            onClick={() => applyPreset('cloudburst')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              selectedScenario === 'cloudburst'
                ? 'bg-[#E10600] text-white shadow-[0_0_10px_rgba(225,6,0,0.4)]'
                : 'bg-[#17171C] border border-[#26262E] text-[#A1A1AA] hover:text-white'
            }`}
          >
            250mm Cloudburst
          </button>
          <button
            onClick={() => applyPreset('glof')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              selectedScenario === 'glof'
                ? 'bg-[#E10600] text-white shadow-[0_0_10px_rgba(225,6,0,0.4)]'
                : 'bg-[#17171C] border border-[#26262E] text-[#A1A1AA] hover:text-white'
            }`}
          >
            Glacial Outburst (GLOF)
          </button>
          <button
            onClick={() => applyPreset('monsoon')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              selectedScenario === 'monsoon'
                ? 'bg-[#E10600] text-white shadow-[0_0_10px_rgba(225,6,0,0.4)]'
                : 'bg-[#17171C] border border-[#26262E] text-[#A1A1AA] hover:text-white'
            }`}
          >
            Monsoon River Rise
          </button>
          <button
            onClick={() => applyPreset('dam_release')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              selectedScenario === 'dam_release'
                ? 'bg-[#E10600] text-white shadow-[0_0_10px_rgba(225,6,0,0.4)]'
                : 'bg-[#17171C] border border-[#26262E] text-[#A1A1AA] hover:text-white'
            }`}
          >
            Dam Spillway Spill
          </button>
        </div>
      </div>

      {/* 2. TIMELINE SCRUBBER & PLAYBACK CONTROLLER */}
      <div className="bg-[#0F0F12] border border-[#26262E] p-4 rounded-xl shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg bg-[#E10600] hover:bg-[#FF2A1F] text-white transition-all shadow-[0_0_12px_rgba(225,6,0,0.5)] active:scale-95"
              title={isPlaying ? 'Pause Simulation' : 'Run Simulation'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setTimeStepHours(0);
              }}
              className="p-2 rounded-lg bg-[#17171C] border border-[#26262E] text-[#A1A1AA] hover:text-white transition-colors"
              title="Reset Timeline to T+0h"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="font-mono-code">
              <span className="text-[#A1A1AA] text-[10px] block">SIMULATED TIME ELAPSED</span>
              <span className="text-white font-bold text-sm">
                T + {timeStepHours.toFixed(0)} Hours
              </span>
            </div>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 font-mono-code text-[11px]">
            <span className="text-[#A1A1AA] mr-1">SPEED:</span>
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-0.5 rounded ${
                  playbackSpeed === spd
                    ? 'bg-[#17171C] text-[#E10600] border border-[#E10600] font-bold'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Time Slider */}
        <div className="relative pt-1">
          <input
            type="range"
            min={0}
            max={48}
            step={1}
            value={timeStepHours}
            onChange={(e) => setTimeStepHours(Number(e.target.value))}
            className="w-full accent-[#E10600] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono-code text-[#A1A1AA] mt-1">
            <span>T+0h (Onset)</span>
            <span>T+12h (Peak Wave Surge)</span>
            <span>T+24h (Max Inundation)</span>
            <span>T+36h (Recession Phase)</span>
            <span>T+48h (Stabilization)</span>
          </div>
        </div>
      </div>

      {/* 3. SIMULATED IMPACT KPIS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#0F0F12] border border-[#26262E] p-3.5 rounded-xl">
          <p className="text-[11px] font-mono-code uppercase text-[#A1A1AA] flex items-center justify-between">
            <span>Projected Water Depth</span>
            <Waves className="w-3.5 h-3.5 text-[#00E5FF]" />
          </p>
          <p className="text-2xl font-bold font-mono-code text-white mt-1">
            {currentSurgeHeightMeters.toFixed(1)} <span className="text-xs text-[#A1A1AA]">meters</span>
          </p>
          <p className="text-[10px] text-[#00E5FF] mt-0.5">
            Crest Status: {timeStepHours <= 18 ? 'Rising Surge' : 'Receding'}
          </p>
        </div>

        <div className="bg-[#0F0F12] border border-[#26262E] p-3.5 rounded-xl">
          <p className="text-[11px] font-mono-code uppercase text-[#A1A1AA] flex items-center justify-between">
            <span>Flood Spread Area</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#E10600]" />
          </p>
          <p className="text-2xl font-bold font-mono-code text-white mt-1">
            {projectedFloodAreaSqKm.toFixed(1)} <span className="text-xs text-[#A1A1AA]">km²</span>
          </p>
          <p className="text-[10px] text-[#A1A1AA] mt-0.5">Catchment Basin Spread</p>
        </div>

        <div className="bg-[#0F0F12] border border-[#26262E] p-3.5 rounded-xl">
          <p className="text-[11px] font-mono-code uppercase text-[#A1A1AA] flex items-center justify-between">
            <span>Evacuation Deficit</span>
            <AlertTriangle className="w-3.5 h-3.5 text-[#FF8F00]" />
          </p>
          <p className="text-2xl font-bold font-mono-code text-[#FF8F00] mt-1">
            {strandedCount.toLocaleString()} <span className="text-xs text-[#A1A1AA]">Persons</span>
          </p>
          <p className="text-[10px] text-[#FF8F00] mt-0.5">
            {evacuatedCount.toLocaleString()} Safely Evacuated
          </p>
        </div>

        <div className="bg-[#0F0F12] border border-[#E10600]/40 p-3.5 rounded-xl relative overflow-hidden">
          <p className="text-[11px] font-mono-code uppercase text-[#FF1744] flex items-center justify-between font-bold">
            <span>Corridors Severed</span>
            <ShieldAlert className="w-3.5 h-3.5 text-[#FF1744]" />
          </p>
          <p className="text-2xl font-bold font-mono-code text-white mt-1">
            {infrastructureFailures.filter((f) => f.status === 'FAILED').length} / {infrastructureFailures.length}
          </p>
          <p className="text-[10px] text-[#FF1744] mt-0.5">Lifeline Links Submerged</p>
        </div>
      </div>

      {/* 4. DYNAMIC SLIDERS & HYDROLOGIC PARAMETERS (2 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Controls (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0F0F12] border border-[#26262E] p-4 rounded-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#26262E] pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#E10600]" />
              Hydraulic Stress Variables
            </h3>
            <span className="text-[10px] font-mono-code text-[#A1A1AA]">Live Recalculation</span>
          </div>

          {/* Slider 1: Rainfall */}
          <div className="bg-[#17171C] p-3 rounded-lg border border-[#26262E] space-y-1">
            <div className="flex justify-between text-xs font-mono-code">
              <span className="text-[#A1A1AA]">Precipitation Rate</span>
              <span className="text-white font-bold">{rainfallMm} mm / 24h</span>
            </div>
            <input
              type="range"
              min={30}
              max={300}
              value={rainfallMm}
              onChange={(e) => setRainfallMm(Number(e.target.value))}
              className="w-full accent-[#E10600] cursor-pointer"
            />
            <p className="text-[10px] text-[#71717A]">
              Catchment flash surge threshold: 120 mm
            </p>
          </div>

          {/* Slider 2: Runoff Coefficient */}
          <div className="bg-[#17171C] p-3 rounded-lg border border-[#26262E] space-y-1">
            <div className="flex justify-between text-xs font-mono-code">
              <span className="text-[#A1A1AA]">Surface Runoff Coeff</span>
              <span className="text-white font-bold">{runoffCoeff.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.2}
              max={0.95}
              step={0.05}
              value={runoffCoeff}
              onChange={(e) => setRunoffCoeff(Number(e.target.value))}
              className="w-full accent-[#E10600] cursor-pointer"
            />
            <p className="text-[10px] text-[#71717A]">
              0.25 (Porous forest) ↔ 0.90 (Impervious urban asphalt)
            </p>
          </div>

          {/* Slider 3: Embankment Breach Width */}
          <div className="bg-[#17171C] p-3 rounded-lg border border-[#26262E] space-y-1">
            <div className="flex justify-between text-xs font-mono-code">
              <span className="text-[#A1A1AA]">Dyke Breach Width</span>
              <span className="text-[#FF1744] font-bold">{breachWidthMeters} meters</span>
            </div>
            <input
              type="range"
              min={0}
              max={120}
              value={breachWidthMeters}
              onChange={(e) => setBreachWidthMeters(Number(e.target.value))}
              className="w-full accent-[#E10600] cursor-pointer"
            />
            <p className="text-[10px] text-[#71717A]">
              Structural rupture size along the primary riverwall
            </p>
          </div>

          {/* Slider 4: Drainage Pumping Capacity */}
          <div className="bg-[#17171C] p-3 rounded-lg border border-[#26262E] space-y-1">
            <div className="flex justify-between text-xs font-mono-code">
              <span className="text-[#A1A1AA]">Emergency Pump Evacuation</span>
              <span className="text-[#00E676] font-bold">{drainagePumpCapacity} m³/s</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={drainagePumpCapacity}
              onChange={(e) => setDrainagePumpCapacity(Number(e.target.value))}
              className="w-full accent-[#E10600] cursor-pointer"
            />
            <p className="text-[10px] text-[#71717A]">
              Active mobile diesel pump de-watering rate
            </p>
          </div>

          {/* Summary Box */}
          <div className="bg-[#070708] border border-[#26262E] p-3 rounded-lg text-xs font-mono-code space-y-1">
            <p className="text-[#FF2A1F] font-bold text-[11px]">
              SIMULATED CATASTROPHIC PEAK STATUS
            </p>
            <p className="text-[#A1A1AA] text-[11px]">
              Effective Water Volume: <strong className="text-white">{(effectiveInflow * 12.5).toFixed(0)}k m³</strong>
            </p>
            <p className="text-[#A1A1AA] text-[11px]">
              Critical Window Remaining: <strong className="text-[#00E5FF]">~{(Math.max(0, 14 - timeStepHours)).toFixed(1)} Hours</strong>
            </p>
          </div>
        </div>

        {/* Right: Hydrograph Chart & Cascading Failure Timeline (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Hydrograph Chart */}
          <div className="bg-[#0F0F12] border border-[#26262E] p-4 rounded-xl shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                Simulated River Discharge & Depth Wave (48h Hydrograph)
              </h3>
              <span className="text-[10px] font-mono-code text-[#00E5FF]">Dynamic Curve</span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hydrographData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#26262E" />
                  <XAxis dataKey="time" stroke="#A1A1AA" fontSize={10} tickLine={false} />
                  <YAxis stroke="#A1A1AA" fontSize={10} tickLine={false} unit="m" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#17171C', borderColor: '#26262E', color: '#F4F4F5', borderTop: '2px solid #E10600' }}
                  />
                  <ReferenceLine y={2.2} stroke="#FF1744" strokeDasharray="4 4" label={{ value: 'Embankment Overtopping (2.2m)', fill: '#FF1744', fontSize: 10 }} />
                  <Area type="monotone" dataKey="waterLevel" stroke="#00B8D4" fill="rgba(0, 184, 212, 0.25)" name="Water Level (m)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cascading Infrastructure Failure Timeline */}
          <div className="bg-[#0F0F12] border border-[#26262E] p-4 rounded-xl shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display mb-3 flex items-center justify-between">
              <span>Cascading Infrastructure Isolation Sequence</span>
              <span className="text-[10px] font-mono-code text-[#A1A1AA]">Current: T+{timeStepHours}h</span>
            </h3>

            <div className="space-y-2">
              {infrastructureFailures.map((item, i) => {
                const isSevered = item.status === 'FAILED';
                return (
                  <div
                    key={i}
                    className={`p-2.5 rounded-lg border text-xs transition-colors flex items-center justify-between gap-3 ${
                      isSevered
                        ? 'bg-[#7A0A0A]/30 border-[#FF1744] text-[#F4F4F5]'
                        : 'bg-[#17171C] border-[#26262E] text-[#A1A1AA]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`font-mono-code px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isSevered ? 'bg-[#FF1744] text-white animate-pulse' : 'bg-[#070708] text-[#A1A1AA]'
                        }`}
                      >
                        T+{item.timeH}h
                      </span>
                      <div>
                        <p className={`font-semibold ${isSevered ? 'text-white' : 'text-[#F4F4F5]'}`}>
                          {item.name}
                        </p>
                        <p className="text-[10px] text-[#A1A1AA]">{item.threat}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 rounded ${
                          isSevered
                            ? 'bg-[#FF1744]/20 text-[#FF1744] border border-[#FF1744]/40'
                            : 'bg-[#070708] text-[#00E676] border border-[#26262E]'
                        }`}
                      >
                        {isSevered ? 'SUBMERGED / CUT' : 'FUNCTIONAL'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 5. VIRTUAL DRONE RE-TASKING & SATELLITE OVERPASS PREDICTOR */}
      <div className="bg-[#0F0F12] border border-[#26262E] p-4 rounded-xl shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
              <Satellite className="w-4 h-4 text-[#E10600]" />
              Virtual Drone Next-Overpass & Constellation Tasking Horizon
            </h3>
            <p className="text-xs text-[#A1A1AA]">
              Predicted observation windows to re-verify simulated flood dynamics with live spaceborne instruments.
            </p>
          </div>
          <span className="text-[11px] font-mono-code text-[#00E676] bg-[#17171C] px-2 py-1 rounded border border-[#26262E]">
            Constellation Orbit Engine Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono-code">
          {satelliteRevisits.map((sat, i) => (
            <div
              key={i}
              className="bg-[#17171C] border border-[#26262E] p-3 rounded-lg flex flex-col justify-between space-y-2 hover:border-[#383842] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[12px]">{sat.satellite}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      sat.ready ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30' : 'bg-[#FFB300]/10 text-[#FFB300] border border-[#FFB300]/30'
                    }`}
                  >
                    {sat.eta}
                  </span>
                </div>
                <p className="text-[10px] text-[#A1A1AA] mt-1">{sat.type} · {sat.resolution}</p>
              </div>

              <div className="text-[10px] pt-1.5 border-t border-[#26262E] flex items-center justify-between text-[#A1A1AA]">
                <span>Cloud Penetration:</span>
                <span className={sat.cloudProof ? 'text-[#00E676]' : 'text-[#FF8F00]'}>
                  {sat.cloudProof ? '100% (Radar)' : 'Weather-Dependent'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
