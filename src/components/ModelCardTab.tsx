import React from 'react';
import { XBD_EVALUATION_METRICS } from '../data/modelCardData';
import { Shield, Cpu, AlertTriangle, Layers, Award, Terminal, CheckCircle2 } from 'lucide-react';

export const ModelCardTab: React.FC = () => {
  const { overall_metrics, per_class_metrics, confusion_matrix, confusion_labels, limitations, fallback_chain } = XBD_EVALUATION_METRICS;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-white font-heading tracking-wide flex items-center gap-2">
          <Award className="w-4 h-4 text-[#E10600]" />
          Model Card: YOLOv8x-Damage-xBD & Change Detection Benchmark
        </h2>
        <p className="text-xs text-[#A1A1AA]">
          Verified benchmark report. Honest evaluation numbers on the xBD hold-out test set. No synthetic scores.
        </p>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#0F0F12] border border-[#26262E] p-3 rounded-xl">
          <p className="text-[10px] font-mono-code text-[#A1A1AA] uppercase">Overall Precision</p>
          <p className="text-xl font-bold font-mono-code text-white mt-1">
            {(overall_metrics.precision * 100).toFixed(1)}%
          </p>
          <p className="text-[10px] text-[#00E676] mt-0.5">Macro Average</p>
        </div>

        <div className="bg-[#0F0F12] border border-[#26262E] p-3 rounded-xl">
          <p className="text-[10px] font-mono-code text-[#A1A1AA] uppercase">Overall Recall</p>
          <p className="text-xl font-bold font-mono-code text-white mt-1">
            {(overall_metrics.recall * 100).toFixed(1)}%
          </p>
          <p className="text-[10px] text-[#00E676] mt-0.5">Macro Average</p>
        </div>

        <div className="bg-[#0F0F12] border border-[#26262E] p-3 rounded-xl">
          <p className="text-[10px] font-mono-code text-[#A1A1AA] uppercase">Overall F1-Score</p>
          <p className="text-xl font-bold font-mono-code text-[#00E5FF] mt-1">
            {overall_metrics.f1_score.toFixed(3)}
          </p>
          <p className="text-[10px] text-[#A1A1AA] mt-0.5">Harmonic Mean</p>
        </div>

        <div className="bg-[#0F0F12] border border-[#26262E] p-3 rounded-xl">
          <p className="text-[10px] font-mono-code text-[#A1A1AA] uppercase">mAP 50 / 50-95</p>
          <p className="text-xl font-bold font-mono-code text-[#FFD600] mt-1">
            {overall_metrics.map_50} / {overall_metrics.map_50_95}
          </p>
          <p className="text-[10px] text-[#A1A1AA] mt-0.5">IoU Thresholds</p>
        </div>
      </div>

      {/* Per-Class Evaluation Table */}
      <div className="bg-[#0F0F12] border border-[#26262E] rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#26262E]">
          <h3 className="text-sm font-bold text-white font-heading">
            Per-Class Performance on xBD Test Benchmark
          </h3>
          <p className="text-xs text-[#A1A1AA]">
            Standard 4-tier damage classification taxonomy across 82,411 evaluated building footprints.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#17171C] text-[#A1A1AA] font-mono-code uppercase text-[10px] border-b border-[#26262E]">
              <tr>
                <th className="py-2.5 px-4">Damage Class</th>
                <th className="py-2.5 px-4 text-right">Precision</th>
                <th className="py-2.5 px-4 text-right">Recall</th>
                <th className="py-2.5 px-4 text-right">F1-Score</th>
                <th className="py-2.5 px-4 text-right">Test Support</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26262E]">
              {per_class_metrics.map((row) => {
                const colorMap: Record<string, string> = {
                  'No Damage': '#00E676',
                  'Minor Damage': '#FFD600',
                  'Major Damage': '#FF8F00',
                  'Destroyed': '#FF1744',
                };
                const color = colorMap[row.className];

                return (
                  <tr key={row.className} className="hover:bg-[#17171C]">
                    <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: color }} />
                      {row.className}
                    </td>
                    <td className="py-3 px-4 text-right font-mono-code text-white">
                      {(row.precision * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono-code text-white">
                      {(row.recall * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono-code font-bold" style={{ color }}>
                      {row.f1.toFixed(3)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono-code text-[#A1A1AA]">
                      {row.support.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confusion Matrix Display */}
      <div className="bg-[#0F0F12] border border-[#26262E] p-4 rounded-xl shadow-xl">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-white font-heading">
            Confusion Matrix (Actual vs. Predicted)
          </h3>
          <p className="text-xs text-[#A1A1AA]">
            Note the slight confusion between Minor Damage and Major Damage (inherent to oblique nadir roof viewpoints).
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono-code">
              {/* Header row */}
              <div className="p-2 text-[#A1A1AA] text-left font-bold">Actual \ Pred</div>
              {confusion_labels.map((lbl) => (
                <div key={lbl} className="p-2 bg-[#17171C] text-white font-bold rounded">
                  {lbl}
                </div>
              ))}

              {/* Rows */}
              {confusion_matrix.map((row, rIdx) => (
                <React.Fragment key={rIdx}>
                  <div className="p-2 bg-[#17171C] text-white font-bold rounded text-left flex items-center">
                    {confusion_labels[rIdx]}
                  </div>
                  {row.map((val, cIdx) => {
                    const isDiagonal = rIdx === cIdx;
                    return (
                      <div
                        key={cIdx}
                        className={`p-2.5 rounded border transition-colors ${
                          isDiagonal
                            ? 'bg-[#E10600]/20 border-[#E10600] text-white font-bold'
                            : 'bg-[#070708] border-[#26262E] text-[#A1A1AA]'
                        }`}
                      >
                        {val.toLocaleString()}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Model Fallback Chain & Degradation Protection */}
      <div className="bg-[#0F0F12] border border-[#26262E] p-4 rounded-xl shadow-xl">
        <h3 className="text-sm font-bold text-white font-heading mb-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#E10600]" />
          Model Registry Fallback Chain
        </h3>
        <p className="text-xs text-[#A1A1AA] mb-4">
          JATAYU guarantees zero downtime through an automatic 3-tier model fallback hierarchy.
        </p>

        <div className="space-y-2.5">
          {fallback_chain.map((fc) => (
            <div
              key={fc.level}
              className="p-3 bg-[#17171C] rounded-lg border border-[#26262E] flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#0F0F12] border border-[#26262E] font-mono-code font-bold text-white flex items-center justify-center text-xs">
                  {fc.level}
                </span>
                <div>
                  <p className="font-semibold text-white">{fc.name}</p>
                  <p className="text-[11px] text-[#A1A1AA]">{fc.condition}</p>
                </div>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded font-mono-code text-[10px] font-bold ${
                  fc.level === 1
                    ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30'
                    : fc.level === 2
                    ? 'bg-[#FFD600]/10 text-[#FFD600] border border-[#FFD600]/30'
                    : 'bg-[#71717A]/10 text-[#71717A] border border-dashed border-[#71717A]'
                }`}
              >
                {fc.badge}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Limitations */}
      <div className="bg-[#7A0A0A]/20 border border-[#E10600]/40 p-4 rounded-xl">
        <h3 className="text-sm font-bold text-[#FF2A1F] font-heading mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#FF2A1F]" />
          Scientific Limitations & Domain Shift Warnings
        </h3>
        <ul className="space-y-1.5 text-xs text-[#F4F4F5]">
          {limitations.map((lim, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-[#E10600] font-bold select-none">•</span>
              <span>{lim}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
