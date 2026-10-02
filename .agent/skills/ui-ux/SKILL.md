---
name: ui-ux
description: UI/UX design language, principles, and interaction rules for Ancient Scripts AI.
---

# UI/UX — Ancient Scripts AI

## Purpose

Documents the design language, UX patterns, and interaction rules so that future agents produce UI changes consistent with the project's premium research-tool aesthetic and scientific clarity requirements.

## When to Use

- When modifying CSS files.
- When adding a new UI section or component.
- When changing how results are presented to the researcher.
- When adjusting layouts, colours, or animations.

## Design Language

The interface is designed for researchers. It must feel:
- **Premium and high-tech** — not like a generic SaaS dashboard.
- **Scientific and trustworthy** — not sensationalist or misleading.
- **Dark-mode focused** — researchers often work in low-light laboratory environments.
- **Archaeological in spirit** — the gold `#f0a500` accent evokes ancient artefacts and inscriptions.

## Design Tokens (from `index.css`)

| Variable | Value | Usage |
| :--- | :--- | :--- |
| `--color-bg-base` | `#0f1115` | Deepest background layer |
| `--color-bg-surface` | `#1a1d24` | Panel/card surface |
| `--color-primary` | `#f0a500` | Ancient Gold — primary accent |
| `--color-primary-glow` | `rgba(240,165,0,0.4)` | Glow effects on gold elements |
| `--color-accent` | `#3b82f6` | Science Blue — bounding boxes, active states |
| `--color-text-main` | `#f0f4f8` | Primary readable text |
| `--color-text-muted` | `#9ba1a6` | Labels, secondary info |
| `--font-family-main` | `'Inter', system-ui, sans-serif` | All text |

## Glassmorphism Pattern

Panels use the `.glass-panel` utility class:
- `background: rgba(26, 29, 36, 0.7)` with `backdrop-filter: blur(12px)`.
- `border: 1px solid rgba(255,255,255,0.05)`.
- `box-shadow: 0 8px 32px 0 rgba(0,0,0,0.37)`.
- Apply `glass-panel` to any new card or section panel.

## UX Flows

### 1. Image Upload
- Researcher sees a centred drag-and-drop zone.
- On hover: visual feedback (border glow).
- On drop or file select: image preview appears immediately with filename, size, and dimensions shown below the image.
- Do not navigate away or reload on file select.

### 2. Image Preview
- Image is shown at full available width inside a dark container.
- Bounding boxes overlay the image as absolute-positioned divs using percentages.
- A toggle checkbox shows/hides bounding boxes without re-running analysis.
- A blue laser scanner line animates over the image during stages 1–8.

### 3. Start Analysis
- The "Start Epigraphic Analysis" button uses `.btn-primary` (gold, glowing).
- While `isAnalyzing`, the button text changes to `Analyzing (Stage X/8)...` and is disabled.
- After completion (stage 9), the button reads "Analysis Complete" and is disabled.
- An "Upload Different Image" secondary button is always available.

### 4. Pipeline Progress
- `PipelineVisualizer` shows 8 stages in a vertical list.
- Each stage has a coloured type badge:
  - `OBSERVED` → blue
  - `PREDICTED` → amber
  - `CORPUS EVIDENCE` → purple
  - `INTERPRETATION` → pink
- Active stage has a blue animated loading bar.
- Past stages show a green checkmark.

### 5. Results Dashboard
- Five tabs clearly separate different types of analytical output.
- A four-chip status bar at the top always reminds the researcher which evidence level they are reading.
- The "Demo ML Classifier" amber pill badge appears next to the script name whenever `is_model_demo: true`.

### 6. Confidence Display
- Confidence values appear as percentage meters.
- Green gradient for > 50%. Amber for 20–50%. Grey for < 20%.
- Never display a confidence value without also displaying the uncertainty/limitations section.

### 7. Errors
- Currently shown with `alert()`. In future work: replace with an inline error card inside the right panel.
- Error messages must tell the researcher what to check (e.g., "Backend not running at http://localhost:8000").

### 8. Scientific Level Clarity

**This is mandatory.** The UI must ALWAYS make clear which evidence level is being displayed. Never make an INTERPRETATION look like an OBSERVATION.

Pattern to follow:
- Use `level-disclaimer-card` at the top of each tab.
- Use the four `sc-chip` badges in `scientific-levels-bar`.
- Label demo results with the `demo-indicator-pill` badge.

## Do

- Use the existing CSS variables for all colours.
- Apply `.glass-panel` to all new cards.
- Add `fade-in` animation class to new sections that appear after analysis.
- Keep the four-chip taxonomy visible wherever results are shown.
- Test responsiveness at 1024px breakpoint (single column) and 1440px (two columns).

## Do Not

- Do not use Tailwind or any CSS framework.
- Do not use bright white backgrounds.
- Do not display hypothesis text without also showing the limitations/uncertainties.
- Do not remove or hide the `demo-indicator-pill` from the script classification header.
- Do not add inline styles except for dynamic computed values.
- Do not make the interface look like a chat assistant or a definitive translation tool.

## Definition of Done

- New UI renders correctly in dark mode with correct design tokens.
- Scientific level indicators are visible for any displayed analysis output.
- Demo labels are visible wherever demo data is shown.
- The interface is responsive at 1024px and 1440px widths.
- TypeScript compiles without errors after CSS class usage.
