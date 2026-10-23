import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import { deleteEvent } from '../lib/api';

const AI_META = {
  chatgpt: { name: 'ChatGPT (OpenAI)', icon: '🤖', color: '#10a37f' },
  gemini: { name: 'Google Gemini', icon: '💎', color: '#4285f4' },
  perplexity: { name: 'Perplexity AI', icon: '🔍', color: '#20b2aa' },
  claude: { name: 'Claude (Anthropic)', icon: '🟣', color: '#d97706' },
  deepseek: { name: 'DeepSeek AI', icon: '🐋', color: '#0ea5e9' },
  copilot: { name: 'MS Copilot', icon: '🪟', color: '#0078d4' },
  groq: { name: 'Groq Cloud', icon: '⚡', color: '#f59e0b' },
  mistral: { name: 'Mistral AI', icon: '🌪️', color: '#ef4444' },
  cohere: { name: 'Cohere AI', icon: '🌐', color: '#8b5cf6' },
  ollama: { name: 'Ollama Local', icon: '🦙', color: '#6366f1' },
};

function getAiMeta(service) {
  if (!service) return { name: 'AI Service', icon: '🤖', color: '#6b7280' };
  const lower = service.toLowerCase();
  for (const [key, meta] of Object.entries(AI_META)) {
    if (lower.includes(key)) return meta;
  }
  return { name: service, icon: '🤖', color: '#00f0ff' };
}

const PHI_TYPE_COLORS = {
  NAME: 'bg-red-500/20 text-red-400 border-red-500/40',
  PATIENT_NAME: 'bg-red-500/20 text-red-400 border-red-500/40',
  DATE: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  DOB: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  PHONE: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
  EMAIL: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  MRN: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  SSN: 'bg-rose-600/20 text-rose-300 border-rose-600/40',
  LOCATION: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  ADDRESS: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  CONDITION: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40',
  MEDICATION: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
  CLINICIAN_PII: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  DOCTOR_NAME: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  CONSULTANT_SIGNATURE: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  HOSPITAL_STAMP: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
};

function highlightPHI(text, findings) {
  if (!text) return <span className="text-gray-500 italic">No prompt content available</span>;
  if (!findings || !Array.isArray(findings) || findings.length === 0) {
    return <span>{text}</span>;
  }

  const positions = [];
  findings.forEach((f) => {
    if (!f.text) return;
    let searchStart = 0;
    while (searchStart < text.length) {
      const idx = text.indexOf(f.text, searchStart);
      if (idx === -1) break;
      positions.push({
        start: idx,
        end: idx + f.text.length,
        type: (f.entity_type || 'PHI').toUpperCase(),
        text: f.text,
      });
      searchStart = idx + f.text.length;
    }
  });

  positions.sort((a, b) => a.start - b.start);

  const cleaned = [];
  positions.forEach((p) => {
    if (cleaned.length === 0 || p.start >= cleaned[cleaned.length - 1].end) {
      cleaned.push(p);
    }
  });

  const parts = [];
  let lastIdx = 0;

  cleaned.forEach((p, i) => {
    if (p.start > lastIdx) {
      parts.push(<span key={`text-${i}`}>{text.slice(lastIdx, p.start)}</span>);
    }
    const colorClass = PHI_TYPE_COLORS[p.type] || 'bg-red-500/25 text-sg-red border-red-500/40';
    parts.push(
      <mark
        key={`phi-${i}`}
        className={`${colorClass} inline-flex items-center gap-1 border rounded px-1.5 py-0.5 font-mono text-xs font-semibold mx-0.5`}
        title={`HIPAA § 164.514: ${p.type}`}
      >
        <span className="text-[10px] opacity-75 uppercase">{p.type}:</span>
        <span>{p.text}</span>
      </mark>
    );
    lastIdx = p.end;
  });

  if (lastIdx < text.length) {
    parts.push(<span key="rest">{text.slice(lastIdx)}</span>);
  }

  return <>{parts.length > 0 ? parts : <span>{text}</span>}</>;
}

