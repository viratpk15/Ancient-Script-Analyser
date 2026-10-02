---
name: bugs-debugging
description: Systematic debugging process for Ancient Scripts AI — frontend, backend, and pipeline debugging workflows.
---

# Bugs & Debugging — Ancient Scripts AI

## Purpose

Defines a consistent, systematic process for diagnosing and fixing bugs. Prevents random multi-file edits that introduce new problems while attempting to fix existing ones.

## When to Use

- When the application produces an unexpected error.
- When a feature does not behave as expected.
- When the frontend and backend are not communicating correctly.
- When bounding boxes are misaligned or missing.
- When the pipeline returns unexpected values.

## Golden Rule

**Do not randomly edit multiple files while debugging.** Identify the root cause first. Make the smallest safe change. Test before moving to the next file.

## Standard Debugging Process

1. **Reproduce the bug.** Confirm you can reliably reproduce it. Note exact steps.
2. **Record the exact error.** Note: error message, HTTP status code, browser console message, or incorrect UI state.
3. **Determine the layer.** Is the problem in the frontend (React), the API (FastAPI), or the pipeline (Python)?
4. **Inspect the relevant logs.**
5. **Isolate the failing component.** Use the smallest possible reproduction.
6. **Identify root cause.** Do not fix symptoms.
7. **Make the smallest safe fix.**
8. **Test the fix.**
9. **Perform regression testing.** Confirm other flows still work.

## Layer Determination Guide

### Frontend-only errors
- Error appears in browser DevTools console.
- Network tab shows the API request succeeded (200 OK).
- The JSON response is correct, but the UI displays incorrectly.
- TypeScript compilation error (`npm run build` fails).

### Backend-only errors
- Network tab shows non-200 response (400, 422, 500).
- Uvicorn terminal shows a Python traceback.
- `GET /` works but `POST /analyze` fails.

### Frontend–Backend mismatch
- Network tab shows 200 OK but the UI does not update.
- Response JSON has unexpected keys or missing fields.
- TypeScript interface does not match the actual response shape.

## Frontend Debugging Checklist

- Open browser DevTools → Console tab: note all errors and warnings.
- Open Network tab: inspect the `POST /analyze` request payload and response body.
- Check `analysisStage` state: if stuck at 8, the setTimeout chain completed but the result has not been set yet (check if fetch failed silently).
- Check the `result` object in React DevTools to confirm all expected keys are present.
- Check CSS: bounding boxes use `position: absolute` inside `position: relative` — if the parent container is wrong, boxes will be offset.
- Check `verbatimModuleSyntax`: TypeScript errors about `import` may require `import type` instead of `import`.

## Backend Debugging Checklist

- Check the uvicorn terminal for Python tracebacks.
- Confirm both processes are running: `python -m uvicorn main:app --reload` (port 8000) and `npm run dev` (port 5173).
- Test `GET http://localhost:8000/` — should return JSON with `status: "online"`.
- Test `POST http://localhost:8000/analyze` via Swagger UI at `http://localhost:8000/docs`.
- Check if the image decoded correctly: add `print(img.shape)` after `cv2.imdecode()` in `main.py`.
- Check if `process_image()` raises an exception: wrap in try/except and print the traceback.

## Pipeline-Specific Debugging

- `analyze_image_quality()` failure: check that `image` is a valid non-None numpy array with 2 or 3 dimensions.
- `segment_glyph_regions()` returning all demo boxes: the image may have < 4 contours. This is expected for solid-colour or near-blank images.
- Bounding box percentages out of range: check that `width` and `height` from `image.shape` are non-zero.

## Common Bugs Known in the Current Prototype

1. **Stage animation finishes before API response arrives:** The setTimeout chain runs for 4800ms total. If the backend takes > 4800ms (e.g., on a slow machine), `setAnalysisStage(9)` fires before the result is set. The result will still be set when the fetch completes, but there is a brief window with `analysisStage === 9` and `result === null`. The conditional `{result && analysisStage === 9 && <ResultsDashboard>}` handles this correctly — the dashboard only renders when both conditions are true.

2. **CORS error in browser:** Ensure the backend is running. The `allow_origins=["*"]` config should prevent CORS errors during development. If CORS errors appear, the backend is likely not running.

3. **`Failed to decode image raster`:** OpenCV could not decode the bytes. Common causes: non-image file, corrupted upload, unsupported format.

## Definition of Done

- The bug is reproducible and has been confirmed fixed.
- The fix is the smallest change necessary.
- No other existing flows are broken (upload → analysis → results still works end-to-end).
- If the bug reveals a gap in test coverage, that is noted for future testing work.
