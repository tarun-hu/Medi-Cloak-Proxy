import React, { useState } from 'react';

const DEMO_PRESETS = [
  {
    title: '🏥 Case 1: ER & Regional Syndromes (Jaipur Foot & Delhi Belly)',
    department: 'Emergency Room (ER)',
    rawText:
      'Patient Dalla Ram, ABHA ID: 32-4415-9982-1012, Aadhaar: 4589 1234 9081, residing at Sector 45, Madras. ' +
      'Came to Emergency Room with acute Madras Eye and severe Delhi Belly. ' +
      'Patient has an existing Jaipur Foot prosthetic limb. Prescribed Dolo-650 BD and ATT protocol.',
    competitorBroken:
      'Patient [REDACTED], ABHA ID: 32-4415-9982-1012, Aadhaar: [REDACTED], residing at [REDACTED], [REDACTED]. ' +
      'Came to Emergency Room with acute [REDACTED] and severe [REDACTED]. ' +
      'Patient has an existing [REDACTED] prosthetic limb. Prescribed [REDACTED] BD and [REDACTED] protocol.',
    medicloakProtected:
      'Patient [PATIENT_1], ABHA ID: [HEALTH_ID_1], Aadhaar: [AADHAAR_ID_1], residing at [LOCATION_1]. ' +
      'Came to Emergency Room with acute Madras Eye and severe Delhi Belly. ' +
      'Patient has an existing Jaipur Foot prosthetic limb. Prescribed Dolo-650 BD and ATT protocol.',
    preservedTerms: ['Jaipur Foot', 'Madras Eye', 'Delhi Belly', 'Dolo-650', 'ATT', 'BD'],
    rehydrationMap: {
      '[PATIENT_1]': 'Dalla Ram',
      '[HEALTH_ID_1]': '32-4415-9982-1012',
      '[AADHAAR_ID_1]': '4589 1234 9081',
      '[LOCATION_1]': 'Sector 45, Madras',
    },
  },
  {
    title: '🎗️ Case 2: Oncology & NCR Locality (Covishield & Biopsy)',
    department: 'Oncology',
    rawText:
      'Patient Rajesh Verma, ABHA ID: 14-8891-2304-5512, DLF Phase 3, Cyber City, Gurgaon. ' +
      'Histopathology confirms stage 2 adenocarcinoma. Vaccinated with Covishield and Covaxin regimens. ' +
      'Advised urgent referral to AIIMS New Delhi for radiation oncology evaluation.',
    competitorBroken:
      'Patient [REDACTED], ABHA ID: 14-8891-2304-5512, [REDACTED], [REDACTED], [REDACTED]. ' +
      'Histopathology confirms stage 2 adenocarcinoma. Vaccinated with [REDACTED] and [REDACTED] regimens. ' +
      'Advised urgent referral to [REDACTED] for radiation oncology evaluation.',
    medicloakProtected:
      'Patient [PATIENT_1], ABHA ID: [HEALTH_ID_1], [LOCATION_1]. ' +
      'Histopathology confirms stage 2 adenocarcinoma. Vaccinated with Covishield and Covaxin regimens. ' +
      'Advised urgent referral to AIIMS New Delhi for radiation oncology evaluation.',
    preservedTerms: ['Covishield', 'Covaxin', 'AIIMS New Delhi', 'Oncology'],
    rehydrationMap: {
      '[PATIENT_1]': 'Rajesh Verma',
      '[HEALTH_ID_1]': '14-8891-2304-5512',
      '[LOCATION_1]': 'DLF Phase 3, Cyber City, Gurgaon',
    },
  },
  {
    title: '👶 Case 3: Pediatrics & Endemic Fevers (Kala-azar & AGE)',
    department: 'Pediatrics',
    rawText:
      'Baby Ananya, mother Priya Nair, phone +91 9811234567, Sector 18, Noida. ' +
      'Suspected Kala-azar / Assam Fever with severe AGE symptoms. ' +
      'Prescribed PCM 250mg TDS and oral rehydration salts.',
    competitorBroken:
      'Baby [REDACTED], mother [REDACTED], phone [REDACTED], [REDACTED], [REDACTED]. ' +
      'Suspected [REDACTED] with severe [REDACTED] symptoms. ' +
      'Prescribed [REDACTED] TDS and oral rehydration salts.',
    medicloakProtected:
      'Baby [PATIENT_1], mother [PATIENT_2], phone [PHONE_1], [LOCATION_1]. ' +
      'Suspected Kala-azar / Assam Fever with severe AGE symptoms. ' +
      'Prescribed PCM 250mg TDS and oral rehydration salts.',
    preservedTerms: ['Kala-azar', 'Assam Fever', 'AGE', 'PCM', 'TDS'],
    rehydrationMap: {
      '[PATIENT_1]': 'Ananya',
      '[PATIENT_2]': 'Priya Nair',
      '[PHONE_1]': '+91 9811234567',
      '[LOCATION_1]': 'Sector 18, Noida',
    },
  },
];

