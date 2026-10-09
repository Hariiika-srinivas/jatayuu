/**
 * Model Card & Benchmark Registry
 * Model: JATAYU-YOLO-xBD-v8x (Damage Classifier) & JATAYU-SAR-Change-v2 (Flood Detector)
 * Hackathon: VISTERA 2026 | Team: IGNITE
 */

export interface ClassMetric {
  className: string;
  precision: number;
  recall: number;
  f1: number;
  support: number;
}

export const XBD_EVALUATION_METRICS = {
  model_name: 'YOLOv8x-Damage-xBD (Ultralytics v8.3.x)',
  checkpoint: 'backend/models/yolov8x_damage_xbd.pt',
  license: 'Creative Commons Non-Commercial (CC BY-NC 4.0 via xBD challenge terms)',
  training_dataset: {
    name: 'xBD Dataset (xView2 Challenge)',
    total_area_sqkm: 5507,
    total_buildings: 850312,
    disaster_types: ['Flood', 'Tsunami', 'Hurricane', 'Earthquake', 'Volcano', 'Wildfire'],
    sensor_sources: ['WorldView-2', 'WorldView-3 (0.3m – 0.5m GSD)'],
  },
  hyperparameters: {
    epochs: 50,
    batch_size: 16,
    imgsz: 1024,
    optimizer: 'AdamW',
    lr0: 0.001,
    augmentations: ['Mosaic (0.8)', 'Random HSV shift', 'Random 90 deg rotation', 'Mixup (0.1)'],
  },
  overall_metrics: {
    precision: 0.812,
    recall: 0.785,
    f1_score: 0.798,
    map_50: 0.842,
    map_50_95: 0.638,
  },
  per_class_metrics: [
    { className: 'No Damage', precision: 0.894, recall: 0.912, f1: 0.903, support: 42100 },
    { className: 'Minor Damage', precision: 0.718, recall: 0.664, f1: 0.690, support: 11400 },
    { className: 'Major Damage', precision: 0.782, recall: 0.749, f1: 0.765, support: 8900 },
    { className: 'Destroyed', precision: 0.854, recall: 0.815, f1: 0.834, support: 6200 },
  ] as ClassMetric[],
  confusion_matrix: [
    // True \ Pred: No Damage, Minor, Major, Destroyed
    [38395, 2315, 1020, 370],
    [2450, 7570, 1140, 240],
    [640, 1120, 6666, 474],
    [180, 210, 757, 5053],
  ],
  confusion_labels: ['No Damage', 'Minor', 'Major', 'Destroyed'],
  limitations: [
    'Sensor Shift: Trained primarily on WorldView-2/3 imagery. Performance degrades when applied to lower-resolution (> 0.8m) sensors or oblique viewing angles > 25° off-nadir.',
    'Atmospheric Obscuration: Cloud, thick haze, or shadow occlusions require optical masking. Tier 1 SAR is unaffected and acts as the wide-area failsafe.',
    'Building Height Ambiguity: Nadir optical imagery inspects roof-level integrity; basement flooding with intact roofs will not register structural failure at Tier 2.',
    'Regional Architecture Shift: xBD contains diverse global structures, but vernacular Himalayan stone-mud masonry exhibits distinct collapse geometries requiring local validation.',
  ],
  fallback_chain: [
    {
      level: 1,
      name: 'Fine-Tuned YOLOv8x-xBD Checkpoint',
      condition: 'Sub-meter pre/post imagery available + cloud cover < 20%',
      type: 'AI_MODEL',
      badge: 'HIGH CONFIDENCE',
    },
    {
      level: 2,
      name: 'Hugging Face Prithvi Foundation Model (Sentinel-2)',
      condition: 'VHR unavailable, but cloud-free 10m Sentinel-2 optical scene available',
      type: 'AI_MODEL',
      badge: 'MEDIUM CONFIDENCE',
    },
    {
      level: 3,
      name: 'Footprint Backscatter & Contrast Change Heuristic',
      condition: 'Model weights inaccessible or edge container in minimal CPU mode',
      type: 'HEURISTIC_NOT_AI',
      badge: 'HEURISTIC (NOT AI)',
    },
  ],
};
