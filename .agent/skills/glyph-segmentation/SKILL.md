---
name: glyph-segmentation
description: Glyph segmentation skill for Ancient Scripts AI — understanding the current contour approach, bounding box format, and how to replace it.
---

# Glyph Segmentation — Ancient Scripts AI

## Purpose

Explains the glyph detection implementation in detail: what the current approach does, how bounding boxes are normalized, and how to replace or improve the segmentation stage.

## When to Use

- When modifying `segment_glyph_regions()` in `pipeline.py`.
- When debugging misaligned or missing bounding boxes.
- When integrating a real detector (YOLO, SAM, Mask R-CNN).
- When adjusting contour filtering thresholds.

## What Glyph Segmentation Does

Glyph segmentation identifies candidate regions in the image that may contain individual signs or symbol groups. It produces **bounding boxes** — rectangular regions — for each candidate.

In the current implementation, these are **candidate regions**, not confirmed signs. Sign identity is assigned separately (demo: index wrapping into corpus).

## Algorithm: Step-by-Step

```python
# Step 1: Grayscale conversion
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Step 2: Smooth to reduce noise
blur = cv2.GaussianBlur(gray, (5, 5), 0)

# Step 3: Adaptive threshold (highlights incised marks)
thresh = cv2.adaptiveThreshold(
    blur, 255,
    cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
    cv2.THRESH_BINARY_INV,    # Invert: dark incisions become white
    blockSize=15,             # Local neighbourhood size
    C=4                       # Subtract 4 from local mean
)

# Step 4: Morphological close (connects broken strokes)
kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
morphed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

# Step 5: Find external contours
contours, _ = cv2.findContours(morphed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# Step 6: Filter by area
min_area = (width * height) * 0.001  # Must be > 0.1% of image
max_area = (width * height) * 0.25   # Must be < 25% of image

# Step 7: Sort left-to-right
# Step 8: Take first 9 candidates
# Step 9: Normalize to percentage coordinates
```

## Bounding Box Format

Each glyph dict contains a `bounding_box` sub-dict:

```python
{
    "left_pct": float,   # x position as % of image width (0–100)
    "top_pct": float,    # y position as % of image height (0–100)
    "width_pct": float,  # box width as % of image width (0–100)
    "height_pct": float, # box height as % of image height (0–100)
    "raw_box": [x, y, w, h]  # absolute pixel coordinates
}
```

**Why percentages?** The frontend overlays boxes using CSS `position: absolute` with percentage `left/top/width/height` values. This makes boxes responsive regardless of how the image is scaled in the browser.

**Important:** Both `left_pct + width_pct` and `top_pct + height_pct` should not exceed 100. If they do, a box extends beyond the image boundary — this indicates a buggy contour.

## Demo Fallback

If fewer than 4 contours pass the area filter, the fallback generates 9 evenly-spaced demo boxes:

```python
step = width / 10
for i in range(9):
    bx = int(step * i + step * 0.1)
    by = int(height * 0.25 + (height * 0.05 if i % 2 == 0 else 0))
    bw = int(step * 0.8)
    bh = int(height * 0.5)
```

This produces a grid-like layout of 9 equal boxes. It activates for blank images, solid-colour images, or very low-contrast inputs.

## Integrating a Real Detector

When replacing with a YOLO or SAM model:

1. Keep `segment_glyph_regions(image)` as the function signature.
2. Compute real bounding boxes from the model output.
3. Convert pixel coordinates to percentages using the same formula:
   ```python
   left_pct = (x / width) * 100
   top_pct = (y / height) * 100
   width_pct = (w / width) * 100
   height_pct = (h / height) * 100
   ```
4. Return the same list-of-dicts format.
5. Replace the demo fallback with a real low-confidence threshold.
6. Remove the `idx % 9` sign assignment and replace with model-predicted sign IDs.
7. Update the `confidence_score` field with real model confidence.

## Debugging Bounding Boxes

- **Boxes cover the full image:** One contour is extremely large. The `max_area = 0.25 × total` filter may be too loose for this image. Try reducing to 0.15.
- **No boxes, demo grid shown:** Image has very low contrast. Try preprocessing with CLAHE before segmentation (not currently implemented).
- **Boxes are offset from actual signs:** Verify the image `width` and `height` used for normalization match the actual image dimensions passed to the function.
- **Boxes appear in wrong place on screen:** Check that the frontend overlay container has `position: relative` and the box divs have `position: absolute`.

## Definition of Done

- `segment_glyph_regions()` returns a list of 1–9 glyph dicts.
- Each dict has `bounding_box` with `left_pct`, `top_pct`, `width_pct`, `height_pct` in range 0–100.
- `left_pct + width_pct ≤ 100` and `top_pct + height_pct ≤ 100` for all boxes.
- Demo fallback activates only when < 4 real contours are found.
- Boxes are visible and aligned over the image in the browser.