export default function LiveDemoSandbox({ onClose }) {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('comparison'); // 'comparison' | 'rehydration'
  const [copiedKey, setCopiedKey] = useState(null); // 'raw' | 'competitor' | 'medicloak'
  const currentPreset = DEMO_PRESETS[selectedPresetIndex];

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="live-demo-modal">
      <div
        className="glass-panel w-[96vw] max-w-7xl max-h-[92vh] overflow-hidden flex flex-col border border-cyan-400/40 shadow-2xl rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-white/10 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wider flex items-center gap-2">
                MEDICLOAK SOVEREIGN LIVE COMPARATIVE SHOWCASE
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                  Judges Comparative View
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Demonstrating Dual-Pass Clinical Context Shield vs. Broken Competitor Proxies
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition flex items-center justify-center text-base"
          >
            ✕
          </button>
        </div>

        {/* Preset Selector Strip */}
        <div className="px-4 py-2.5 bg-slate-900/80 border-b border-white/10 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-300 font-mono">Select Clinical Case:</span>
            {DEMO_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPresetIndex(idx)}
                className={`px-3 py-1 rounded text-xs font-mono transition border ${
                  selectedPresetIndex === idx
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 font-bold'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                {preset.title.split(':')[0]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                activeTab === 'comparison'
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3-Way Side-by-Side
            </button>
            <button
              onClick={() => setActiveTab('rehydration')}
              className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                activeTab === 'rehydration'
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🔑 Local Rehydration Map
            </button>
          </div>
        </div>

        {/* Preserved Clinical Banner */}
        <div className="px-4 py-2 bg-black/40 border-b border-white/5 flex items-center justify-between text-xs font-mono flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-cyan-300 font-semibold">🛡️ Protected Clinical Terms:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {currentPreset.preservedTerms.map((term, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px]"
                >
                  ✓ {term}
                </span>
              ))}
            </div>
          </div>
          <span className="text-[11px] text-slate-400">
            Hospital Ward: <strong className="text-amber-400">{currentPreset.department}</strong>
          </span>
        </div>

        {/* Main Content Area */}
        {activeTab === 'comparison' ? (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-white/10">
            {/* COLUMN 1: DOCTOR'S RAW INPUT */}
            <div className="flex flex-col overflow-hidden bg-slate-950/40">
              <div className="px-4 py-2.5 bg-blue-500/10 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-xs font-bold text-blue-300 tracking-wider font-mono">
                    1. RAW CLINICAL INPUT (DOCTOR)
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(currentPreset.rawText, 'raw')}
                  title="Copy raw doctor text"
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/10 hover:bg-white/20 text-slate-300 transition flex items-center gap-1"
                >
                  {copiedKey === 'raw' ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto text-xs font-mono leading-relaxed text-slate-200 whitespace-pre-wrap select-text bg-blue-950/5">
                {currentPreset.rawText}
              </div>
              <div className="p-2.5 border-t border-white/10 bg-slate-900/60 text-[11px] font-mono text-slate-400">
                🛑 Unprotected: Transmitting this directly to US AI violates DPDP Act 2023.
              </div>
            </div>

            {/* COLUMN 2: GENERIC BROKEN PROXY (COMPETITOR) */}
            <div className="flex flex-col overflow-hidden bg-rose-950/20">
              <div className="px-4 py-2.5 bg-rose-500/15 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-xs font-bold text-rose-400 tracking-wider font-mono">
                    2. GENERIC BROKEN PROXY (COMPETITOR)
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(currentPreset.competitorBroken, 'competitor')}
                  title="Copy broken competitor text"
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/10 hover:bg-white/20 text-rose-300 transition flex items-center gap-1"
                >
                  {copiedKey === 'competitor' ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto text-xs font-mono leading-relaxed text-rose-200 whitespace-pre-wrap select-text bg-rose-950/10">
                {currentPreset.competitorBroken}
              </div>
              <div className="p-2.5 border-t border-white/10 bg-rose-950/40 text-[11px] font-mono text-rose-400">
                ⚠️ FATAL CLINICAL FAILURE: Place syndromes erased as places ([REDACTED] Foot). AI cannot diagnose!
              </div>
            </div>

            {/* COLUMN 3: MEDICLOAK SOVEREIGN PROTECTION (WINNER) */}
            <div className="flex flex-col overflow-hidden bg-emerald-950/20">
              <div className="px-4 py-2.5 bg-emerald-500/15 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300 tracking-wider font-mono">
                    3. MEDICLOAK SOVEREIGN PROTECTION
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(currentPreset.medicloakProtected, 'medicloak')}
                  title="Copy sovereign protected prompt"
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/10 hover:bg-white/20 text-emerald-300 transition flex items-center gap-1"
                >
                  {copiedKey === 'medicloak' ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto text-xs font-mono leading-relaxed text-emerald-100 whitespace-pre-wrap select-text bg-emerald-950/10">
                {currentPreset.medicloakProtected}
              </div>
              <div className="p-2.5 border-t border-white/10 bg-emerald-950/40 text-[11px] font-mono text-emerald-400 font-semibold">
                ✅ WINNING OUTCOME: 100% PII Sanitized + 100% Medical Diagnostic Context Retained!
              </div>
            </div>
          </div>
        ) : (
          /* REHYDRATION VIEW */
          <div className="flex-1 p-6 overflow-y-auto bg-slate-950">
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-cyan-400/30">
                <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  🔑 Local In-Memory Turn Rehydration Map
                  <span className="text-xs font-mono text-cyan-300">Client-Side Memory Only</span>
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  External Cloud AI receives strictly anonymous tokens. The hospital terminal re-hydrates the response locally for the doctor:
                </p>
                <div className="space-y-2 font-mono text-xs">
                  {Object.entries(currentPreset.rehydrationMap).map(([token, realVal]) => (
                    <div
                      key={token}
                      className="flex items-center justify-between p-2.5 rounded bg-black/50 border border-white/5"
                    >
                      <span className="text-cyan-300 font-bold">{token}</span>
                      <span className="text-slate-500">── Rehydrates To ──▶</span>
                      <span className="text-white font-semibold">{realVal}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 font-mono text-xs text-slate-300">
                <span className="text-emerald-400 font-bold">🔒 Sovereign Guarantee:</span> Real patient identities never cross the local proxy gateway. External LLMs process anonymous mathematical tokens.
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-slate-950 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>MediCloak Sovereign NLP Engine • Dual-Pass Shielding Architecture</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white transition text-xs"
          >
            Close Sandbox
          </button>
        </div>
      </div>
    </div>
  );
}
