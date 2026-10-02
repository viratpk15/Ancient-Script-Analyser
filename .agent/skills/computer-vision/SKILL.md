---
name: computer-vision
description: Computer vision implementation guide for Ancient Scripts AI — what is real, what is demo, and how to extend it.
---

# Computer Vision — Ancient Scripts AI

## Purpose

Documents the actual computer vision implementation in `pipeline.py`, clearly distinguishing what uses real OpenCV from what is placeholder logic. Guides future agents adding or improving CV stages.

## When to Use

- When modifying image preprocessing steps.
- When improving glyph segmentation.
- When integrating a real segmentation model (YOLO, SAM, Mask R-CNN).
- When adding support for new image types (TIFF, multi-spectral).
- When debugging incorrect bounding box positions.

## Current CV Implementation Status

| Stage | Method | Status |
| :--- | :--- | :--- |
| Image decoding | `cv2.imdecode(nparr, cv2.IMREAD_COLOR)` | ✅ Real |
| Grayscale conversion | `cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)` | ✅ Real |
| Sharpness/focus metric | Laplacian variance `cv2.Laplacian().var()` | ✅ Real |
| Raw contrast | `np.std(gray)` | ✅ Real |
| CLAHE enhancement | `cv2.createCLAHE(clipLimit=2.5)` | ✅ Real |
| Mean brightness | `np.mean(gray)` | ✅ Real |
| Glyph segmentation | Gaussian blur → adaptive threshold → morphClose → findContours | ✅ Real |
| Contour filtering | Area-based filter (0.1% – 25% of image area) | ✅ Real |
| Sign assignment from contours | Index wrapping `idx % 9` into local corpus | ⚠️ Demo |
| Sign confidence scores | Hardcoded values (0.88, 0.76, 0.94) | ⚠️ Demo |
| Script classification | Hardcoded "Proto-Elamite" | ⚠️ Demo |
| RTI / photometric stereo | Not implemented | ❌ Planned |
| 3D surface mesh analysis | Not implemented | ❌ Planned |

## Implemented Pipeline: `analyze_image_quality()`

```
Input: BGR numpy array
    ↓
Convert to grayscale
    ↓
Compute Laplacian variance  → sharpness_laplacian_var (REAL)
Compute np.std(gray)        → raw_contrast_std (REAL)
Compute np.mean(gray)       → mean_brightness (REAL)
Apply CLAHE                 → enhanced_contrast_std (REAL)
    ↓
Apply if/else thresholds    → surface_visibility, damage_level, quality_score
    ↓
Return dict with is_photometric_real: True
```

Note: `quality_score` (0.88, 0.64, 0.42) uses fixed threshold rules, not a learned model.

## Implemented Pipeline: `segment_glyph_regions()`

```
Input: BGR numpy array
    ↓
Convert to grayscale
    ↓
Gaussian blur (5×5)
    ↓
Adaptive threshold (THRESH_BINARY_INV, blockSize=15, C=4)
    ↓
Morphological close (3×3 rect kernel)
    ↓
cv2.findContours (RETR_EXTERNAL, CHAIN_APPROX_SIMPLE)
    ↓
Filter by area (0.001 – 0.25 × total_area)
    ↓
Sort left-to-right
    ↓
If < 4 contours: fall back to 9 evenly-spaced demo boxes
    ↓
Take first 9 contours
    ↓
For each: compute normalized percentage bounding box
    ↓
Assign demo sign label from LOCAL_SIGN_CORPUS by index wrapping
    ↓
Return list of glyph dicts
```

**Important:** The fallback demo boxes are evenly spaced across the image width. They are shown when the image has very little contrast (e.g., a solid-colour or nearly blank image). Real ancient tablet photos should produce real contours.

## Extending the CV Pipeline

When adding real segmentation (e.g., YOLOv8, SAM):

1. Add the new function to `pipeline.py` alongside `segment_glyph_regions()`.
2. Keep the same output schema: list of dicts with `glyph_id`, `bounding_box` (with `left_pct`, `top_pct`, `width_pct`, `height_pct`, `raw_box`), and candidate fields.
3. Call the new function from `process_image()` in place of `segment_glyph_regions()`.
4. Do not change the response schema keys.
5. Label the new implementation as real in `pipeline_stages` (`type: "OBSERVED"`).

## Rules

- Never claim RTI or photometric stereo was performed on an image. These are not implemented.
- Never present the hardcoded confidence values (0.88, 0.76, 0.94) as model outputs. They are placeholders.
- Never suppress the fallback demo box logic without replacing it with a real detector.
- Always preserve the normalized percentage bounding box format — the frontend CSS positions boxes using these percentages.
- If the image is genuinely blank or solid-coloured, the fallback boxes are acceptable; this is documented behaviour.

## Common Problems

- **Bounding boxes cover the entire image:** Usually caused by a single very large contour matching the image border. The `max_area = 0.25 × total_area` filter should prevent this, but check if the threshold is appropriate for the input image.
- **No contours found:** Image may be extremely low contrast, over-exposed, or already binarized. The demo fallback activates.
- **Boxes misaligned on frontend:** Confirm that `left_pct`, `top_pct`, `width_pct`, `height_pct` are computed relative to the image `width` and `height`, and that the frontend overlay `div` has `position: absolute` inside a `position: relative` container.

## Definition of Done

- New CV code computes results from the actual image, not hardcoded values.
- Output schema matches the existing glyph dict structure.
- The `type` field in `pipeline_stages` correctly reflects whether the stage is `OBSERVED` or `PREDICTED`.
- All new placeholder values are explicitly documented as demo.
