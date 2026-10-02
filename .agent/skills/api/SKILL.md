---
name: api
description: API design, contract, validation, and change management for Ancient Scripts AI.
---

# API — Ancient Scripts AI

## Purpose

Documents the current API contract, explains request/response formats, and defines rules for making API changes safely so the frontend and backend stay in sync.

## When to Use

- When adding a new endpoint to `main.py`.
- When modifying the response schema in `pipeline.py`.
- When changing how file uploads are handled.
- When updating TypeScript interfaces in `ResultsDashboard.tsx`.

## Current Endpoints

### `GET /`
**Purpose:** Health check and service metadata.  
**Auth:** None.  
**Response (200):**
```json
{
  "status": "online",
  "service": "Computational Epigraphy AI Pipeline",
  "version": "2.0-research",
  "scientific_disclaimer": "..."
}
```

### `POST /analyze`
**Purpose:** Accepts an ancient script image and returns the full 8-stage analysis.  
**Auth:** None.  
**Content-Type:** `multipart/form-data`  
**Fields:**
- `file`: (Optional) Image file (JPG, PNG, TIFF).
- `url`: (Optional) Remote image URL string.

At least one of `file` or `url` must be provided.

**Response (200):** Full analysis JSON (see schema below).  
**Response (400):** `{"detail": "..."}` for missing input, bad URL, or decode failure.

### Response Schema (as of current implementation)

```
{
  "artifact_metadata": {
    "inferred_script": str,
    "period": str,
    "provenance": str,
    "reading_direction": str,
    "medium": str
  },
  "level_1_observed": {
    "image_quality": {
      "dimensions": str,
      "aspect_ratio": float,
      "sharpness_laplacian_var": float,
      "raw_contrast_std": float,
      "enhanced_contrast_std": float,
      "mean_brightness": float,
      "quality_score": float,
      "surface_visibility": str,
      "damage_level": str,
      "is_photometric_real": bool
    },
    "detected_glyph_count": int,
    "glyphs": [
      {
        "glyph_id": int,
        "bounding_box": {
          "left_pct": float, "top_pct": float, "width_pct": float,
          "height_pct": float, "raw_box": [int, int, int, int]
        },
        "candidate_sign": str,
        "unicode_symbol": str,
        "label": str,
        "sign_category": str,
        "confidence_score": float,
        "segmentation_quality": float,
        "candidates": [{"sign_id": str, "name": str, "confidence": float}],
        "paleographic_notes": str
      }
    ]
  },
  "level_2_predicted": {
    "script_classification": {
      "top_prediction": str,
      "confidence": float,
      "is_model_demo": bool,
      "model_architecture": str,
      "alternatives": [{"script": str, "confidence": float}],
      "estimated_period": str,
      "provenance": str,
      "reading_direction": str
    }
  },
  "level_3_corpus_evidence": {
    "corpus_name": str,
    "catalog_entries_indexed": int,
    "strong_sequence_matches": [...],
    "metrological_pattern": {...}
  },
  "level_4_interpretation": {
    "context_analysis": {...},
    "hypotheses": [
      {
        "rank": int,
        "title": str,
        "confidence": float,
        "reconstructed_reading": str,
        "supporting_evidence": [str],
        "uncertainties_and_limitations": [str]
      }
    ]
  },
  "pipeline_stages": [{"id": int, "name": str, "status": str, "type": str, "details": str}],
  "research_report_markdown": str,
  "scientific_disclaimer": str
}
```

## Rules

- **Validate inputs.** Check for missing file and URL before processing.
- **Return predictable JSON.** All 9 top-level keys must be present in every successful response.
- **Do not leak stack traces.** Catch all exceptions in endpoint handlers and return HTTP 400 or 500 with a `detail` message.
- **Keep frontend and backend contracts in sync.** If you change a key name in `pipeline.py`, update the matching TypeScript interface in `ResultsDashboard.tsx`.
- **CORS is `allow_origins=["*"]` in development.** For production, restrict to the specific frontend origin.
- **Use HTTP status codes correctly:** 400 for invalid input, 422 for validation errors (FastAPI default), 500 for unexpected server errors.

## Changing the API Contract

When adding a new field to the response:
1. Add it to `pipeline.py`'s return dict.
2. Add it to the corresponding TypeScript interface in `ResultsDashboard.tsx`.
3. Update this skill with the new field.
4. Check that existing frontend code does not break (optional new fields are safer than removing existing ones).

When removing a field:
1. Check all places in the frontend that use it.
2. Remove the usage first, then remove the field from the backend.
3. Do not remove fields from the schema without verifying no frontend code depends on them.

## Definition of Done

- Both endpoints return documented responses.
- No Python traceback appears in any response body.
- The TypeScript interfaces match the actual JSON response structure.
- CORS is correctly configured for the target environment.
