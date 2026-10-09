import React from 'react';
import { DataSourceMeta } from '../types';
import { DATA_SOURCES_CATALOG } from '../data/demoEvents';
import { Satellite, Shield, Clock, ExternalLink, HardDrive, CheckCircle2, AlertCircle } from 'lucide-react';

export const DataSourcesTab: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-base font-bold text-white font-heading tracking-wide flex items-center gap-2">
          <Satellite className="w-4 h-4 text-[#E10600]" />
          Multi-Provider Earth Observation Catalogs & Integration Status
        </h2>
        <p className="text-xs text-[#A1A1AA]">
          JATAYU unifies 8 distinct open and commercial space observation providers. Every layer is transparently tagged with its acquisition timestamp, resolution, license, and ingestion mode.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DATA_SOURCES_CATALOG.map((source) => {
          const statusColors = {
            REAL: 'text-[#00E676] bg-[#00E676]/10 border-[#00E676]/30',
            CACHED: 'text-[#FFB300] bg-[#FFB300]/10 border-[#FFB300]/30',
            MOCK: 'text-[#71717A] bg-[#71717A]/10 border-dashed border-[#71717A]',
          };
          const badgeStyle = statusColors[source.status];

          return (
            <div
              key={source.id}
              className="bg-[#0F0F12] border border-[#26262E] rounded-xl p-4 flex flex-col justify-between hover:border-[#383842] transition-colors shadow-lg"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="font-bold text-white text-sm font-heading flex items-center gap-2">
                      {source.name}
                    </h3>
                    <p className="text-[11px] text-[#A1A1AA] font-mono-code">
                      {source.satellite_constellation}
                    </p>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-bold uppercase border ${badgeStyle}`}
                  >
                    {source.status}
                  </span>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-[#17171C] rounded-lg border border-[#26262E] text-[11px] font-mono-code">
                  <div>
                    <span className="text-[#A1A1AA] block text-[10px]">SPATIAL RESOLUTION</span>
                    <span className="text-white font-semibold">{source.spatial_resolution}</span>
                  </div>
                  <div>
                    <span className="text-[#A1A1AA] block text-[10px]">REVISIT CADENCE</span>
                    <span className="text-white font-semibold">{source.revisit_rate}</span>
                  </div>
                  <div>
                    <span className="text-[#A1A1AA] block text-[10px]">TYPICAL LATENCY</span>
                    <span className="text-[#00E5FF] font-semibold">{source.latency_hours} Hours</span>
                  </div>
                  <div>
                    <span className="text-[#A1A1AA] block text-[10px]">OPERATING TIER</span>
                    <span className="text-[#E10600] font-semibold">{source.usable_in_tier}</span>
                  </div>
                </div>

                {/* Technical Description & Science Context */}
                <p className="text-xs text-[#A1A1AA] leading-relaxed mb-3">
                  {source.notes}
                </p>
              </div>

              {/* Footer Metadata */}
              <div className="pt-3 border-t border-[#26262E] space-y-1 text-[10px] font-mono-code text-[#A1A1AA]">
                <div className="flex items-center justify-between">
                  <span>Provider Endpoint:</span>
                  <span className="text-white truncate max-w-[250px]">{source.endpoint_provider}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>License:</span>
                  <span className="text-[#00E676]">{source.license}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Scene Acquired:</span>
                  <span className="text-[#FF2A1F]">{source.last_acquisition}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
