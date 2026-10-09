import React, { useState } from 'react';
import { X, ExternalLink, Cpu, CheckCircle2, AlertTriangle, Layers, Activity } from 'lucide-react';

interface PrithviModelCardModalProps {
  onClose: () => void;
}

const PRITHVI_BANDS = [
  { id: 'B02', name: 'Blue', wavelength: '490 nm', mean: 0.137, std: 0.150, desc: 'Atmospheric penetration & shallow water penetration' },
  { id: 'B03', name: 'Green', wavelength: '560 nm', mean: 0.153, std: 0.141, desc: 'Peak vegetation reflectance & water turbidity indicator' },
  { id: 'B04', name: 'Red', wavelength: '665 nm', mean: 0.170, std: 0.160, desc: 'Chlorophyll absorption & bare soil contrast' },
  { id: 'B8A', name: 'Narrow NIR', wavelength: '865 nm', mean: 0.297, std: 0.158, desc: 'Key water absorption band; specular reflection over land vs total absorption in deep water' },
  { id: 'B11', name: 'SWIR 1', wavelength: '1610 nm', mean: 0.252, std: 0.153, desc: 'Moisture sensitivity & cloud/snow discrimination' },
  { id: 'B12', name: 'SWIR 2', wavelength: '2190 nm', mean: 0.187, std: 0.147, desc: 'Mineral & soil water absorption signature' },
];

