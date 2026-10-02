import React from 'react';
import './PipelineVisualizer.css';

interface Props {
  currentStage: number; // 0 to 8, 9 for complete
}

export const researchStages = [
  { id: 1, label: "Image Preprocessing", type: "OBSERVED", desc: "Computing Laplacian variance, sharpness, and CLAHE contrast" },
  { id: 2, label: "Script Identification", type: "PREDICTED", desc: "Classifying writing system family & reading direction" },
  { id: 3, label: "Glyph Segmentation", type: "OBSERVED", desc: "Extracting candidate glyph bounding boxes from contours" },
  { id: 4, label: "Sign Recognition", type: "PREDICTED", desc: "Ranking candidate signs against paleographical topologies" },
  { id: 5, label: "Corpus Matching", type: "CORPUS EVIDENCE", desc: "Querying sequences against indexed tablet databases" },
  { id: 6, label: "Context & Syntax Analysis", type: "INTERPRETATION", desc: "Analyzing header, commodity, and administrative formulas" },
  { id: 7, label: "Numerical Analysis", type: "OBSERVED", desc: "Identifying unit punch impressions and counting systems" },
  { id: 8, label: "Hypothesis Synthesis", type: "INTERPRETATION", desc: "Synthesizing evidence-based readings and uncertainty bounds" }
];

const PipelineVisualizer: React.FC<Props> = ({ currentStage }) => {
  const stage = Math.min(currentStage, 8);
  const progressPct = Math.round((stage / 8) * 100);
  const activeLabel = researchStages[Math.max(0, stage - 1)]?.label ?? '';

  return (
    <div className="glass-panel pipeline-panel fade-in">
      <div className="panel-corners" aria-hidden="true" />

      <div className="pipeline-header-row">
        <div className="pipeline-title-block">
          <h3>Pipeline Console</h3>
          <span className="pipeline-sub">8-stage computational epigraphy run</span>
        </div>
        <div className="pipeline-progress-block">
          <span className="pipeline-badge-live">STAGE {stage} / 8</span>
          <div className="pipeline-bar">
            <div className="pipeline-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      <div className="terminal-line">
        <span className="term-prompt">›</span>
        <span className="term-text">{activeLabel.toLowerCase()}…</span>
        <span className="term-caret">▌</span>
      </div>

      <div className="pipeline-steps-grid">
        {researchStages.map((s) => {
          const isActive = currentStage === s.id;
          const isPast = currentStage > s.id;

          return (
            <div key={s.id} className={`step-item-v2 ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}>
              <div className="step-indicator-v2">
                {isPast ? '✓' : `0${s.id}`}
              </div>
              <div className="step-content-v2">
                <div className="step-title-line">
                  <h4>{s.label}</h4>
                  <span className={`stage-type-tag ${s.type.toLowerCase().replace(/\s+/g, '-')}`}>
                    {s.type}
                  </span>
                </div>
                <p>{s.desc}</p>
                {isActive && (
                  <div className="loading-bar-v2">
                    <div className="loading-progress-v2"></div>
                  </div>
                )}
              </div>
              {isActive && <span className="live-dot" aria-hidden="true" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineVisualizer;
