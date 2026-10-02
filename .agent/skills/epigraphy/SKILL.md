---
name: epigraphy
description: Epigraphic domain knowledge for Ancient Scripts AI — terminology, sign systems, and scientific interpretation rules.
---

# Epigraphy — Ancient Scripts AI

## Purpose

Provides domain-specific knowledge about ancient scripts and epigraphy so future agents avoid misrepresenting findings, use correct terminology, and handle undeciphered scripts appropriately.

## When to Use

- When writing or modifying hypothesis text, sign labels, or corpus descriptions.
- When adding new scripts or sign systems to the pipeline.
- When writing documentation that describes analysis output.
- When generating or modifying the research report.

## Key Terminology

| Term | Definition |
| :--- | :--- |
| **Glyph** | A single visible mark or stroke group on the surface of an artefact. A physical observation. |
| **Candidate glyph** | A contour region the segmentation algorithm identified as a potential sign location. Not yet identified. |
| **Sign** | A specific grapheme in a writing system catalogue (e.g., MDP catalogue for Proto-Elamite). |
| **Sign variant** | A morphologically related alternative form of the same sign (e.g., `M001_A`, `M001_A_var`). |
| **Sign sequence** | An ordered series of signs on a tablet, read in the documented direction. |
| **Corpus match** | A sequence or pattern that appears in the reference corpus with documented frequency. |
| **Semantic interpretation** | An assignment of functional meaning to a sign or sequence (e.g., "administrative allocation"). |
| **Phonetic reading** | Assignment of a spoken sound value to a sign. Currently IMPOSSIBLE for Proto-Elamite. |
| **Translation** | A conversion of written text to another language including phonetics. Currently IMPOSSIBLE for Proto-Elamite. |
| **Logogram** | A sign representing a word or concept, not a sound. Common in Proto-Elamite. |
| **Metrological sign** | A sign representing a numerical quantity or measurement unit. |
| **Determinative** | A sign that classifies the semantic category of adjacent signs (e.g., a divine determinative). |
| **Boustrophedon** | Writing that alternates direction line by line, like an ox ploughing a field. |
| **MDP catalogue** | Mémoires de la Délégation en Perse — the primary sign-list reference for Proto-Elamite (M-numbers). |

## The Interpretation Chain

Agents must always follow this chain and never skip levels:

```
Physical Image
    ↓
Observed glyph candidate (contour region) — LEVEL 1
    ↓
Candidate sign identification (model or catalog match) — LEVEL 2
    ↓
Corpus evidence (does this sign / sequence appear elsewhere?) — LEVEL 3
    ↓
Contextual analysis (what are the surrounding signs? what domain?) — LEVEL 3 / LEVEL 4
    ↓
Semantic hypothesis (functional meaning, administrative role) — LEVEL 4
    ↓
NEVER: Phonetic translation (not possible for Proto-Elamite)
```

## Proto-Elamite — Special Rules

Proto-Elamite is the **primary script currently supported** by the prototype.

**Critical facts:**
- Proto-Elamite is **undeciphered**. No one has determined the underlying spoken language.
- Readings such as "King/Ruler" or "Deity" are **functional/semantic hypotheses** based on administrative context, not phonetic decipherments.
- The MDP sign catalogue (M-numbers, N-numbers) provides sign identifiers, not pronunciations.
- Numerical signs (N01, N14) are understood as counting tokens, but their exact metrological value is context-dependent and debated.
- The corpus references in the current prototype (MDP 6, MDP 17, Tepe Yahya IVC) are real published sources, but the specific matches shown are demo approximations, not verified database queries.

**Prohibited statements:**
- "Proto-Elamite says..."
- "This translates to..."
- "The text reads..." (unless explicitly qualified as a hypothesis)
- "Definitively identified as..."

**Allowed statements:**
- "Sign M388 is consistent with..."
- "The sequence resembles administrative ledger patterns in..."
- "Based on positional evidence, a possible functional reading is..."
- "This hypothesis has a confidence of X%, derived from Y evidence points."

## Sign Notation

The current prototype uses the following sign notation from `LOCAL_SIGN_CORPUS`:

| Sign ID | Category | Typical Position |
| :--- | :--- | :--- |
| M001_A | Logogram / Honorific | Header-initial |
| M218 | Administrative Estate | Header-medial |
| M388 | Titulary Sign | Header-final |
| M056_f | Storehouse Allotment | Body-initial |
| M157 | Ration Commodity | Body-medial |
| M004_c | Administrative Verb | Pre-numerical |
| M096 | Geographic Marker | Pre-numerical |
| N01 | Numerical Punch | Tablet-terminal |
| N14 | Fractional Token | Tablet-terminal |

## Extending to Other Scripts

When adding support for a new script (e.g., Linear Elamite, Proto-Cuneiform, Indus Valley):

1. Add a new key to `LOCAL_SIGN_CORPUS` with sign entries matching that script's catalogue.
2. Document the source of the sign catalogue.
3. Note whether the script is deciphered, partially deciphered, or undeciphered.
4. If partially deciphered, note which signs have accepted phonetic values.
5. Do not apply Proto-Elamite hypothesis templates to other scripts without review.

## Definition of Done

- All new sign labels and readings are qualified as hypotheses, not facts.
- No phonetic translation is claimed for undeciphered scripts.
- Corpus references cite real published sources or are clearly marked as demo.
- The 4-level interpretation chain is followed for all new hypothesis content.
