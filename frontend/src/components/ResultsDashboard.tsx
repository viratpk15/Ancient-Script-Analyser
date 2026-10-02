import React, { useEffect, useState } from 'react';
import './ResultsDashboard.css';

export interface BoundingBox {
  left_pct: number;
  top_pct: number;
  width_pct: number;
  height_pct: number;
  raw_box: number[];
}

export interface CandidateSign {
  sign_id: string;
  name: string;
  confidence: number;
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
  candidates: CandidateSign[];
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

export interface SequenceMatch {
  sequence: string;
  tablet_references: string[];
  frequency_in_sample: number;
  syntactic_role: string;
}

export interface CorpusEvidence {
  corpus_name: string;
  catalog_entries_indexed: number;
  strong_sequence_matches: SequenceMatch[];
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
  reliability?: {
    score: number;
    verdict: string;
    factors: Array<{ name: string; score: number; detail: string }>;
    recommendations: string[];
    confidence_calibration?: number;
  };
  pipeline_stages: Array<{
    id: number;
    name: string;
    status: string;
    type: string;
    details: string;
  }>;
  research_report_markdown: string;
  scientific_disclaimer: string;
}

interface Props {
  result: AnalysisResult;
  imageUrl?: string;
}

type ConfTone = 'strong' | 'moderate' | 'weak' | 'speculative';

const SECTIONS = [
  { id: 'reading', num: '01', label: 'The Reading' },
  { id: 'symbols', num: '02', label: 'The Symbols' },
  { id: 'evidence', num: '03', label: 'The Evidence' },
  { id: 'measurements', num: '04', label: 'Measurements' },
  { id: 'report', num: '05', label: 'Full Report' }
];

/** Converts a raw percentage into a plain-English confidence label. */
const describeConfidence = (pct: number): { label: string; tone: ConfTone; hint: string } => {
  if (pct >= 60) return { label: 'Strong match', tone: 'strong', hint: 'Several independent lines of evidence agree with this reading.' };
  if (pct >= 25) return { label: 'Moderate match', tone: 'moderate', hint: 'Promising, but some supporting evidence is missing or ambiguous.' };
  if (pct >= 10) return { label: 'Weak match', tone: 'weak', hint: 'Possible, though the supporting evidence is limited.' };
  return { label: 'Speculative', tone: 'speculative', hint: 'A long shot — treat it as an educated guess, not a confirmed result.' };
};

/** Smoothly counts from 0 to the target value for a live-telemetry feel. */
function useCountUp(target: number, duration = 1200): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

interface RingProps {
  pct: number;
  size?: number;
  stroke?: number;
  caption?: string;
  tone?: ConfTone;
}

/** Animated SVG confidence gauge. */
const ConfidenceRing: React.FC<RingProps> = ({ pct, size = 88, stroke = 7, caption, tone = 'strong' }) => {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const id = window.setTimeout(() => setShown(pct), 120);
    return () => window.clearTimeout(id);
  }, [pct]);

  const offset = circumference - (shown / 100) * circumference;

  return (
    <div className={`conf-ring tone-${tone}`}>
      <div className="ring-circle" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={r} className="ring-track" strokeWidth={stroke} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            className="ring-value"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <span className="ring-pct">{Math.round(shown)}%</span>
      </div>
      {caption && <span className="ring-caption">{caption}</span>}
    </div>
  );
};

