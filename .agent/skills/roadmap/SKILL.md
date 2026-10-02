---
name: roadmap
description: Feature roadmap for Ancient Scripts AI — planned phases, priority order, and feature scope definitions.
---

# Roadmap — Ancient Scripts AI

## Purpose

Defines the planned development phases for Ancient Scripts AI, helping future agents understand which features are planned next, what scope they should have, and what dependencies must exist before they can begin.

## When to Use

- When deciding what to build next.
- When evaluating whether a proposed feature fits the project vision.
- When estimating the scope of a new feature.
- When communicating project status to collaborators.

## Current State (Phase 0 — Research Prototype Complete)

The working prototype is complete with:
- React frontend (upload, preview, pipeline visualization, 5-tab results dashboard).
- FastAPI backend with `/analyze` endpoint.
- Real OpenCV image metrics and glyph contour segmentation.
- Demo script classification, sign recognition, corpus matching, and hypothesis generation.
- Exportable Markdown research report.
- Glyph bounding box overlay with toggle.

## Phase 1 — Real ML Script Classifier

**Goal:** Replace the hardcoded "Proto-Elamite" classifier with a real trained model.

**Prerequisites:** 
- Labelled dataset of ancient script images (Proto-Elamite, Proto-Cuneiform, Linear Elamite, Indus).
- GPU training environment.

**Scope:**
- Train or fine-tune a CNN or ViT classifier on epigraphic image datasets.
- Save model checkpoint as ONNX for portable inference.
- Integrate into `pipeline.py` — load at module level, call from `process_image()`.
- Set `is_model_demo: False`.
- Document test-set metrics in model README.
- Expose top-5 softmax predictions in the response.

**Success criteria:**
- Classifier correctly identifies at least 3 script families.
- Response time < 1 second for inference on CPU.
- `is_model_demo` is `False` in the response.

## Phase 2 — Real Sign Segmentation (YOLOv8 / SAM)

**Goal:** Replace index-based sign assignment with a real glyph detector.

**Prerequisites:** Phase 1 complete. Labelled glyph bounding box dataset.

**Scope:**
- Fine-tune YOLOv8 or use SAM (Segment Anything) for glyph detection.
- Replace `segment_glyph_regions()` with real inference.
- Keep the same bounding box output schema.
- Label Stage 3 `type: "OBSERVED"` with confidence values from the model.

## Phase 3 — Corpus Database Integration

**Goal:** Replace the 9-entry hardcoded dict with a queryable epigraphic database.

**Prerequisites:** Licensed access to a corpus (CDLI, MDP digital archive).

**Scope:**
- Build `backend/corpus/` module with database access layer.
- Implement sequence search and frequency retrieval.
- Update `catalog_entries_indexed` to reflect real database size.
- Preserve the response schema keys.

## Phase 4 — Real Sign Recognition

**Goal:** Replace index-based sign labelling with metric learning.

**Prerequisites:** Phase 2 (real detection). Phase 3 (real corpus). Labelled sign dataset.

**Scope:**
- Train ArcFace or SimCLR embedding model on sign patches.
- Build sign embedding index (FAISS or ScaNN).
- For each detected glyph patch, embed and retrieve top-k nearest signs from the index.
- Replace current `candidates` list with real nearest-neighbour results.

## Phase 5 — Research History & User Accounts

**Goal:** Let researchers save, compare, and revisit analyses.

**Prerequisites:** Phase 1, 2, 3.

**Scope:**
- Add a PostgreSQL (or SQLite) database for analysis records.
- Add user accounts (OAuth or email).
- Persist uploaded images (object storage: S3, MinIO).
- Analysis history page listing past analyses.
- Side-by-side comparison of two analyses.

## Phase 6 — Multi-Spectral Imaging (RTI)

**Goal:** Support Reflectance Transformation Imaging (RTI) for surface enhancement.

**Prerequisites:** Research collaboration with RTI capture facility.

**Scope:**
- Accept multi-image RTI input (stack of photos taken at different lighting angles).
- Compute PTM (Polynomial Texture Map) surface model.
- Generate enhanced surface normal visualization.
- Feed enhanced image to glyph segmentation stage.

## Phase 7 — Collaborative Annotation Tool

**Goal:** Allow epigraphers to annotate, correct, and improve machine analysis.

**Prerequisites:** Phase 5 (accounts).

**Scope:**
- Annotation canvas over the image for manual sign correction.
- Expert consensus mechanism for hypothesis ranking.
- Annotated data feeds back to model training pipeline.

## Features Outside Scope (Will Not Build)

- Automatic phonetic pronunciation of undeciphered scripts (scientifically impossible).
- Real-time OCR of modern languages.
- General-purpose image recognition (not epigraphic).
- Chat-based translation assistant claiming to translate undeciphered scripts.

## Definition of Done (per Phase)

Each phase is complete when:
- The relevant `is_model_demo` flag is set to `False`.
- Test-set metrics are documented.
- The response schema is stable.
- This roadmap is updated with the new phase status.
