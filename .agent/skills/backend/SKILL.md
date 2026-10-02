---
name: backend
description: Backend development guide for Ancient Scripts AI — FastAPI, pipeline.py, input handling, response schema, and rules.
---

# Backend — Ancient Scripts AI

## Purpose

Guides future agents working on the Python FastAPI backend. Covers the API design, pipeline architecture, input handling, and rules specific to this project.

## When to Use

- When modifying `backend/main.py` or `backend/pipeline.py`.
- When adding a new API endpoint.
- When adding a new pipeline stage.
- When replacing a placeholder component with real ML.
- When debugging backend errors.

## Project Context

| File | Role |
| :--- | :--- |
| `backend/main.py` | FastAPI app, CORS config, endpoint definitions, image decoding |
| `backend/pipeline.py` | All analysis logic — the only place scientific computation should live |
| `backend/requirements.txt` | Python dependencies (fastapi, uvicorn, python-multipart, opencv-python-headless, pydantic, numpy) |

**Runtime:** Python 3.10+, started with `python -m uvicorn main:app --reload --port 8000` from the `backend/` directory.

## `main.py` — What it Does

- Creates the FastAPI `app` instance with title and description.
- Configures CORS middleware with `allow_origins=["*"]` (development setting — restrict in production).
- Defines `GET /` — returns service status and scientific disclaimer string.
- Defines `POST /analyze` — accepts `file: UploadFile` or `url: str` (form field), decodes the image with OpenCV, calls `process_image(img)`, and returns the raw dict.
- Uses `-> Dict[str, Any]` return type (no Pydantic response model — the schema is validated by the TypeScript interfaces on the frontend).
- If image decoding fails, raises `HTTPException(400)`.

## `pipeline.py` — What it Does

### `LOCAL_SIGN_CORPUS`
A hardcoded dict containing a single key `"Proto-Elamite"` with 9 sign entries (M001_A, M218, M388, M056_f, M157, M004_c, M096, N01, N14). This is the entire "corpus" of the current prototype. It is **not** a database.

### `analyze_image_quality(image)` — Stage 1
**Status: REAL OpenCV implementation.**
- Computes: image `width × height`, aspect ratio, Laplacian variance (sharpness), raw grayscale contrast std, CLAHE enhanced contrast std, mean brightness.
- Classifies surface visibility and damage level using simple if/else thresholds on `laplacian_var` and `mean_brightness`.
- Returns: `is_photometric_real: True` — this flag tells the frontend these are real measurements.

### `segment_glyph_regions(image)` — Stage 3
**Status: REAL OpenCV implementation (with demo fallback).**
- Converts to grayscale → Gaussian blur → adaptive threshold → morphological close → `findContours`.
- Filters contours by area (0.1% to 25% of image area).
- If fewer than 4 contours are found, falls back to 9 evenly-spaced demo bounding boxes.
- Returns normalized bounding boxes as percentages (`left_pct`, `top_pct`, `width_pct`, `height_pct`).
- **Sign assignment is demo:** Each detected contour is matched to the corpus by `idx % 9` — i.e., index wrapping. This is NOT real sign recognition.
- **Confidence scores are hardcoded:** `0.88` for idx < 3, `0.76` for idx < 7, `0.94` otherwise. These are NOT from a model.

### `process_image(image)` — Orchestrator
**Status: Demo logic for stages 2, 4, 5, 6, 7, 8.**
- Calls `analyze_image_quality()` and `segment_glyph_regions()` (real stages).
- Hardcodes `script_classification` as Proto-Elamite with confidence 0.892 and `is_model_demo: True`.
- Hardcodes `corpus_evidence` with 2 sequence matches and 1 metrological pattern.
- Hardcodes `context_analysis` dict.
- Hardcodes 3 `hypotheses` with fixed confidence scores (0.684, 0.238, 0.078).
- Hardcodes `pipeline_stages` list (8 audit entries).
- Calls `generate_markdown_report()` and returns the full structured dict.

### `generate_markdown_report()` — Report Generator
**Status: REAL — generates markdown text from the pipeline output.**

## Response Schema

The response is a Python `Dict[str, Any]` with these top-level keys:

```
artifact_metadata       — inferred_script, period, provenance, reading_direction, medium
level_1_observed        — image_quality (real), detected_glyph_count, glyphs (real boxes, demo labels)
level_2_predicted       — script_classification (demo)
level_3_corpus_evidence — corpus_name, catalog_entries_indexed, strong_sequence_matches, metrological_pattern
level_4_interpretation  — context_analysis, hypotheses
pipeline_stages         — list of 8 stage audit dicts
research_report_markdown — generated markdown string
scientific_disclaimer   — static notice string
```

**If you change this schema, you must update the TypeScript interfaces in `ResultsDashboard.tsx`.**

## Rules

- Validate all inputs. If `file` and `url` are both `None`, return HTTP 400.
- Never expose raw Python exceptions (tracebacks) to the API response.
- Keep all analysis logic in `pipeline.py`, not in `main.py`.
- Never add new hardcoded scientific values without labelling them clearly as `DEMO`.
- Log meaningful diagnostic information (uvicorn auto-logs requests; add `print()` for pipeline errors in development).
- `allow_origins=["*"]` is acceptable for development but must be restricted in production.
- Do not change the top-level response schema keys without updating both the TypeScript interfaces and this skill.

## Common Problems

- **`ModuleNotFoundError: No module named 'fastapi'`:** Running uvicorn from the wrong directory or wrong Python environment. Run from `backend/` using the correct Python.
- **`Failed to decode image raster`:** OpenCV returned `None` from `imdecode`. The uploaded bytes may not be a valid image format.
- **Pipeline returns demo-only results regardless of input:** This is expected. The script classification, sign labels, and hypotheses are hardcoded in the current prototype.

## Definition of Done

- `GET /` returns 200 with `status: "online"`.
- `POST /analyze` with a valid image returns 200 with all 9 top-level keys.
- `POST /analyze` with no file and no URL returns HTTP 400.
- `POST /analyze` with a corrupted file returns HTTP 400.
- No Python traceback appears in any HTTP response body.
- All new demo/placeholder values are explicitly labelled as such.