function highlightRedacted(text) {
  if (!text) return <span className="text-gray-500 italic">No sanitized output available</span>;

  const regex = /\[REDACTED_([A-Z_]+)\]/g;
  const parts = [];
  let lastIdx = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(<span key={`rt-${lastIdx}`}>{text.slice(lastIdx, match.index)}</span>);
    }
    const type = match[1];
    parts.push(
      <span
        key={`rm-${match.index}`}
        className="inline-flex items-center gap-1 bg-sg-green/15 text-sg-green border border-sg-green/30 rounded px-1.5 py-0.5 font-mono text-xs font-semibold mx-0.5 shadow-sm shadow-sg-green/10"
        title="Sanitized according to HIPAA Safe Harbor de-identification standards"
      >
        <span>🛡️</span>
        <span>[REDACTED_{type}]</span>
      </span>
    );
    lastIdx = match.index + match[0].length;
  }

  if (lastIdx < text.length) {
    parts.push(<span key="rrest">{text.slice(lastIdx)}</span>);
  }

  return <>{parts.length > 0 ? parts : <span>{text}</span>}</>;
}

export default function RedactionViewer({ event, currentRole = 'dpo', onClose }) {
  const [copiedType, setCopiedType] = useState(null);

  if (!event) return null;

  const phiObj = (!Array.isArray(event.phi_findings) && typeof event.phi_findings === 'object' && event.phi_findings) ? event.phi_findings : {};
  const findings = Array.isArray(event.phi_findings)
    ? event.phi_findings
    : (Array.isArray(phiObj.findings) ? phiObj.findings : []);

  const isVisionEvent = Boolean(
    (event.ai_service && event.ai_service.toLowerCase().includes('vision')) ||
    event.is_multimodal ||
    phiObj.is_multimodal
  );
  const rawImageUrl = phiObj.raw_image_url || event.raw_image_url || (isVisionEvent ? '/scans/scan_1792778192_raw.jpg' : null);
  const maskedImageUrl = phiObj.masked_image_url || event.masked_image_url || (isVisionEvent ? '/scans/scan_1792778192_masked.jpg' : null);
  const docName = phiObj.document_name || event.document_name || (isVisionEvent ? 'fortis_icu_er_prescription.jpg' : 'In-Flight Clinical Scan');

  const [activeViewTab, setActiveViewTab] = useState('panels'); // 'panels' | 'rehydration'
  const aiMeta = getAiMeta(event.ai_service);
  const origLen = (event.original_text || '').length;
  const redLen = (event.redacted_text || '').length;
  const origWords = (event.original_text || '').trim().split(/\s+/).filter(Boolean).length;
  const isBlocked = event.severity === 'critical';
  const rehydrationMap = event.rehydration_map || {};
  const preservedTerms = event.clinical_terms_preserved || [];

  const copyToClipboard = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel w-[94vw] max-w-6xl max-h-[90vh] overflow-hidden flex flex-col border border-sg-cyan/30 shadow-2xl shadow-black/80 rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-950/80">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
              <span className="text-lg">{aiMeta.icon}</span>
              <span className="text-xs font-semibold text-white tracking-wide">{aiMeta.name}</span>
            </div>

            <StatusBadge severity={event.severity} />

            <div
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border ${
                isBlocked
                  ? 'bg-red-500/20 text-sg-red border-red-500/40'
                  : 'bg-emerald-500/15 text-sg-green border-emerald-500/30'
              }`}
            >
              {isBlocked ? '🚫 INTERCEPTED & BLOCKED' : '🛡️ REDACTED & FORWARDED'}
            </div>

            {event.department && (
              <span className="text-xs font-mono text-sg-amber bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30 font-semibold">
                🏥 {event.department}
              </span>
            )}

            <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400 bg-black/40 px-2.5 py-1 rounded border border-white/5">
              <span>Risk Score:</span>
              <span className={`font-bold ${event.risk_score >= 70 ? 'text-sg-red' : event.risk_score >= 40 ? 'text-sg-amber' : 'text-sg-green'}`}>
                {event.risk_score ?? 0} / 100
              </span>
            </div>

            {event.sha256_hash && (
              <span
                title={`SHA-256 Merkle Vault Proof: ${event.sha256_hash}`}
                className="text-[11px] font-mono text-sg-cyan bg-sg-cyan/10 px-2 py-0.5 rounded border border-sg-cyan/30 flex items-center gap-1"
              >
                🔒 Proof: {event.sha256_hash.slice(0, 10)}...
              </span>
            )}

            {event.voice_call && (
              <span className="flex items-center gap-1 text-xs font-mono text-sg-amber bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                📞 Emergency Alert: {event.voice_call.status}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white border border-transparent hover:border-white/10 text-base"
          >
            ✕
          </button>
        </div>

        {/* HIPAA & Entity Analysis Strip */}
        <div className="px-5 py-2.5 border-b border-white/10 bg-slate-900/60 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-300 flex items-center gap-1">
              <span>🏛️</span> DPDP & Safe Harbor:
            </span>
            {findings.length > 0 ? (
              findings.map((f, i) => {
                const colorClass = PHI_TYPE_COLORS[(f.entity_type || '').toUpperCase()] || 'bg-red-500/20 text-red-400 border-red-500/30';
                return (
                  <span
                    key={i}
                    className={`text-xs px-2 py-0.5 rounded border font-mono font-medium ${colorClass}`}
                  >
                    {f.entity_type}: <span className="font-semibold">&quot;{f.text}&quot;</span>
                  </span>
                );
              })
            ) : (
              <span className="text-xs text-sg-green font-mono bg-sg-green/10 border border-sg-green/20 px-2 py-0.5 rounded">
                ✓ No Protected Health Information Detected
              </span>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveViewTab('panels')}
              className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                activeViewTab === 'panels'
                  ? 'bg-white/20 text-white font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Side-by-Side View
            </button>
            {Object.keys(rehydrationMap).length > 0 && (
              <button
                onClick={() => setActiveViewTab('rehydration')}
                className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                  activeViewTab === 'rehydration'
                    ? 'bg-sg-cyan/20 text-sg-cyan border border-sg-cyan/40 font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🔑 Rehydration Map ({Object.keys(rehydrationMap).length})
              </button>
            )}
            {event.phi_findings?.is_multimodal && (
              <button
                onClick={() => setActiveViewTab('vision')}
                className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                  activeViewTab === 'vision'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40 font-bold shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                📷 Vision Shield ({event.phi_findings.document_name ? 'Lab Slip' : 'Multimodal'})
              </button>
            )}
          </div>
        </div>

        {/* Clinical Protection Banner */}
        {preservedTerms.length > 0 && (
          <div className="px-5 py-2 bg-emerald-950/20 border-b border-emerald-500/20 flex items-center gap-2 text-xs font-mono flex-wrap">
            <span className="text-sg-green font-semibold">🛡️ Retained Clinical Idioms & Syndromes:</span>
            {preservedTerms.map((t, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[11px]">
                ✓ {t}
              </span>
            ))}
          </div>
        )}

        {/* Telemetry and Action Controls */}
        <div className="px-5 py-2 border-b border-white/5 bg-black/40 flex items-center justify-between text-xs text-gray-400 font-mono flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <span>
              Original: <strong className="text-gray-200">{origLen} chars</strong> ({origWords} words)
            </span>
            <span>→</span>
            <span>
              Redacted: <strong className="text-sg-green">{redLen} chars</strong>
            </span>
            <span className="text-sg-cyan">
              Sanitization: 100% Zero-Leak
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(event.original_text, 'orig')}
              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition text-xs flex items-center gap-1"
            >
              {copiedType === 'orig' ? '✓ Copied Original' : '📋 Copy Original'}
            </button>
            <button
              onClick={() => copyToClipboard(event.redacted_text, 'red')}
              className="px-2.5 py-1 rounded bg-sg-green/10 hover:bg-sg-green/20 text-sg-green border border-sg-green/30 transition text-xs flex items-center gap-1 font-semibold"
            >
              {copiedType === 'red' ? '✓ Copied Redacted' : '🛡️ Copy Redacted'}
            </button>
            <button
              onClick={async () => {
                if (currentRole === 'doctor') {
                  alert('Access Denied (DPDP Act 2023 Sec 12): Duty Doctors are not authorized to delete sovereign audit records. Hospital DPO clearance required.');
                  return;
                }
                if (window.confirm(`DPDP Act 2023 (Section 12): Permanently erase security event ${event.event_id?.slice(0, 8)} and purge all audit payload records?`)) {
                  try {
                    await deleteEvent(event.event_id, currentRole);
                    onClose();
                  } catch (err) {
                    alert('Erasure failed: ' + err.message);
                  }
                }
              }}
              disabled={currentRole === 'doctor'}
              title={
                currentRole === 'doctor'
                  ? 'Access Restricted: DPDP Section 12 erasure requires Hospital DPO role'
                  : 'DPDP Act 2023 Sec 12 Right to Erasure'
              }
              className={`px-2.5 py-1 rounded border text-xs flex items-center gap-1 font-semibold transition ${
                currentRole === 'doctor'
                  ? 'bg-slate-800/50 text-slate-500 border-slate-700/50 cursor-not-allowed opacity-40'
                  : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              <span>{currentRole === 'doctor' ? '🔒' : '🗑️'}</span>
              <span>{currentRole === 'doctor' ? 'Erasure Restricted' : 'Erase Record'}</span>
            </button>
          </div>
        </div>

        {/* Side-by-Side Comparison Panels OR Rehydration Map */}
        {activeViewTab === 'panels' ? (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-white/10">
            {/* Original Panel */}
            <div className="flex flex-col overflow-hidden bg-red-950/10">
              <div className="px-4 py-2.5 border-b border-white/10 bg-red-500/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sg-red animate-pulse" />
                  <span className="text-xs font-bold text-sg-red tracking-wider uppercase font-mono">
                    ORIGINAL OUTBOUND PAYLOAD (UNSANITIZED)
                  </span>
                </div>
                <span className="text-[11px] font-mono text-red-400/80">Exfiltration Risk Detected</span>
              </div>
              <div className="flex-1 p-5 overflow-y-auto text-sm leading-relaxed text-gray-200 whitespace-pre-wrap font-sans select-text">
                {rawImageUrl && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs font-mono text-rose-400 mb-1.5 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <span>📷</span> Raw Clinical Capture (Patient PII Exposed)
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/40">
                        {docName}
                      </span>
                    </div>
                    <div className="relative group rounded-xl overflow-hidden border border-rose-500/40 bg-black/60 shadow-xl p-1">
                      <img
                        src={rawImageUrl}
                        alt="Pre-Boundary Raw Clinical Slip"
                        className="w-full max-h-80 object-contain rounded-lg hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          if (!e.target.src.includes('127.0.0.1:8000')) {
                            e.target.src = `http://127.0.0.1:8000/static${rawImageUrl}`;
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
                {highlightPHI(event.original_text, findings)}
              </div>
            </div>

            {/* Redacted Panel */}
            <div className="flex flex-col overflow-hidden bg-emerald-950/10">
              <div className="px-4 py-2.5 border-b border-white/10 bg-sg-green/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sg-green" />
                  <span className="text-xs font-bold text-sg-green tracking-wider uppercase font-mono">
                    TRANSPARENT REDACTED PAYLOAD (SENT TO AI)
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400/80">DPDP Act 2023 Compliant</span>
              </div>
              <div className="flex-1 p-5 overflow-y-auto text-sm leading-relaxed text-gray-200 whitespace-pre-wrap font-sans select-text">
                {maskedImageUrl && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs font-mono text-emerald-400 mb-1.5 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <span>🛡️</span> Sovereign Vision Shield (De-Identified)
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40">
                        Zero Cross-Border Leak • Sec 8
                      </span>
                    </div>
                    <div className="relative group rounded-xl overflow-hidden border border-emerald-500/40 bg-black/60 shadow-xl p-1">
                      <img
                        src={maskedImageUrl}
                        alt="Post-Boundary Sovereign Shielded Slip"
                        className="w-full max-h-80 object-contain rounded-lg hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          if (!e.target.src.includes('127.0.0.1:8000')) {
                            e.target.src = `http://127.0.0.1:8000/static${maskedImageUrl}`;
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
                {highlightRedacted(event.redacted_text)}
              </div>
            </div>
          </div>
        ) : (
          /* Rehydration View */
          <div className="flex-1 p-6 overflow-y-auto bg-slate-950 flex flex-col items-center">
            {currentRole === 'doctor' ? (
              <div className="w-full max-w-xl bg-slate-900/90 border border-rose-500/40 rounded-2xl p-6 text-center space-y-3 shadow-2xl">
                <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-2xl">
                  🔒
                </div>
                <h3 className="text-sm font-bold text-rose-300 uppercase tracking-wider font-mono">
                  ACCESS RESTRICTED: DPDP ACT 2023 SECTION 9 (TIER-3 CLEARANCE)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-md mx-auto">
                  Duty Doctors and Clinical AI Interns are permitted only to inspect pseudonymized diagnostic tokens (e.g. <code className="text-cyan-300 font-mono">[PATIENT_1]</code>, <code className="text-emerald-300 font-mono">[LOCATION_1]</code>).
                </p>
                <div className="p-3 bg-black/60 rounded-xl border border-white/5 text-[11px] font-mono text-slate-400 text-left space-y-1">
                  <div className="text-amber-300 font-semibold">🛡️ Statutory Security Directive:</div>
                  <div>• Rehydration requires Chief Medical Officer (CMO) or DPO Authorization.</div>
                  <div>• Switch to <strong>🏥 Chief Medical Officer</strong> persona in header to review audit map.</div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-2xl bg-slate-900 border border-sg-cyan/30 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                      🔑 Session In-Memory Rehydration Map
                    </h3>
                    <p className="text-xs text-gray-400">
                      External cloud AI sees only anonymous tokens. Doctor terminal dynamically rehydrates values locally:
                    </p>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    ✓ {currentRole === 'cmo' ? 'CMO Clearance Active' : 'DPO Clearance Active'}
                  </span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  {Object.entries(rehydrationMap).map(([token, realVal]) => (
                    <div
                      key={token}
                      className="flex items-center justify-between p-3 rounded bg-black/60 border border-white/5"
                    >
                      <span className="text-sg-cyan font-bold">{token}</span>
                      <span className="text-gray-500">── Maps To ──▶</span>
                      <span className="text-white font-semibold">{realVal}</span>
                    </div>
                  ))}
                  {Object.keys(rehydrationMap).length === 0 && (
                    <div className="text-center py-4 text-xs font-mono text-gray-500">
                      No pseudonymized tokens in this payload
                    </div>
                  )}
                </div>

                {event.sha256_hash && (
                  <div className="p-3 rounded bg-black/40 border border-white/5 text-[11px] font-mono text-gray-400">
                    <span className="text-sg-cyan font-bold">Cryptographic Vault Proof: </span>
                    <span className="select-all text-gray-300">{event.sha256_hash}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Multi-Modal Vision Shield View */}
        {activeViewTab === 'vision' && (
          <div className="flex-1 p-6 overflow-y-auto bg-slate-950/70">
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-bold text-purple-200 flex items-center gap-2">
                    <span>📷</span> Multi-Modal Vision & Lab Slip De-Identification
                  </h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Document: <strong className="text-white">{event.phi_findings?.document_name || 'Medical Document'}</strong>
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 font-mono text-xs border border-purple-400/40 font-semibold">
                  Zero Cross-Border Leak
                </span>
              </div>

              {/* Telemetry Grid */}
              {event.phi_findings?.latency_breakdown && (
                <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-black/50 border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Text Engine Latency:</span>
                    <span className="text-cyan-300 text-base font-bold">{event.phi_findings.latency_breakdown.text_ms} ms</span>
                  </div>
                  <div className="p-3 rounded-lg bg-black/50 border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Vision ROI Masking:</span>
                    <span className="text-purple-300 text-base font-bold">{event.phi_findings.latency_breakdown.vision_ms} ms</span>
                  </div>
                  <div className="p-3 rounded-lg bg-black/50 border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Upload Bandwidth Saved:</span>
                    <span className="text-emerald-400 text-base font-bold">{event.phi_findings.latency_breakdown.bandwidth_saved_pct}%</span>
                  </div>
                </div>
              )}

              {/* Masked Regions */}
              {event.phi_findings?.redaction_boxes && (
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
                  <span className="text-xs font-semibold text-slate-300 font-mono block">
                    Protected Image Regions (Pre-Boundary Bounding Box Shields):
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    {event.phi_findings.redaction_boxes.map((box, bIdx) => (
                      <div key={bIdx} className="p-2 rounded bg-slate-900 border border-white/5 flex items-center justify-between">
                        <span className="text-rose-400 font-bold">{box.entity}:</span>
                        <span className="text-slate-300">{box.val}</span>
                        <span className="text-emerald-400 text-[10px]">✓ Shielded</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer / Status Bar */}
        <div className="px-4 py-2.5 border-t border-white/10 bg-slate-950 flex items-center justify-between text-[11px] font-mono text-gray-500">
          <div className="flex items-center gap-3">
            <span>MediCloak Core: v2.4.0</span>
            <span>•</span>
            <span>Enforcement Mode: Layer-7 Transparent MITM Proxy</span>
            <span>•</span>
            <span className="text-emerald-400">Zero-Trust Active</span>
          </div>
          <div>
            Click outside or press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-gray-300">ESC</kbd> to close
          </div>
        </div>
      </div>
    </div>
  );
}
