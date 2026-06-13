import React, { useState } from 'react';
import './App.css';

// ── Mock AI responses ────────────────────────────────────────────────
const SAMPLE_NOTES = [
  `Patient is a 67-year-old male presenting with chest pain radiating to the left arm, shortness of breath, and diaphoresis for the past 2 hours. History of hypertension and type 2 diabetes. BP 158/94, HR 102, O2 sat 94%. EKG shows ST elevation in leads II, III, aVF. Troponin elevated at 2.4. Starting aspirin 325mg, nitroglycerin, and heparin drip. Cardiology consult placed. Impression: Acute inferior STEMI.`,
  `47-year-old female with 3-day history of productive cough, fever (38.9°C), and right-sided pleuritic chest pain. Decreased breath sounds at right base. CXR shows right lower lobe consolidation. WBC 14,200. Started on azithromycin and amoxicillin-clavulanate. Diagnosis: Community-acquired pneumonia, right lower lobe.`,
  `32-year-old male with sudden onset severe headache, worst of life, nausea, vomiting, photophobia. Neck stiffness present. CT head negative for hemorrhage. LP performed: opening pressure 28, cloudy fluid, WBC 1200 (neutrophil predominant), glucose 28, protein 180. Blood cultures drawn. Started on ceftriaxone 2g IV q12h and dexamethasone. Diagnosis: Bacterial meningitis.`
];

function analyzNote(note) {
  const text = note.toLowerCase();

  // Simple keyword-based mock analysis
  const diagnoses = [];
  const symptoms  = [];
  const codes     = [];
  const vitals    = [];

  // Diagnoses
  if (text.includes('stemi') || text.includes('st elevation'))
    diagnoses.push('Acute ST-Elevation Myocardial Infarction (STEMI)');
  if (text.includes('pneumonia'))
    diagnoses.push('Community-Acquired Pneumonia');
  if (text.includes('meningitis'))
    diagnoses.push('Bacterial Meningitis');
  if (text.includes('hypertension'))
    diagnoses.push('Hypertension');
  if (text.includes('diabetes'))
    diagnoses.push('Type 2 Diabetes Mellitus');
  if (text.includes('chest pain'))
    diagnoses.push('Chest Pain');
  if (diagnoses.length === 0)
    diagnoses.push('Unspecified condition — review note for diagnosis');

  // Symptoms
  if (text.includes('chest pain'))     symptoms.push(' Chest pain');
  if (text.includes('shortness of breath') || text.includes(' dyspnea')) symptoms.push(' Shortness of breath');
  if (text.includes('fever'))          symptoms.push(' Fever');
  if (text.includes('cough'))          symptoms.push(' Productive cough');
  if (text.includes('headache'))       symptoms.push(' Severe headache');
  if (text.includes('nausea'))         symptoms.push(' Nausea');
  if (text.includes('vomiting'))       symptoms.push(' Vomiting');
  if (text.includes('diaphoresis'))    symptoms.push(' Diaphoresis');
  if (text.includes('photophobia'))    symptoms.push(' Photophobia');
  if (text.includes('neck stiffness')) symptoms.push(' Neck stiffness');

  // ICD-10 codes
  if (text.includes('stemi') || text.includes('st elevation'))
    codes.push({ code: 'I21.19 ', description: 'ST elevation MI, other coronary artery', type: 'ICD-10' });
  if (text.includes('pneumonia'))
    codes.push({ code: 'J18.1 ', description: 'Lobar pneumonia, unspecified organism', type: 'ICD-10' });
  if (text.includes('meningitis'))
    codes.push({ code: 'G00.9 ', description: 'Bacterial meningitis, unspecified', type: 'ICD-10' });
  if (text.includes('hypertension'))
    codes.push({ code: 'I10', description: 'Essential (primary) hypertension', type: 'ICD-10' });
  if (text.includes('diabetes'))
    codes.push({ code: 'E11.9 ', description: 'Type 2 diabetes mellitus without complications', type: 'ICD-10' });
  if (text.includes('chest pain'))
    codes.push({ code: 'R07.9 ', description: 'Chest pain, unspecified', type: 'ICD-10' });

  // CPT codes
  if (text.includes('ekg') || text.includes('ecg'))
    codes.push({ code: '93000 ', description: 'Electrocardiogram (ECG/EKG)', type: 'CPT' });
  if (text.includes('troponin'))
    codes.push({ code: '84484 ', description: 'Troponin, quantitative', type: 'CPT' });
  if (text.includes('cxr') || text.includes('chest x'))
    codes.push({ code: '71046 ', description: 'Chest X-ray, 2 views', type: 'CPT' });
  if (text.includes(' lp ') || text.includes('lumbar puncture'))
    codes.push({ code: '62270 ', description: 'Lumbar puncture, diagnostic', type: 'CPT' });
  if (text.includes('ct head') || text.includes('ct scan'))
    codes.push({ code: '70450 ', description: 'CT head/brain without contrast', type: 'CPT' });
  if (codes.filter(c => c.type === 'CPT').length === 0)
    codes.push({ code: '99213 ', description: 'Office/outpatient visit, moderate complexity', type: 'CPT' });

  // Vitals extraction
  const bpMatch = note.match(/BP\s*(\d+\/\d+)/i);
  if (bpMatch) vitals.push({ label: 'Blood Pressure', value: bpMatch[1] + ' mmHg' });
  const hrMatch = note.match(/HR\s*(\d+)/i);
  if (hrMatch) vitals.push({ label: 'Heart Rate', value: hrMatch[1] + ' bpm' });
  const o2Match = note.match(/O2\s*sat\s*(\d+)/i);
  if (o2Match) vitals.push({ label: 'O2 Saturation', value: o2Match[1] + '%' });
  const tempMatch = note.match(/(\d+\.?\d*)\s*°?C/i);
  if (tempMatch) vitals.push({ label: 'Temperature', value: tempMatch[1] + '°C' });

  // Severity
  let severity = 'Low';
  let severityColor = '#22c55e';
  if (text.includes('stemi') || text.includes('meningitis') || text.includes('st elevation')) {
    severity = 'Critical'; severityColor = '#ef4444';
  } else if (text.includes('pneumonia') || text.includes('chest pain') || text.includes('fever')) {
    severity = 'Moderate'; severityColor = '#f59e0b';
  }

  return { diagnoses, symptoms, codes, vitals, severity, severityColor };
}

