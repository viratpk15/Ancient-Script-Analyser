---
name: scientific-integrity
description: Scientific integrity framework for Ancient Scripts AI — the mandatory 4-level taxonomy and all labelling rules.
---

# Scientific Integrity — Ancient Scripts AI

## Purpose

This is the most important skill in the project. It defines the mandatory 4-level taxonomy that governs ALL output produced by Ancient Scripts AI. No analysis output may be presented to a researcher without following this taxonomy.

## When to Use

- ALWAYS. Read this skill before making any change to analysis output, pipeline results, or research reports.
- When writing or modifying hypothesis text.
- When adding new result fields to the pipeline.
- When displaying results in the UI.
- When writing the research report markdown.
- When documenting the project to external audiences.

## The Core Problem

Ancient scripts research involves deep uncertainty. A computer system that presents fabricated confidence scores or unqualified machine output as scientific findings can mislead researchers and cause real harm to the field of epigraphy. This platform MUST NOT do this.

## The 4-Level Taxonomy (MANDATORY)

Every piece of output produced by the pipeline must be assigned to exactly one of these four levels.

### Level 1: OBSERVED
**What it means:** Directly measured from the image pixels using deterministic algorithms.  
**Who computes it:** Real OpenCV functions in `analyze_image_quality()` and `segment_glyph_regions()`.  
**Examples:**
- Image dimensions (width × height).
- Laplacian variance (sharpness).
- Grayscale standard deviation (contrast).
- CLAHE enhanced contrast.
- Mean pixel brightness.
- Bounding box coordinates of detected contour regions.

**Rules:**
- Level 1 values are marked `is_photometric_real: True` in the response.
- Level 1 values may be stated without qualification in the research report.
- However: quality classification labels (e.g., "High (Clean Inscription Boundaries)") are interpretive thresholds applied to observed values, not pure observations. They should be presented as assessments, not measurements.

### Level 2: PREDICTED (DEMO in current implementation)
**What it means:** Output of a machine-learning model or classification heuristic.  
**Who computes it:** Currently, hardcoded heuristic logic in `process_image()`. In future phases, real trained models.  
**Examples:**
- Script family classification (currently always returns "Proto-Elamite").
- Softmax confidence score (currently hardcoded at 0.892).
- Alternative script rankings.
- Sign candidate recognition (currently index-based catalog lookup).
- Per-glyph confidence scores (currently hardcoded at 0.88, 0.76, 0.94).

**Rules:**
- Current implementation: ALL Level 2 outputs MUST be labelled `is_model_demo: True` in the JSON response.
- The `model_architecture` field must accurately describe what is computing the result.
- The UI must display the "Demo ML Classifier" badge on all Level 2 outputs.
- When a real model is integrated: `is_model_demo` → `False`, model architecture updated, metrics documented.
- NEVER present hardcoded values as model-derived statistics.

### Level 3: CORPUS EVIDENCE
**What it means:** Information retrieved by matching observed signs or sequences against a reference corpus of known documented tablets.  
**Who computes it:** Currently, hardcoded `corpus_evidence` dict in `process_image()`. Future: real database query.  
**Examples:**
- Sequence match ("M001_A + M218 + M388 appears in 12 documented tablets").
- Tablet references (MDP 6 214, MDP 17 112, etc.).
- Sign frequency in corpus.
- Metrological system identification.

**Rules:**
- Corpus matches must reference real published sources OR be explicitly labelled as demonstration data.
- The current corpus name includes "Demonstration" to signal this: `"Local Demonstration Proto-Elamite Sign Corpus (MDP Reference Subset)"`.
- `catalog_entries_indexed` must reflect the actual database size (currently: 9).
- NEVER claim matches from thousands of tablets when only 9 entries are indexed.
- Tablet reference identifiers (MDP 6 214, Tepe Yahya IVC, etc.) are real published works; cite them accurately.

### Level 4: INTERPRETATION
**What it means:** Scientific hypotheses derived from the combination of observed data, predicted classifications, and corpus evidence.  
**Who computes it:** Currently, hardcoded `hypotheses` list in `process_image()`. Future: hypothesis engine.  
**Examples:**
- "Administrative Authority & Livestock Allocation" (rank 1, confidence 68.4%).
- "Cultic / Temple Estate Allotment Ledger" (rank 2, confidence 23.8%).
- "Highland Outpost Tributary Dispatch" (rank 3, confidence 7.8%).

**Rules:**
- EVERY hypothesis MUST include `supporting_evidence` (list of specific evidence points) AND `uncertainties_and_limitations` (list of stated limitations).
- Confidence values for hypotheses are NOT from a model. They are researcher-assigned or algorithm-estimated plausibility scores. This must be stated in any documentation.
- Proto-Elamite interpretations MUST NOT claim phonetic pronunciation. They MUST be presented as functional/semantic models.
- The reconstructed reading must use hedged language: "Belonging to..." not "This says...".
- Hypotheses must be ranked by descending confidence. Rank 1 is the most supported.

## Prohibited Statements

Never write any of these anywhere in the codebase (code, comments, documentation, UI text):

- "Translation: ..."
- "This text reads: ..."
- "Definitively identified as ..."
- "The AI has determined ..."
- "Accuracy: 99.4%"
- "Our model was trained on X tablets" (unless training actually occurred)
- "Confidence: X%" without disclosing whether the confidence is from a real model or a heuristic

## Required Labels in the UI

| Output | Required Label |
| :--- | :--- |
| Script classification | "Demo ML Classifier" amber pill badge |
| Image metrics | "Level 1 — Directly Observed" chip |
| Script prediction | "Level 2 — ML Predicted" chip |
| Corpus matches | "Level 3 — Corpus Evidence" chip |
| Hypotheses | "Level 4 — Interpretation" chip |
| Hypothesis text | Must be preceded by evidence list and followed by uncertainties |

## The Scientific Disclaimer

Every API response contains a `scientific_disclaimer` field. This text must never be removed. It must be shown to users before they interpret results. The current text:

> "NOTICE: This report is generated by a research assistance prototype. Level 1 values are directly computed from the image raster. Level 2 & 4 classifications are model predictions / heuristics clearly labeled as demonstration results. All linguistic interpretations represent hypothetical semantic models."

## Definition of Done

- Every new output field is assigned to exactly one of the 4 levels.
- Demo values are labelled `is_model_demo: True` or equivalent.
- Every hypothesis has both `supporting_evidence` and `uncertainties_and_limitations`.
- No phonetic translation is claimed for undeciphered scripts.
- The scientific disclaimer is present in every API response.
