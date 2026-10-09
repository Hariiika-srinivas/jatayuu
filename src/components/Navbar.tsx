import React from 'react';
import { DisasterEvent } from '../types';
import { DEMO_EVENTS } from '../data/demoEvents';
import { Radio, Satellite, AlertTriangle, ShieldAlert, RefreshCw, Send, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  currentEvent: DisasterEvent;
  onSelectEvent: (event: DisasterEvent) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isMissionRunning: boolean;
  onRunMission: () => void;
  monitorMode: boolean;
  onToggleMonitor: () => void;
  newAcquisitionAlert: boolean;
  onOpenReport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentEvent,
  onSelectEvent,
  activeTab,
  onSelectTab,
  isMissionRunning,
  onRunMission,
  monitorMode,
  onToggleMonitor,
  newAcquisitionAlert,
  onOpenReport,
}) => {
  const tabs = [
    { id: 'mission_control', label: 'Mission Control' },
    { id: 'findings', label: 'Findings' },
    { id: 'simulations', label: 'Simulations' },
    { id: 'sources', label: 'Data Sources' },
    { id: 'alerts', label: 'Alerts' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0F0F12] border-b border-[#26262E] px-4 lg:px-6 py-2.5 transition-colors">
      {/* New Acquisition Detected Banner */}
      {newAcquisitionAlert && (
        <div className="bg-[#7A0A0A] border-b border-[#E10600] px-4 py-1.5 -mx-4 lg:-mx-6 -mt-2.5 mb-2.5 flex items-center justify-between text-xs text-[#F4F4F5]">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#FF2A1F] animate-pulse" />
            <span className="font-semibold tracking-wide">MONITOR NOTICE:</span>
            <span>New Sentinel-1 overpass detected in catalog (Acquired 18 mins ago). Ready to re-task.</span>
          </div>
          <button
            onClick={onRunMission}
            className="px-2.5 py-0.5 bg-[#E10600] hover:bg-[#FF2A1F] text-white rounded text-[11px] font-medium transition-all"
          >
            Re-analyze Now
          </button>
        </div>
      )}

      {/* Top Bar Contract: 3 zones */}
      <div className="flex items-center justify-between gap-4">
        {/* Zone 1: Brand Zone */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#17171C] border border-[#26262E] flex items-center justify-center relative overflow-hidden group">
            <Radio className="w-5 h-5 text-[#E10600] transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 bg-[#E10600]/10 rounded-lg pointer-events-none" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-wider text-white font-display">
                JATAYU
              </span>
              <span className="text-[10px] tracking-widest uppercase font-mono-code text-[#A1A1AA] border border-[#26262E] px-1.5 py-0.5 rounded">
                VISTERA 2026 · IGNITE
              </span>
            </div>
            <p className="text-[11px] text-[#A1A1AA] hidden sm:block">
              See the Disaster. Prioritize the Risk. Save Lives.
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelectTab(t.id)}
                className={`px-3 py-1.5 text-xs font-medium tracking-wide transition-all whitespace-nowrap relative rounded-md ${
                  isActive
                    ? 'text-white bg-[#17171C] border border-[#26262E]'
                    : 'text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#17171C]/50'
                }`}
              >
                {t.label}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#E10600]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Event Selector */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Disaster Event Switcher */}
          <div className="relative">
            <select
              aria-label="Select Disaster Event"
              value={currentEvent.id}
              onChange={(e) => {
                const found = DEMO_EVENTS.find((ev) => ev.id === e.target.value);
                if (found) onSelectEvent(found);
              }}
              className="bg-[#17171C] border border-[#26262E] text-[#F4F4F5] text-xs rounded-lg px-2.5 py-1.5 pr-8 focus:outline-none focus:border-[#E10600] font-medium transition-colors cursor-pointer max-w-[190px] sm:max-w-[240px] truncate"
            >
              {DEMO_EVENTS.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.headline_event ? '★ ' : ''}{ev.name} ({ev.country})
                </option>
              ))}
            </select>
          </div>

          {/* Monitor Mode Toggle */}
          <button
            onClick={onToggleMonitor}
            title="Monitor Mode: Periodically poll satellite catalogs for new overpasses"
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              monitorMode
                ? 'bg-[#17171C] border-[#00E676] text-[#00E676]'
                : 'bg-[#17171C] border-[#26262E] text-[#A1A1AA] hover:text-[#F4F4F5]'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${monitorMode ? 'animate-spin' : ''}`} />
            <span>Monitor</span>
          </button>

          {/* Task Drone Primary Action */}
          <button
            onClick={onRunMission}
            disabled={isMissionRunning}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-all shadow-lg ${
              isMissionRunning
                ? 'bg-[#7A0A0A] opacity-80 cursor-wait'
                : 'bg-[#E10600] hover:bg-[#FF2A1F] hover:shadow-[0_0_16px_rgba(225,6,0,0.5)] active:scale-95'
            }`}
          >
            <Send className={`w-3.5 h-3.5 ${isMissionRunning ? 'animate-bounce' : ''}`} />
            <span>{isMissionRunning ? 'Drone Active...' : 'Task Virtual Drone'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="flex md:hidden items-center gap-1 mt-2.5 pt-2 border-t border-[#26262E] overflow-x-auto pb-1">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTab(t.id)}
              className={`px-2.5 py-1 text-[11px] font-medium tracking-wide whitespace-nowrap rounded ${
                isActive
                  ? 'bg-[#17171C] text-white border border-[#26262E]'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
