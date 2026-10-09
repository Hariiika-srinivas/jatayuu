import React from 'react';
import { AffectedZone, DamagedBuilding, DisasterEvent, MissionStep } from '../types';
import { DEMO_AFFECTED_ZONES, DEMO_DAMAGED_BUILDINGS } from '../data/demoEvents';
import { X, Printer, ShieldAlert, CheckCircle, FileText, Download } from 'lucide-react';

interface MissionReportModalProps {
  currentEvent: DisasterEvent;
  missionLogs: MissionStep[];
  onClose: () => void;
}

export const MissionReportModal: React.FC<MissionReportModalProps> = ({
  currentEvent,
  missionLogs,
  onClose,
}) => {
  const zones = DEMO_AFFECTED_ZONES[currentEvent.id] || [];
  const buildings = DEMO_DAMAGED_BUILDINGS.filter((b) => b.event_id === currentEvent.id);

  const handlePrint = () => {
    window.print();
  };

  const totalFloodArea = zones.reduce((acc, z) => acc + z.flood_area_sqkm, 0);
  const totalExposedPop = zones.reduce((acc, z) => acc + z.exposed_population, 0);
  const p1Zones = zones.filter((z) => z.priority === 'P1');

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0F0F12] border border-[#26262E] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Top Control Bar (Hidden in Print) */}
        <div className="p-4 bg-[#17171C] border-b border-[#26262E] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#E10600]" />
            <h3 className="font-bold text-white font-display text-sm">
              JATAYU Virtual Drone Mission Report
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E10600] hover:bg-[#FF2A1F] text-white rounded-lg text-xs font-semibold shadow-md transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#A1A1AA] hover:text-white rounded-lg hover:bg-[#26262E]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div className="p-6 space-y-6 text-xs text-[#F4F4F5] print:text-black">
          {/* Header */}
          <div className="border-b border-[#26262E] print:border-black pb-4 flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold font-display text-white print:text-black">
                JATAYU RAPID DISASTER SITUATION ASSESSMENT REPORT
              </h1>
              <p className="text-[#A1A1AA] print:text-gray-600 mt-0.5">
                AUTONOMOUS MULTI-SATELLITE EMERGENCY TASKING & DAMAGE EVALUATION
              </p>
              <p className="font-mono-code text-[11px] text-[#00E5FF] print:text-blue-800 mt-1">
                Event: {currentEvent.name} ({currentEvent.location_name})
              </p>
            </div>
            <div className="text-right font-mono-code text-[10px] text-[#A1A1AA] print:text-gray-600">
              <p>MISSION ID: MSN-2026-AUTODRONE-90</p>
              <p>GENERATED: {new Date().toISOString().substring(0, 19)}Z</p>
              <p>TEAM: IGNITE · VISTERA 2026</p>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-2">
            <h2 className="font-bold text-white print:text-black text-sm uppercase tracking-wide font-heading">
              1. Executive Incident Summary
            </h2>
            <div className="bg-[#17171C] print:bg-gray-100 p-3.5 rounded-lg border border-[#26262E] print:border-gray-300">
              <p className="leading-relaxed">
                Following hazard notification ({currentEvent.hazard_type}), the JATAYU AI Virtual Drone autonomously executed multi-sensor STAC discovery across European Space Agency (Sentinel-1 C-band, Sentinel-2), NASA/ISRO (NISAR L-band), Copernicus GFM, and Vantor (Maxar) sub-meter optical constellations. Delineated flood inundation totals <strong>{totalFloodArea.toFixed(1)} km²</strong> across <strong>{zones.length}</strong> surveyed municipal zones, with an estimated <strong>{totalExposedPop.toLocaleString()}</strong> civilians exposed and <strong>{p1Zones.length}</strong> zones escalating to CRITICAL (P1) priority.
              </p>
            </div>
          </div>

          {/* Key Metrics Summary */}
          <div className="grid grid-cols-4 gap-3 font-mono-code text-[11px]">
            <div className="p-3 bg-[#17171C] print:bg-gray-100 rounded border border-[#26262E] print:border-gray-300">
              <span className="text-[#A1A1AA] print:text-gray-600 block text-[10px]">TOTAL FLOOD EXTENT</span>
              <span className="font-bold text-base text-white print:text-black">{totalFloodArea.toFixed(1)} km²</span>
            </div>
            <div className="p-3 bg-[#17171C] print:bg-gray-100 rounded border border-[#26262E] print:border-gray-300">
              <span className="text-[#A1A1AA] print:text-gray-600 block text-[10px]">EXPOSED POPULATION</span>
              <span className="font-bold text-base text-white print:text-black">{totalExposedPop.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-[#17171C] print:bg-gray-100 rounded border border-[#26262E] print:border-gray-300">
              <span className="text-[#A1A1AA] print:text-gray-600 block text-[10px]">CRITICAL P1 ZONES</span>
              <span className="font-bold text-base text-[#FF1744] print:text-red-700">{p1Zones.length} Zones</span>
            </div>
            <div className="p-3 bg-[#17171C] print:bg-gray-100 rounded border border-[#26262E] print:border-gray-300">
              <span className="text-[#A1A1AA] print:text-gray-600 block text-[10px]">BUILDINGS INSPECTED</span>
              <span className="font-bold text-base text-white print:text-black">{buildings.length} Footprints</span>
            </div>
          </div>

          {/* Priority Zones Table */}
          <div className="space-y-2">
            <h2 className="font-bold text-white print:text-black text-sm uppercase tracking-wide font-heading">
              2. Priority Zonal Action Matrix
            </h2>
            <div className="overflow-x-auto border border-[#26262E] print:border-gray-300 rounded-lg">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-[#17171C] print:bg-gray-200 text-[#A1A1AA] print:text-black font-mono-code">
                  <tr>
                    <th className="p-2">Priority</th>
                    <th className="p-2">Zone Name</th>
                    <th className="p-2 text-right">Score</th>
                    <th className="p-2 text-right">Flood (km²)</th>
                    <th className="p-2 text-right">Population</th>
                    <th className="p-2">Hospital Cuts</th>
                    <th className="p-2">Action Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#26262E] print:divide-gray-300">
                  {zones.map((z) => (
                    <tr key={z.id}>
                      <td className="p-2 font-mono-code font-bold">
                        <span className={z.priority === 'P1' ? 'text-[#FF1744] print:text-red-700' : 'text-[#FF8F00] print:text-amber-700'}>
                          {z.priority}
                        </span>
                      </td>
                      <td className="p-2 font-semibold">{z.zone_name}</td>
                      <td className="p-2 text-right font-mono-code">{z.severity_score}/100</td>
                      <td className="p-2 text-right font-mono-code">{z.flood_area_sqkm}</td>
                      <td className="p-2 text-right font-mono-code">{z.exposed_population}</td>
                      <td className="p-2 font-mono-code text-[#FF1744] print:text-red-700">
                        {z.critical_facilities.hospitals > 0 ? `${z.critical_facilities.hospitals} Submerged` : 'None'}
                      </td>
                      <td className="p-2 max-w-xs">{z.plain_language_summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mission Execution Trace */}
          <div className="space-y-2">
            <h2 className="font-bold text-white print:text-black text-sm uppercase tracking-wide font-heading">
              3. Autonomous Execution & Verification Trace
            </h2>
            <div className="bg-[#070708] print:bg-gray-50 p-3 rounded-lg border border-[#26262E] print:border-gray-300 font-mono-code text-[10px] space-y-1">
              {missionLogs.map((log, i) => (
                <div key={i} className="flex gap-2 text-[#A1A1AA] print:text-gray-700">
                  <span className="text-[#FF2A1F] print:text-red-600">[{log.timestamp}]</span>
                  <span className="font-bold text-white print:text-black">[{log.step}]</span>
                  <span>{log.detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory Disclaimer Footer */}
          <div className="pt-4 border-t border-[#26262E] print:border-black text-[10px] text-[#A1A1AA] print:text-gray-600 space-y-1">
            <p className="font-semibold text-white print:text-black">
              MANDATORY OPERATIONAL DISCLAIMER:
            </p>
            <p>
              Latest available imagery, acquisition times shown. Severity is a transparent weighted heuristic. AI damage labels are estimates, verify on the ground.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
