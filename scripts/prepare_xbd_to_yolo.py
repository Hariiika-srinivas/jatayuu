#!/usr/bin/env python3
"""
scripts/prepare_xbd_to_yolo.py
Converts xBD (xView2) polygon annotations and pre/post disaster image pairs into YOLO format.

DATASET LICENSE & REGISTRATION:
- Name: xBD Dataset (xView2 challenge)
- Provider: Defense Innovation Unit (DIU) / Carnegie Mellon University
- License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
- How to download:
  1. Register at https://xview2.org
  2. Download tier1 and tier3 tarballs:
     - xBD_train.tar.gz
     - xBD_hold.tar.gz
     - xBD_test.tar.gz
  3. Extract into datasets/xbd/
"""

import json
import os
import glob
from pathlib import Path
from shapely.wkt import loads as wkt_loads

# xBD Damage Class Mapping to YOLO Class IDs
DAMAGE_MAP = {
    "no-damage": 0,
    "minor-damage": 1,
    "major-damage": 2,
    "destroyed": 3,
    "un-classified": -1  # Ignore
}

def convert_xbd_labels_to_yolo(input_dir: str, output_labels_dir: str, img_width: int = 1024, img_height: int = 1024):
    os.makedirs(output_labels_dir, exist_ok=True)
    post_json_files = glob.glob(os.path.join(input_dir, "*_post_disaster.json"))

    print(f"Found {len(post_json_files)} post-disaster JSON label files...")

    converted_count = 0
    for json_path in post_json_files:
        stem = Path(json_path).stem
        yolo_txt_path = os.path.join(output_labels_dir, f"{stem}.txt")

        with open(json_path, 'r') as f:
            data = json.load(f)

        features = data.get("features", {}).get("xy", [])
        yolo_lines = []

        for feat in features:
            props = feat.get("properties", {})
            subtype = props.get("subtype", "un-classified")
            class_id = DAMAGE_MAP.get(subtype, -1)
            if class_id == -1:
                continue

            wkt_str = feat.get("wkt")
            if not wkt_str:
                continue

            try:
                poly = wkt_loads(wkt_str)
                minx, miny, maxx, maxy = poly.bounds
                # Normalize coordinates (0 to 1)
                x_center = ((minx + maxx) / 2.0) / img_width
                y_center = ((miny + maxy) / 2.0) / img_height
                width = (maxx - minx) / img_width
                height = (maxy - miny) / img_height

                # Clip bounds
                x_center = max(0.0, min(1.0, x_center))
                y_center = max(0.0, min(1.0, y_center))
                width = max(0.0, min(1.0, width))
                height = max(0.0, min(1.0, height))

                yolo_lines.append(f"{class_id} {x_center:.6f} {y_center:.6f} {width:.6f} {height:.6f}")
            except Exception as e:
                continue

        with open(yolo_txt_path, "w") as out_f:
            out_f.write("\n".join(yolo_lines))

        converted_count += 1

    print(f"Successfully converted {converted_count} xBD label files into YOLO annotations.")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Convert xBD dataset annotations to YOLO format")
    parser.add_argument("--input-dir", default="datasets/xbd/labels", help="Directory with xBD JSON files")
    parser.add_argument("--output-dir", default="datasets/yolo_xbd/labels/train", help="Target directory for YOLO txts")
    args = parser.parse_args()

    convert_xbd_labels_to_yolo(args.input_dir, args.output_dir)
