---
name: project-overview
description: Complete overview of the Ancient Scripts AI project — its purpose, workflow, MVP state, and scientific principles. Use this skill before any work on the project.
---

# Project Overview — Ancient Scripts AI

## Purpose

This skill gives a future agent a complete understanding of the Ancient Scripts AI project: what it is, what it does, what is actually implemented, and what its scientific principles are. It must be read before any modification to the codebase.

## When to Use

- At the start of any new task on this project.
- Before modifying any file in `backend/` or `frontend/`.
- When deciding whether a proposed change aligns with the project mission.
- When writing documentation.

## Project Context

Ancient Scripts AI is a **research assistance prototype** for computational epigraphy. It assists archaeologists and linguists in analysing photographic scans of ancient inscribed tablets. It is **not** a definitive translation system, and must never be presented as one.

The primary focus is currently **Proto-Elamite** inscriptions (c. 3100–2900 BCE), which remain **undeciphered**. The system therefore produces only hypotheses, not translations.

## Conceptual Workflow

```
Tablet Image
    ↓
Image Upload (React Frontend)
    ↓
Image Preprocessing (OpenCV — real)
    ↓
Script Identification (Heuristic demo — NOT a trained model)
    ↓
Glyph Candidate Segmentation (OpenCV contours — real)
    ↓
Sign Recognition (Local catalog lookup — demo)
    ↓
Corpus Matching (9-entry local catalog — demo)
    ↓
Contextual & Syntax Analysis (Hard-coded rules — demo)
    ↓
Hypothesis Generation (3 ranked hypotheses — demo logic)
    ↓
Evidence + Confidence (From local catalog — demo)
    ↓
Research Report (Markdown export — real)
    ↓
Frontend Results Dashboard (React — real)
```

## What is INPUT

A single JPG, PNG, or TIFF raster image of an ancient inscription or tablet, uploaded by the researcher via the browser.

## What is PROCESSING

A computer vision and analysis pipeline in `backend/pipeline.py`, running on the FastAPI server. The pipeline computes real image metrics and runs placeholder classification logic.

## What is OUTPUT

A structured JSON object containing four explicitly labelled evidence levels:
- **Level 1 OBSERVED**: Real measurements from the image (dimensions, sharpness, contrast, contour bounding boxes).
- **Level 2 PREDICTED**: Heuristic/demo script classification and sign candidate rankings.
- **Level 3 CORPUS EVIDENCE**: Matches from a 9-entry local demonstration corpus.
- **Level 4 INTERPRETATION**: Hard-coded ranked hypotheses with supporting evidence lists and stated uncertainties.

## Current MVP State

| Component | Status |
| :--- | :--- |
| React frontend (upload, preview, pipeline visualization, results tabs) | ✅ Implemented |
| FastAPI backend API (`GET /`, `POST /analyze`) | ✅ Implemented |
| Image quality metrics (resolution, sharpness, contrast) | ✅ Real OpenCV |
| Glyph bounding box segmentation via contours | ✅ Real OpenCV |
| Script classification (Proto-Elamite softmax output) | ⚠️ Heuristic Demo — hardcoded result |
| Sign candidate recognition | ⚠️ Demo — maps by index to 9-entry catalog |
| Corpus matching | ⚠️ Demo — 9 hardcoded entries, no database |
| Hypothesis generation | ⚠️ Demo — 3 hardcoded hypotheses |
| Markdown research report | ✅ Generated from pipeline output |
| No persistent database | ❌ Not implemented |
| No user accounts / history | ❌ Not implemented |
| No real trained ML model | ❌ Not implemented |
| No RTI / multi-spectral support | ❌ Not implemented |

## Scientific Principles That Must Not Be Violated

1. The system **must never** claim a trained ML model exists when only hardcoded results exist.
2. All demonstration values must be labelled as `DEMO` or `PLACEHOLDER`.
3. Proto-Elamite is **undeciphered**. Readings are structural/functional hypotheses, never phonetic translations.
4. Confidence percentages in the current output are **not** derived from a real statistical model.
5. Corpus matches reference a local 9-entry demo catalog, not thousands of real tablets.

## Responsibilities

- Understand the distinction between implemented and demonstration components before changing anything.
- Preserve the 4-level scientific taxonomy in all new features.
- Do not add features that blur the line between observation and interpretation.

## Definition of Done

A change is done when:
- It respects the 4-level scientific taxonomy.
- It does not claim implemented status for unimplemented components.
- It does not break existing upload, pipeline visualization, or results display.
- It is documented in the relevant README section.
