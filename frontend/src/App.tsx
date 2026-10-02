import { useState } from 'react';
import './App.css';
import ImageUpload from './components/ImageUpload.tsx';
import PipelineVisualizer from './components/PipelineVisualizer.tsx';
import ResultsDashboard from './components/ResultsDashboard.tsx';
import type { AnalysisResult } from './components/ResultsDashboard.tsx';

interface ImageMeta {
  name: string;
  sizeKb: number;
  dimensions?: string;
}

const STEPS = [
  { id: 1, label: 'Load', hint: 'Upload a tablet photo' },
  { id: 2, label: 'Analyse', hint: 'Run the 8-stage pipeline' },
  { id: 3, label: 'Decode', hint: 'Explore evidence & readings' }
];

const HOW_CARDS = [
  { icon: '🔬', title: 'Observe', desc: 'Real computer-vision measurements — sharpness, contrast and glyph contours — taken straight from your photo.' },
  { icon: '🧠', title: 'Predict', desc: 'Machine-learning classification of the writing system, with calibrated confidence you can audit.' },
  { icon: '📜', title: 'Interpret', desc: 'Evidence-ranked hypotheses with supporting facts and limitations side by side — never hidden.' }
];

function App() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<ImageMeta | null>(null);
  const [analysisStage, setAnalysisStage] = useState<number>(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showBoxes, setShowBoxes] = useState(true);

  const currentStep = !selectedImage ? 1 : result && analysisStage === 9 ? 3 : 2;

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      setImageMeta({
        name: file.name,
        sizeKb: Math.round(file.size / 1024),
        dimensions: `${img.naturalWidth} × ${img.naturalHeight} px`
      });
    };

    setAnalysisStage(0);
    setResult(null);
  };

  const startAnalysis = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setAnalysisStage(1);

    const formData = new FormData();
    formData.append('file', selectedImage);

    try {
      setTimeout(() => setAnalysisStage(2), 600);
      setTimeout(() => setAnalysisStage(3), 1200);
      setTimeout(() => setAnalysisStage(4), 1800);
      setTimeout(() => setAnalysisStage(5), 2400);
      setTimeout(() => setAnalysisStage(6), 3000);
      setTimeout(() => setAnalysisStage(7), 3600);
      setTimeout(() => setAnalysisStage(8), 4200);

      const response = await fetch('http://localhost:8001/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      setTimeout(() => {
        setResult(data);
        setAnalysisStage(9);
        setIsAnalyzing(false);
      }, 4800);
    } catch (error) {
      console.error('Error analyzing script:', error);
      setIsAnalyzing(false);
      setAnalysisStage(0);
      alert('Failed to analyze image. Ensure the backend is running at http://localhost:8001');
    }
  };

  const resetToUpload = () => {
    setSelectedImage(null);
    setImagePreviewUrl(null);
    setImageMeta(null);
    setAnalysisStage(0);
    setResult(null);
    setIsAnalyzing(false);
    setShowBoxes(true);
  };

  return (
    <div className="app-shell">
      {/* Animated cosmic background */}
      <div className="cosmos-bg" aria-hidden="true">
        <div className="orb orb-gold" />
        <div className="orb orb-cyan" />
        <div className="orb orb-violet" />
        <div className="grid-floor" />
        <div className="starfield" />
      </div>

      {/* Sticky HUD header + workflow navigation */}
      <header className="app-header">
        <div className="logo-container">
          <span className="logo-icon">𒀭</span>
          <div className="logo-copy">
            <h1 className="app-title gradient-text">Ancient Scripts AI</h1>
            <p className="subtitle">Computational Epigraphy · Decipherment Research Platform</p>
          </div>
        </div>

        <nav className="step-nav" aria-label="Workflow steps">
          {STEPS.map((s) => {
            const state = currentStep === s.id ? 'active' : currentStep > s.id ? 'done' : 'locked';
            const reachable =
              s.id === 1 || (s.id === 2 && !!selectedImage) || (s.id === 3 && !!result);
            return (
              <button
                key={s.id}
                className={`step-chip ${state}`}
                disabled={!reachable}
                title={s.hint}
                onClick={() => s.id === 1 && resetToUpload()}
              >
                <span className="step-idx">{state === 'done' ? '✓' : `0${s.id}`}</span>
                <span className="step-label">{s.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      <main className="app-main">
        {!selectedImage ? (
          <div className="landing">
            <section className="hero reveal">
              <span className="hero-eyebrow">AI-ASSISTED RESEARCH PROTOTYPE</span>
              <h2 className="hero-title">
                Read the <span className="gradient-text">ancient world</span>
                <br />one symbol at a time
              </h2>
              <p className="hero-sub">
                Upload a photograph of an inscription and watch an 8-stage pipeline measure,
                classify, cross-reference and interpret it — every claim labelled by how much
                you should trust it.
              </p>
              <div className="hero-chips">
                <span className="hero-chip">🔬 Real computer-vision measurements</span>
                <span className="hero-chip">🧠 ML script classification</span>
                <span className="hero-chip">🏛️ Corpus cross-referencing</span>
                <span className="hero-chip">📋 Exportable research report</span>
              </div>
            </section>

            <ImageUpload onSelectImage={handleImageSelect} />

            <section className="how-it-works">
              {HOW_CARDS.map((c, i) => (
                <div key={c.title} className="how-card reveal" style={{ animationDelay: `${0.15 * i}s` }}>
                  <span className="how-icon">{c.icon}</span>
                  <span className="how-step">STEP {i + 1}</span>
                  <h4>{c.title}</h4>
                  <p>{c.desc}</p>
                </div>
              ))}
            </section>
          </div>
        ) : (
          <div className="analysis-container view-enter">
            <div className="left-panel">
              <div className="glass-panel image-preview-panel">
                <div className="image-panel-top">
                  <h3>⌖ Source Artifact</h3>
                  {imageMeta && (
                    <span className="image-meta-tag">
                      {imageMeta.dimensions || `${imageMeta.sizeKb} KB`}
                    </span>
                  )}
                </div>

                <div className="image-wrapper">
                  <img src={imagePreviewUrl!} alt="Selected Ancient Script" />

                  {/* Real-time Scanner Animation */}
                  {analysisStage >= 1 && analysisStage <= 8 && (
                    <div className="scanner-line"></div>
                  )}
                  {analysisStage >= 1 && analysisStage <= 8 && (
                    <div className="scan-reticle" aria-hidden="true"></div>
                  )}

                  {/* Bounding Box Visual Overlay */}
                  {result && showBoxes && (
                    <div className="bounding-boxes-overlay">
                      {result.level_1_observed.glyphs.map((g) => (
                        <div
                          key={g.glyph_id}
                          className="glyph-box-rect"
                          style={{
                            left: `${g.bounding_box.left_pct}%`,
                            top: `${g.bounding_box.top_pct}%`,
                            width: `${g.bounding_box.width_pct}%`,
                            height: `${g.bounding_box.height_pct}%`
                          }}
                          title={`Glyph #${g.glyph_id}: ${g.candidate_sign} (${Math.round(g.confidence_score * 100)}%)`}
                        >
                          <span className="glyph-box-label">#{g.glyph_id} {g.candidate_sign}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {imageMeta && (
                  <div className="file-info-bar">
                    <span className="file-name" title={imageMeta.name}>📄 {imageMeta.name}</span>
                    <span className="file-size">{imageMeta.sizeKb} KB</span>
                  </div>
                )}

                {result && (
                  <div className="overlay-toggle-row">
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={showBoxes}
                        onChange={(e) => setShowBoxes(e.target.checked)}
                      />
                      <span>Show glyph bounding boxes ({result.level_1_observed.detected_glyph_count})</span>
                    </label>
                  </div>
                )}

                <button
                  className="btn-primary start-btn"
                  onClick={startAnalysis}
                  disabled={isAnalyzing || analysisStage === 9}
                >
                  {isAnalyzing
                    ? `Analysing · Stage ${Math.min(analysisStage, 8)}/8`
                    : analysisStage === 9
                      ? '✓ Analysis Complete'
                      : '⚡ Start Epigraphic Analysis'}
                </button>
                <button className="btn-secondary" onClick={resetToUpload}>
                  ← Upload different image
                </button>
              </div>
            </div>

            <div className="right-panel">
              {analysisStage > 0 && analysisStage <= 8 && (
                <PipelineVisualizer currentStage={analysisStage} />
              )}
              {result && analysisStage === 9 && (
                <ResultsDashboard result={result} imageUrl={imagePreviewUrl ?? undefined} />
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <span className="foot-dot" aria-hidden="true" />
        Research prototype — Level&nbsp;1 values are <strong>measured</strong>; predictions &amp;
        readings are clearly labelled <strong>hypotheses</strong>.
      </footer>
    </div>
  );
}

export default App;
