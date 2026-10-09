import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  Cpu,
  Calculator,
  ShieldAlert,
  FileText,
  ChevronRight,
  Info,
  Sparkles,
  Building,
  Radio,
} from 'lucide-react';
import { AnalysisMode, DisasterEvent } from '../types';

interface SharedPipelineFlowProps {
  currentEvent: DisasterEvent;
  currentStepIndex: number;
  onOpenPrithviCard: () => void;
}

export const SharedPipelineFlow: React.FC<SharedPipelineFlowProps> = ({
  currentEvent,
  currentStepIndex,
  onOpenPrithviCard,
}) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const pipelineStages = [
    {
      id: 1,
      name: 'Input Ingestion',
      category: 'DATA_INPUT',
      categoryLabel: 'DATA SOURCE',
      detail: currentEvent.is_normal_no_flood
        ? 'Normal baseline satellite observation ingested (Srinagar/Dal Lake nominal flow).'
        : `Ingesting Sentinel-1 C-band SAR + ${currentEvent.vantor_coverage ? 'Vantor 30cm Optical' : 'Multi-Catalog STAC'} for ${currentEvent.location_name}.`,
    },
    {
      id: 2,
      name: 'Format & Band Validation',
      category: 'VALIDATION',
      categoryLabel: 'VALIDATION',
      detail: 'Validates band integrity (6-band multispectral vs RGB vs SAR polarimetry). Verifies coordinate bounds and GSD spatial resolution.',
    },
    {
      id: 3,
      name: 'Metadata & Sensor Constraints',
      category: 'METADATA',
      categoryLabel: 'METADATA',
      detail: `Acquisition: ${currentEvent.data_source_meta?.acquisition_time || currentEvent.onset_date}. Sensor: ${currentEvent.data_source_meta?.primary_sensor || 'Sentinel-1 C-SAR'}. Spatial GSD: ${currentEvent.data_source_meta?.spatial_resolution || '10m GSD'}.`,
    },
    {
      id: 4,
      name: 'Compatible AI / SAR Inference',
      category: 'AI_MODEL',
      categoryLabel: 'GENUINE AI',
      hasPrithviLink: true,
      detail: currentEvent.is_normal_no_flood
        ? 'SAR backscatter change analysis detects 0 dB anomalous deviation. Radar return reflects nominal seasonal water level.'
        : 'IBM-NASA Prithvi-EO-2.0-300M (multispectral) or Dual-Band SAR backscatter drop (<-16 dB) change detection.',
    },
    {
      id: 5,
      name: 'Flood / No-Flood Outcome',
      category: 'OUTCOME',
      categoryLabel: 'OUTCOME',
      detail: currentEvent.is_normal_no_flood
        ? 'OUTCOME: NO FLOOD DETECTED IN THE ANALYZED AREA. Routine surveillance nominal.'
        : 'OUTCOME: Surface water inundation perimeter delineated with high confidence (>91%).',
    },
    {
      id: 6,
      name: 'Building Footprints (m²)',
      category: 'GEOSPATIAL_CALC',
      categoryLabel: 'GEOSPATIAL CALC',
      detail: 'Calculates geodesic spherical polygon area in square meters (m²) using WGS84 ellipsoidal geodesy. Structural damage is not inferred solely from water exposure.',
    },
    {
      id: 7,
      name: 'Exposure Analysis',
      category: 'EXPOSURE',
      categoryLabel: 'EXPOSURE',
      detail: currentEvent.is_normal_no_flood
        ? 'Exposed Population: 0 · Critical Facilities Submerged: 0.'
        : 'Spatial intersection against WorldPop 100m grid, OSM arterial bridges, and regional medical facilities.',
    },
    {
      id: 8,
      name: 'Risk Scoring (Heuristic)',
      category: 'HEURISTIC',
      categoryLabel: 'HEURISTIC',
      detail: 'Transparent weighted formula: 100 × (0.30 Extent + 0.30 Population + 0.20 Infrastructure + 0.20 Accessibility) + Tier 2 optical bonus.',
    },
    {
      id: 9,
      name: 'Rescue Priorities',
      category: 'PRIORITY',
      categoryLabel: 'TACTICAL ROUTING',
      detail: currentEvent.is_normal_no_flood
        ? 'Status: NOMINAL (Zero emergency alerts or sirens dispatched).'
        : 'Priority assigned (P1/P2/P3). Location-based emergency dispatch queued for NDRF/DEOC command.',
    },
    {
      id: 10,
      name: 'Report Generation',
      category: 'REPORT',
      categoryLabel: 'INTELLIGENCE REPORT',
      detail: 'Auditable mission report with timestamps, data source limitations, and ground-check recommendations.',
    },
  ];

  return (
    <div className="bg-[#0F0F12] border border-[#26262E] rounded-xl p-4 text-[#F4F4F5] space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#26262E]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#E10600]" />
          <h3 className="text-xs font-bold uppercase tracking-wider font-display text-white">
            Shared 10-Stage Analysis Pipeline
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#17171C] border border-[#26262E] text-[#A1A1AA] font-mono-code">
            UNIFIED ARCHITECTURE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPrithviCard}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#17171C] hover:bg-[#26262E] border border-[#00E676]/40 hover:border-[#00E676] text-[#00E676] text-[11px] font-mono-code transition-all"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Prithvi-EO Model Card</span>
          </button>
        </div>
      </div>

      {/* Pipeline Stage Pills Container */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5 text-center">
        {pipelineStages.map((stage, idx) => {
          const isActive = currentStepIndex >= idx;
          const isCurrent = currentStepIndex === idx;

          // Color tags by discipline
          const getCategoryColor = (cat: string) => {
            switch (cat) {
              case 'AI_MODEL':
                return 'text-[#B388FF] border-[#B388FF]/30';
              case 'GEOSPATIAL_CALC':
                return 'text-[#00E676] border-[#00E676]/30';
              case 'HEURISTIC':
                return 'text-[#FFD600] border-[#FFD600]/30';
              case 'OUTCOME':
                return currentEvent.is_normal_no_flood ? 'text-[#00E676] border-[#00E676]/40' : 'text-[#FF2A1F] border-[#E10600]/40';
              default:
                return 'text-[#A1A1AA] border-[#26262E]';
            }
          };

          return (
            <div
              key={stage.id}
              onClick={() => setExpandedStep(expandedStep === stage.id ? null : stage.id)}
              className={`p-2 rounded-lg border transition-all cursor-pointer text-left relative flex flex-col justify-between ${
                isCurrent
                  ? 'bg-[#7A0A0A]/30 border-[#E10600] ring-1 ring-[#E10600]'
                  : isActive
                  ? 'bg-[#17171C] border-[#26262E] hover:border-[#A1A1AA]'
                  : 'bg-[#0F0F12] border-[#1F1F24] opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-mono-code text-[#A1A1AA]">#{stage.id}</span>
                <span className={`text-[8px] font-mono-code uppercase px-1 py-0.2 rounded border ${getCategoryColor(stage.category)}`}>
                  {stage.categoryLabel.slice(0, 8)}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-white block line-clamp-2 leading-tight">
                {stage.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Expanded Stage Inspector Card */}
      {expandedStep !== null && (
        <div className="p-3 rounded-lg bg-[#17171C] border border-[#26262E] text-xs flex items-start justify-between gap-3 animate-in fade-in duration-150">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[#E10600] font-mono-code font-bold">
                Stage {pipelineStages[expandedStep - 1].id}: {pipelineStages[expandedStep - 1].name}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0F0F12] border border-[#26262E] font-mono-code text-[#A1A1AA]">
                {pipelineStages[expandedStep - 1].categoryLabel}
              </span>
            </div>
            <p className="text-[#F4F4F5] text-[11px]">
              {pipelineStages[expandedStep - 1].detail}
            </p>
          </div>
          <button
            onClick={() => setExpandedStep(null)}
            className="text-[10px] text-[#A1A1AA] hover:text-white px-2 py-1 rounded bg-[#0F0F12] border border-[#26262E]"
          >
            Close
          </button>
        </div>
      )}

      {/* Scientific Separation Guide */}
      <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#A1A1AA] border-t border-[#26262E]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#B388FF]" /> Genuine AI (Prithvi-EO & YOLO)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#00E676]" /> Geospatial Calculations (m² Footprint Area)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#FFD600]" /> Heuristic (Weighted Priority Formula)
          </span>
        </div>
        <span className="font-mono-code text-[10px] text-[#4DD0E1]">
          PROVENANCE: {currentEvent.observation_badge || 'REAL SATELLITE OBSERVATION'}
        </span>
      </div>
    </div>
  );
};
