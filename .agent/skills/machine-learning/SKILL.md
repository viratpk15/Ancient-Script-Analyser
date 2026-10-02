---
name: machine-learning
description: ML integration guide for Ancient Scripts AI — dataset, training, inference, model versioning, and scientific integrity rules.
---

# Machine Learning — Ancient Scripts AI

## Purpose

Guides future agents integrating or improving machine learning components. Enforces strict scientific integrity so that no fabricated metrics, confidence scores, or training claims appear in the codebase.

## When to Use

- When integrating a real trained model (script classifier, sign recogniser, segmentation model).
- When adding model inference to the pipeline.
- When reporting model metrics or confidence scores.
- When managing model files or versions.

## Current ML Status

**There are currently NO trained ML models in this project.**

The current prototype uses:
- Hardcoded script classification (always returns "Proto-Elamite", confidence 0.892, labelled `is_model_demo: True`).
- Index-based sign assignment (wraps `idx % 9` into the local catalog — not a model).
- Hardcoded confidence scores (0.88, 0.76, 0.94 — not from any model).
- Hardcoded hypothesis confidence values (0.684, 0.238, 0.078 — not from any model).

All demo values are explicitly labelled in the pipeline output via `is_model_demo: True` and `type: "PREDICTED (DEMO)"`.

## Planned ML Components (Future Phases)

| Component | Planned Approach | Status |
| :--- | :--- | :--- |
| Script family classifier | ResNet-101 or ViT fine-tuned on epigraphic datasets | ❌ Not implemented |
| Glyph segmentation | YOLOv8 or Segment Anything Model (SAM) | ❌ Not implemented |
| Sign recognition | Metric learning (ArcFace/SimCLR) with sign embedding database | ❌ Not implemented |
| Sequence context model | GNN or transformer over sign graphs | ❌ Not implemented |

## Rules for Integrating Real Models

### Training
- Document dataset name, version, and size.
- Document train/validation/test split.
- Document preprocessing applied to training images.
- Never claim training was performed without actual training code and checkpoints.

### Metrics
- Only report metrics computed from a held-out **test set**, not the training set.
- Report: Accuracy, Precision, Recall, F1, and Confidence calibration.
- Never fabricate any numeric metric.
- Never report metrics from the training set as model performance.

### Confidence Scores
- When a real model is integrated, replace hardcoded confidence values with actual softmax or sigmoid outputs.
- Calibrate confidence outputs — raw softmax values are often overconfident.
- If confidence calibration has not been performed, state this explicitly.

### Model Files
- Store model weights in a dedicated `backend/models/` directory (not in `pipeline.py`).
- Version model files: `script_classifier_v1.0.onnx`.
- Never commit large binary model files to git without using Git LFS.
- Document model architecture, input shape, output schema, and licence in a `backend/models/README.md`.

### Inference in `pipeline.py`
- Load the model once at module level (not inside `process_image()`) to avoid repeated loading overhead.
- Wrap inference in try/except so model failures return a graceful error, not a crash.
- Keep the output schema consistent with the existing response structure.
- Label the stage `type: "PREDICTED"` (not `"PREDICTED (DEMO)"`) only when a real model is used.

## Replacing the Demo Script Classifier

When a real classifier is ready:

1. Load it at module level in `pipeline.py`.
2. Replace the hardcoded `script_classification` dict in `process_image()`.
3. Set `"is_model_demo": False`.
4. Set `"model_architecture"` to the real architecture name and version.
5. Compute `"confidence"` from the real softmax output.
6. Update the `pipeline_stages[1]` details string with real metrics.

## Do Not

- Never hard-code accuracy claims such as "99.4% accuracy" unless computed on a real test set.
- Never claim a model was trained on a dataset unless training code and checkpoints exist.
- Never use placeholder confidence values and call them "model predictions".
- Never store API keys or data licences in source code.

## Definition of Done

- A real ML model is integrated only when: a trained checkpoint exists, test-set metrics are documented, and `is_model_demo` is set to `False`.
- All model code is version-tracked (weights via Git LFS if large).
- The `pipeline_stages` list correctly reflects the model type and version.
