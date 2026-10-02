---
name: typescript-interfaces
description: TypeScript interface definitions for Ancient Scripts AI — API response types, component props, and contract rules.
---

# TypeScript Interfaces — Ancient Scripts AI

## Purpose

Documents all TypeScript interfaces that define the shape of the backend API response and React component props. Acts as the authoritative frontend API contract. Changes to the backend response schema must be reflected here.

## When to Use

- When modifying the backend JSON response schema.
- When adding a new field to the API response.
- When adding a new React component with typed props.
- When debugging TypeScript compilation errors.

## Location

All API response interfaces live in: `frontend/src/components/ResultsDashboard.tsx`

## API Response Interfaces

These interfaces match the backend `pipeline.py` output exactly.

```typescript
export interface BoundingBox {
  left_pct: number;
  top_pct: number;
  width_pct: number;
  height_pct: number;
  raw_box: number[];  // [x, y, w, h] in absolute pixels
}

export interface GlyphData {
  glyph_id: number;
  bounding_box: BoundingBox;
  candidate_sign: string;
  unicode_symbol: string;
  label: string;
  sign_category: string;
  confidence_score: number;
  segmentation_quality: number;
  candidates: Array<{ sign_id: string; name: string; confidence: number }>;
  paleographic_notes: string;
}

export interface ImageQuality {
  dimensions: string;
  aspect_ratio: number;
  sharpness_laplacian_var: number;
  raw_contrast_std: number;
  enhanced_contrast_std: number;
  mean_brightness: number;
  quality_score: number;
  surface_visibility: string;
  damage_level: string;
  is_photometric_real: boolean;
}

export interface ScriptClassification {
  top_prediction: string;
  confidence: number;
  is_model_demo: boolean;
  model_architecture: string;
  alternatives: Array<{ script: string; confidence: number }>;
  estimated_period: string;
  provenance: string;
  reading_direction: string;
}

export interface CorpusEvidence {
  corpus_name: string;
  catalog_entries_indexed: number;
  strong_sequence_matches: Array<{
    sequence: string;
    tablet_references: string[];
    frequency_in_sample: number;
    syntactic_role: string;
  }>;
  metrological_pattern: {
    system_detected: string;
    numerical_tokens_observed: string;
    interpretation: string;
  };
}

export interface Hypothesis {
  rank: number;
  title: string;
  confidence: number;
  reconstructed_reading: string;
  supporting_evidence: string[];
  uncertainties_and_limitations: string[];
}

export interface PipelineStage {
  id: number;
  name: string;
  status: string;
  type: string;
  details: string;
}

export interface AnalysisResult {
  artifact_metadata: {
    inferred_script: string;
    period: string;
    provenance: string;
    reading_direction: string;
    medium: string;
  };
  level_1_observed: {
    image_quality: ImageQuality;
    detected_glyph_count: number;
    glyphs: GlyphData[];
  };
  level_2_predicted: {
    script_classification: ScriptClassification;
  };
  level_3_corpus_evidence: CorpusEvidence;
  level_4_interpretation: {
    context_analysis: {
      sequence_structure: string;
      possible_domains: string[];
      grammatical_assessment: string;
    };
    hypotheses: Hypothesis[];
  };
  pipeline_stages: PipelineStage[];
  research_report_markdown: string;
  scientific_disclaimer: string;
}
```

## Component Prop Interfaces

### `ImageUpload`
```typescript
interface ImageUploadProps {
  onSelectImage: (file: File) => void;
}
```

### `PipelineVisualizer`
```typescript
interface PipelineVisualizerProps {
  currentStage: number;  // 1–9
}
```

### `ResultsDashboard`
```typescript
interface ResultsDashboardProps {
  result: AnalysisResult;
}
```

## Rules

- All interfaces in `ResultsDashboard.tsx` are the source of truth for the API contract.
- When the backend schema changes, update both `pipeline.py` AND these interfaces.
- Use `export interface` for types used across files.
- Use `number` not `float` (TypeScript does not have a separate float type).
- Use `string[]` not `Array<string>` for simple array types.
- Use `import type { AnalysisResult }` in `App.tsx` (verbatimModuleSyntax is enabled in tsconfig).
- `raw_box: number[]` — avoid using a fixed-length tuple type unless TypeScript requires it.

## Adding a New Field to the API Response

1. Add the Python key to `pipeline.py`'s return dict.
2. Add the TypeScript field to the appropriate interface here.
3. Add the TypeScript field to the interface in `ResultsDashboard.tsx`.
4. Update the `api` skill with the new field in the response schema.

## Definition of Done

- `npm run build` completes with zero TypeScript errors.
- All new API response fields are typed.
- All component props are typed.
- No `any` type is used.