const ResultsDashboard: React.FC<Props> = ({ result, imageUrl }) => {
  const [selectedGlyphId, setSelectedGlyphId] = useState(1);
  const [selectedRank, setSelectedRank] = useState(1);
  const [activeSection, setActiveSection] = useState('reading');
  const [copiedReport, setCopiedReport] = useState(false);
  const [glyphQuery, setGlyphQuery] = useState('');
  const [copiedReading, setCopiedReading] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  const { level_1_observed, level_2_predicted, level_3_corpus_evidence, level_4_interpretation } = result;
  const script = level_2_predicted.script_classification;
  const imageQuality = level_1_observed.image_quality;
  const glyphs = level_1_observed.glyphs;
  const hypotheses = level_4_interpretation.hypotheses;

  const selectedGlyph = glyphs.find((g) => g.glyph_id === selectedGlyphId) || glyphs[0];
  const activeHyp = hypotheses.find((h) => h.rank === selectedRank) || hypotheses[0];
  const activePct = activeHyp ? Math.round(activeHyp.confidence * 100) : 0;
  const activeConf = describeConfidence(activePct);
  const topPct = hypotheses[0] ? Math.round(hypotheses[0].confidence * 100) : 0;
  const scriptPct = Math.round(script.confidence * 100);

  const symbolsAnim = useCountUp(level_1_observed.detected_glyph_count);
  const scriptAnim = useCountUp(scriptPct);
  const readingAnim = useCountUp(topPct);
  const photoAnim = useCountUp(Math.round(imageQuality.quality_score * 100));

  const readingWords = activeHyp ? activeHyp.reconstructed_reading.split(' ') : [];

  const reliability = result.reliability;
  const relPct = reliability ? Math.round(reliability.score * 100) : 0;
  const relTone: ConfTone = relPct >= 75 ? 'strong' : relPct >= 50 ? 'moderate' : 'weak';

  const filteredGlyphs = glyphs.filter((g) => {
    const q = glyphQuery.trim().toLowerCase();
    if (!q) return true;
    return `${g.glyph_id} ${g.unicode_symbol} ${g.candidate_sign} ${g.label} ${g.sign_category}`
      .toLowerCase()
      .includes(q);
  });

  const handleDownload = (format: 'md' | 'json') => {
    const content =
      format === 'md' ? result.research_report_markdown : JSON.stringify(result, null, 2);
    const blob = new Blob([content], {
      type: format === 'md' ? 'text/markdown' : 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = format === 'md' ? 'epigraphy-report.md' : 'epigraphy-analysis.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyReading = () => {
    if (!activeHyp) return;
    navigator.clipboard.writeText(activeHyp.reconstructed_reading);
    setCopiedReading(true);
    setTimeout(() => setCopiedReading(false), 2000);
  };

  /* Scroll-spy + progressive section reveal + nav progress */
  useEffect(() => {
    const els = SECTIONS
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el);
    if (!els.length || !('IntersectionObserver' in window)) return;

    els.forEach((el) => el.classList.add('will-reveal'));
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActiveSection(e.target.id);
            e.target.classList.add('in-view');
          }
        });
      },
      { rootMargin: '-15% 0px -55% 0px', threshold: 0 }
    );
    els.forEach((el) => obs.observe(el));

    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setScrollPct(max > 0 ? (doc.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      obs.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const goToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(result.research_report_markdown);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  return (
    <div className="decode-experience fade-in">
      {/* ============ CINEMATIC MASTHEAD ============ */}
      <header className="decode-masthead reveal">
        {imageUrl && (
          <div className="masthead-art" style={{ backgroundImage: `url(${imageUrl})` }} aria-hidden="true" />
        )}
        <div className="masthead-veil" aria-hidden="true" />

        <div className="masthead-body">
          <div className="masthead-info">
            <span className="micro-label">◈ Decoded artifact dossier</span>
            <h2 className="masthead-title">{script.top_prediction}</h2>
            <div className="dossier-chips">
              <span className="d-chip">📅 {script.estimated_period}</span>
              <span className="d-chip">📍 {script.provenance}</span>
              <span className="d-chip">↔ {script.reading_direction}</span>
              {script.is_model_demo && <span className="d-chip chip-demo">🧠 Demo classifier</span>}
            </div>
          </div>

          <div className="masthead-rings">
            <ConfidenceRing pct={scriptPct} caption="Script ID" tone={describeConfidence(scriptPct).tone} />
            <ConfidenceRing pct={topPct} caption="Top reading" tone={describeConfidence(topPct).tone} />
          </div>
        </div>

        <div className="stat-strip">
          <div className="stat-item">
            <span className="stat-num">{symbolsAnim}</span>
            <span className="stat-cap">Symbols found</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">{scriptAnim}%</span>
            <span className="stat-cap">Script match</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">{readingAnim}%</span>
            <span className="stat-cap">Top reading</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">{hypotheses.length}</span>
            <span className="stat-cap">Hypotheses</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">{photoAnim}%</span>
            <span className="stat-cap">Photo quality</span>
          </div>
        </div>
      </header>

      {/* ============ RELIABILITY BANNER ============ */}
      {reliability && (
        <div className="reliability-bar reveal" style={{ animationDelay: '0.15s' }}>
          <ConfidenceRing
            pct={relPct}
            size={70}
            stroke={6}
            caption="Reliability"
            tone={relTone}
          />
          <div className="rel-main">
            <span className="micro-label">◈ Analysis reliability</span>
            <p className="rel-verdict">{reliability.verdict}</p>
            <div className="rel-factors">
              {reliability.factors.map((f) => (
                <span key={f.name} className="factor-chip" title={f.detail}>
                  {f.name} <strong>{Math.round(f.score * 100)}%</strong>
                </span>
              ))}
            </div>
          </div>
          <div className="rel-recs">
            <span className="candidates-label">Recommendations</span>
            <ul>
              {reliability.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ============ EVIDENCE-LEVEL LEGEND ============ */}
      <details className="how-to-read">
        <summary>🧭 How to read these results — the 4 evidence levels</summary>
        <div className="legend-grid">
          <div className="legend-item lv-observed">
            <span className="legend-name">1 · Measured</span>
            <p>Calculated straight from your photo (sharpness, symbol positions). Reliable facts.</p>
          </div>
          <div className="legend-item lv-predicted">
            <span className="legend-name">2 · Predicted</span>
            <p>Machine-learning guesses (script ID, sign matching). Useful — but can be wrong.</p>
          </div>
          <div className="legend-item lv-corpus">
            <span className="legend-name">3 · Database match</span>
            <p>Your sign sequences compared against a reference catalogue of known tablets.</p>
          </div>
          <div className="legend-item lv-interpretation">
            <span className="legend-name">4 · Interpretation</span>
            <p>A researcher's best guess at the meaning. Proto-Elamite is undeciphered — never fully certain.</p>
          </div>
        </div>
      </details>

      {/* ============ STICKY SECTION NAV ============ */}
      <nav className="section-nav" aria-label="Result sections">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            className={`section-pill ${activeSection === s.id ? 'active' : ''}`}
            onClick={() => goToSection(s.id)}
          >
            <span className="pill-num">{s.num}</span>
            {s.label}
          </button>
        ))}
        <div className="nav-progress" aria-hidden="true">
          <div className="nav-progress-fill" style={{ width: `${scrollPct}%` }} />
        </div>
      </nav>

      {/* ============ 01 · THE READING ============ */}
      <section id="reading" className="decode-section">
        <div className="section-head">
          <span className="section-num">01</span>
          <h3>The Reading</h3>
          <span className="section-rule" />
          <span className="section-tag">Interpretation · educated guess</span>
        </div>

        {hypotheses.length > 1 && (
          <div className="hypo-rail">
            {hypotheses.map((h) => {
              const pct = Math.round(h.confidence * 100);
              const c = describeConfidence(pct);
              return (
                <button
                  key={h.rank}
                  className={`hyp-chip ${selectedRank === h.rank ? 'active' : ''}`}
                  onClick={() => setSelectedRank(h.rank)}
                >
                  <span className={`rank-seal sm ${h.rank === 1 ? 'gold' : ''}`}>#{h.rank}</span>
                  <span className="hyp-chip-text">
                    <span className="hyp-chip-title">{h.title}</span>
                    <span className={`conf-badge ${c.tone}`}>{c.label} · {pct}%</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {activeHyp && (
          <div className="reading-hero" key={activeHyp.rank}>
            <div className="reading-hero-top">
              <span className="micro-label">◈ Reconstructed reading</span>
              <div className="reading-actions">
                {activeHyp.rank === 1 && <span className="top-ribbon">★ TOP CANDIDATE</span>}
                <button className="ghost-btn" onClick={handleCopyReading}>
                  {copiedReading ? '✓ Copied' : '⧉ Copy reading'}
                </button>
              </div>
            </div>

            <p className="reading-display" key={activeHyp.rank}>
              {readingWords.map((w, i) => (
                <span className="rword" key={`${activeHyp.rank}-${i}`} style={{ animationDelay: `${0.05 * i}s` }}>
                  {w}{' '}
                </span>
              ))}
            </p>

            <div className="reading-hero-foot">
              <ConfidenceRing pct={activePct} size={72} stroke={6} caption="Confidence" tone={activeConf.tone} />
              <div className="reading-foot-text">
                <span className="reading-hyp-title">Hypothesis #{activeHyp.rank} · {activeHyp.title}</span>
                <p className="conf-hint">{activeConf.hint}</p>
              </div>
            </div>
          </div>
        )}

        {activeHyp && (
          <div className="evidence-split-grid">
            <div className="evidence-col positive">
              <span className="evidence-heading">✓ Why we think this (supporting evidence)</span>
              <ul>
                {activeHyp.supporting_evidence.map((ev, idx) => (
                  <li key={idx}>{ev}</li>
                ))}
              </ul>
            </div>
            <div className="evidence-col warning">
              <span className="evidence-heading">⚠️ What could be wrong (limitations)</span>
              <ul>
                {activeHyp.uncertainties_and_limitations.map((un, idx) => (
                  <li key={idx}>{un}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      {/* ============ 02 · THE SYMBOLS ============ */}
      <section id="symbols" className="decode-section">
        <div className="section-head">
          <span className="section-num">02</span>
          <h3>The Symbols</h3>
          <span className="section-rule" />
          <span className="section-tag">Measured locations · predicted identities</span>
        </div>

        <div className="symbols-layout">
          <div className="artifact-map">
            {imageUrl ? (
              <>
                <img src={imageUrl} alt="Analyzed artifact with glyph locations" />
                <div className="map-overlay">
                  {glyphs.map((g) => (
                    <button
                      key={g.glyph_id}
                      className={`map-glyph ${selectedGlyphId === g.glyph_id ? 'active' : ''}`}
                      style={{
                        left: `${g.bounding_box.left_pct}%`,
                        top: `${g.bounding_box.top_pct}%`,
                        width: `${g.bounding_box.width_pct}%`,
                        height: `${g.bounding_box.height_pct}%`
                      }}
                      onClick={() => setSelectedGlyphId(g.glyph_id)}
                      title={`#${g.glyph_id} ${g.candidate_sign} — ${Math.round(g.confidence_score * 100)}%`}
                    >
                      <span className="map-glyph-tag">#{g.glyph_id}</span>
                    </button>
                  ))}
                </div>
                <span className="map-caption">◈ Tap a box to inspect the symbol</span>
              </>
            ) : (
              <p className="map-fallback">Artifact image unavailable</p>
            )}
          </div>

          <div className="glyph-side">
            <div className="glyph-search-row">
              <input
                className="glyph-search"
                type="search"
                placeholder="Filter symbols… (name, sign ID, category)"
                value={glyphQuery}
                onChange={(e) => setGlyphQuery(e.target.value)}
              />
              <span className="glyph-count">{filteredGlyphs.length}/{glyphs.length}</span>
            </div>
            <div className="glyph-cards">
              {filteredGlyphs.map((g) => (
                <button
                  key={g.glyph_id}
                  className={`glyph-card ${selectedGlyphId === g.glyph_id ? 'active' : ''}`}
                  onClick={() => setSelectedGlyphId(g.glyph_id)}
                >
                  <span className="gc-symbol">{g.unicode_symbol}</span>
                  <span className="gc-meta">
                    <span className="gc-id">#{g.glyph_id} · <strong>{g.candidate_sign}</strong></span>
                    <span className="gc-name">{g.label}</span>
                  </span>
                  <span className="gc-conf">{Math.round(g.confidence_score * 100)}%</span>
                </button>
              ))}
              {filteredGlyphs.length === 0 && (
                <p className="map-fallback">No symbols match “{glyphQuery}”.</p>
              )}
            </div>
          </div>
        </div>

        {selectedGlyph && (
          <div className="specimen-card" key={selectedGlyph.glyph_id}>
            <div className="specimen-head">
              <span className="specimen-char">{selectedGlyph.unicode_symbol}</span>
              <div className="specimen-titles">
                <span className="micro-label">◈ Specimen #{selectedGlyph.glyph_id}</span>
                <h4>{selectedGlyph.candidate_sign} — {selectedGlyph.label}</h4>
                <div className="specimen-tags">
                  <span className="category-tag">{selectedGlyph.sign_category}</span>
                  <span className="quality-pill">crop {Math.round(selectedGlyph.segmentation_quality * 100)}%</span>
                  <span className="quality-pill conf">{Math.round(selectedGlyph.confidence_score * 100)}% match</span>
                </div>
              </div>
            </div>

            <p className="specimen-notes">{selectedGlyph.paleographic_notes}</p>

            <div className="candidates-row">
              <span className="candidates-label">Ranked alternatives</span>
              <div className="candidate-badges">
                {selectedGlyph.candidates.map((cand, cIdx) => (
                  <div key={cIdx} className="cand-pill">
                    <span className="cand-name">{cand.name}</span>
                    <span className="cand-conf">{Math.round(cand.confidence * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="specimen-pos">
              Position [x, y, w, h]: [{selectedGlyph.bounding_box.raw_box.join(', ')}]
            </div>
          </div>
        )}
      </section>

      {/* ============ 03 · THE EVIDENCE ============ */}
      <section id="evidence" className="decode-section">
        <div className="section-head">
          <span className="section-num">03</span>
          <h3>The Evidence</h3>
          <span className="section-rule" />
          <span className="section-tag">Corpus &amp; context — strongest non-statistical proof</span>
        </div>

        <div className="timeline">
          <div className="tl-node">
            <span className="tl-icon">🧠</span>
            <div className="tl-card">
              <span className="micro-label">◈ Script identification breakdown — predicted</span>
              <h5>Alternative candidates considered</h5>
              <div className="alt-list">
                <div className="alt-row main">
                  <span className="alt-name">{script.top_prediction}</span>
                  <div className="alt-bar">
                    <div className="alt-fill" style={{ width: `${scriptPct}%` }} />
                  </div>
                  <span className="alt-conf">{scriptPct}%</span>
                </div>
                {script.alternatives.map((a, i) => (
                  <div className="alt-row" key={i}>
                    <span className="alt-name">{a.script}</span>
                    <div className="alt-bar">
                      <div
                        className="alt-fill dim"
                        style={{ width: `${Math.max(3, Math.round(a.confidence * 100))}%` }}
                      />
                    </div>
                    <span className="alt-conf">{(a.confidence * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="tl-node">
            <span className="tl-icon">📖</span>
            <div className="tl-card">
              <span className="micro-label">◈ {level_3_corpus_evidence.corpus_name}</span>
              <h5>Matching sign sequences</h5>
              <div className="matches-list">
                {level_3_corpus_evidence.strong_sequence_matches.map((seq, sIdx) => (
                  <div key={sIdx} className="tl-match">
                    <span className="match-seq">{seq.sequence}</span>
                    <span className="match-role"><strong>What it does:</strong> {seq.syntactic_role}</span>
                    <span className="match-refs"><strong>Seen on tablets:</strong> {seq.tablet_references.join(', ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="tl-node">
            <span className="tl-icon">🏷️</span>
            <div className="tl-card">
              <span className="micro-label">◈ Document classification</span>
              <h5>What kind of document is this?</h5>
              <div className="ev-rows">
                <div className="ev-row">
                  <span className="ev-key">Document structure</span>
                  <span className="ev-val">{level_4_interpretation.context_analysis.sequence_structure}</span>
                </div>
                <div className="ev-row">
                  <span className="ev-key">Likely topic</span>
                  <span className="ev-val">{level_4_interpretation.context_analysis.possible_domains.join(', ')}</span>
                </div>
                <div className="ev-row">
                  <span className="ev-key">Writing style</span>
                  <span className="ev-val">{level_4_interpretation.context_analysis.grammatical_assessment}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="tl-node">
            <span className="tl-icon">⚖️</span>
            <div className="tl-card">
              <span className="micro-label">◈ Numerical system</span>
              <h5>Numbers &amp; counting</h5>
              <div className="ev-rows">
                <div className="ev-row">
                  <span className="ev-key">Counting system</span>
                  <span className="ev-val">{level_3_corpus_evidence.metrological_pattern.system_detected}</span>
                </div>
                <div className="ev-row">
                  <span className="ev-key">Number marks found</span>
                  <span className="ev-val">{level_3_corpus_evidence.metrological_pattern.numerical_tokens_observed}</span>
                </div>
                <div className="ev-row">
                  <span className="ev-key">What the total means</span>
                  <span className="ev-val">{level_3_corpus_evidence.metrological_pattern.interpretation}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 04 · MEASUREMENTS ============ */}
      <section id="measurements" className="decode-section">
        <div className="section-head">
          <span className="section-num">04</span>
          <h3>Measurements</h3>
          <span className="section-rule" />
          <span className="section-tag">Measured from your image — no guessing</span>
        </div>

        <div className="metrics-grid-four">
          <div className="metric-box">
            <span className="metric-lbl">Photo size</span>
            <span className="metric-num">{imageQuality.dimensions}</span>
            <span className="metric-sub">Aspect ratio {imageQuality.aspect_ratio} · Brightness {imageQuality.mean_brightness}</span>
          </div>
          <div className="metric-box">
            <span className="metric-lbl">Sharpness — how crisp the photo is</span>
            <span className="metric-num">{imageQuality.sharpness_laplacian_var}</span>
            <span className="metric-sub">Higher = sharper · {imageQuality.surface_visibility}</span>
          </div>
          <div className="metric-box">
            <span className="metric-lbl">Contrast — light vs dark range</span>
            <span className="metric-num">{imageQuality.enhanced_contrast_std}</span>
            <span className="metric-sub">Raw value before enhancement: {imageQuality.raw_contrast_std}</span>
          </div>
          <div className="metric-box">
            <span className="metric-lbl">Surface condition</span>
            <span className="metric-num">{imageQuality.damage_level}</span>
            <span className="metric-sub">Overall photo-quality index: {Math.round(imageQuality.quality_score * 100)}%</span>
          </div>
        </div>
      </section>

      {/* ============ 05 · FULL REPORT ============ */}
      <section id="report" className="decode-section">
        <div className="section-head">
          <span className="section-num">05</span>
          <h3>Full Report</h3>
          <span className="section-rule" />
          <span className="section-tag">Exportable markdown · cite or share</span>
        </div>

        <details className="pipeline-audit">
          <summary>⚙ Pipeline audit trail — {result.pipeline_stages.length} stages recorded</summary>
          <div className="audit-list">
            {result.pipeline_stages.map((s) => (
              <div className="audit-row" key={s.id}>
                <span className="audit-id">{String(s.id).padStart(2, '0')}</span>
                <div className="audit-main">
                  <span className="audit-name">
                    {s.name} <em className="audit-type">{s.type}</em>
                  </span>
                  <span className="audit-details">{s.details}</span>
                </div>
                <span className="audit-status">{s.status}</span>
              </div>
            ))}
          </div>
        </details>

        <div className="report-container">
          <div className="report-action-bar">
            <span className="report-hint">Comprehensive computational epigraphy report</span>
            <div className="report-actions">
              <button className="ghost-btn" onClick={() => handleDownload('json')}>⬇ JSON data</button>
              <button className="ghost-btn" onClick={() => handleDownload('md')}>⬇ Markdown</button>
              <button className="btn-primary copy-btn" onClick={handleCopyReport}>
                {copiedReport ? '✓ Copied to clipboard' : '📋 Copy report'}
              </button>
            </div>
          </div>
          <pre className="markdown-preview-box">{result.research_report_markdown}</pre>
          <p className="disclaimer-footnote">{result.scientific_disclaimer}</p>
        </div>
      </section>
    </div>
  );
};

export default ResultsDashboard;

