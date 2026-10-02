---
name: results-dashboard
description: ResultsDashboard component guide for Ancient Scripts AI — 5-tab structure, data rendering, and extension rules.
---

# Results Dashboard — Ancient Scripts AI

## Purpose

Documents the `ResultsDashboard` React component — the main display for all analysis output after a successful pipeline run. Guides agents extending or modifying the results display.

## When to Use

- When modifying how results are displayed.
- When adding a new tab or section to the results view.
- When changing how confidence meters, evidence tables, or sign glyphs render.
- When adding new TypeScript interfaces for new backend fields.
- When debugging why results don't appear after analysis.

## Component Location

`frontend/src/components/ResultsDashboard.tsx`

## Rendering Trigger

`ResultsDashboard` only renders when **both** conditions are true in `App.tsx`:
```tsx
{result && analysisStage === 9 && (
  <ResultsDashboard result={result} />
)}
```

If `result` is null (fetch failed) or `analysisStage` is not 9 (timer hasn't completed), the component doesn't mount.

## 5-Tab Structure

The component renders 5 tabs:

| Tab Index | Tab Label | Content |
| :--- | :--- | :--- |
| 0 | Hypotheses | Ranked hypothesis cards with confidence meters |
| 1 | Sign Table | Table of detected glyphs with sign IDs, symbols, candidates |
| 2 | Corpus & Metrology | Sequence matches, tablet references, metrological pattern |
| 3 | Observed Metrics | Image quality metrics from Level 1 |
| 4 | Export Report | Full Markdown research report in `<pre>` block |

## Tab 0: Hypotheses

- Iterates over `result.level_4_interpretation.hypotheses`.
- For each hypothesis: shows rank badge, title, confidence meter, reconstructed reading, supporting evidence bullets, uncertainty bullets.
- Confidence meter uses colour coding: green > 50%, amber 20–50%, grey < 20%.
- Always shows uncertainty section below the supporting evidence.
- The script classification card at the top shows the "Demo ML Classifier" amber pill when `is_model_demo: true`.

## Tab 1: Sign Table

- Iterates over `result.level_1_observed.glyphs`.
- For each glyph: glyph_id, unicode_symbol, candidate_sign label, sign_category, confidence_score, and top 3 candidates.
- Confidence is shown as `(score × 100)%`.

## Tab 2: Corpus & Metrology

- Shows `result.level_3_corpus_evidence.corpus_name` and `catalog_entries_indexed`.
- Lists `strong_sequence_matches` with sequence identifiers, tablet references, and syntactic role.
- Shows metrological pattern: system name, observed tokens, interpretation.

## Tab 3: Observed Metrics

- Renders all fields from `result.level_1_observed.image_quality`.
- `is_photometric_real` badge displayed prominently.
- Shows: dimensions, aspect_ratio, sharpness_laplacian_var, raw_contrast_std, enhanced_contrast_std, mean_brightness, quality_score, surface_visibility, damage_level.

## Tab 4: Export Report

- Renders `result.research_report_markdown` in a `<pre>` block.
- Copy to Clipboard button using `navigator.clipboard.writeText()`.
- Provides the full publication-ready report text.

## Scientific Level Indicator Bar

At the top of `ResultsDashboard`, a four-chip status bar shows the four evidence levels. This must always be visible when results are shown. Do not remove it.

## Adding a New Tab

To add a tab (e.g., "Comparative Analysis"):

1. Add a new tab button to the tab navigation list.
2. Add the corresponding render block in the tab content section.
3. Type the new data using the TypeScript interface update pattern (see `typescript-interfaces` skill).
4. Ensure the tab content follows the Level naming convention (show which level of evidence it displays).
5. Never display a hypothesis-level output without uncertainty labels.

## Rules

- Every tab that shows hypothesis or prediction data must include the appropriate Level badge.
- The "Demo ML Classifier" amber pill must remain on the script classification display.
- Do not remove the four-chip scientific levels bar.
- Do not use inline styles for colours — use CSS classes.
- All new sections must be clearly labelled with their evidence level.

## Definition of Done

- All 5 tabs render correctly from real API data.
- Switching tabs does not re-fetch or re-run analysis.
- Hypotheses tab shows confidence meters correctly.
- Export tab produces copyable Markdown text.
- No TypeScript errors (`npm run build`).
