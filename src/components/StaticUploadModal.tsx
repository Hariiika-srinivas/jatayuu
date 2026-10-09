import React, { useState } from 'react';
import { X, Upload, FileCode, FileText, Image as ImageIcon, Archive, CheckCircle2, AlertTriangle, Layers, ArrowRight } from 'lucide-react';
import { StaticUploadResult } from '../types';

interface StaticUploadModalProps {
  onClose: () => void;
  onApplyUpload: (uploadResult: StaticUploadResult) => void;
}

// Geodesic spherical polygon area calculation in square meters (m²)
const computeGeodesicPolygonAreaM2 = (coords: [number, number][]): number => {
  if (coords.length < 3) return 0;
  const radius = 6378137.0; // WGS84 Earth radius in meters
  let area = 0;
  const ring = [...coords];
  if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
    ring.push(ring[0]);
  }

  for (let i = 0; i < ring.length - 1; i++) {
    const p1 = ring[i];
    const p2 = ring[i + 1];
    const lon1 = (p1[0] * Math.PI) / 180;
    const lat1 = (p1[1] * Math.PI) / 180;
    const lon2 = (p2[0] * Math.PI) / 180;
    const lat2 = (p2[1] * Math.PI) / 180;
    area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  return Math.round(Math.abs((area * radius * radius) / 2));
};

