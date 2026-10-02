---
name: frontend
description: Frontend development guide for Ancient Scripts AI — React 19, TypeScript, Vite, component responsibilities, and rules.
---

# Frontend — Ancient Scripts AI

## Purpose

Guides future agents working on the React/TypeScript frontend. Covers component responsibilities, state management, API communication, and coding rules specific to this project.

## When to Use

- When modifying any file in `frontend/src/`.
- When adding a new React component.
- When changing how analysis results are displayed.
- When updating the pipeline progress visualization.
- When modifying the image upload flow.

## Project Context

- **Framework:** React 19 with TypeScript
- **Build tool:** Vite 8
- **Styling:** Vanilla CSS (no Tailwind, no CSS-in-JS)
- **Linting:** Oxlint
- **Entry point:** `frontend/src/main.tsx`
- **Dev server:** `http://localhost:5173`

## Component Responsibilities

### `App.tsx`
The application master state machine.
- Holds all state: `selectedImage`, `imagePreviewUrl`, `imageMeta`, `analysisStage` (0–9), `result`, `isAnalyzing`, `showBoxes`.
- Stage 0 = no analysis started. Stage 1–8 = pipeline running (cosmetic timers). Stage 9 = complete.
- Fires `POST /analyze` to the backend.
- Renders the bounding box overlay div using normalized `left_pct/top_pct/width_pct/height_pct` percentages from `result.level_1_observed.glyphs`.
- Manages the `setTimeout` chain (600ms intervals) that advances the stage number for the `PipelineVisualizer`. These are **cosmetic only** — not tied to real backend progress.
- Handles errors with `alert()` (MVP-level error handling; needs improvement in future phases).

### `ImageUpload.tsx`
- Drag-and-drop zone plus hidden `<input type="file">`.
- Calls `onSelectImage(file)` prop with the selected `File` object.
- Accepts all image MIME types via `accept="image/*"`.
- Does **not** validate file size or specific MIME types (needs improvement).

### `PipelineVisualizer.tsx`
- Receives `currentStage: number` (1–9).
- Displays all 8 research stages from `researchStages` array.
- Each stage has a `type` label: `OBSERVED`, `PREDICTED`, `CORPUS EVIDENCE`, or `INTERPRETATION`.
- Active stage shows an animated loading bar. Past stages show a checkmark.
- Does **not** communicate with the backend — purely presentational.

### `ResultsDashboard.tsx`
- Receives the full `AnalysisResult` typed object from `App.tsx`.
- Renders 5 tabs: Hypotheses, Sign Table, Corpus & Metrology, Observed Metrics, Export Report.
- Contains all TypeScript interfaces defining the API response shape. **This is the source of truth for the frontend API contract.**
- Key interfaces: `AnalysisResult`, `GlyphData`, `BoundingBox`, `Hypothesis`, `ScriptClassification`, `CorpusEvidence`, `ImageQuality`.
- The export report tab renders a `<pre>` of `result.research_report_markdown` and provides a clipboard copy button.

## State Flow

```
handleImageSelect(file)
    → sets selectedImage, imagePreviewUrl, imageMeta
    → reads dimensions async via Image() object

startAnalysis()
    → setIsAnalyzing(true), setAnalysisStage(1)
    → starts 7 setTimeouts (600ms each) advancing stage 2–8
    → fires fetch POST /analyze
    → on success: setTimeout(4800ms) → setResult(data), setAnalysisStage(9)
    → on error: alert(), reset stage to 0
```

## TypeScript Rules

- Always use explicit TypeScript types. Avoid `any`.
- All interfaces for the backend response live in `ResultsDashboard.tsx` and are exported.
- Import `AnalysisResult` in `App.tsx` using `import type { AnalysisResult }` (verbatimModuleSyntax is enabled).
- Do not use `interface` where `type` would be more appropriate for union types.

## CSS Rules

- All styles are in `.css` files co-located with their components.
- Global design tokens are in `frontend/src/index.css` as CSS custom properties.
- Do not use inline styles except for dynamic values (e.g., bounding box positions from percentage values).
- The glassmorphism panel class `.glass-panel` is defined in `index.css` and reused across all panels.
- Do not add new third-party CSS libraries without updating the project documentation.

## Rules

- Keep components focused. `App.tsx` manages state; components receive props and render.
- Handle loading states: disable the "Start Epigraphic Analysis" button while `isAnalyzing` is true.
- Handle error states: currently uses `alert()`; future work should use an inline error component.
- Do not expose backend API URLs as constants inside individual components — keep the `fetch` call in `App.tsx`.
- Do not break the TypeScript interfaces in `ResultsDashboard.tsx` without also updating `pipeline.py`'s return schema.
- The `showBoxes` toggle checkbox must control bounding box visibility without re-running analysis.

## Common Problems

- **Bounding boxes misaligned:** The boxes use `left_pct/top_pct/width_pct/height_pct` which are percentages relative to the image container. If the container CSS changes, the overlay position may shift.
- **Stage stuck at 8:** If the `fetch` takes longer than 4800ms (the timer for stage 9 completion), the UI will transition to stage 9 before the backend has returned. The current implementation assumes the backend responds within ~4 seconds.
- **TypeScript error on `AnalysisResult` import:** Use `import type { AnalysisResult }` not `import { AnalysisResult }` due to `verbatimModuleSyntax`.

## Definition of Done

- Component renders correctly for all states: empty, uploading, analyzing (stages 1–8), complete, error.
- TypeScript compiles without errors (`npm run build`).
- All new props are typed.
- Bounding boxes appear correctly over the image after analysis.
- The 4-level scientific distinction is visible in the UI for any new result section added.
