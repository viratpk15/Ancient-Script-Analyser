---
name: proto-elamite
description: Domain knowledge for Proto-Elamite — the primary script in Ancient Scripts AI. Covers writing system characteristics, sign system, undeciphered status, and research context.
---

# Proto-Elamite — Ancient Scripts AI

## Purpose

Provides authoritative domain knowledge about Proto-Elamite — the primary ancient writing system supported by the current prototype — so future agents write accurate, respectful, scientifically sound content about this script.

## When to Use

- When writing or reviewing hypothesis text about Proto-Elamite tablets.
- When modifying the `LOCAL_SIGN_CORPUS` entries.
- When adding new sign descriptions or catalog entries.
- When reviewing the research report text for scientific accuracy.

## What is Proto-Elamite?

**Proto-Elamite** is an ancient writing system used in the Iranian Plateau primarily during the Early Bronze Age, approximately **3100–2900 BCE**. It was the first known large-scale writing system in the ancient Iranian world.

Key facts:

| Attribute | Value |
| :--- | :--- |
| Approximate date | 3100–2900 BCE |
| Region | Iranian Plateau (Susa, Tepe Sialk, Tepe Yahya, Shahr-i Sokhta, etc.) |
| Number of signs | ~1,000+ graphemes in known repertoire |
| Decipherment status | **UNDECIPHERED** |
| Underlying language | Unknown |
| Closest relative | Proto-Cuneiform (Archaic Sumerian) — contemporary and geographically adjacent |
| Primary function | Administrative accounting — rationing, commodities, personnel, livestock |
| Reading direction | Generally right-to-left; boustrophedon in some tablets |
| Medium | Unbaked clay tablets with incised stylus marks and punched numerical impressions |

## Decipherment Status

**Proto-Elamite is undeciphered.** This is the single most important fact for every agent working on this project.

This means:
- The phonetic values of signs are **unknown**.
- The grammatical structure of the language is **unknown**.
- Signs can be assigned functional/semantic roles based on administrative context, but not syllabic or phonetic readings.
- Modern researchers (Dahl, Englund, Nissen, and others) have made substantial progress in understanding the administrative system, but the underlying spoken language remains a mystery.

## What IS Known (Functional Understanding)

Despite being undeciphered, researchers understand much about Proto-Elamite's administrative function:

- Tablets are almost exclusively **administrative accounting records** (rationing, livestock counts, grain distribution, personnel lists).
- The sign system includes **logograms** (word signs representing commodities, titles, institutions) and **numerical punch marks** (representing quantities).
- Signs appear in consistent **positional patterns**: header section (authority, institution), body section (commodities, amounts), and terminal section (totals, notations).
- Numerical signs are fairly well understood (N01 = major unit, N14 = fractional unit in decimal and bisexagesimal metrological systems).
- The **Moussaieff sign list** (MDP catalogue) provides identifier numbers for ~1,000 known sign types.

## The MDP Catalogue (M-Numbers and N-Numbers)

The Mémoires de la Délégation en Perse (MDP) publications provide the primary sign catalogue:
- **M-numbers** (M001, M218, etc.) identify logographic, semantic, and administrative signs.
- **N-numbers** (N01, N14, etc.) identify numerical punch marks.

The current `LOCAL_SIGN_CORPUS` uses 9 entries from this system:
- **M001_A**: Star/rosette motif — honorific or divine classifier.
- **M218**: Stepped podium contour — high administrative institution.
- **M388**: Anthropomorphic title sign — sovereign/executive office.
- **M056_f**: Crosshatch grid — granary/commodity domain.
- **M157**: Bovid head — livestock.
- **M004_c**: Triple horizontal ligature — transaction operator.
- **M096**: Mountain sign — highland geographical determinative.
- **N01**: Spherical punch — major count unit.
- **N14**: Crescent impression — fractional sub-unit.

## Key Archaeological Sites

| Site | Modern Location | Significance |
| :--- | :--- | :--- |
| Susa (ancient Shush) | SW Iran | Largest Proto-Elamite archive; MDP excavations |
| Tepe Sialk | Central Iran | Important Proto-Elamite corpus |
| Tepe Yahya | SE Iran | Trade network tablets |
| Shahr-i Sokhta | SE Iran (Helmand) | Peripheral Proto-Elamite |

## Reference Publications in the Current Prototype

The pipeline references these real publications:
- **MDP 6**: Mémoires de la Délégation en Perse, vol. 6 (Susa tablets).
- **MDP 17**: Mémoires de la Délégation en Perse, vol. 17 (Susa tablets).
- **MDP 26**: Mémoires de la Délégation en Perse, vol. 26.
- **T-Y 14**: Tepe Yahya IVC tablet reference.
- **Sialk IV-12**: Tepe Sialk level IV tablet reference.

These are real published sources. The matching logic in the current prototype is demo only, but the citations are real.

## Rules for Writing Proto-Elamite Content

- Never write "translation" — write "functional hypothesis" or "semantic reading".
- Never claim to know the phonetic pronunciation of any sign.
- Always qualify administrative readings: "consistent with administrative ledger patterns", not "this is an administrative ledger".
- Always mention the undeciphered status in any user-facing content.
- Use the MDP identifier format (M001_A, not "Sign 1").
- When adding new sign entries, verify the M-number against published MDP sign lists.

## Definition of Done

- All Proto-Elamite content uses correct MDP identifiers.
- No phonetic pronunciation is claimed.
- The undeciphered status is stated wherever Proto-Elamite is described.
- Hypothesis readings use hedged language appropriate for an undeciphered script.
