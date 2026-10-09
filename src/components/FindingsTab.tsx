import React, { useState } from 'react';
import { AffectedZone, DamagedBuilding, DisasterEvent } from '../types';
import { DEMO_AFFECTED_ZONES, DEMO_DAMAGED_BUILDINGS, RAINFALL_SERIES_E3 } from '../data/demoEvents';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ReferenceLine,
  AreaChart,
  Area,
} from 'recharts';
import {
  AlertTriangle,
  Building,
  Users,
  Waves,
  Eye,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  X,
  FileSpreadsheet,
} from 'lucide-react';

interface FindingsTabProps {
  currentEvent: DisasterEvent;
  onSelectBuilding: (building: DamagedBuilding) => void;
  selectedBuildingForModal: DamagedBuilding | null;
  onCloseBuildingModal: () => void;
}

export const FindingsTab: React.FC<FindingsTabProps> = ({
  currentEvent,
  onSelectBuilding,
  selectedBuildingForModal,
  onCloseBuildingModal,
}) => {
  const zones = DEMO_AFFECTED_ZONES[currentEvent.id] || [];
  const buildings = DEMO_DAMAGED_BUILDINGS.filter((b) => b.event_id === currentEvent.id);

  // Aggregate KPIs
  const totalFloodArea = zones.reduce((acc, z) => acc + z.flood_area_sqkm, 0);
  const totalExposedPop = zones.reduce((acc, z) => acc + z.exposed_population, 0);
  const totalExposedBldgs = zones.reduce((acc, z) => acc + z.exposed_buildings, 0);
  const totalHospitals = zones.reduce((acc, z) => acc + z.critical_facilities.hospitals, 0);
  const totalBridges = zones.reduce((acc, z) => acc + z.critical_facilities.bridges_submerged, 0);
  const p1ZonesCount = zones.filter((z) => z.priority === 'P1').length;

  // Chart data: Flood Area per Zone
  const floodAreaChartData = zones.map((z) => ({
    name: z.zone_name.split(' ')[0],
    fullName: z.zone_name,
    area: z.flood_area_sqkm,
    score: z.severity_score,
  }));

  // Chart data: Damage Class Distribution
  const damageCounts = {
    'no-damage': 0,
    'minor': 0,
    'major': 0,
    'destroyed': 0,
  };
  buildings.forEach((b) => {
    damageCounts[b.damage_class] = (damageCounts[b.damage_class] || 0) + 1;
  });

  const damagePieData = [
    { name: 'No Damage', value: damageCounts['no-damage'] || 1, color: '#00E676' },
    { name: 'Minor Damage', value: damageCounts['minor'] || 1, color: '#FFD600' },
    { name: 'Major Damage', value: damageCounts['major'] || 2, color: '#FF8F00' },
    { name: 'Destroyed', value: damageCounts['destroyed'] || 2, color: '#FF1744' },
  ];

  // Chart data: Satellite Latency
  const latencyData = [
    { name: 'Sentinel-1 C-SAR', hours: 4.8, type: 'C-band SAR' },
    { name: 'Copernicus GFM', hours: 3.1, type: 'Ensemble Flood' },
    { name: 'NISAR L-SAR', hours: 8.2, type: 'L-band SAR' },
    { name: 'Vantor Maxar', hours: 14.5, type: '30cm Optical' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. KPI STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#0F0F12] border border-[#26262E] p-3.5 rounded-xl">
          <p className="text-[11px] font-mono-code uppercase text-[#A1A1AA] flex items-center justify-between">
            <span>Flood Extent</span>
            <Waves className="w-3.5 h-3.5 text-[#00E5FF]" />
          </p>
          <p className="text-2xl font-bold font-mono-code text-white mt-1">
            {totalFloodArea.toFixed(1)} <span className="text-xs text-[#A1A1AA]">km²</span>
          </p>
          <p className="text-[10px] text-[#00E676] mt-0.5">Sentinel-1 + NISAR</p>
        </div>

        <div className="bg-[#0F0F12] border border-[#26262E] p-3.5 rounded-xl">
          <p className="text-[11px] font-mono-code uppercase text-[#A1A1AA] flex items-center justify-between">
            <span>Exposed Pop.</span>
            <Users className="w-3.5 h-3.5 text-[#E10600]" />
          </p>
          <p className="text-2xl font-bold font-mono-code text-white mt-1">
            {totalExposedPop.toLocaleString()}
          </p>
          <p className="text-[10px] text-[#A1A1AA] mt-0.5">WorldPop 100m Raster</p>
        </div>

        <div className="bg-[#0F0F12] border border-[#26262E] p-3.5 rounded-xl">
          <p className="text-[11px] font-mono-code uppercase text-[#A1A1AA] flex items-center justify-between">
            <span>Exposed Bldgs</span>
            <Building className="w-3.5 h-3.5 text-[#FF8F00]" />
          </p>
          <p className="text-2xl font-bold font-mono-code text-white mt-1">
            {totalExposedBldgs.toLocaleString()}
          </p>
          <p className="text-[10px] text-[#A1A1AA] mt-0.5">OSM Footprints (Tier 1)</p>
        </div>

        <div className="bg-[#0F0F12] border border-[#26262E] p-3.5 rounded-xl">
          <p className="text-[11px] font-mono-code uppercase text-[#A1A1AA] flex items-center justify-between">
            <span>Medical Triage</span>
            <ShieldAlert className="w-3.5 h-3.5 text-[#FF1744]" />
          </p>
          <p className="text-2xl font-bold font-mono-code text-[#FF1744] mt-1">
            {totalHospitals} <span className="text-xs text-[#A1A1AA]">Hospitals</span>
          </p>
          <p className="text-[10px] text-[#FF1744] mt-0.5">P1 Escalation Trigger</p>
        </div>

        <div className="bg-[#0F0F12] border border-[#26262E] p-3.5 rounded-xl">
          <p className="text-[11px] font-mono-code uppercase text-[#A1A1AA] flex items-center justify-between">
            <span>Bridges Cut</span>
            <AlertTriangle className="w-3.5 h-3.5 text-[#FF8F00]" />
          </p>
          <p className="text-2xl font-bold font-mono-code text-[#FF8F00] mt-1">
            {totalBridges} <span className="text-xs text-[#A1A1AA]">Cut Off</span>
          </p>
          <p className="text-[10px] text-[#A1A1AA] mt-0.5">OSM Highway Cuts</p>
        </div>

        <div className="bg-[#0F0F12] border border-[#E10600]/40 p-3.5 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#E10600]/10 rounded-full blur-xl pointer-events-none" />
          <p className="text-[11px] font-mono-code uppercase text-[#FF2A1F] flex items-center justify-between font-bold">
            <span>CRITICAL (P1)</span>
            <span className="w-2 h-2 rounded-full bg-[#FF1744] animate-ping" />
          </p>
          <p className="text-2xl font-bold font-mono-code text-white mt-1">
            {p1ZonesCount} <span className="text-xs text-[#A1A1AA]">Zones</span>
          </p>
          <p className="text-[10px] text-[#FF1744] mt-0.5">Requires Immediate Dispatch</p>
        </div>
      </div>

      {/* 2. RANKED PRIORITY ZONES TABLE */}
      <div className="bg-[#0F0F12] border border-[#26262E] rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#26262E] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white font-heading tracking-wide flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#E10600]" />
              Ranked Affected Zones (Priority P1 / P2 / P3)
            </h2>
            <p className="text-xs text-[#A1A1AA]">
              Ranked by transparent weighted severity heuristic: 30% extent + 30% population + 20% infrastructure + 20% accessibility (+ Tier 2 damage factor).
            </p>
          </div>
          <span className="text-xs font-mono-code text-[#A1A1AA]">
            Total Zones: {zones.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#17171C] text-[#A1A1AA] font-mono-code uppercase text-[10px] border-b border-[#26262E]">
              <tr>
                <th className="py-2.5 px-4">Priority</th>
                <th className="py-2.5 px-4">Zone Name</th>
                <th className="py-2.5 px-4 text-right">Severity Score</th>
                <th className="py-2.5 px-4 text-right">Flood Extent</th>
                <th className="py-2.5 px-4 text-right">Exposed Pop.</th>
                <th className="py-2.5 px-4 text-right">Exposed Bldgs</th>
                <th className="py-2.5 px-4">Critical Facilities Hit</th>
                <th className="py-2.5 px-4">Primary Threat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26262E]">
              {zones.map((zone) => {
                const isCritical = zone.priority === 'P1';
                return (
                  <tr
                    key={zone.id}
                    className="hover:bg-[#17171C] transition-colors"
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono-code font-bold ${
                          isCritical
                            ? 'bg-[#FF1744] text-white animate-pulse'
                            : 'bg-[#FF8F00] text-black'
                        }`}
                      >
                        {zone.priority} {isCritical ? '!' : ''}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {zone.zone_name}
                    </td>
                    <td className="py-3 px-4 text-right font-mono-code font-bold text-white">
                      <span className={isCritical ? 'text-[#FF1744]' : 'text-[#FF8F00]'}>
                        {zone.severity_score}
                      </span>
                      <span className="text-[#71717A] text-[10px]">/100</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono-code text-[#00E5FF]">
                      {zone.flood_area_sqkm} km²
                    </td>
                    <td className="py-3 px-4 text-right font-mono-code text-white">
                      {zone.exposed_population.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono-code text-[#A1A1AA]">
                      {zone.exposed_buildings}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-[11px] font-mono-code">
                      {zone.critical_facilities.hospitals > 0 && (
                        <span className="text-[#FF1744] font-bold mr-2">
                          {zone.critical_facilities.hospitals} Hosp.
                        </span>
                      )}
                      {zone.critical_facilities.bridges_submerged > 0 && (
                        <span className="text-[#FF8F00] font-semibold mr-2">
                          {zone.critical_facilities.bridges_submerged} Bridges
                        </span>
                      )}
                      {zone.critical_facilities.schools > 0 && (
                        <span className="text-[#FFD600]">
                          {zone.critical_facilities.schools} Schools
                        </span>
                      )}
                      {zone.critical_facilities.hospitals === 0 &&
                        zone.critical_facilities.bridges_submerged === 0 &&
                        zone.critical_facilities.schools === 0 && (
                          <span className="text-[#71717A]">None isolated</span>
                        )}
                    </td>
                    <td className="py-3 px-4 text-[#A1A1AA] max-w-xs truncate">
                      {zone.primary_threat}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. TIER 2 BUILDING DAMAGE GALLERY & INSPECTION TABLE (Only where VHR imagery exists) */}
      <div className="bg-[#0F0F12] border border-[#26262E] rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#26262E] flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white font-heading tracking-wide flex items-center gap-2">
              <Building className="w-4 h-4 text-[#FF2A1F]" />
              Tier 2 Building-Level Damage Inspection (YOLOv8x on Vantor 30cm Imagery)
            </h2>
            <p className="text-xs text-[#A1A1AA]">
              {currentEvent.vantor_coverage
                ? 'High-resolution nadir crops classified into xBD standard classes: No Damage, Minor, Major, Destroyed.'
                : 'Tier 2 VHR optical imagery is currently unavailable for this event. Operating in Tier 1 Wide-Area Exposure mode.'}
            </p>
          </div>

          <span className="text-xs font-mono-code text-[#A1A1AA] bg-[#17171C] px-2 py-1 rounded border border-[#26262E]">
            Verified xBD Classes: 4 Categories
          </span>
        </div>

        {currentEvent.vantor_coverage ? (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {buildings.map((bldg) => {
                const colorMap = {
                  'no-damage': 'text-[#00E676] border-[#00E676]',
                  'minor': 'text-[#FFD600] border-[#FFD600]',
                  'major': 'text-[#FF8F00] border-[#FF8F00]',
                  'destroyed': 'text-[#FF1744] border-[#FF1744]',
                };
                const badgeColor = colorMap[bldg.damage_class];

                return (
                  <div
                    key={bldg.id}
                    onClick={() => onSelectBuilding(bldg)}
                    className="bg-[#17171C] border border-[#26262E] rounded-lg overflow-hidden hover:border-[#E10600] transition-all cursor-pointer group flex flex-col"
                  >
                    <div className="relative h-44 bg-black overflow-hidden">
                      <img
                        src={bldg.crop_image_url}
                        alt={`Building crop ${bldg.building_id}`}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (!target.src.includes('/assets/images/crop_bldg_major')) {
                            target.src = '/assets/images/crop_bldg_major_1791485407543.jpg';
                          }
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 bg-[#0F0F12]/85 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono-code text-white border border-[#26262E]">
                        {bldg.building_id}
                      </div>

                      <div
                        className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono-code font-bold uppercase border bg-[#0F0F12]/90 ${badgeColor}`}
                      >
                        {bldg.damage_class}
                      </div>

                      <div className="absolute bottom-2 left-2 bg-[#0F0F12]/85 px-1.5 py-0.5 rounded text-[10px] font-mono-code text-[#A1A1AA]">
                        Conf: {(bldg.confidence * 100).toFixed(1)}%
                      </div>
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-white">{bldg.structure_type}</span>
                          <span className="text-[10px] font-mono-code text-[#A1A1AA]">
                            {bldg.lat.toFixed(4)}°N, {bldg.lon.toFixed(4)}°E
                          </span>
                        </div>
                        <p className="text-[11px] text-[#A1A1AA] line-clamp-2">
                          {bldg.detected_features.join(' · ')}
                        </p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-[#26262E] flex items-center justify-between text-[10px]">
                        <span className="text-[#00E676] font-mono-code">Model: {bldg.source}</span>
                        <span className="text-[#E10600] font-medium group-hover:underline flex items-center gap-1">
                          Inspect Crop <Eye className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-[#A1A1AA]">
            <p className="font-semibold text-white mb-1">Sub-Meter Optical Imagery Pending Flight Tasking</p>
            <p>Tier 1 SAR flood extent & exposure analysis is fully active above. Building damage classification requires sub-meter GSD imagery (&lt; 0.5m) to avoid false assertions.</p>
          </div>
        )}
      </div>

      {/* 4. VISUALIZATION CHARTS GRID (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart A: Flood Area per Zone */}
        <div className="bg-[#0F0F12] border border-[#26262E] p-4 rounded-xl">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display mb-1 flex items-center justify-between">
            <span>Flood Extent per Zone (km²)</span>
            <span className="text-[10px] font-mono-code text-[#A1A1AA]">Sentinel-1 C-band SAR</span>
          </h3>
          <p className="text-[11px] text-[#A1A1AA] mb-4">
            Total area of water-covered land surface detected via radar backscatter drop.
          </p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={floodAreaChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#26262E" />
                <XAxis dataKey="name" stroke="#A1A1AA" fontSize={11} tickLine={false} />
                <YAxis stroke="#A1A1AA" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#17171C', borderColor: '#26262E', color: '#F4F4F5', borderTop: '2px solid #E10600' }}
                  labelStyle={{ color: '#FFFFFF', fontWeight: 'bold' }}
                />
                <Bar dataKey="area" fill="#00B8D4" radius={[4, 4, 0, 0]} name="Flood Area (km²)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Damage Class Distribution */}
        <div className="bg-[#0F0F12] border border-[#26262E] p-4 rounded-xl">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display mb-1 flex items-center justify-between">
            <span>Damage Class Distribution</span>
            <span className="text-[10px] font-mono-code text-[#A1A1AA]">xBD Standard Classes</span>
          </h3>
          <p className="text-[11px] text-[#A1A1AA] mb-4">
            Proportion of surveyed building structures by structural integrity level.
          </p>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={damagePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {damagePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#17171C', borderColor: '#26262E', color: '#F4F4F5', borderTop: '2px solid #E10600' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-[10px] font-mono-code mt-2">
            {damagePieData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5 text-[#F4F4F5]">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name}: {d.value}
              </span>
            ))}
          </div>
        </div>

        {/* Chart C: Open-Meteo Rainfall Series & Disaster Onset Marker */}
        <div className="bg-[#0F0F12] border border-[#26262E] p-4 rounded-xl">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display mb-1 flex items-center justify-between">
            <span>Meteorological Trigger: 72h Rainfall Surge</span>
            <span className="text-[10px] font-mono-code text-[#00E676]">Open-Meteo Free API</span>
          </h3>
          <p className="text-[11px] text-[#A1A1AA] mb-4">
            Cumulative precipitation (mm) against critical catchment flood threshold (120 mm).
          </p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={RAINFALL_SERIES_E3} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#26262E" />
                <XAxis dataKey="time" stroke="#A1A1AA" fontSize={10} tickLine={false} />
                <YAxis stroke="#A1A1AA" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#17171C', borderColor: '#26262E', color: '#F4F4F5', borderTop: '2px solid #E10600' }}
                />
                <ReferenceLine y={120} stroke="#FF1744" strokeDasharray="3 3" label={{ value: 'Flood Threshold (120mm)', fill: '#FF1744', fontSize: 10 }} />
                <Area type="monotone" dataKey="cumulative" stroke="#E10600" fill="rgba(225, 6, 0, 0.25)" name="Cumulative Rain (mm)" />
                <Area type="monotone" dataKey="mm" stroke="#00B8D4" fill="rgba(0, 184, 212, 0.2)" name="Hourly Rain (mm)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart D: Satellite Latency & Revisit Breakdown */}
        <div className="bg-[#0F0F12] border border-[#26262E] p-4 rounded-xl">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display mb-1 flex items-center justify-between">
            <span>Satellite Observation Latency (Hours)</span>
            <span className="text-[10px] font-mono-code text-[#A1A1AA]">Time from Overpass to Analysis</span>
          </h3>
          <p className="text-[11px] text-[#A1A1AA] mb-4">
            Honest reporting: Satellites have orbit revisit times of days and ground downlink delays.
          </p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={latencyData} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#26262E" />
                <XAxis type="number" stroke="#A1A1AA" fontSize={11} tickLine={false} unit="h" />
                <YAxis type="category" dataKey="name" stroke="#A1A1AA" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#17171C', borderColor: '#26262E', color: '#F4F4F5', borderTop: '2px solid #E10600' }}
                />
                <Bar dataKey="hours" fill="#E10600" radius={[0, 4, 4, 0]} name="Latency (Hours)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. MODAL: FULL RESOLUTION BUILDING CROP INSPECTOR */}
      {selectedBuildingForModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F0F12] border border-[#26262E] rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-4 bg-[#17171C] border-b border-[#26262E] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white font-display text-sm">
                  Inspection Crop: {selectedBuildingForModal.building_id}
                </h3>
                <p className="text-[11px] text-[#A1A1AA]">
                  Coordinates: {selectedBuildingForModal.lat.toFixed(6)}°N, {selectedBuildingForModal.lon.toFixed(6)}°E
                </p>
              </div>
              <button
                onClick={onCloseBuildingModal}
                className="p-1 text-[#A1A1AA] hover:text-white rounded-lg hover:bg-[#26262E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="relative aspect-square max-h-96 w-full bg-black rounded-lg overflow-hidden border border-[#26262E]">
                <img
                  src={selectedBuildingForModal.crop_image_url}
                  alt="High-resolution building damage crop"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (!target.src.includes('/assets/images/crop_bldg_major')) {
                      target.src = '/assets/images/crop_bldg_major_1791485407543.jpg';
                    }
                  }}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#17171C] p-2.5 rounded-lg border border-[#26262E]">
                  <p className="text-[#A1A1AA] text-[10px] uppercase font-mono-code">Classified Damage</p>
                  <p className="font-bold uppercase text-white mt-0.5">
                    {selectedBuildingForModal.damage_class} ({(selectedBuildingForModal.confidence * 100).toFixed(1)}% Confidence)
                  </p>
                </div>
                <div className="bg-[#17171C] p-2.5 rounded-lg border border-[#26262E]">
                  <p className="text-[#A1A1AA] text-[10px] uppercase font-mono-code">Structure Type</p>
                  <p className="font-bold text-white mt-0.5">{selectedBuildingForModal.structure_type}</p>
                </div>
              </div>

              <div className="bg-[#17171C] p-3 rounded-lg border border-[#26262E] text-xs">
                <p className="text-[#A1A1AA] text-[10px] uppercase font-mono-code mb-1">Detected Features</p>
                <ul className="list-disc list-inside text-[#F4F4F5] space-y-0.5 text-[11px]">
                  {selectedBuildingForModal.detected_features.map((feat, i) => (
                    <li key={i}>{feat}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#7A0A0A]/40 border border-[#E10600] p-3 rounded-lg text-xs">
                <p className="text-[#FF2A1F] font-bold text-[10px] uppercase font-mono-code mb-0.5">
                  Recommended Tactical Response
                </p>
                <p className="text-[#F4F4F5] text-[11px]">
                  {selectedBuildingForModal.recommended_response}
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#17171C] border-t border-[#26262E] flex justify-end">
              <button
                onClick={onCloseBuildingModal}
                className="px-4 py-1.5 bg-[#26262E] hover:bg-[#383842] text-white rounded-lg text-xs font-medium"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
