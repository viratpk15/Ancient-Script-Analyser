---
name: performance
description: Performance guidelines for Ancient Scripts AI — image processing speed, API response time, and frontend rendering efficiency.
---

# Performance — Ancient Scripts AI

## Purpose

Defines performance expectations, known bottlenecks, and optimisation rules for the Ancient Scripts AI platform.

## When to Use

- When adding a new pipeline stage that involves image processing.
- When integrating a real ML model with inference time.
- When dealing with large image uploads.
- When the UI feels slow or unresponsive.

## Performance Targets

| Metric | Target | Current Reality |
| :--- | :--- | :--- |
| `POST /analyze` total response time | < 5 seconds for a typical tablet photo | ~0.3–1.5 seconds (OpenCV only) |
| Frontend first render | < 2 seconds | Under 2 seconds on localhost |
| Bounding box overlay render | Instant (CSS percentages) | Instant |
| Analysis result display | Appears after stage 9 (~4.8s timer) | Depends on timer, not actual compute |
| Max supported image size | 20 MB | Currently unlimited — to fix |
| Concurrent users | 1 (single-user research tool) | Not tested |

## Current Performance Profile

The current backend is very fast because it performs only:
1. OpenCV image decode (< 50ms).
2. OpenCV contour analysis (< 100ms for typical tablet photos).
3. Returning hardcoded dicts.

The **frontend timer** (4.8 seconds total) is the primary delay, not the backend. The backend returns in well under 5 seconds. The timer is cosmetic to show research stages.

## Bottlenecks When ML Is Added

When real ML models are integrated, performance will be dominated by:
- Model loading (one-time startup cost, amortised if loaded at module level).
- Script classification inference (50–500ms for ResNet-101 on CPU; 20–100ms on GPU).
- Glyph segmentation inference (YOLOv8 ~100ms on CPU per image; SAM significantly slower).
- Sign recognition (depends on embedding lookup size).

## OpenCV Performance Rules

- Load the model at module level (outside of `process_image()`), not inside the function.
- Use `cv2.IMREAD_COLOR` for most images; `cv2.IMREAD_GRAYSCALE` when only grayscale is needed.
- Resize very large images before running expensive operations:
  ```python
  MAX_DIM = 2000
  if max(height, width) > MAX_DIM:
      scale = MAX_DIM / max(height, width)
      image = cv2.resize(image, (int(width * scale), int(height * scale)))
  ```
- CLAHE is fast (< 10ms) but should run on the grayscale image only.

## Frontend Performance Rules

- Bounding boxes use CSS `position: absolute` with percentage values — this is efficient and does not require JavaScript for each render.
- The `showBoxes` toggle uses simple React state and does not re-run analysis.
- Do not use `useEffect` to poll the backend.
- The `setTimeout` chain should not be replaced with `setInterval`.
- `ResultsDashboard` renders conditionally (`result && analysisStage === 9`) — it only mounts after analysis is done.
- The research report Markdown is rendered in a `<pre>` tag (simple, no parsing library needed for the current prototype).

## Memory Usage

- Uploaded images are held in memory as OpenCV numpy arrays during processing only.
- There is no caching of previous analysis results in memory.
- If future features add in-memory caching, implement TTL-based eviction.

## Do Not

- Do not run ML inference inside a `for` loop over image tiles without batching.
- Do not load model weights inside the `process_image()` function (loads on every request).
- Do not decode the same image multiple times (decode once, pass the numpy array).
- Do not use synchronous HTTP calls inside async FastAPI endpoints without wrapping in `asyncio.run_in_executor`.
- Do not ship the development Vite server for production use.

## Definition of Done

- `POST /analyze` with a standard tablet JPEG returns a 200 response within 5 seconds.
- No endpoint blocks the event loop for more than 1 second.
- Images larger than 20 MB are rejected before processing (400 response).
- ML model weights are loaded once at startup, not per request.
