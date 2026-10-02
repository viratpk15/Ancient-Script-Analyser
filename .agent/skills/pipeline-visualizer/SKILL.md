---
name: pipeline-visualizer
description: PipelineVisualizer component guide for Ancient Scripts AI — stage definitions, types, timing, and extension.
---

# Pipeline Visualizer — Ancient Scripts AI

## Purpose

Documents the `PipelineVisualizer` React component that displays the 8-stage analysis progress to the researcher. Explains stage types, timing behaviour, and rules for extending it.

## When to Use

- When modifying the `PipelineVisualizer` component.
- When adding a new pipeline stage.
- When changing stage type labels or descriptions.
- When debugging stage animation issues.

## Component Location

`frontend/src/components/PipelineVisualizer.tsx`

## Component Responsibility

`PipelineVisualizer` is a **purely presentational component**. It:
- Receives `currentStage: number` as its only prop.
- Renders a vertical list of all 8 research stages.
- Shows the progress state of each stage based on `currentStage`.
- Does NOT communicate with the backend.
- Does NOT update its own state.

## Render Logic

For each stage `n` (1–8):
- If `n < currentStage`: stage is **completed** — shows green checkmark icon.
- If `n === currentStage`: stage is **active** — shows an animated loading bar.
- If `n > currentStage`: stage is **pending** — shows dim bullet.

When `currentStage === 9` (complete): all 8 stages show completed.

## The 8 Research Stages

These stage definitions come from `researchStages` in the component (matching `pipeline_stages` in the backend response):

| ID | Name | Type | Evidence Level |
| :--- | :--- | :--- | :--- |
| 1 | Image Preprocessing & Normalization | OBSERVED | Level 1 |
| 2 | Script Family Identification | PREDICTED | Level 2 |
| 3 | Glyph Candidate Segmentation | OBSERVED | Level 1 |
| 4 | Sign Candidate Recognition | PREDICTED | Level 2 |
| 5 | Corpus Matching & Sequence Retrieval | CORPUS EVIDENCE | Level 3 |
| 6 | Context & Sequence Analysis | INTERPRETATION | Level 4 |
| 7 | Numerical / Metrological Analysis | OBSERVED / INTERPRETATION | Level 1+4 |
| 8 | Hypothesis Engine & Research Report | INTERPRETATION | Level 4 |

## Stage Type Badges

Each stage displays a coloured type badge:

| Type String | Badge Colour |
| :--- | :--- |
| `OBSERVED` | Blue |
| `PREDICTED` | Amber / Orange |
| `CORPUS EVIDENCE` | Purple |
| `INTERPRETATION` | Pink |

These colours must match the four scientific levels described in the `scientific-integrity` skill.

## Timing

The stage progression in the frontend is **cosmetic and timer-based**:

```
App.tsx startAnalysis():
  setAnalysisStage(1)             — immediate
  setTimeout(setAnalysisStage(2), 600ms)
  setTimeout(setAnalysisStage(3), 1200ms)
  ...
  setTimeout(setAnalysisStage(8), 4200ms)
  fetch('POST /analyze') — runs concurrently
  On fetch resolve:
    setTimeout(setResult + setAnalysisStage(9), 4800ms)
```

**The stage numbers in PipelineVisualizer are NOT tied to real backend computation progress.** They are purely cosmetic animations designed to help the researcher understand what analysis is happening.

## Adding a New Stage

If a 9th real pipeline stage is added to the backend:

1. Add the stage to `researchStages` in `PipelineVisualizer.tsx`.
2. Update `pipeline_stages` in `pipeline.py` to include the new stage.
3. Add the corresponding setTimeout call in `App.tsx`'s `startAnalysis()` function.
4. Update the total to 9 stages in the button label logic in `App.tsx`.
5. Update the `data-pipeline` skill with the new stage.

## Rules

- `PipelineVisualizer` must remain a pure presentational component. Never add data fetching or side effects.
- Stage type labels must match the 4-level scientific taxonomy (`OBSERVED`, `PREDICTED`, `CORPUS EVIDENCE`, `INTERPRETATION`).
- Do not add stages that do not correspond to actual computations in the backend pipeline.
- The stage count displayed in the button label (`Analyzing (Stage ${Math.min(analysisStage, 8)}/8)...`) must be updated if stages are added.

## Definition of Done

- All 8 stages render with correct names and type badges.
- Active stage shows loading animation.
- Completed stages show checkmarks.
- Pending stages are visually dimmed.
- Adding a new stage requires consistent changes in both the component and `App.tsx`.
