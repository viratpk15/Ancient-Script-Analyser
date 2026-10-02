---
name: hypotheses
description: Hypothesis generation guide for Ancient Scripts AI — structure, scientific rules, confidence scoring, and extension patterns.
---

# Hypotheses — Ancient Scripts AI

## Purpose

Documents the hypothesis generation component of the pipeline, the required structure of each hypothesis, the rules for writing hypothesis text, and how to extend or improve the hypothesis engine.

## When to Use

- When modifying the hypotheses list in `process_image()`.
- When writing new hypothesis text for additional script families.
- When building an automated hypothesis engine to replace the hardcoded list.
- When changing how hypotheses are displayed in `ResultsDashboard.tsx`.

## What a Hypothesis Is

In Ancient Scripts AI, a hypothesis is a **ranked, evidence-backed interpretive proposal** about the functional meaning or administrative context of the analysed inscription. Hypotheses are explicitly NOT translations. They are semantic and functional models derived from:
- Observed glyph positions and counts (Level 1).
- Predicted script family (Level 2).
- Corpus evidence and sequence matches (Level 3).
- Domain knowledge of administrative practices (Level 4).

## Current Implementation

Three hardcoded hypotheses are returned by `process_image()`:

| Rank | Title | Confidence |
| :--- | :--- | :--- |
| 1 | Administrative Authority & Livestock Allocation | 68.4% |
| 2 | Cultic / Temple Estate Allotment Ledger | 23.8% |
| 3 | Highland Outpost Tributary Dispatch | 7.8% |

These confidences are illustrative, not model-derived. They sum to approximately 100% (84.0%), representing that ranks 1–3 are not exhaustive and < 16% is unaccounted for by any current hypothesis.

## Hypothesis Data Structure

```python
{
    "rank": int,                    # 1 = most supported
    "title": str,                   # Short descriptive title
    "confidence": float,            # 0.0 – 1.0 (NOT from a model)
    "reconstructed_reading": str,   # Hedged semantic reading in quotes
    "supporting_evidence": [str],   # Bullet list of specific evidence points
    "uncertainties_and_limitations": [str]  # Bullet list of limitations
}
```

**All 6 fields are required.** A hypothesis without `supporting_evidence` or `uncertainties_and_limitations` violates the scientific integrity requirement.

## Writing Hypothesis Text

### Title
- Short, descriptive, noun-phrase format.
- Avoid certainty: "Possible Administrative Record of..." not "Administrative Record of...".

### Reconstructed Reading
- Use first-person possessive or institutional framing: "Belonging to...", "For the account of...".
- Use square brackets for unknowns: `[Title Holder]`, `[Deity Name]`, `[Toponym]`.
- Never use second or third-person address: "The king says..." is prohibited.
- Use approximate quantity language: "2 Major Units, 4 Sub-allotments" not "24 oxen".

### Supporting Evidence
- Each bullet should cite a specific observable fact, corpus match, or positional regularity.
- Format: "Observed [specific thing] at [specific position], consistent with [specific corpus reference or known pattern]."

### Uncertainties and Limitations
- Each bullet should name a specific reason the hypothesis could be wrong.
- Must include at least one limitation about the undeciphered nature of the script.
- Format: "Sign X shows [issue]. Alternative reading as [alternative] is possible."

## Confidence Scoring Rules

Until a real probabilistic model is built:
- Rank 1 confidence: 50–80%.
- Rank 2 confidence: 15–35%.
- Rank 3 confidence: 5–15%.
- Sum of all hypothesis confidences should not exceed ~95% (leaving room for unaccounted cases).
- Never claim confidence was computed by a model.
- Never inflate rank 1 to > 90% to appear definitive.

## Adding a New Hypothesis

To add a 4th hypothesis:

1. Add a new dict to the `hypotheses` list in `process_image()`.
2. Assign rank 4 and an appropriate confidence (< rank 3 confidence).
3. Write a title, reconstructed reading, at least 2 supporting evidence bullets, and at least 1 uncertainty bullet.
4. Verify that the sum of all confidences does not exceed 100%.
5. The `ResultsDashboard.tsx` hypothesis tab renders all hypotheses from the list dynamically, so no frontend changes are needed.

## Building a Real Hypothesis Engine

A real hypothesis engine would:
1. Receive the detected sign sequence and corpus matches.
2. Query a knowledge base of known administrative patterns.
3. Compute confidence scores using a probabilistic model (e.g., Bayesian network over sign co-occurrence probabilities).
4. Return a dynamically generated list of hypotheses, sorted by confidence.
5. Generate supporting evidence by tracing which corpus matches contributed to each hypothesis.
6. Generate uncertainties by identifying which expected signs are absent or ambiguous.

## Definition of Done

- All hypotheses have all 6 required fields.
- `supporting_evidence` has at least 2 bullet points.
- `uncertainties_and_limitations` has at least 1 bullet point.
- Reconstructed reading uses hedged language and square brackets.
- Hypotheses are sorted descending by confidence.
- Sum of all confidence values does not exceed 100%.
