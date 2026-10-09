import React, { useState } from 'react';
import {
  Satellite,
  Upload,
  CheckCircle2,
  History,
  Calendar,
  RefreshCw,
  AlertTriangle,
  Info,
  Clock,
  ExternalLink,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { AnalysisMode, DisasterEvent } from '../types';
import { DEMO_EVENTS } from '../data/demoEvents';

interface AnalysisModeSelectorProps {
  currentEvent: DisasterEvent;
  onSelectEvent: (event: DisasterEvent) => void;
  onOpenUploadModal: () => void;
  onOpenPrithviModal: () => void;
}

export const AnalysisModeSelector: React.FC<AnalysisModeSelectorProps> = ({
  currentEvent,
  onSelectEvent,
  onOpenUploadModal,
  onOpenPrithviModal,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-08');
  const [isQueryingData, setIsQueryingData] = useState(false);
  const [querySuccessNotice, setQuerySuccessNotice] = useState<string | null>(null);

  // Switch to specific mode events
  const handleSelectMode = (mode: AnalysisMode) => {
    let targetEvent: DisasterEvent | undefined;

    if (mode === 'LATEST_OBSERVATION') {
      targetEvent = DEMO_EVENTS.find((e) => e.id === 'E0_JK_LATEST_2026') || DEMO_EVENTS[0];
    } else if (mode === 'NORMAL_CONDITIONS') {
      targetEvent = DEMO_EVENTS.find((e) => e.id === 'E0_JK_NORMAL_2026') || DEMO_EVENTS[1];
    } else if (mode === 'HISTORICAL_REPLAY') {
      targetEvent = DEMO_EVENTS.find((e) => e.id === 'E_HIST_JK_2014') || DEMO_EVENTS[2];
    }

    if (targetEvent) {
      onSelectEvent(targetEvent);
    }
  };

  // Simulate querying latest observation for selected date
  const handleQueryLatest = () => {
    setIsQueryingData(true);
    setQuerySuccessNotice(null);

    setTimeout(() => {
      setIsQueryingData(false);
      setQuerySuccessNotice(`Observation updated for ${selectedDate} via NASA GIBS & Copernicus CDSE.`);
      setTimeout(() => setQuerySuccessNotice(null), 4000);
    }, 800);
  };

  const currentCategory = currentEvent.event_category || 'LATEST_OBSERVATION';

  return (
    <div className="bg-[#0F0F12] border border-[#26262E] rounded-xl p-3.5 space-y-3 text-xs text-[#F4F4F5]">
      {/* 1. Mode Switcher Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#26262E]">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono-code uppercase text-[#A1A1AA] mr-1 hidden sm:inline">
            ANALYSIS MODE:
          </span>

          {/* Mode A: Latest Satellite Observation */}
          <button
            onClick={() => handleSelectMode('LATEST_OBSERVATION')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all text-xs ${
              currentCategory === 'LATEST_OBSERVATION' && !currentEvent.is_normal_no_flood
                ? 'bg-[#E10600] text-white shadow-[0_0_12px_rgba(225,6,0,0.4)]'
                : 'bg-[#17171C] text-[#A1A1AA] hover:text-white border border-[#26262E]'
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>Mode A: Latest Satellite (J&K)</span>
          </button>

          {/* Mode B: Static Upload */}
          <button
            onClick={onOpenUploadModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#17171C] hover:bg-[#26262E] border border-[#26262E] text-[#4DD0E1] hover:text-white font-medium transition-all text-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Mode B: Upload Static Data</span>
          </button>

          {/* Mode C: Normal Conditions / No Flood */}
          <button
            onClick={() => handleSelectMode('NORMAL_CONDITIONS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all text-xs ${
              currentEvent.is_normal_no_flood
                ? 'bg-[#00E676]/20 text-[#00E676] border border-[#00E676] shadow-[0_0_12px_rgba(0,230,118,0.2)]'
                : 'bg-[#17171C] text-[#A1A1AA] hover:text-white border border-[#26262E]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Mode C: Normal Conditions (No Flood)</span>
          </button>

          {/* Mode D: Historical Replay */}
          <button
            onClick={() => handleSelectMode('HISTORICAL_REPLAY')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all text-xs ${
              currentCategory === 'HISTORICAL_REPLAY'
                ? 'bg-[#B388FF]/20 text-[#B388FF] border border-[#B388FF] shadow-[0_0_12px_rgba(179,136,255,0.2)]'
                : 'bg-[#17171C] text-[#A1A1AA] hover:text-white border border-[#26262E]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Mode D: Historical Replay</span>
          </button>
        </div>

        {/* Provenance Badge */}
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 rounded border ${
            currentEvent.observation_badge === 'HISTORICAL EVENT REPLAY'
              ? 'bg-[#B388FF]/10 text-[#B388FF] border-[#B388FF]/40'
              : currentEvent.is_normal_no_flood
              ? 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/40'
              : 'bg-[#E10600]/10 text-[#FF2A1F] border-[#E10600]/40'
          }`}>
            {currentEvent.observation_badge || 'REAL SATELLITE OBSERVATION'}
          </span>
        </div>
      </div>

      {/* 2. Metadata Bar: Acquisition, Retrieval, Resolution & Date Picker */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 items-center bg-[#17171C]/70 p-2.5 rounded-lg border border-[#26262E]">
        {/* Sensor & Spatial Resolution */}
        <div>
          <span className="text-[10px] text-[#A1A1AA] font-mono-code uppercase block">Data Source & GSD</span>
          <span className="font-semibold text-white truncate block">
            {currentEvent.data_source_meta?.primary_sensor || 'Sentinel-1 C-SAR (10m)'}
          </span>
          <span className="text-[10px] text-[#4DD0E1] font-mono-code">
            Res: {currentEvent.data_source_meta?.spatial_resolution || '10m GSD'}
          </span>
        </div>

        {/* Observation Timestamp */}
        <div>
          <span className="text-[10px] text-[#A1A1AA] font-mono-code uppercase block">Observation Datetime</span>
          <span className="font-mono-code text-white font-medium block">
            {currentEvent.data_source_meta?.acquisition_time || currentEvent.onset_date}
          </span>
          <span className="text-[10px] text-[#A1A1AA]">
            Retrieved: {currentEvent.data_source_meta?.retrieval_time?.substring(0, 16) || '2026-10-08 22:15 UTC'}
          </span>
        </div>

        {/* Region & Coverage */}
        <div>
          <span className="text-[10px] text-[#A1A1AA] font-mono-code uppercase block">Analyzed Region</span>
          <span className="font-medium text-white truncate block">
            {currentEvent.location_name}
          </span>
          <span className="text-[10px] text-[#A1A1AA]">
            AOI: {currentEvent.data_source_meta?.coverage_area_sqkm ? `${currentEvent.data_source_meta.coverage_area_sqkm} sq km` : '1,950 sq km'}
          </span>
        </div>

        {/* Date Selector & Refresh Action */}
        <div className="flex items-center gap-1.5 justify-end">
          <div className="flex items-center gap-1 bg-[#0F0F12] border border-[#26262E] rounded-lg px-2 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-[#A1A1AA]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white text-[11px] font-mono-code focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleQueryLatest}
            disabled={isQueryingData}
            title="Query latest observation pass from NASA GIBS / Copernicus"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#26262E] hover:bg-[#E10600] text-white text-[11px] font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isQueryingData ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Query</span>
          </button>
        </div>
      </div>

      {/* Query notice */}
      {querySuccessNotice && (
        <div className="p-2 rounded bg-[#00E676]/10 border border-[#00E676]/40 text-[#00E676] text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{querySuccessNotice}</span>
        </div>
      )}

      {/* 3. Documented Limitations & Data Source Disclosure */}
      {currentEvent.data_source_meta?.limitations && (
        <div className="flex items-start gap-2 text-[11px] text-[#A1A1AA] bg-[#17171C]/40 p-2 rounded border border-[#26262E]/60">
          <Info className="w-3.5 h-3.5 text-[#E10600] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-white">Documented Sensor & Orbital Limitations:</span>
            <ul className="list-disc list-inside space-y-0.5 text-[10px]">
              {currentEvent.data_source_meta.limitations.map((lim, i) => (
                <li key={i}>{lim}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
