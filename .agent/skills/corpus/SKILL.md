---
name: corpus
description: Corpus data management guide for Ancient Scripts AI — what is in the current corpus, how to extend it, and integrity rules.
---

# Corpus — Ancient Scripts AI

## Purpose

Documents the current corpus implementation, its limitations, and the rules for managing corpus data. Prevents agents from inventing corpus records or misrepresenting the coverage of the reference database.

## When to Use

- When modifying `LOCAL_SIGN_CORPUS` in `pipeline.py`.
- When replacing the local demo corpus with a real database.
- When adding new sign entries or sequence patterns.
- When writing text that refers to "corpus matches" or "indexed tablets".

## Current Corpus State

The current corpus is a **local hardcoded Python dictionary** in `backend/pipeline.py`.

```python
LOCAL_SIGN_CORPUS = {
    "Proto-Elamite": [9 sign entries]
}
```

**Coverage:** 9 Proto-Elamite sign entries. No other scripts are indexed.  
**Storage:** In-memory Python dict. No database, no file, no external service.  
**Search:** Index wrapping (`idx % 9`) — NOT a real search algorithm.  
**Sequence matches:** 2 hardcoded multi-sign patterns in `corpus_evidence` in `process_image()`.  
**References:** MDP 6 214, MDP 17 112, T-Y 14, MDP 17 85, MDP 26 381, Sialk IV-12 are cited as real published sources, but the matching is demo logic, not verified database queries.

## Sign Entry Schema

Each entry in `LOCAL_SIGN_CORPUS["Proto-Elamite"]` has:

```python
{
    "sign_id": str,          # MDP catalogue identifier (e.g., "M001_A")
    "symbol": str,           # Unicode representation
    "name": str,             # Human-readable name
    "category": str,         # Functional category
    "freq_in_corpus": int,   # Demo frequency count (not from real statistics)
    "typical_position": str, # Where the sign typically appears on a tablet
    "description": str       # Paleographic description
}
```

**Note:** `freq_in_corpus` values are illustrative estimates, not computed from a real corpus.

## Corpus Integrity Rules

1. **Never invent sign IDs.** All sign identifiers must come from a published catalogue (e.g., MDP for Proto-Elamite, CDLI for cuneiform).
2. **Never invent artifact references.** Tablet references (e.g., "MDP 6, 214") must be real published sources or clearly marked as demo.
3. **Never claim a match was found** in the corpus without evidence that the matching logic actually retrieved it from data.
4. **Never report `freq_in_corpus` values** as statistically derived unless computed from real corpus data.
5. **Never claim thousands of tablets were searched** when only 9 entries exist.
6. **Always state the corpus name and size** in the response (`corpus_name`, `catalog_entries_indexed`).

## Upgrading to a Real Corpus

When replacing the local dict with a real epigraphic database:

1. Create a `backend/corpus/` module with a database access layer (SQLite, PostgreSQL, or a vector store like FAISS/Milvus).
2. Each record should contain: Artifact ID, Provenance, Date range, Sign sequence (array), Sign identifiers, Source publication, Image source URL, Citation, Confidence/quality metadata.
3. Implement a `search_sequence(sign_ids: List[str]) -> List[Match]` function.
4. Replace the hardcoded `corpus_evidence` in `process_image()` with calls to this function.
5. Update `catalog_entries_indexed` to reflect the actual database count.
6. Update the `type` in `pipeline_stages[4]` from `"CORPUS EVIDENCE"` (which it already is) to note the real database name.
7. Update `corpus_name` in the response to reflect the real database name and version.

## Recommended Real Corpus Sources

| Source | Content | URL |
| :--- | :--- | :--- |
| CDLI (Cuneiform Digital Library Initiative) | Cuneiform tablets | cdli.ucla.edu |
| MDP publications | Proto-Elamite tablets from Susa | Published volumes |
| DASI (Digital Archive for the Study of pre-Islamic Arabia) | Arabian epigraphy | dasi.cnr.it |
| Indus Script | IVC corpus | Various |

**Note:** Always verify data licences before incorporating corpus data.

## Definition of Done

- All corpus entries have a documented source.
- `catalog_entries_indexed` matches the actual number of entries available.
- `corpus_name` accurately describes the database being queried.
- No corpus references are invented.
- Demo corpus data is labelled `"Local Demonstration ... Corpus"`.