// ── Components ───────────────────────────────────────────────────────

function Badge({ type }) {
  const colors = {
    'ICD-10': { bg: 'rgba(124,106,247,0.15)', color: '#a78bfa' },
    'CPT':    { bg: 'rgba(56,189,248,0.15)',  color: '#38bdf8' }
  };
  const c = colors[type] || colors['ICD-10'];
  return (
    <span style={{
      fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em',
      padding: '0.15rem 0.5rem', borderRadius: '4px',
      background: c.bg, color: c.color
    }}>
      {type}
    </span>
  );
}

function SeverityPill({ severity, color }) {
  return (
    <span style={{
      fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em',
      padding: '0.25rem 0.75rem', borderRadius: '20px',
      background: color + '22', color, border: `1px solid ${color}44`
    }}>
      {severity} Severity
    </span>
  );
}

// ── Main App ─────────────────────────────────────────────────────────

export default function App() {
  const [note,     setNote]     = useState('');
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [copied,   setCopied]   = useState(false);

  const handleAnalyze = () => {
    if (!note.trim()) return;
    setLoading(true);
    setResult(null);
    // Simulate AI processing delay
    setTimeout(() => {
      setResult(analyzNote(note));
      setLoading(false);
    }, 1400);
  };

  const handleSample = (text) => {
    setNote(text);
    setResult(null);
  };

  const handleCopy = () => {
    if (!result) return;
    const icd = result.codes.filter(c => c.type === 'ICD-10').map(c => `${c.code} - ${c.description}`).join('\n');
    const cpt = result.codes.filter(c => c.type === 'CPT').map(c => `${c.code} - ${c.description}`).join('\n');
    const text = `DIAGNOSES:\n${result.diagnoses.join('\n')}\n\nICD-10 CODES:\n${icd}\n\nCPT CODES:\n${cpt}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const icdCodes = result?.codes.filter(c => c.type === 'ICD-10') || [];
  const cptCodes = result?.codes.filter(c => c.type === 'CPT')    || [];

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">⚕</span>
            <span className="logo-text">ClinicalAI <span className="logo-accent">Coder</span></span>
          </div>
          <div className="header-sub">AI-powered clinical note analysis & medical code extraction</div>
        </div>
        <div className="header-badge">Hackathon Demo</div>
      </header>

      <main className="main">
        {/* Input panel */}
        <section className="panel input-panel">
          <div className="panel-header">
            <h2>Clinical Note</h2>
            <div className="sample-buttons">
              <span className="samples-label">Try a sample:</span>
              {['STEMI', 'Pneumonia', 'Meningitis'].map((label, i) => (
                <button key={i} className="btn-sample" onClick={() => handleSample(SAMPLE_NOTES[i])}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <textarea
            className="note-input"
            placeholder="Paste or type a clinical note here — discharge summary, progress note, or ED note..."
            value={note}
            onChange={e => { setNote(e.target.value); setResult(null); }}
          />
          <div className="input-footer">
            <span className="char-count">{note.length} characters</span>
            <button
              className="btn-analyze"
              onClick={handleAnalyze}
              disabled={!note.trim() || loading}
            >
              {loading ? (
                <><span className="btn-spinner" /> Analyzing...</>
              ) : (
                <> Analyze Note</>
              )}
            </button>
          </div>
        </section>

        {/* Results panel */}
        {(loading || result) && (
          <section className="panel results-panel">
            <div className="panel-header">
              <h2>Analysis Results</h2>
              {result && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <SeverityPill severity={result.severity} color={result.severityColor} />
                  <button className="btn-copy" onClick={handleCopy}>
                    {copied ? '✓ Copied' : 'Copy Codes'}
                  </button>
                </div>
              )}
            </div>

            {loading && (
              <div className="loading-state">
                <div className="loading-bar">
                  <div className="loading-fill" />
                </div>
                <div className="loading-steps">
                  <span>Parsing clinical entities...</span>
                  <span>Extracting diagnoses...</span>
                  <span>Mapping billing codes...</span>
                </div>
              </div>
            )}

            {result && (
              <div className="results-grid">

                {/* Diagnoses */}
                <div className="result-card diagnoses-card">
                  <div className="result-card-title">🩺 Diagnoses</div>
                  <ul className="result-list">
                    {result.diagnoses.map((d, i) => (
                      <li key={i} className="result-item">
                        <span className="result-dot" style={{ background: '#a78bfa' }} />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Symptoms */}
                {result.symptoms.length > 0 && (
                  <div className="result-card">
                    <div className="result-card-title">💊 Presenting Symptoms</div>
                    <div className="symptom-pills">
                      {result.symptoms.map((s, i) => (
                        <span key={i} className="symptom-pill">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vitals */}
                {result.vitals.length > 0 && (
                  <div className="result-card">
                    <div className="result-card-title">📊 Extracted Vitals</div>
                    <div className="vitals-grid">
                      {result.vitals.map((v, i) => (
                        <div key={i} className="vital-item">
                          <div className="vital-value">{v.value}</div>
                          <div className="vital-label">{v.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ICD-10 Codes */}
                {icdCodes.length > 0 && (
                  <div className="result-card">
                    <div className="result-card-title">
                      <Badge type="ICD-10" /> Diagnosis Codes
                    </div>
                    <div className="code-list">
                      {icdCodes.map((c, i) => (
                        <div key={i} className="code-row">
                          <span className="code-value">{c.code}</span>
                          <span className="code-desc">{c.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CPT Codes */}
                {cptCodes.length > 0 && (
                  <div className="result-card">
                    <div className="result-card-title">
                      <Badge type="CPT" /> Procedure Codes
                    </div>
                    <div className="code-list">
                      {cptCodes.map((c, i) => (
                        <div key={i} className="code-row">
                          <span className="code-value">{c.code}</span>
                          <span className="code-desc">{c.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </section>
        )}

        {/* Empty state */}
        {!loading && !result && (
          <div className="empty-state">
            <div className="empty-icon">⚕</div>
            <div className="empty-title">Paste a clinical note to begin</div>
            <div className="empty-sub">The AI will extract diagnoses, symptoms, vitals, ICD-10 and CPT codes automatically.</div>
          </div>
        )}
      </main>

      <footer className="footer">
        Built for CodaMetrix Calling Hackathon · June 2026 · Edwin Sorto Rosales
      </footer>
    </div>
  );
}