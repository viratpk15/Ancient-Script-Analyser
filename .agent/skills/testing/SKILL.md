---
name: testing
description: Testing strategy and requirements for Ancient Scripts AI — unit, integration, UI, and regression tests.
---

# Testing — Ancient Scripts AI

## Purpose

Defines what must be tested, at what level, and what constitutes a passing test suite. Ensures new features and bug fixes do not break existing behaviour.

## When to Use

- Before submitting any new feature.
- After fixing a bug (regression test required).
- When modifying `pipeline.py` functions.
- When changing the API response schema.
- When modifying React component behaviour.

## Current Testing State

**No automated tests currently exist in this project.** This is a known gap. Future agents should add tests incrementally, starting with the most critical paths.

Priority order for first tests:
1. Backend pipeline unit tests (highest value, lowest dependency).
2. API integration tests.
3. Frontend component tests.

## Backend Unit Tests

**Tool:** `pytest` (add to `requirements.txt` as dev dependency).

Test `analyze_image_quality()`:
```
- Valid colour image → returns dict with all 7 keys
- Valid grayscale image → does not crash
- Very bright image (near-white) → quality_score = 0.42
- Sharp image → sharpness_laplacian_var > 100
- is_photometric_real is always True
```

Test `segment_glyph_regions()`:
```
- Valid image with clear contours → returns list of glyph dicts
- Near-blank image → triggers demo fallback (returns exactly 9 boxes)
- Each dict has: glyph_id, bounding_box, candidate_sign, confidence_score, candidates
- bounding_box values (left_pct, top_pct, width_pct, height_pct) are in range 0–100
- glyph_ids are sequential starting from 1
```

Test `process_image()`:
```
- Valid image → response has all 9 top-level keys
- level_1_observed.glyphs is a non-empty list
- level_2_predicted.script_classification.is_model_demo is True
- level_4_interpretation.hypotheses has exactly 3 entries
- pipeline_stages has exactly 8 entries
- research_report_markdown is a non-empty string
```

## API Integration Tests

**Tool:** `httpx` + `pytest` with `TestClient` from FastAPI.

Test `GET /`:
```
- Returns 200
- Body contains "status": "online"
```

Test `POST /analyze` with valid image:
```
- Returns 200
- Response body is valid JSON
- Contains level_1_observed key
- level_1_observed.image_quality.dimensions is a non-empty string
```

Test `POST /analyze` with no file and no URL:
```
- Returns 400
- Body contains "detail" key
```

Test `POST /analyze` with corrupted bytes:
```
- Returns 400
- Body contains "Failed to decode image raster"
```

Test `POST /analyze` with invalid URL:
```
- Returns 400
- Body contains "Could not load image from URL"
```

## Frontend Tests

**Tool:** Vitest + React Testing Library (not yet installed; add as dev dependencies).

Test `ImageUpload`:
```
- Renders upload zone
- Calls onSelectImage with File when file is selected
- Shows dragging state when drag is over the zone
```

Test `PipelineVisualizer`:
```
- Renders all 8 stage labels
- Stage with currentStage === N shows loading bar
- Stage with currentStage > N shows checkmark
- Each stage has a type badge (OBSERVED, PREDICTED, etc.)
```

Test `ResultsDashboard` (with mock data):
```
- Renders 5 tabs
- Hypotheses tab shows all hypothesis cards
- Switching to Sign Table tab shows glyph table
- Copy Report button writes to clipboard
```

Test `App` flow (integration):
```
- Initial state: shows ImageUpload
- After file select: shows image preview and Start button
- After analysis complete: shows ResultsDashboard
```

## Regression Tests

Every bug fix should have a corresponding test that reproduces the bug scenario and confirms it is fixed. Document the bug ID or description in the test name.

Example:
```python
def test_blank_image_does_not_crash():
    """Regression: blank/solid-colour images previously caused div-by-zero in contour area filter."""
    blank = np.zeros((400, 600, 3), dtype=np.uint8)
    result = process_image(blank)
    assert len(result["level_1_observed"]["glyphs"]) == 9  # fallback demo boxes
```

## Test Organisation

```
backend/
    tests/
        test_pipeline.py      # Unit tests for pipeline.py functions
        test_api.py           # Integration tests for FastAPI endpoints

frontend/
    src/
        __tests__/
            ImageUpload.test.tsx
            PipelineVisualizer.test.tsx
            ResultsDashboard.test.tsx
```

## Definition of Done

- All tests pass.
- New pipeline functions have at least one happy-path and one error-path test.
- API endpoints have tests for: valid input, missing input, invalid input.
- No new feature is merged without running `npm run build` and confirming zero TypeScript errors.