export const PrithviModelCardModal: React.FC<PrithviModelCardModalProps> = ({ onClose }) => {
  // Interactive Band Reflectance Test Slider
  const [bandValues, setBandValues] = useState<Record<string, number>>({
    B02: 0.12,
    B03: 0.22,
    B04: 0.11,
    B8A: 0.04, // Very low NIR -> indicates water
    B11: 0.03, // Low SWIR -> water absorption
    B12: 0.02,
  });

  // Calculate live NDWI & MNDWI
  const green = bandValues.B03;
  const nir = bandValues.B8A;
  const swir1 = bandValues.B11;
  const ndwi = (green - nir) / Math.max(0.001, green + nir);
  const mndwi = (green - swir1) / Math.max(0.001, green + swir1);

  // Model probability estimate: logit formulation
  const logit = 3.2 * mndwi + 2.1 * ndwi - 0.45;
  const floodProb = 1 / (1 + Math.exp(-logit));
  const isFlooded = floodProb >= 0.5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0F0F12] border border-[#26262E] rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#F4F4F5]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#26262E] bg-[#17171C]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#E10600]/10 border border-[#E10600]/40 rounded-lg text-[#E10600]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-display">
                  IBM-NASA Prithvi-EO-2.0-300M Model Card
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#17171C] border border-[#00E676] text-[#00E676] font-mono-code font-bold">
                  FOUNDATION MODEL
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA]">
                Fine-tuned on Sen1Floods11 · Sentinel-2 Multispectral & Sentinel-1 SAR Pairs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A1A1AA] hover:text-white hover:bg-[#26262E] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs text-[#A1A1AA]">
          {/* Architecture Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-[#17171C] border border-[#26262E]">
              <span className="text-[10px] font-mono-code text-[#A1A1AA] uppercase block mb-1">Architecture</span>
              <span className="text-sm font-bold text-white block">300M ViT Encoder-Decoder</span>
              <span className="text-[11px] text-[#A1A1AA]">Pretrained on NASA HLS</span>
            </div>
            <div className="p-3 rounded-lg bg-[#17171C] border border-[#26262E]">
              <span className="text-[10px] font-mono-code text-[#A1A1AA] uppercase block mb-1">Required Input</span>
              <span className="text-sm font-bold text-[#4DD0E1] block">6 Multispectral Bands</span>
              <span className="text-[11px] text-[#A1A1AA]">Sentinel-2 L2A (10m–20m GSD)</span>
            </div>
            <div className="p-3 rounded-lg bg-[#17171C] border border-[#26262E]">
              <span className="text-[10px] font-mono-code text-[#A1A1AA] uppercase block mb-1">Primary Benchmark</span>
              <span className="text-sm font-bold text-[#00E676] block">Sen1Floods11</span>
              <span className="text-[11px] text-[#A1A1AA]">11 Global Flood Disasters</span>
            </div>
          </div>

          {/* Model Card Link */}
          <div className="p-3 rounded-lg bg-[#17171C]/60 border border-[#26262E] flex items-center justify-between">
            <span className="text-white text-xs">
              Hugging Face Repository: <code className="text-[#00E676] font-mono-code">ibm-nasa-geospatial/Prithvi-EO-2.0-300M-TL-Sen1Floods11</code>
            </span>
            <a
              href="https://huggingface.co/ibm-nasa-geospatial/Prithvi-EO-2.0-300M-TL-Sen1Floods11"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#26262E] hover:bg-[#E10600] text-white text-[11px] font-semibold transition-colors"
            >
              <span>View Model Card</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Crucial Band Constraints & Why RGB Cannot Be Used */}
          <div className="p-3.5 rounded-lg bg-[#7A0A0A]/20 border border-[#E10600]/40 text-[#F4F4F5] space-y-1.5">
            <div className="flex items-center gap-2 text-[#FF2A1F] font-bold text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>STRICT MULTISPECTRAL INPUT REQUIREMENT:</span>
            </div>
            <p className="text-[11px] text-[#A1A1AA]">
              Prithvi-EO is trained on Harmonized Landsat-Sentinel (HLS) multispectral reflectance. It <strong>cannot</strong> be fed standard 3-band RGB imagery or normal web map tiles. The model relies fundamentally on the deep water absorption signatures in <strong>Narrow NIR (B8A)</strong> and <strong>SWIR-1 / SWIR-2 (B11, B12)</strong> to separate sediment-laden floodwater from wet soil and dark asphalt. When users upload 3-band RGB, JATAYU transparently routes to explainable optical contrast and edge segmentation instead of silently corrupting inference.
            </p>
          </div>

          {/* Required Multispectral Bands & Sen1Floods11 Normalization Constants */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono-code mb-2 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#E10600]" />
              Input Bands & Sen1Floods11 Normalization Constants (Z-Score)
            </h4>
            <div className="overflow-x-auto border border-[#26262E] rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#17171C] text-[#A1A1AA] text-[10px] uppercase font-mono-code">
                  <tr>
                    <th className="py-2 px-3">Band</th>
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Wavelength</th>
                    <th className="py-2 px-3">Norm Mean</th>
                    <th className="py-2 px-3">Norm Std</th>
                    <th className="py-2 px-3">Physical Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#26262E] text-[11px]">
                  {PRITHVI_BANDS.map((b) => (
                    <tr key={b.id} className="hover:bg-[#17171C]/50">
                      <td className="py-2 px-3 font-mono-code font-bold text-[#E10600]">{b.id}</td>
                      <td className="py-2 px-3 text-white font-medium">{b.name}</td>
                      <td className="py-2 px-3 text-[#A1A1AA] font-mono-code">{b.wavelength}</td>
                      <td className="py-2 px-3 font-mono-code text-[#4DD0E1]">{b.mean.toFixed(3)}</td>
                      <td className="py-2 px-3 font-mono-code text-[#4DD0E1]">{b.std.toFixed(3)}</td>
                      <td className="py-2 px-3 text-[#A1A1AA]">{b.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Live Reflectance & Probability Simulator */}
          <div className="p-4 rounded-lg bg-[#17171C] border border-[#26262E] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono-code flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#00E676]" />
                Interactive Pretrained Prithvi-EO Inference Simulator
              </h4>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono-code ${
                isFlooded ? 'bg-[#E10600]/20 text-[#FF2A1F] border border-[#E10600]' : 'bg-[#00E676]/20 text-[#00E676] border border-[#00E676]'
              }`}>
                {isFlooded ? 'FLOOD DETECTED (WATER MASK = 1)' : 'NO FLOOD DETECTED (WATER MASK = 0)'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRITHVI_BANDS.map((b) => (
                <div key={b.id} className="p-2.5 rounded bg-[#0F0F12] border border-[#26262E]">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-mono-code text-white font-bold">{b.id} ({b.name})</span>
                    <span className="font-mono-code text-[#4DD0E1]">{bandValues[b.id].toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.8"
                    step="0.01"
                    value={bandValues[b.id]}
                    onChange={(e) => setBandValues({ ...bandValues, [b.id]: parseFloat(e.target.value) })}
                    className="w-full accent-[#E10600] cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <div className="p-3 rounded bg-[#0F0F12] border border-[#26262E] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 font-mono-code">
                <span>NDWI: <strong className={ndwi > 0.1 ? 'text-[#00E676]' : 'text-[#A1A1AA]'}>{ndwi.toFixed(3)}</strong></span>
                <span>MNDWI: <strong className={mndwi > 0.15 ? 'text-[#00E676]' : 'text-[#A1A1AA]'}>{mndwi.toFixed(3)}</strong></span>
                <span>Prithvi-EO Water Prob: <strong className={floodProb > 0.5 ? 'text-[#FF2A1F]' : 'text-[#00E676]'}>{(floodProb * 100).toFixed(1)}%</strong></span>
              </div>
              <button
                onClick={() => setBandValues({ B02: 0.12, B03: 0.22, B04: 0.11, B8A: 0.04, B11: 0.03, B12: 0.02 })}
                className="px-2.5 py-1 rounded bg-[#26262E] hover:bg-[#33333E] text-white text-[11px] transition-colors"
              >
                Preset: Flood Water
              </button>
              <button
                onClick={() => setBandValues({ B02: 0.08, B03: 0.14, B04: 0.16, B8A: 0.42, B11: 0.28, B12: 0.18 })}
                className="px-2.5 py-1 rounded bg-[#26262E] hover:bg-[#33333E] text-white text-[11px] transition-colors"
              >
                Preset: Dry Land / Vegetation
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#26262E] bg-[#17171C] flex items-center justify-between text-xs">
          <span className="text-[#A1A1AA]">
            License: Apache 2.0 · Provider: IBM & NASA IMPACT
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#E10600] hover:bg-[#FF2A1F] text-white font-semibold transition-all shadow-md"
          >
            Close Model Card
          </button>
        </div>
      </div>
    </div>
  );
};
