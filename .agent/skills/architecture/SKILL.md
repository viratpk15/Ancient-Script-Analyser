---
name: architecture
description: System architecture of Ancient Scripts AI — responsibility boundaries, data flow, and modularity rules.
---

# Architecture — Ancient Scripts AI

## Purpose

Documents the actual system architecture so future agents understand where to place new logic and how components communicate. Prevents misplacement of business logic and API contract violations.

## When to Use

- Before adding a new feature that touches more than one file.
- Before changing how frontend and backend communicate.
- Before introducing a new module or service.
- When refactoring existing code.

## Project Context

The project has two major runtime processes that must both be running:

| Process | Port | Command |
| :--- | :--- | :--- |
| FastAPI backend | 8000 | `python -m uvicorn main:app --reload` (from `backend/`) |
| Vite React frontend | 5173 | `npm run dev` (from `frontend/`) |

## Actual Architecture

```
Researcher (Browser)
    │
    │  HTTP (FormData multipart)
    ▼
React Frontend — http://localhost:5173
    App.tsx         — state machine, layout
    ImageUpload.tsx — file picker & drag-drop
    PipelineVisualizer.tsx — 8-stage progress display
    ResultsDashboard.tsx   — tabbed results with 4 levels
    │
    │  POST /analyze  (FormData: file)
    │  GET  /         (health check)
    ▼
FastAPI Backend — http://localhost:8000
    main.py         — API routing, CORS, input decoding
    │
    ▼
pipeline.py         — all analysis logic
    analyze_image_quality()    — real OpenCV metrics
    segment_glyph_regions()    — real OpenCV contours
    process_image()            — orchestrates all stages
    generate_markdown_report() — builds text report
    LOCAL_SIGN_CORPUS          — 9-entry hardcoded catalog
```

## Separation of Responsibilities

| Layer | Responsibility | File |
| :--- | :--- | :--- |
| **UI logic** | State, rendering, user interactions | `frontend/src/App.tsx` and components |
| **API routing** | Accept request, validate, call pipeline, return response | `backend/main.py` |
| **Analysis logic** | All computation, image processing, classification | `backend/pipeline.py` |
| **Design tokens** | CSS variables, typography, colour palette | `frontend/src/index.css` |
| **Layout & animation** | App-level layout, bounding box overlays, scanner | `frontend/src/App.css` |

## Rules

- **UI logic stays in frontend.** Do not move rendering decisions to the backend.
- **Analysis logic stays in `pipeline.py`.** Do not add scientific computation to `main.py`.
- **API routing stays in `main.py`.** Do not add routing logic to `pipeline.py`.
- **Do not duplicate business logic** between frontend and backend. The backend is the source of truth for all analysis results.
- **Keep ML models replaceable.** The `process_image()` function in `pipeline.py` is the single integration point for real ML. Its output schema must remain stable when swapping models.
- **Keep corpus access separate.** Future corpus databases must be accessed via a dedicated module, not inline in `process_image()`.
- **Keep scientific levels separate.** Level 1 (Observed), Level 2 (Predicted), Level 3 (Corpus), Level 4 (Interpretation) must be separate keys in the JSON response.

## Data Flow (Request Lifecycle)

```
1. User selects image in browser
2. App.tsx creates FormData, fires POST /analyze
3. App.tsx simultaneously starts setTimeout chain to advance analysisStage (1–8)
   → These are purely cosmetic UI timers; they do NOT reflect actual backend progress
4. main.py receives request, decodes image with OpenCV
5. main.py calls process_image(img) in pipeline.py
6. pipeline.py returns Dict[str, Any] with 4-level structure
7. main.py returns JSON response
8. App.tsx receives JSON, waits for setTimeout(4800ms) to complete, then sets result
9. ResultsDashboard renders 5 tabs from the response
```

**Important:** The stage advancement (stages 1–8) in the frontend is a cosmetic timer animation, not tied to actual backend computation progress. The backend runs all 8 stages synchronously and returns the full result at once.

## Common Mistakes

- Putting analysis logic in `main.py` instead of `pipeline.py`.
- Putting API call logic inside React components instead of `App.tsx`.
- Assuming the pipeline stages in the frontend correspond to real backend milestones (they don't; they are UI timers).
- Modifying the JSON response schema in `pipeline.py` without updating the TypeScript interfaces in `ResultsDashboard.tsx`.

## Definition of Done

- New logic is in the correct layer.
- The JSON response schema is consistent between `pipeline.py` output and TypeScript interfaces.
- No analysis logic lives in the frontend.
- No UI logic lives in the backend.