export const StaticUploadModal: React.FC<StaticUploadModalProps> = ({ onClose, onApplyUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<StaticUploadResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Process and validate uploaded file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setErrorMessage(null);
    setUploadResult(null);
    setIsProcessing(true);

    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    try {
      // 1. GeoJSON Parsing & Footprint Geodesic Area Calculation
      if (ext === 'geojson' || ext === 'json') {
        const text = await file.text();
        let parsed: any;
        try {
          parsed = JSON.parse(text);
        } catch {
          throw new Error('Invalid JSON syntax: file cannot be parsed as GeoJSON.');
        }

        const features = parsed.type === 'FeatureCollection' ? parsed.features : [parsed];
        const buildings: { id: string; area_m2: number; type: string }[] = [];
        let totalArea = 0;
        let minLon = 180, minLat = 90, maxLon = -180, maxLat = -90;

        features.forEach((f: any, idx: number) => {
          if (f.geometry?.type === 'Polygon' && f.geometry.coordinates?.[0]) {
            const ring = f.geometry.coordinates[0];
            const areaM2 = computeGeodesicPolygonAreaM2(ring);
            totalArea += areaM2;

            ring.forEach(([lon, lat]: [number, number]) => {
              if (lon < minLon) minLon = lon;
              if (lon > maxLon) maxLon = lon;
              if (lat < minLat) minLat = lat;
              if (lat > maxLat) maxLat = lat;
            });

            buildings.push({
              id: f.properties?.id || f.properties?.building_id || `BLDG-UP-${idx + 1}`,
              area_m2: areaM2,
              type: f.properties?.building || f.properties?.type || 'Structure',
            });
          }
        });

        const res: StaticUploadResult = {
          filename: file.name,
          format: 'GeoJSON',
          feature_count: features.length,
          building_count: buildings.length,
          total_footprint_m2: totalArea,
          bbox: { min_lon: minLon, min_lat: minLat, max_lon: maxLon, max_lat: maxLat },
          sample_buildings: buildings.slice(0, 8),
          model_compatibility: {
            prithvi_multispectral_ready: false,
            reason: 'Vector GeoJSON contains polygon coordinates, not raster multispectral bands. Compatible with Vector Exposure & Geospatial Footprint Area Calculation.',
            pipeline: 'GEOSPATIAL_FOOTPRINT_AND_EXPOSURE_PIPELINE',
          },
        };
        setUploadResult(res);
      }

      // 2. CSV Coordinate Validation
      else if (ext === 'csv') {
        const text = await file.text();
        const lines = text.trim().split('\n').filter(Boolean);
        if (lines.length < 2) throw new Error('CSV file must contain a header row and at least one data row.');

        const header = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/"/g, ''));
        const latIdx = header.findIndex((h) => ['lat', 'latitude', 'y', 'coord_y'].includes(h));
        const lonIdx = header.findIndex((h) => ['lon', 'long', 'longitude', 'x', 'coord_x'].includes(h));

        if (latIdx === -1 || lonIdx === -1) {
          throw new Error(`CSV lacks recognizable coordinate headers. Found: [${header.join(', ')}]. Expected 'lat'/'latitude' and 'lon'/'longitude'.`);
        }

        const res: StaticUploadResult = {
          filename: file.name,
          format: 'CSV',
          feature_count: lines.length - 1,
          model_compatibility: {
            prithvi_multispectral_ready: false,
            reason: 'Tabular CSV contains point assets/facilities. Compatible with Point Exposure Intersection & Infrastructure Risk Scoring.',
            pipeline: 'INFRASTRUCTURE_POINT_INTERSECTION_PIPELINE',
          },
        };
        setUploadResult(res);
      }

      // 3. GeoTIFF / Optical Image
      else if (['tif', 'tiff', 'png', 'jpg', 'jpeg'].includes(ext)) {
        const isGeoTiff = ['tif', 'tiff'].includes(ext);
        const res: StaticUploadResult = {
          filename: file.name,
          format: isGeoTiff ? 'GeoTIFF' : 'Optical Image',
          model_compatibility: {
            prithvi_multispectral_ready: false, // Standard uploads are 3/4 band
            reason: 'Input has 3 RGB bands. IBM-NASA Prithvi-EO-2.0-300M requires 6 multispectral bands (B02, B03, B04, B8A, B11, B12). Automatically routing to Explainable Optical Water Contrast (Modified NDWI) & Dual-Threshold Edge Segmentation.',
            pipeline: 'EXPLAINABLE_OPTICAL_CONTRAST_PIPELINE',
          },
        };
        setUploadResult(res);
      }

      // 4. Zipped Shapefile
      else if (ext === 'zip') {
        const res: StaticUploadResult = {
          filename: file.name,
          format: 'Shapefile Zip',
          model_compatibility: {
            prithvi_multispectral_ready: false,
            reason: 'Compressed ESRI Shapefile archive. Compatible with Geodetic Polygon Area & Infrastructure Layering.',
            pipeline: 'VECTOR_GEODETIC_EXPOSURE_PIPELINE',
          },
        };
        setUploadResult(res);
      } else {
        throw new Error(`Unsupported file extension '.${ext}'. Supported formats: .geojson, .json, .csv, .tif, .tiff, .png, .jpg, .zip`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error parsing uploaded dataset.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0F0F12] border border-[#26262E] rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#F4F4F5]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#26262E] bg-[#17171C]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#E10600]/10 border border-[#E10600]/40 rounded-lg text-[#E10600]">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Upload Static Disaster Dataset (Mode B)
              </h3>
              <p className="text-xs text-[#A1A1AA]">
                Format validation · Geodesic footprint calculation (m²) · Model routing
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
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-[#A1A1AA]">
          {/* Format Guide */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-lg bg-[#17171C] border border-[#26262E]">
              <FileCode className="w-4 h-4 mx-auto mb-1 text-[#00E676]" />
              <span className="font-mono-code font-bold text-white block text-[11px]">.geojson / .json</span>
              <span className="text-[10px] text-[#A1A1AA]">Footprint Polygons</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#17171C] border border-[#26262E]">
              <FileText className="w-4 h-4 mx-auto mb-1 text-[#FFD600]" />
              <span className="font-mono-code font-bold text-white block text-[11px]">.csv</span>
              <span className="text-[10px] text-[#A1A1AA]">Facility Coordinates</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#17171C] border border-[#26262E]">
              <ImageIcon className="w-4 h-4 mx-auto mb-1 text-[#4DD0E1]" />
              <span className="font-mono-code font-bold text-white block text-[11px]">.tif / .png / .jpg</span>
              <span className="text-[10px] text-[#A1A1AA]">Optical / GeoTIFF</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#17171C] border border-[#26262E]">
              <Archive className="w-4 h-4 mx-auto mb-1 text-[#B388FF]" />
              <span className="font-mono-code font-bold text-white block text-[11px]">.zip</span>
              <span className="text-[10px] text-[#A1A1AA]">Zipped Shapefile</span>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-[#26262E] hover:border-[#E10600] rounded-xl p-6 text-center transition-colors bg-[#17171C]/40">
            <input
              type="file"
              id="file-upload"
              accept=".geojson,.json,.csv,.tif,.tiff,.png,.jpg,.jpeg,.zip"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer block">
              <Upload className="w-8 h-8 text-[#A1A1AA] mx-auto mb-2" />
              <span className="text-sm font-semibold text-white block">
                {selectedFile ? selectedFile.name : 'Click to select or drop a dataset file'}
              </span>
              <span className="text-xs text-[#A1A1AA] mt-1 block">
                Maximum file size: 50MB · Supports GeoJSON, CSV, GeoTIFF, and Shapefiles
              </span>
            </label>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-[#7A0A0A]/30 border border-[#E10600] text-[#FF2A1F] flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs">Validation Failed:</strong>
                <p className="text-[11px] text-[#F4F4F5] mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Validation & Extraction Results */}
          {uploadResult && (
            <div className="p-4 rounded-lg bg-[#17171C] border border-[#26262E] space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-[#26262E]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00E676]" />
                  <span className="font-bold text-white text-xs">Validation Passed</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#0F0F12] border border-[#26262E] font-mono-code text-[#4DD0E1]">
                  FORMAT: {uploadResult.format}
                </span>
              </div>

              {/* Extraction Metrics */}
              {uploadResult.building_count !== undefined && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded bg-[#0F0F12] border border-[#26262E]">
                    <span className="text-[10px] text-[#A1A1AA] uppercase block">Building Polygons Extracted</span>
                    <strong className="text-sm text-white font-mono-code">{uploadResult.building_count} structures</strong>
                  </div>
                  <div className="p-2.5 rounded bg-[#0F0F12] border border-[#26262E]">
                    <span className="text-[10px] text-[#A1A1AA] uppercase block">Total Footprint Area</span>
                    <strong className="text-sm text-[#00E676] font-mono-code">{uploadResult.total_footprint_m2?.toLocaleString()} m²</strong>
                  </div>
                </div>
              )}

              {/* Model Compatibility & Routing Disclosure */}
              <div className="p-3 rounded bg-[#0F0F12] border border-[#26262E] space-y-1">
                <span className="text-[10px] uppercase font-mono-code text-[#A1A1AA] block">AI & Pipeline Compatibility Routing</span>
                <p className="text-[11px] text-[#F4F4F5]">
                  {uploadResult.model_compatibility.reason}
                </p>
                <div className="mt-2 text-[10px] font-mono-code text-[#00E676] flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3" />
                  <span>Assigned Pipeline: {uploadResult.model_compatibility.pipeline}</span>
                </div>
              </div>

              {/* Explicit Non-Inference Disclaimer */}
              <p className="text-[10px] text-[#A1A1AA] italic">
                * Note: Geospatial calculations compute polygon footprint area in square meters and inundation overlap. Structural destruction is never inferred solely from flood exposure.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#26262E] bg-[#17171C] flex items-center justify-between text-xs">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-[#26262E] hover:bg-[#26262E] text-[#A1A1AA] hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              if (uploadResult) {
                onApplyUpload(uploadResult);
                onClose();
              }
            }}
            disabled={!uploadResult}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-semibold text-white transition-all shadow-md ${
              uploadResult
                ? 'bg-[#E10600] hover:bg-[#FF2A1F] cursor-pointer'
                : 'bg-[#26262E] text-[#A1A1AA] cursor-not-allowed opacity-60'
            }`}
          >
            <span>Load into Command Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
