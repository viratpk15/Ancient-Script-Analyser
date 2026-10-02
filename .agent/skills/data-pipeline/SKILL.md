---
name: data-pipeline
description: The 8-stage data pipeline of Ancient Scripts AI — inputs, transforms, outputs, and extension rules for each stage.
---

# Data Pipeline — Ancient Scripts AI

## Purpose

Provides a detailed reference for each of the 8 research stages in the Ancient Scripts AI analysis pipeline. Guides future agents understanding data flow, extending a stage, or replacing a placeholder stage.

## When to Use

- When adding or modifying a pipeline stage in `pipeline.py`.
- When understanding what data is available at each stage.
- When replacing a demo stage with a real implementation.
- When debugging unexpected pipeline output.

## Pipeline Overview

All 8 stages are orchestrated by `process_image(image: np.ndarray)` in `pipeline.py`. The function executes all stages synchronously and returns the full result dict.

```
Stage 1: Image Preprocessing & Normalization
    Input: Raw BGR numpy array from OpenCV decode
    Output: image_quality dict (7 metrics)

Stage 2: Script Family Identification
    Input: image_quality + (future: image features)
    Output: script_classification dict

Stage 3: Glyph Candidate Segmentation
    Input: Raw BGR numpy array
    Output: List of glyph dicts with bounding boxes

Stage 4: Sign Candidate Recognition
    Input: Detected glyph regions + corpus catalog
    Output: Per-glyph candidate sign rankings

Stage 5: Corpus Matching & Sequence Retrieval
    Input: Sign candidates sequence
    Output: corpus_evidence dict (matching sequences, references)

Stage 6: Context & Sequence Analysis
    Input: Detected sign sequence + corpus matches
    Output: context_analysis dict (domain, syntax structure)

Stage 7: Numerical / Metrological Analysis
    Input: Sign sequence + corpus metrological patterns
    Output: Metrological pattern dict embedded in corpus_evidence

Stage 8: Hypothesis Engine & Research Report
    Input: All prior stage outputs
    Output: 3 ranked hypotheses + research_report_markdown string
```

## Stage-by-Stage Detail

### Stage 1 — Image Preprocessing & Normalization
**Type:** `OBSERVED`  
**Status:** ✅ Real OpenCV implementation.  
**Function:** `analyze_image_quality()`

Input: BGR numpy array from `cv2.imdecode`.  
Outputs to `level_1_observed.image_quality`:
- `dimensions`, `aspect_ratio`: from `image.shape`.
- `sharpness_laplacian_var`: from `cv2.Laplacian().var()`.
- `raw_contrast_std`: from `np.std(gray)`.
- `enhanced_contrast_std`: from CLAHE applied grayscale.
- `mean_brightness`: from `np.mean(gray)`.
- `quality_score`, `surface_visibility`, `damage_level`: from threshold rules on Laplacian var.
- `is_photometric_real: True`.

### Stage 2 — Script Family Identification
**Type:** `PREDICTED (DEMO)`  
**Status:** ⚠️ Hardcoded. Always returns "Proto-Elamite" with confidence 0.892.  
**Future:** Train a ResNet-101 or ViT classifier on epigraphic sign datasets.

Outputs to `level_2_predicted.script_classification`:
- `top_prediction: "Proto-Elamite"` (hardcoded).
- `confidence: 0.892` (hardcoded).
- `is_model_demo: True` (MUST remain True until real model integrated).
- `alternatives`: 3 hardcoded alternatives.
- `model_architecture: "ResNet-101 Grapheme Classifier (Demonstration / Heuristic Weights)"`.

### Stage 3 — Glyph Candidate Segmentation
**Type:** `OBSERVED` (real boxes) + `PREDICTED (DEMO)` (sign assignments)  
**Status:** ✅ Real OpenCV contour detection. ⚠️ Demo sign assignment.  
**Function:** `segment_glyph_regions()`

Real: bounding box coordinates from `cv2.findContours`.  
Demo: sign label from `LOCAL_SIGN_CORPUS[idx % 9]`.  
Demo: confidence scores (0.88, 0.76, 0.94 hardcoded).  
Output: list of glyph dicts in `level_1_observed.glyphs`.

### Stage 4 — Sign Candidate Recognition
**Type:** `PREDICTED (DEMO)`  
**Status:** ⚠️ Index-based catalog lookup only. Not a real recognition model.

Embedded inside `segment_glyph_regions()`. Each glyph dict includes:
- `candidates`: list of 3 alternatives (primary, variant, unidentified).
- `confidence_score`: hardcoded.
- `paleographic_notes`: from corpus description field.

### Stage 5 — Corpus Matching & Sequence Retrieval
**Type:** `CORPUS EVIDENCE`  
**Status:** ⚠️ Hardcoded. The 2 sequence matches are always the same regardless of input.

Output to `level_3_corpus_evidence`:
- `corpus_name`, `catalog_entries_indexed: 9`.
- `strong_sequence_matches`: 2 hardcoded sequences.

### Stage 6 — Context & Sequence Analysis
**Type:** `INTERPRETATION`  
**Status:** ⚠️ Hardcoded.

Output to `level_4_interpretation.context_analysis`:
- `sequence_structure`: hardcoded header→commodity→metrology description.
- `possible_domains`: 3 hardcoded domain strings.
- `grammatical_assessment`: hardcoded string.

### Stage 7 — Numerical / Metrological Analysis
**Type:** `OBSERVED / INTERPRETATION` (mixed)  
**Status:** ⚠️ Hardcoded pattern. No real numerical detection.

Embedded in `level_3_corpus_evidence.metrological_pattern`:
- `system_detected: "Decimal / Bisexagesimal System B (Candidate)"`.
- `numerical_tokens_observed`: hardcoded string.
- `interpretation`: hardcoded string.

### Stage 8 — Hypothesis Engine & Research Report
**Type:** `INTERPRETATION`  
**Status:** ⚠️ 3 hardcoded hypotheses. `generate_markdown_report()` is real templating.

Output to `level_4_interpretation.hypotheses` (3 dicts) and `research_report_markdown` (string).

## Rules for Extending Stages

1. Keep each stage's output in the correct Level (1–4) key in the response.
2. When replacing a demo stage with a real implementation, update:
   - `is_model_demo: False`.
   - `pipeline_stages[n].type` to remove "(DEMO)".
   - `pipeline_stages[n].details` with real metrics.
3. Never mix OBSERVED and PREDICTED data in the same output key without clear labelling.
4. Preserve the output schema when replacing a stage so the frontend does not break.
5. If a stage fails, return a graceful fallback value with a warning flag, not a crash.

## Definition of Done

- Each stage produces output in its documented format.
- Replaced demo stages have `is_model_demo: False` and documented real metrics.
- All 8 pipeline_stages entries are accurate descriptions of what actually happened.
