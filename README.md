# Ancient Script Analyser (Computational Epigraphy AI)

A multi-stage AI research assistant for ancient script analysis, grapheme segmentation, and computational decipherment triage—tailored for early writing systems such as **Proto-Elamite** (c. 3100–2900 BCE).

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![OpenCV](https://img.shields.io/badge/OpenCV-Python-5C3EE8.svg?logo=opencv&logoColor=white)](https://opencv.org)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)

---

## 🏛️ Overview

Deciphering ancient, unvocalized, or fragmentary inscriptions on clay tablets requires rigorous separation between **physical measurements** and **interpretive hypotheses**. 

**Ancient Script Analyser** provides an end-to-end computational pipeline that:
1. Performs real photometric and optical quality checks on tablet scans.
2. Extracts candidate glyph bounding boxes using adaptive morphological contour analysis.
3. Classifies grapheme stroke topologies using an 8-parameter shape descriptor.
4. Cross-references detected sequences with cataloged epigraphic corpora and metrological sign systems.
5. Synthesizes ranked, evidence-weighted research hypotheses with explicit limitations and uncertainties.
6. Exports structured research reports in Markdown for academic peer review.

---

## 🔬 Four-Level Scientific Evidence Framework

To prevent AI hallucination and uphold scientific integrity in epigraphic scholarship, all outputs are categorized strictly into four epistemic tiers:

| Tier | Name | Nature | Implementation |
| :--- | :--- | :--- | :--- |
| **Level 1** | **OBSERVED** | Empirical, physically measured data from the image raster | Resolution, aspect ratio, Laplacian variance (sharpness), contrast standard deviations, and OpenCV contour bounding boxes. |
| **Level 2** | **PREDICTED** | Statistical / heuristic classifications | Script-family classifier (heuristic prior calibrated against input image reliability) and 8-feature stroke topology sign matching. |
| **Level 3** | **CORPUS EVIDENCE** | Empirical historical tablet attestations | Matches from local indexed sign catalog (MDP reference corpus subset), attested syntax patterns, and metrological tokens. |
| **Level 4** | **INTERPRETATION** | Epigraphic hypotheses & semantic readings | Ranked structural interpretations with explicit supporting evidence and documented philological uncertainties. |

---

## ⚙️ 8-Stage Research Pipeline

```
1. Image Normalization & Preprocessing (CLAHE, Gaussian Filtering, Laplacian Variance)
                       ↓
2. Script Family Identification (Proto-Elamite vs Proto-Cuneiform vs Linear Elamite)
                       ↓
3. Glyph Candidate Segmentation (Adaptive Thresholding & External Contour Extraction)
                       ↓
4. Sign Topology Recognition (8-feature visual shape matching against sign catalog)
                       ↓
5. Corpus Matching & Sequence Retrieval (Attestation lookup in reference corpus)
                       ↓
6. Contextual & Syntactic Analysis (Header authority → Commodity → Metrology structure)
                       ↓
7. Numerical / Metrological Token Parsing (System B / Decimal numerical punch marks)
                       ↓
8. Hypothesis Synthesis & Research Report (Ranked readings + Markdown export)
```

---

## 🛠️ Project Structure

```
.
├── backend/
│   ├── main.py              # FastAPI endpoints (/analyze, /) & CORS configuration
│   ├── pipeline.py          # 8-stage epigraphic computer vision & analysis pipeline
│   ├── requirements.txt     # Python dependencies (FastAPI, OpenCV headless, NumPy, etc.)
├── frontend/
│   ├── index.html           # Single-page web application entrypoint
│   ├── package.json         # React 19, TypeScript, Vite scripts and dependencies
│   ├── vite.config.ts       # Vite build & dev-server configuration
│   └── src/
│       ├── App.tsx          # Root application layout & state machine
│       ├── components/
│       │   ├── ImageUpload.tsx        # Drag-and-drop file upload, URL import & preview
│       │   ├── PipelineVisualizer.tsx # Interactive 8-stage pipeline status display
│       │   └── ResultsDashboard.tsx   # 5-tab research dashboard & markdown exporter
│       └── assets/          # Static icons and assets
├── assets/                  # Documentation and sample imagery
├── .agent/skills/           # Deep domain and architecture specifications
└── .gitignore               # Ignored build, cache, and virtual environment artifacts
```

---

## 🚀 Getting Started

### Prerequisites
- **Python**: 3.10+ (Python 3.12 recommended)
- **Node.js**: 18+ (Node 20+ recommended)
- **npm** or **pnpm**

---

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate    # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`. Interactive OpenAPI documentation can be inspected at `http://localhost:8000/docs`.

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Open `http://localhost:5173` in your browser.

To verify a production build:
```bash
npm run build
```

---

## 📊 API Reference

### `POST /analyze`
Accepts either `multipart/form-data` with an image file (`file`) or `application/x-www-form-urlencoded` with an image URL (`url`).

**Response Schema Highlights:**
```json
{
  "artifact_metadata": {
    "inferred_script": "Proto-Elamite",
    "period": "Early Bronze Age (c. 3100 – 2900 BCE)",
    "provenance": "Susa IIIb / Tepe Sialk / Tepe Yahya (Iranian Plateau)",
    "reading_direction": "Right-to-Left (Horizontal boustrophedon)"
  },
  "level_1_observed": {
    "image_quality": {
      "dimensions": "1024 x 768 px",
      "sharpness_laplacian_var": 142.5,
      "raw_contrast_std": 48.2,
      "quality_score": 0.88
    },
    "detected_glyph_count": 9,
    "glyphs": [ ... ]
  },
  "level_2_predicted": { ... },
  "level_3_corpus_evidence": { ... },
  "level_4_interpretation": { ... },
  "reliability": {
    "score": 0.82,
    "verdict": "High — results are dependable for research triage",
    "recommendations": [ ... ]
  },
  "pipeline_stages": [ ... ],
  "research_report_markdown": "..."
}
```

---

## 📜 Scientific Disclaimer

> **Important Note for Epigraphers and Historians:**  
> Proto-Elamite remains an **undeciphered script**. The hypotheses and reconstructed readings generated by this tool reflect computational structural-functional models, not deciphered spoken-language translations. All demonstration and heuristic values are explicitly identified in the output.

---

## 📄 License

This research prototype is developed for open academic inquiry and computational epigraphy experimentation. Distributed under the MIT License.
