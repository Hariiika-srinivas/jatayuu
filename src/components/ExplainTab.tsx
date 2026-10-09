import React, { useState } from 'react';
import { DisasterEvent, AffectedZone } from '../types';
import { DEMO_AFFECTED_ZONES } from '../data/demoEvents';
import {
  HelpCircle,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Layers,
  Cpu,
  ShieldAlert,
  ArrowRight,
  BookOpen,
  Calculator,
  Compass,
} from 'lucide-react';

interface ExplainTabProps {
  currentEvent: DisasterEvent;
}

export const ExplainTab: React.FC<ExplainTabProps> = ({ currentEvent }) => {
  const zones = DEMO_AFFECTED_ZONES[currentEvent.id] || [];
  const [activeZone, setActiveZone] = useState<AffectedZone>(zones[0] || {} as AffectedZone);

  // Dynamic Formula Interactive Calculator State
  const [extentWeight, setExtentWeight] = useState(0.30);
  const [popWeight, setPopWeight] = useState(0.30);
  const [infraWeight, setInfraWeight] = useState(0.20);
  const [accessWeight, setAccessWeight] = useState(0.20);

  const [extentVal, setExtentVal] = useState(activeZone.extent_score || 90);
  const [popVal, setPopVal] = useState(activeZone.population_score || 85);
  const [infraVal, setInfraVal] = useState(activeZone.infrastructure_score || 90);
  const [accessVal, setAccessVal] = useState(activeZone.accessibility_score || 80);
  const [tier2Bonus, setTier2Bonus] = useState(activeZone.tier2_damage_factor || 15);
  const [hasHospital, setHasHospital] = useState(activeZone.critical_facilities?.hospitals > 0);

  // Compute live score
  const computedBase = (extentVal * extentWeight) + (popVal * popWeight) + (infraVal * infraWeight) + (accessVal * accessWeight);
  const computedTotal = Math.min(100, Math.round((computedBase + tier2Bonus) * 10) / 10);
  const computedPriority = computedTotal >= 75 || (computedTotal >= 50 && hasHospital) ? 'P1' : computedTotal >= 50 ? 'P2' : 'P3';

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TWO-TIER ARCHITECTURE PIPELINE DIAGRAM */}
      <div className="bg-[#0F0F12] border border-[#26262E] p-5 rounded-xl shadow-xl">
        <div className="mb-4">
          <h2 className="text-base font-bold text-white font-heading tracking-wide flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#E10600]" />
            Two-Tier Geospatial Intelligence Pipeline
          </h2>
          <p className="text-xs text-[#A1A1AA]">
            Defensible emergency architecture: Tier 1 (10m radar) establishes wide-area exposure; Tier 2 (sub-meter optical) verifies structural building damage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* TIER 1 BOX */}
          <div className="bg-[#17171C] border border-[#00B8D4]/40 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold font-mono-code uppercase text-[#00E5FF] bg-[#00B8D4]/10 px-2 py-0.5 rounded border border-[#00B8D4]/30">
                  TIER 1 · WIDE AREA (ALWAYS AVAILABLE)
                </span>
                <span className="text-[10px] text-[#A1A1AA] font-mono-code">10m GSD · All-Weather SAR</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">
                Radar Change Detection & Spatial Exposure
              </h3>
              <p className="text-xs text-[#A1A1AA] mb-3">
                Operates through cloud cover, monsoon rain and nighttime darkness using Sentinel-1 C-band & NISAR L-band SAR.
              </p>

              <div className="space-y-1.5 text-[11px] font-mono-code">
                <div className="flex items-center gap-2 text-[#F4F4F5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
                  <span><strong>SAR Water Threshold:</strong> σ° &lt; -16.0 dB</span>
                </div>
                <div className="flex items-center gap-2 text-[#F4F4F5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
                  <span><strong>Backscatter Drop:</strong> σ°_pre - σ°_post ≥ 4.5 dB</span>
                </div>
                <div className="flex items-center gap-2 text-[#F4F4F5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B388FF]" />
                  <span><strong>NISAR L-band:</strong> Sub-canopy double-bounce (+3.5 dB)</span>
                </div>
                <div className="flex items-center gap-2 text-[#F4F4F5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00BFA5]" />
                  <span><strong>Copernicus GFM:</strong> Ensemble cross-check (94.2% agreement)</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#26262E] text-[11px] text-[#00E5FF] flex items-center justify-between">
              <span>Output: Delineated Flood Extent (km²)</span>
              <span className="text-[#A1A1AA]">Claims: "Exposed" (Never "Damaged")</span>
            </div>
          </div>

          {/* TIER 2 BOX */}
          <div className="bg-[#17171C] border border-[#E10600]/40 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold font-mono-code uppercase text-[#FF2A1F] bg-[#E10600]/10 px-2 py-0.5 rounded border border-[#E10600]/30">
                  TIER 2 · BUILDING LEVEL (WHEN VHR EXISTS)
                </span>
                <span className="text-[10px] text-[#A1A1AA] font-mono-code">30cm GSD · Vantor / WorldView</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">
                Ultralytics YOLO Structural Damage Classification
              </h3>
              <p className="text-xs text-[#A1A1AA] mb-3">
                Invoked when sub-meter optical scenes are available in STAC catalogs (e.g. Vantor Maxar Open Data).
              </p>

              <div className="space-y-1.5 text-[11px] font-mono-code">
                <div className="flex items-center gap-2 text-[#F4F4F5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E676]" />
                  <span><strong>No Damage:</strong> Envelope intact, roof pristine</span>
                </div>
                <div className="flex items-center gap-2 text-[#F4F4F5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD600]" />
                  <span><strong>Minor Damage:</strong> Superficial mud inundation, roof sound</span>
                </div>
                <div className="flex items-center gap-2 text-[#F4F4F5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF8F00]" />
                  <span><strong>Major Damage:</strong> Partial roof collapse, structural cracks</span>
                </div>
                <div className="flex items-center gap-2 text-[#F4F4F5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF1744]" />
                  <span><strong>Destroyed:</strong> Total foundation collapse, rubble pile</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#26262E] text-[11px] text-[#FF2A1F] flex items-center justify-between">
              <span>Output: Building Damage Class & Confidence</span>
              <span className="text-[#A1A1AA]">Claims: Verified Structural Damage</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE "WHY IS THIS ZONE P1?" FORMULA CALCULATOR */}
      <div className="bg-[#0F0F12] border border-[#26262E] p-5 rounded-xl shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-white font-heading tracking-wide flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#E10600]" />
              Transparent Severity Scoring Formula & Priority Triggers
            </h2>
            <p className="text-xs text-[#A1A1AA]">
              Explore the deterministic scoring engine. Adjust sliders below to see how weights and facility hits trigger P1 escalation.
            </p>
          </div>

          {/* Select Zone to load */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#A1A1AA]">Load Zone:</span>
            <select
              aria-label="Select Affected Zone"
              value={activeZone.id}
              onChange={(e) => {
                const z = zones.find((item) => item.id === e.target.value);
                if (z) {
                  setActiveZone(z);
                  setExtentVal(z.extent_score);
                  setPopVal(z.population_score);
                  setInfraVal(z.infrastructure_score);
                  setAccessVal(z.accessibility_score);
                  setTier2Bonus(z.tier2_damage_factor || 0);
                  setHasHospital((z.critical_facilities?.hospitals || 0) > 0);
                }
              }}
              className="bg-[#17171C] border border-[#26262E] rounded px-2 py-1 text-white text-xs font-mono-code"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id}>{z.zone_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Formula Banner */}
        <div className="bg-[#17171C] border border-[#26262E] p-3 rounded-lg mb-6 font-mono-code text-xs text-[#F4F4F5] flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[#A1A1AA]">Formula: </span>
            <span className="text-white font-bold">
              severity_score = 100 × (0.30·extent + 0.30·pop + 0.20·infra + 0.20·access) + Tier2_bonus
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[#A1A1AA]">P1 Threshold: <strong>≥ 75</strong> OR <strong>(≥ 50 + Hospital/School Hit)</strong></span>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#17171C] p-3 rounded-lg border border-[#26262E]">
            <div className="flex justify-between text-xs mb-1 font-mono-code">
              <span className="text-[#A1A1AA]">Extent (30% wt)</span>
              <span className="text-white font-bold">{extentVal} / 100</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={extentVal}
              onChange={(e) => setExtentVal(Number(e.target.value))}
              className="w-full accent-[#E10600] cursor-pointer"
            />
            <p className="text-[10px] text-[#A1A1AA] mt-1">Calculated from SAR flood area</p>
          </div>

          <div className="bg-[#17171C] p-3 rounded-lg border border-[#26262E]">
            <div className="flex justify-between text-xs mb-1 font-mono-code">
              <span className="text-[#A1A1AA]">Population (30% wt)</span>
              <span className="text-white font-bold">{popVal} / 100</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={popVal}
              onChange={(e) => setPopVal(Number(e.target.value))}
              className="w-full accent-[#E10600] cursor-pointer"
            />
            <p className="text-[10px] text-[#A1A1AA] mt-1">WorldPop 100m density count</p>
          </div>

          <div className="bg-[#17171C] p-3 rounded-lg border border-[#26262E]">
            <div className="flex justify-between text-xs mb-1 font-mono-code">
              <span className="text-[#A1A1AA]">Infrastructure (20% wt)</span>
              <span className="text-white font-bold">{infraVal} / 100</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={infraVal}
              onChange={(e) => setInfraVal(Number(e.target.value))}
              className="w-full accent-[#E10600] cursor-pointer"
            />
            <p className="text-[10px] text-[#A1A1AA] mt-1">Bridges, substations, schools</p>
          </div>

          <div className="bg-[#17171C] p-3 rounded-lg border border-[#26262E]">
            <div className="flex justify-between text-xs mb-1 font-mono-code">
              <span className="text-[#A1A1AA]">Accessibility Cut (20% wt)</span>
              <span className="text-white font-bold">{accessVal} / 100</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={accessVal}
              onChange={(e) => setAccessVal(Number(e.target.value))}
              className="w-full accent-[#E10600] cursor-pointer"
            />
            <p className="text-[10px] text-[#A1A1AA] mt-1">Road cuts & isolation factor</p>
          </div>
        </div>

        {/* Tier 2 Factor & Hospital Override Switches */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#17171C] rounded-lg border border-[#26262E] mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xs text-white font-medium">Tier 2 Damage Factor Bonus (+0 to +20):</span>
            <input
              type="number"
              min="0"
              max="20"
              value={tier2Bonus}
              onChange={(e) => setTier2Bonus(Number(e.target.value))}
              className="w-16 bg-[#0F0F12] border border-[#26262E] rounded px-2 py-1 text-white text-xs font-mono-code text-center"
            />
            <span className="text-[11px] text-[#A1A1AA]">(Added when VHR confirms structural collapses)</span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
            <input
              type="checkbox"
              checked={hasHospital}
              onChange={(e) => setHasHospital(e.target.checked)}
              className="accent-[#FF1744] w-4 h-4"
            />
            <span className="font-semibold text-[#FF1744]">Hospital or Medical Facility Submerged (Triggers P1 Escalation)</span>
          </label>
        </div>

        {/* Live Calculation Output Card */}
        <div className="bg-[#070708] border border-[#26262E] p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-mono-code text-[#A1A1AA]">CALCULATED SCORE BREAKDOWN</p>
            <p className="text-xs text-[#F4F4F5] mt-1">
              Base: {computedBase.toFixed(1)} + Tier 2: {tier2Bonus.toFixed(1)} = <strong className="text-white text-base">{computedTotal}</strong> / 100
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] font-mono-code text-[#A1A1AA]">ASSIGNED PRIORITY</p>
              <p className="text-xs font-semibold text-white">
                {computedPriority === 'P1'
                  ? 'CRITICAL DISPATCH (P1)'
                  : computedPriority === 'P2'
                  ? 'ELEVATED MONITORING (P2)'
                  : 'ROUTINE SURVEILLANCE (P3)'}
              </p>
            </div>

            <div
              className={`px-4 py-2 rounded-lg font-mono-code font-bold text-lg ${
                computedPriority === 'P1'
                  ? 'bg-[#FF1744] text-white animate-pulse'
                  : computedPriority === 'P2'
                  ? 'bg-[#FF8F00] text-black'
                  : 'bg-[#00E676] text-black'
              }`}
            >
              {computedPriority} {computedPriority === 'P1' ? '!' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* 3. DETERMINISTIC PLAIN LANGUAGE SITUATIONAL BRIEFING */}
      <div className="bg-[#0F0F12] border border-[#26262E] p-5 rounded-xl shadow-xl">
        <h2 className="text-base font-bold text-white font-heading tracking-wide mb-2 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#E10600]" />
          Deterministic Plain-Language Situational Briefing (No LLM Required)
        </h2>
        <p className="text-xs text-[#A1A1AA] mb-4">
          Generated instantaneously from verified numerical triggers, spatial topology, and emergency criteria. Zero hallucinations.
        </p>

        <div className="bg-[#17171C] border border-[#26262E] p-4 rounded-lg font-mono-code text-xs text-[#F4F4F5] leading-relaxed">
          <p className="text-[#FF2A1F] font-bold mb-2">
            [SITUATIONAL REPORT: {activeZone.zone_name.toUpperCase()}]
          </p>
          <p className="text-[#F4F4F5]">
            {activeZone.plain_language_summary}
          </p>
        </div>
      </div>

      {/* 4. GEOSPATIAL & ML GLOSSARY */}
      <div className="bg-[#0F0F12] border border-[#26262E] p-5 rounded-xl shadow-xl">
        <h2 className="text-base font-bold text-white font-heading tracking-wide mb-3 flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#E10600]" />
          Geospatial & Machine Learning Glossary
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="bg-[#17171C] p-3 rounded-lg border border-[#26262E]">
            <p className="font-bold text-[#00E5FF] font-mono-code">SAR (Synthetic Aperture Radar)</p>
            <p className="text-[#A1A1AA] mt-1 text-[11px]">
              Active microwave sensor that emits its own radar pulses. Operates unhindered through dense clouds, haze, and nighttime conditions.
            </p>
          </div>

          <div className="bg-[#17171C] p-3 rounded-lg border border-[#26262E]">
            <p className="font-bold text-[#00E5FF] font-mono-code">Backscatter (Sigma0, dB)</p>
            <p className="text-[#A1A1AA] mt-1 text-[11px]">
              Amount of radar pulse energy reflected back to the satellite. Calm water reflects radar away like a mirror, producing very low backscatter (&lt; -16 dB).
            </p>
          </div>

          <div className="bg-[#17171C] p-3 rounded-lg border border-[#26262E]">
            <p className="font-bold text-[#B388FF] font-mono-code">L-band vs C-band SAR</p>
            <p className="text-[#A1A1AA] mt-1 text-[11px]">
              C-band (5.6 cm, Sentinel-1) bounces off leaves. L-band (24 cm, NISAR) penetrates dense tree canopies, revealing flooded ground beneath forests.
            </p>
          </div>

          <div className="bg-[#17171C] p-3 rounded-lg border border-[#26262E]">
            <p className="font-bold text-[#FF2A1F] font-mono-code">xBD Dataset Benchmark</p>
            <p className="text-[#A1A1AA] mt-1 text-[11px]">
              The global standard benchmark for disaster building damage (850k buildings). Defines four standardized classes: No Damage, Minor, Major, Destroyed.
            </p>
          </div>

          <div className="bg-[#17171C] p-3 rounded-lg border border-[#26262E]">
            <p className="font-bold text-[#00E676] font-mono-code">Exposure vs. Damage</p>
            <p className="text-[#A1A1AA] mt-1 text-[11px]">
              Tier 1 (10m) identifies structures "exposed" inside the flood polygon. Only Tier 2 (30cm) can claim structural "damage".
            </p>
          </div>

          <div className="bg-[#17171C] p-3 rounded-lg border border-[#26262E]">
            <p className="font-bold text-[#FF8F00] font-mono-code">STAC (SpatioTemporal Asset Catalog)</p>
            <p className="text-[#A1A1AA] mt-1 text-[11px]">
              Open standard for searching and indexing geospatial imagery across NASA, ESA, AWS, and commercial constellations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
