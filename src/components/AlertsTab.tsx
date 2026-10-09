import React, { useState } from 'react';
import { AffectedZone, AlertRecord, DisasterEvent } from '../types';
import { DEMO_AFFECTED_ZONES } from '../data/demoEvents';
import {
  Bell,
  Send,
  MessageSquare,
  Smartphone,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Printer,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface AlertsTabProps {
  currentEvent: DisasterEvent;
  onOpenReport: () => void;
}

export const AlertsTab: React.FC<AlertsTabProps> = ({ currentEvent, onOpenReport }) => {
  const zones = DEMO_AFFECTED_ZONES[currentEvent.id] || [];
  const [selectedZone, setSelectedZone] = useState<AffectedZone>(zones[0] || {} as AffectedZone);

  const [channel, setChannel] = useState<'DASHBOARD' | 'TELEGRAM' | 'SMS_MOCK'>('DASHBOARD');
  const [targetAgency, setTargetAgency] = useState('National Disaster Response Force (NDRF) / EOC');
  const [customNotes, setCustomNotes] = useState('Immediate aerial boat rescue prioritized. Medical triage cut off.');

  const [dispatchedAlerts, setDispatchedAlerts] = useState<AlertRecord[]>([
    {
      id: 'ALT-2026-001',
      timestamp: '2026-07-21 04:35:12 UTC',
      zone_id: 'ZONE_N1_NAKKHU',
      zone_name: 'Nakkhu River Confluence & Bhaisepati Lowlands',
      priority: 'P1',
      severity_score: 88.4,
      channel: 'DASHBOARD',
      status: 'DISPATCHED',
      summary: '2 Hospitals cut off; 3 link bridges submerged; 18 collapsed structures confirmed by sub-meter optical.',
      target_agency: 'National Disaster Response Force (NDRF)',
    },
    {
      id: 'ALT-2026-002',
      timestamp: '2026-07-21 04:36:00 UTC',
      zone_id: 'ZONE_N2_BALKHU',
      zone_name: 'Balkhu Vegetable Market & Bagmati Corridor',
      priority: 'P1',
      severity_score: 79.1,
      channel: 'TELEGRAM',
      status: 'DISPATCHED',
      summary: 'Ring Road underpass inundated >2.2m. Power grid isolated.',
      target_agency: 'District Emergency Operations Center (DEOC)',
    },
  ]);

  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);

  const handleSendAlert = () => {
    setIsSending(true);
    setTimeout(() => {
      const newAlert: AlertRecord = {
        id: `ALT-2026-${String(dispatchedAlerts.length + 1).padStart(3, '0')}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        zone_id: selectedZone.id,
        zone_name: selectedZone.zone_name,
        priority: selectedZone.priority,
        severity_score: selectedZone.severity_score,
        channel: channel,
        status: 'DISPATCHED',
        summary: `${selectedZone.primary_threat} Notes: ${customNotes}`,
        target_agency: targetAgency,
      };

      setDispatchedAlerts([newAlert, ...dispatchedAlerts]);
      setIsSending(false);
      setSendSuccessMessage(`Alert successfully dispatched via ${channel} to ${targetAgency}!`);
      setTimeout(() => setSendSuccessMessage(null), 4000);
    }, 700);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white font-heading tracking-wide flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#E10600]" />
            Location-Based Emergency Alert Dispatch & Agency Gateway
          </h2>
          <p className="text-xs text-[#A1A1AA]">
            Automated location-based alerts routed by severity priority. Real-time Telegram webhook dispatch, SMS alert simulation, and Command Center feeds.
          </p>
        </div>

        <button
          onClick={onOpenReport}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#17171C] border border-[#26262E] hover:border-[#E10600] text-white text-xs font-semibold transition-all shadow-md"
        >
          <FileText className="w-3.5 h-3.5 text-[#E10600]" />
          <span>Generate Printable Mission Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Dispatch Form (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0F0F12] border border-[#26262E] p-4 rounded-xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-heading mb-3 flex items-center gap-2">
              <Send className="w-3.5 h-3.5 text-[#E10600]" />
              Compose & Dispatch Tactical Warning
            </h3>

            {sendSuccessMessage && (
              <div className="mb-3 p-2.5 bg-[#00E676]/10 border border-[#00E676]/40 rounded-lg text-xs text-[#00E676] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{sendSuccessMessage}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              {/* Select Zone */}
              <div>
                <label className="text-[#A1A1AA] text-[11px] block mb-1 font-mono-code">
                  SELECT TARGET ZONE
                </label>
                <select
                  value={selectedZone.id}
                  onChange={(e) => {
                    const z = zones.find((item) => item.id === e.target.value);
                    if (z) setSelectedZone(z);
                  }}
                  className="w-full bg-[#17171C] border border-[#26262E] rounded-lg p-2 text-white text-xs focus:border-[#E10600] focus:outline-none"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      [{z.priority}] {z.zone_name} (Score: {z.severity_score})
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Agency */}
              <div>
                <label className="text-[#A1A1AA] text-[11px] block mb-1 font-mono-code">
                  TARGET RESPONDER AGENCY
                </label>
                <select
                  value={targetAgency}
                  onChange={(e) => setTargetAgency(e.target.value)}
                  className="w-full bg-[#17171C] border border-[#26262E] rounded-lg p-2 text-white text-xs focus:border-[#E10600] focus:outline-none"
                >
                  <option value="National Disaster Response Force (NDRF) / EOC">National Disaster Response Force (NDRF) / EOC</option>
                  <option value="District Magistrate & Incident Command">District Magistrate & Incident Command</option>
                  <option value="Armed Forces Disaster Task Force">Armed Forces Disaster Task Force</option>
                  <option value="Red Cross & Humanitarian Triage">Red Cross & Humanitarian Triage</option>
                </select>
              </div>

              {/* Channel Selector */}
              <div>
                <label className="text-[#A1A1AA] text-[11px] block mb-1 font-mono-code">
                  DISPATCH CHANNEL
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel('DASHBOARD')}
                    className={`p-2 rounded-lg border text-[11px] font-medium flex flex-col items-center gap-1 transition-all ${
                      channel === 'DASHBOARD'
                        ? 'bg-[#17171C] border-[#E10600] text-white shadow-[0_0_10px_rgba(225,6,0,0.3)]'
                        : 'bg-[#17171C]/50 border-[#26262E] text-[#A1A1AA]'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Command Feed</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('TELEGRAM')}
                    className={`p-2 rounded-lg border text-[11px] font-medium flex flex-col items-center gap-1 transition-all ${
                      channel === 'TELEGRAM'
                        ? 'bg-[#17171C] border-[#00E5FF] text-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                        : 'bg-[#17171C]/50 border-[#26262E] text-[#A1A1AA]'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Telegram Bot</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('SMS_MOCK')}
                    className={`p-2 rounded-lg border text-[11px] font-medium flex flex-col items-center gap-1 transition-all ${
                      channel === 'SMS_MOCK'
                        ? 'bg-[#17171C] border-[#FFD600] text-[#FFD600] shadow-[0_0_10px_rgba(255,214,0,0.3)]'
                        : 'bg-[#17171C]/50 border-[#26262E] text-[#A1A1AA]'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>SMS Gateway</span>
                  </button>
                </div>
              </div>

              {/* Tactical Notes */}
              <div>
                <label className="text-[#A1A1AA] text-[11px] block mb-1 font-mono-code">
                  TACTICAL FIELD INSTRUCTIONS
                </label>
                <textarea
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-[#17171C] border border-[#26262E] rounded-lg p-2 text-white text-xs focus:border-[#E10600] focus:outline-none"
                />
              </div>

              {/* Alert Payload Preview */}
              <div className="bg-[#070708] border border-[#26262E] p-3 rounded-lg font-mono-code text-[10px] text-[#A1A1AA]">
                <p className="text-[#FF2A1F] font-bold mb-1">
                  PAYLOAD PREVIEW [{selectedZone.priority} · {channel}]
                </p>
                <p className="text-white">
                  URGENT: Flood breach in {selectedZone.zone_name}. Severity: {selectedZone.severity_score}/100.
                </p>
                <p className="text-[#00E5FF] mt-1">
                  Exposed: {selectedZone.exposed_population} civilians | {selectedZone.critical_facilities.hospitals} hospitals cut off.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSendAlert}
            disabled={isSending}
            className={`w-full mt-4 py-2.5 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
              isSending
                ? 'bg-[#7A0A0A] text-white cursor-wait'
                : 'bg-[#E10600] hover:bg-[#FF2A1F] text-white hover:shadow-[0_0_16px_rgba(225,6,0,0.6)]'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSending ? 'Transmitting Alert...' : 'Transmit Location Alert'}</span>
          </button>
        </div>

        {/* Right: Dispatched Alert History Feed (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0F0F12] border border-[#26262E] rounded-xl overflow-hidden shadow-xl flex flex-col">
          <div className="p-4 border-b border-[#26262E] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-heading">
                Dispatched Alert Audit Log
              </h3>
              <p className="text-xs text-[#A1A1AA]">
                Immutable record of emergency notifications issued to civil authorities.
              </p>
            </div>
            <span className="text-xs font-mono-code text-[#A1A1AA]">
              {dispatchedAlerts.length} Alerts Dispatched
            </span>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-3 divide-y divide-[#26262E]">
            {dispatchedAlerts.map((alert) => {
              const isP1 = alert.priority === 'P1';

              return (
                <div key={alert.id} className="pt-3 first:pt-0 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono-code font-bold ${
                          isP1 ? 'bg-[#FF1744] text-white animate-pulse' : 'bg-[#FF8F00] text-black'
                        }`}
                      >
                        {alert.priority} {isP1 ? '!' : ''}
                      </span>
                      <span className="font-semibold text-white">{alert.zone_name}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono-code text-[#A1A1AA]">
                      <span className="bg-[#17171C] px-1.5 py-0.5 rounded border border-[#26262E] text-white">
                        {alert.channel}
                      </span>
                      <span>{alert.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-[#F4F4F5] text-[11px] leading-relaxed">
                    {alert.summary}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono-code text-[#A1A1AA] pt-1">
                    <span>Target: <strong className="text-white">{alert.target_agency}</strong></span>
                    <span className="text-[#00E676] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Dispatched
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
