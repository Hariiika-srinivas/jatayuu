import React, { useState } from 'react';
import { DisasterEvent } from '../types';
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Layers,
  Info,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export interface ActiveLayerItem {
  id: string;
  name: string;
  category: 'Flood Extent' | 'Damage Assessment' | 'Cross-Check' | 'Zoning' | 'Infrastructure';
  color: string;
  outlineColor?: string;
  opacity: number;
  symbolType: 'polygon' | 'dashed-line' | 'marker' | 'pulse-polygon' | 'dots' | 'gradient';
  status: 'REAL' | 'CACHED' | 'MOCK' | 'N/A';
  isActive: boolean;
  notes?: string;
}

interface MapLegendProps {
  currentEvent: DisasterEvent;
  showSentinel1: boolean;
  showNisar: boolean;
  showGFM: boolean;
  showVantor: boolean;
  showDamagedBuildings: boolean;
  showSeverityZones: boolean;
  showHeatmap?: boolean;
  heatmapOpacity?: number;
  showOSMInfra?: boolean;
  isVisible: boolean;
  onToggleVisibility: () => void;
  buildingCount?: number;
}

export const MapLegend: React.FC<MapLegendProps> = ({
  currentEvent,
  showSentinel1,
  showNisar,
  showGFM,
  showVantor,
  showDamagedBuildings,
  showSeverityZones,
  showHeatmap = false,
  heatmapOpacity = 65,
  showOSMInfra = true,
  isVisible,
  onToggleVisibility,
  buildingCount = 0,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Compute dynamic active layers
  const allLayers: ActiveLayerItem[] = [
    {
      id: 'sentinel1',
      name: 'Sentinel-1 C-SAR Flood Extent',
      category: 'Flood Extent',
      color: 'rgba(0, 184, 212, 0.45)',
      outlineColor: '#4DD0E1',
      opacity: 45,
      symbolType: 'polygon',
      status: 'REAL',
      isActive: showSentinel1,
      notes: 'Calm water backscatter drop < -16 dB',
    },
    {
      id: 'nisar',
      name: 'NISAR L-band Sub-Canopy Inundation',
      category: 'Flood Extent',
      color: 'rgba(179, 136, 255, 0.35)',
      outlineColor: '#B388FF',
      opacity: 35,
      symbolType: 'dashed-line',
      status: currentEvent.nisar_available ? 'REAL' : 'N/A',
      isActive: showNisar && currentEvent.nisar_available,
      notes: currentEvent.nisar_available
        ? 'L-band canopy penetration (+3.5 dB double-bounce)'
        : 'Not acquired (Precedes 2026 science release)',
    },
    {
      id: 'gfm',
      name: 'Copernicus GFM Ensemble Outline',
      category: 'Cross-Check',
      color: 'transparent',
      outlineColor: '#00BFA5',
      opacity: 90,
      symbolType: 'dashed-line',
      status: 'REAL',
      isActive: showGFM,
      notes: 'Automated flood boundary agreement cross-check',
    },
    {
      id: 'heatmap',
      name: 'Damage Intensity Heatmap (D3)',
      category: 'Damage Assessment',
      color: '#FF1744',
      outlineColor: '#00E676',
      opacity: heatmapOpacity,
      symbolType: 'gradient',
      status: currentEvent.vantor_coverage ? 'REAL' : 'N/A',
      isActive: showHeatmap && currentEvent.vantor_coverage,
      notes: 'D3 Color Interpolation: Green (Low) → Yellow → Red (Destroyed)',
    },
    {
      id: 'buildings',
      name: `YOLOv8x Building Damage (${buildingCount})`,
      category: 'Damage Assessment',
      color: '#FF1744',
      outlineColor: '#FFFFFF',
      opacity: 100,
      symbolType: 'marker',
      status: currentEvent.vantor_coverage ? 'CACHED' : 'N/A',
      isActive: showDamagedBuildings && currentEvent.vantor_coverage,
      notes: currentEvent.vantor_coverage
        ? 'xBD 4-tier structural classification on 30cm optical'
        : 'VHR optical unavailable for building level Tier 2',
    },
    {
      id: 'severity',
      name: 'Priority Affected Zones (P1 / P2)',
      category: 'Zoning',
      color: 'rgba(255, 23, 68, 0.15)',
      outlineColor: '#FF1744',
      opacity: 15,
      symbolType: 'pulse-polygon',
      status: 'REAL',
      isActive: showSeverityZones,
      notes: 'Weighted score: extent, pop, infra, access',
    },
  ];

  // Filter only layers that are actively enabled
  const activeLayers = allLayers.filter((l) => l.isActive);

  if (!isVisible) {
    return (
      <button
        onClick={onToggleVisibility}
        title="Open Map Legend"
        className="absolute bottom-3 left-3 bg-[#0F0F12]/92 hover:bg-[#17171C] border border-[#26262E] hover:border-[#E10600] text-xs font-mono-code text-[#F4F4F5] px-2.5 py-1.5 rounded-lg shadow-xl flex items-center gap-2 z-30 transition-all pointer-events-auto"
      >
        <Layers className="w-3.5 h-3.5 text-[#E10600]" />
        <span>Map Legend</span>
        <span className="text-[10px] bg-[#17171C] border border-[#26262E] px-1 rounded text-[#00E676]">
          {activeLayers.length} Active
        </span>
      </button>
    );
  }

  return (
    <div className="absolute bottom-3 left-3 bg-[#0F0F12]/95 backdrop-blur-md border border-[#26262E] rounded-xl shadow-2xl z-30 w-72 sm:w-80 overflow-hidden pointer-events-auto transition-all animate-in fade-in zoom-in-95">
      {/* Header with Collapse & Hide Toggles */}
      <div className="px-3 py-2 bg-[#17171C] border-b border-[#26262E] flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-[#E10600]" />
          <span className="font-bold text-white font-display text-[11px] uppercase tracking-wider">
            Active Map Legend
          </span>
          <span className="text-[10px] font-mono-code text-[#00E676] bg-[#070708] border border-[#26262E] px-1.5 py-0.2 rounded">
            {activeLayers.length} Active
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand Legend' : 'Collapse Legend'}
            className="p-1 rounded text-[#A1A1AA] hover:text-white hover:bg-[#26262E] transition-colors"
          >
            {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Close/Hide Toggle */}
          <button
            onClick={onToggleVisibility}
            title="Hide Legend"
            className="p-1 rounded text-[#A1A1AA] hover:text-[#FF1744] hover:bg-[#26262E] transition-colors"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {!isCollapsed ? (
        <div className="p-3 space-y-2.5 max-h-80 overflow-y-auto text-xs">
          {activeLayers.length === 0 ? (
            <div className="text-center py-4 text-[#A1A1AA] font-mono-code text-[11px]">
              No active layers enabled.
              <p className="text-[10px] mt-1 text-[#71717A]">
                Toggle GIS layers on the top right to visualize disaster data.
              </p>
            </div>
          ) : (
            activeLayers.map((layer) => {
              const statusBadgeColor =
                layer.status === 'REAL'
                  ? 'text-[#00E676] border-[#00E676]/30 bg-[#00E676]/10'
                  : layer.status === 'CACHED'
                  ? 'text-[#FFB300] border-[#FFB300]/30 bg-[#FFB300]/10'
                  : 'text-[#71717A] border-[#71717A]/30 bg-[#71717A]/10';

              return (
                <div
                  key={layer.id}
                  className="bg-[#17171C]/70 border border-[#26262E] rounded-lg p-2 hover:border-[#383842] transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    {/* Layer Symbol + Title */}
                    <div className="flex items-center gap-2">
                      {/* Render custom symbol swatch according to layer type */}
                      {layer.symbolType === 'polygon' && (
                        <div
                          className="w-4 h-4 rounded-xs border shrink-0"
                          style={{
                            backgroundColor: layer.color,
                            borderColor: layer.outlineColor || layer.color,
                          }}
                        />
                      )}

                      {layer.symbolType === 'dashed-line' && (
                        <div className="w-4 h-4 flex items-center justify-center shrink-0">
                          <div
                            className="w-4 h-0 border-b-2 border-dashed"
                            style={{ borderColor: layer.outlineColor }}
                          />
                        </div>
                      )}

                      {layer.symbolType === 'marker' && (
                        <div className="flex items-center gap-0.5 shrink-0">
                          <span
                            className="w-2 h-2 rounded-xs bg-[#FF1744] ring-1 ring-white"
                            title="Destroyed"
                          />
                          <span
                            className="w-2 h-2 rounded-xs bg-[#FF8F00]"
                            title="Major Damage"
                          />
                          <span
                            className="w-2 h-2 rounded-xs bg-[#FFD600]"
                            title="Minor Damage"
                          />
                          <span
                            className="w-2 h-2 rounded-xs bg-[#00E676]"
                            title="No Damage"
                          />
                        </div>
                      )}

                      {layer.symbolType === 'pulse-polygon' && (
                        <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
                          <div
                            className="w-3.5 h-3.5 rounded-xs border border-[#FF1744] bg-[#FF1744]/20 animate-pulse"
                          />
                        </div>
                      )}

                      {layer.symbolType === 'gradient' && (
                        <div
                          className="w-6 h-3.5 rounded-xs border border-[#26262E] shrink-0"
                          style={{
                            background: 'linear-gradient(90deg, #00E676 0%, #FFD600 35%, #FF8F00 70%, #FF1744 100%)',
                          }}
                          title="D3 Interpolated Intensity: Green (Low) → Yellow → Red (High)"
                        />
                      )}

                      <span className="font-semibold text-white text-[11px] leading-tight">
                        {layer.name}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[9px] font-mono-code uppercase px-1 py-0.2 rounded border font-semibold shrink-0 ${statusBadgeColor}`}
                    >
                      {layer.status}
                    </span>
                  </div>

                  {/* Metadata Row: Category & Opacity */}
                  <div className="flex items-center justify-between text-[10px] font-mono-code text-[#A1A1AA] pt-0.5 border-t border-[#26262E]/60">
                    <span>{layer.category}</span>
                    <span className="text-[#F4F4F5]">
                      Opacity: <strong className="text-[#00E5FF]">{layer.opacity}%</strong>
                    </span>
                  </div>

                  {layer.notes && (
                    <p className="text-[10px] text-[#71717A] italic leading-tight">
                      {layer.notes}
                    </p>
                  )}
                </div>
              );
            })
          )}

          {/* Damage Classes Sub-Legend (Shown when buildings are active) */}
          {showDamagedBuildings && currentEvent.vantor_coverage && (
            <div className="p-2 bg-[#070708] border border-[#26262E] rounded-lg space-y-1 text-[10px] font-mono-code">
              <span className="text-[#A1A1AA] block text-[9px] uppercase font-bold">
                xBD Damage Classes:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="flex items-center gap-1.5 text-[#00E676]">
                  <span className="w-2 h-2 rounded-xs bg-[#00E676]" />
                  <span>No Damage</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#FFD600]">
                  <span className="w-2 h-2 rounded-xs bg-[#FFD600]" />
                  <span>Minor Damage</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#FF8F00]">
                  <span className="w-2 h-2 rounded-xs bg-[#FF8F00]" />
                  <span>Major Damage</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#FF1744]">
                  <span className="w-2 h-2 rounded-xs bg-[#FF1744] ring-1 ring-white" />
                  <span>Destroyed (!)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Collapsed Compact State */
        <div className="p-2 bg-[#070708] flex items-center justify-between text-[10px] font-mono-code text-[#A1A1AA]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E676]" />
            <span>{activeLayers.length} active GIS layers</span>
          </div>
          <button
            onClick={() => setIsCollapsed(false)}
            className="text-[#E10600] hover:underline font-semibold"
          >
            Expand Details
          </button>
        </div>
      )}

      {/* Footer Info Strip */}
      {!isCollapsed && (
        <div className="px-3 py-1.5 bg-[#17171C] border-t border-[#26262E] flex items-center justify-between text-[9px] font-mono-code text-[#71717A]">
          <span>ACQ: &lt;14H AGO</span>
          <span className="text-[#A1A1AA]">CARTO Dark Matter Base</span>
        </div>
      )}
    </div>
  );
};
