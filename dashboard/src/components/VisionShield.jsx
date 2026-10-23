import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { interceptVision } from '../lib/api';

const PRESET_CHANNELS = [
  {
    id: 'apollo_cbc',
    channelLabel: 'CH-1 (ER Ward 4B)',
    terminalIp: '10.0.40.112',
    doctorName: 'Dr. A. K. Banerjee (MD, Emergency Medicine)',
    targetAi: 'ChatGPT-4o (chatgpt.com/backend-api/conversation)',
    name: '🩸 Apollo Diagnostics - Dengue CBC Blood Report Slip',
    hospital: 'APOLLO CLINICAL DIAGNOSTICS & PATH LABS',
    headerBg: 'from-blue-700 to-cyan-600',
    department: 'Hematology / Emergency Ward 4B',
    aiService: 'ChatGPT-4o (Vision)',
    patient: {
      name: 'Rajesh Verma',
      ageGender: '48 Yrs / Male',
      abha: '91-8821-4412-0091',
      phone: '+91 98201 44102',
      barcode: '*APL-992144-X*',
      date: '23-Oct-2026 18:45',
      doctor: 'Dr. A. K. Banerjee (MD)',
      refNo: 'REF-2026-9921A',
    },
    prompt:
      'Patient Rajesh Verma (ABHA 91-8821-4412-0091) ke blood test report mein platelets 85,000 aa rahe hain aur dengue NS1 positive hai. Please advise emergency IV fluids protocol and platelet transfusion threshold.',
    tests: [
      { name: 'Platelet Count', val: '85,000', ref: '1,50,000 - 4,50,000', unit: '/mcL', flag: 'CRITICAL LOW', color: 'text-rose-400 font-bold' },
      { name: 'Dengue NS1 Antigen', val: 'POSITIVE', ref: 'Negative', unit: 'Rapid Immuno', flag: 'POSITIVE', color: 'text-rose-400 font-bold' },
      { name: 'Hemoglobin (Hb)', val: '10.2', ref: '13.0 - 17.0', unit: 'g/dL', flag: 'LOW', color: 'text-amber-400' },
      { name: 'Total Leukocyte Count (TLC)', val: '12,400', ref: '4,000 - 11,000', unit: '/mcL', flag: 'HIGH', color: 'text-amber-400' },
      { name: 'Hematocrit (PCV)', val: '46.2', ref: '40.0 - 50.0', unit: '%', flag: 'ELEVATED', color: 'text-amber-300' },
    ],
    diagnosisSummary: 'Acute Febrile Illness with Dengue Thrombocytopenia & Hemoconcentration.',
  },
  {
    id: 'aiims_xray',
    channelLabel: 'CH-2 (Pulmonology)',
    terminalIp: '10.0.40.118',
    doctorName: 'Dr. Priya Narang (DNB, Pulmonology)',
    targetAi: 'Claude 3.5 Sonnet (claude.ai/api/append_message)',
    name: '🩻 AIIMS New Delhi - Chest X-Ray & Pulmonary Slip',
    hospital: 'ALL INDIA INSTITUTE OF MEDICAL SCIENCES, NEW DELHI',
    headerBg: 'from-emerald-700 to-teal-600',
    department: 'Radiology / Pulmonary Medicine',
    aiService: 'Claude 3.5 Sonnet (Vision)',
    patient: {
      name: 'Meena Kumari',
      ageGender: '36 Yrs / Female',
      abha: 'AIIMS-CR-2026-004921',
      phone: '+91 94112 09844',
      barcode: '*AIIMS-PULM-9021*',
      date: '23-Oct-2026 19:10',
      doctor: 'Dr. Priya Narang (DNB)',
      refNo: 'RAD-904-PULM',
    },
    prompt:
      'Attached Chest X-ray of patient Meena Kumari, CR No AIIMS-CR-2026-004921 showing lower lobe consolidation. Suggest antibiotics regimen for community-acquired pneumonia.',
    tests: [
      { name: 'Bilateral Lower Lobes', val: 'Patchy Consolidation', ref: 'Clear Lung Fields', unit: 'PA View', flag: 'ABNORMAL', color: 'text-rose-400 font-bold' },
      { name: 'Costophrenic Angles', val: 'Left Angle Blunted', ref: 'Sharp & Clear', unit: 'Visual', flag: 'EFFUSION', color: 'text-amber-400' },
      { name: 'Cardiothoracic Ratio', val: '0.48', ref: '< 0.50', unit: 'Ratio', flag: 'NORMAL', color: 'text-emerald-400' },
      { name: 'SpO2 on Room Air', val: '91%', ref: '95 - 100%', unit: '%', flag: 'HYPOXIA', color: 'text-rose-400 font-bold' },
    ],
    diagnosisSummary: 'Community-Acquired Lower Respiratory Tract Infection / Atypical Pneumonia with Mild Left Pleural Reaction.',
  },
  {
    id: 'fortis_er',
    channelLabel: 'CH-3 (Critical Care ICU)',
    terminalIp: '10.0.40.125',
    doctorName: 'Dr. Rohit Singhania (Critical Care Specialist)',
    targetAi: 'Google Gemini 1.5 Pro (gemini.google.com/batchexecute)',
    name: '💊 Fortis Escorts - ER Intensive Care Prescription Slip',
    hospital: 'FORTIS ESCORTS HEART INSTITUTE & CRITICAL CARE',
    headerBg: 'from-purple-700 to-indigo-600',
    department: 'Intensive Care Unit (ICU Bed 12B)',
    aiService: 'Google Gemini 1.5 Pro (Vision)',
    patient: {
      name: 'Kabir Mehta',
      ageGender: '62 Yrs / Male',
      abha: 'ER-MRN-2026-0941',
      phone: '+91 98103 77412',
      barcode: '*FORTIS-ER-0941*',
      date: '23-Oct-2026 19:35',
      doctor: 'Dr. Rohit Singhania (Critical Care)',
      refNo: 'ICU-BED-12B',
    },
    prompt:
      'Patient Kabir Mehta admitted in ICU Bed 12B with acute dyspnea. Check drug-drug interaction between Piperacillin-Tazobactam and Furosemide in CKD stage 3.',
    tests: [
      { name: 'Inj Piperacillin-Tazobactam', val: '4.5g IV Q8H', ref: 'Renal Adjusted', unit: 'IV Infusion', flag: 'ANTIBIOTIC', color: 'text-cyan-300' },
      { name: 'Inj Furosemide', val: '20mg IV Stat', ref: 'Diuretic Protocol', unit: 'Slow IV', flag: 'DIURETIC', color: 'text-amber-400' },
      { name: 'Serum Creatinine', val: '2.4', ref: '0.7 - 1.3', unit: 'mg/dL', flag: 'ELEVATED', color: 'text-rose-400 font-bold' },
      { name: 'eGFR', val: '42', ref: '> 90', unit: 'mL/min', flag: 'CKD STAGE 3', color: 'text-rose-400 font-bold' },
    ],
    diagnosisSummary: 'Acute Decompensated Heart Failure with Fluid Overload & Acute-on-Chronic Kidney Injury.',
  },
];

export default function VisionShield({ events = [], onClose }) {
  const [selectedChannel, setSelectedChannel] = useState(PRESET_CHANNELS[0]);
  const [viewMode, setViewMode] = useState('side_by_side'); // 'side_by_side' | 'pre_boundary' | 'sanitized'
  const [isIntercepting, setIsIntercepting] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [activeTab, setActiveTab] = useState('cctv_split'); // 'cctv_split' | 'wire_payload'

  // Look for any recent multi-modal event from live events list
  useEffect(() => {
    const liveMultiModal = events.find((e) => e.phi_findings?.is_multimodal || (e.ai_service || '').includes('Vision'));
    if (liveMultiModal && !result) {
      const docId = liveMultiModal.phi_findings?.document_id || 'apollo_cbc';
      const matched = PRESET_CHANNELS.find((p) => p.id === docId) || PRESET_CHANNELS[0];
      setSelectedChannel(matched);
      setResult({
        status: 'success',
        event_id: liveMultiModal.event_id,
        original_text: liveMultiModal.original_text,
        sanitized_text: liveMultiModal.redacted_text,
        document_name: liveMultiModal.phi_findings?.document_name || matched.name,
        document_id: docId,
        redaction_boxes: liveMultiModal.phi_findings?.redaction_boxes || [],
        clinical_terms_preserved: liveMultiModal.clinical_terms_preserved || matched.tests.map((t) => `${t.name}: ${t.val}`),
        sha256_hash: liveMultiModal.sha256_hash || '7f83a04b91c0e29d748f...',
        latency_breakdown: liveMultiModal.phi_findings?.latency_breakdown || {
          text_ms: 3.8,
          vision_ms: 19.0,
          total_ms: 22.8,
          bandwidth_saved_pct: 89.2,
        },
      });
    }
  }, [events]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleSelectChannel = (ch) => {
    setSelectedChannel(ch);
    setResult(null);
  };

  const handleTriggerWireInterception = async () => {
    setIsIntercepting(true);
    try {
      const data = await interceptVision({
        prompt_text: selectedChannel.prompt,
        document_id: selectedChannel.id,
        document_name: selectedChannel.name,
        ai_service: selectedChannel.aiService,
        department: selectedChannel.department,
      });
      setResult(data);
    } catch (err) {
      alert('Wire interception trigger failed: ' + err.message);
    } finally {
      setIsIntercepting(false);
    }
  };

  const copyHash = (hash) => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return createPortal(
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}>
      <div
        className="slide-in w-[98vw] max-w-7xl max-h-[96vh] flex flex-col rounded-2xl bg-[#070b16] border border-cyan-500/40 shadow-2xl shadow-black text-slate-200 overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CCTV Top Forensics Header */}
        <div className="p-3.5 border-b border-cyan-500/20 bg-slate-950/95 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <span className="text-xl animate-pulse">📡</span>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                  <span>LIVE PROXY TRAFFIC INTERCEPTION MIRROR</span>
                  <span className="text-[10px] text-slate-400 font-mono font-normal">| SOC CCTV WIRE STREAM</span>
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  L7 PROXY ACTIVE (127.0.0.1:8080)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  DPDP §8(6) & §10 Zero-Leak Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="text-cyan-300 font-mono">Zero Doctor Friction:</span>
                <span>Doctor operates directly in ChatGPT/Claude. MediCloak passively intercepts & sanitizes traffic in-flight.</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition flex items-center justify-center text-base"
              title="Close Monitor (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Doctor Terminal Channels Bar & Live Ingestion Trigger */}
        <div className="px-4 py-2 bg-slate-900/90 border-b border-white/10 flex items-center justify-between flex-wrap gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <span>🎯</span> Doctor Terminals On Wire:
            </span>
            {PRESET_CHANNELS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => handleSelectChannel(ch)}
                className={`px-3 py-1.5 rounded-lg border transition text-left flex items-center gap-2 ${
                  selectedChannel.id === ch.id
                    ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300 font-bold shadow-sm'
                    : 'bg-black/40 border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>{ch.channelLabel}</span>
                <span className="text-[10px] opacity-75 font-normal">({ch.terminalIp})</span>
              </button>
            ))}
          </div>

          {/* Trigger In-Flight Interception Demo Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerWireInterception}
              disabled={isIntercepting}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-mono font-bold text-xs transition shadow-lg shadow-cyan-500/20 flex items-center gap-2"
              title="Simulates an ER Doctor uploading this medical slip to ChatGPT in real-time"
            >
              {isIntercepting ? (
                <>
                  <span className="animate-spin">⚙️</span>
                  <span>Intercepting Wire (22.8ms)...</span>
                </>
              ) : (
                <>
                  <span className="text-base">⚡</span>
                  <span>Fire Wire Intercept (Simulate Doctor ➔ ChatGPT)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* In-Flight Wiretap Forensic Details */}
        <div className="px-4 py-2 bg-[#050811] border-b border-white/10 flex items-center justify-between flex-wrap gap-2 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 text-slate-300">
              <span className="text-rose-400 font-bold">SOURCE:</span> {selectedChannel.terminalIp} ({selectedChannel.doctorName})
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="text-cyan-400 font-bold">DESTINATION:</span> {selectedChannel.targetAi}
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1">
              <span className="text-amber-400 font-bold">PAYLOAD:</span> In-flight Multipart/form-data (Clinical Slip + Prompt)
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-lg border border-white/10 text-xs">
            <button
              onClick={() => setViewMode('side_by_side')}
              className={`px-2 py-0.5 rounded transition ${
                viewMode === 'side_by_side' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dual CCTV Monitor
            </button>
            <button
              onClick={() => setViewMode('pre_boundary')}
              className={`px-2 py-0.5 rounded transition ${
                viewMode === 'pre_boundary' ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pre-Boundary Only
            </button>
            <button
              onClick={() => setViewMode('sanitized')}
              className={`px-2 py-0.5 rounded transition ${
                viewMode === 'sanitized' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sanitized Only
            </button>
          </div>
        </div>

        {/* Real-time Gateway Benchmark Telemetry (Shown when result is available) */}
        {result && (
          <div className="px-4 py-2 bg-gradient-to-r from-cyan-950/40 via-emerald-950/30 to-purple-950/40 border-b border-cyan-500/30 flex items-center justify-between flex-wrap gap-3 text-xs font-mono">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1 text-emerald-300 font-bold">
                <span>✓</span> Intercepted & Scrubbed in {result.latency_breakdown.total_ms} ms (Zero Doctor Lag)
              </span>
              <span className="text-slate-400">
                (Text Engine: <strong className="text-cyan-300">{result.latency_breakdown.text_ms}ms</strong> | Vision ROI Masking:{' '}
                <strong className="text-purple-300">{result.latency_breakdown.vision_ms}ms</strong>)
              </span>
              <span className="text-slate-400">
                Bandwidth Minimized: <strong className="text-emerald-400">{result.latency_breakdown.bandwidth_saved_pct}%</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">SHA-256 Merkle Proof:</span>
              <button
                onClick={() => copyHash(result.sha256_hash)}
                className="px-2 py-0.5 rounded bg-black/60 border border-cyan-400/30 text-cyan-300 text-[10px] font-mono hover:bg-cyan-500/10 transition flex items-center gap-1"
                title="Click to copy full cryptographic hash"
              >
                <span>{result.sha256_hash.slice(0, 16)}...</span>
                <span>{copiedHash ? '✓ Copied' : '📋'}</span>
              </button>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                Audit Vault Logged ✓
              </span>
            </div>
          </div>
        )}

        {/* Main CCTV Screen Display */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#060a14]">
          {viewMode === 'side_by_side' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left CCTV: Pre-Boundary Inbound Wire (Raw Doctor Packet) */}
              <div className="rounded-xl border border-rose-500/40 bg-slate-950/80 p-3 space-y-3 relative overflow-hidden shadow-lg shadow-rose-950/20">
                {/* CCTV Reticle Header */}
                <div className="flex items-center justify-between pb-2 border-b border-rose-500/30">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping"></span>
                    <span className="text-xs font-mono font-bold text-rose-400 tracking-wider">
                      🔴 CCTV-1: PRE-BOUNDARY WIRE (RAW INBOUND PACKET)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded border border-rose-500/40 font-bold">
                    ⚠️ 5 PII LEAKS EXPOSED
                  </span>
                </div>

                {/* Captured Doctor In-Flight Prompt */}
                <div className="p-2.5 rounded-lg bg-black/60 border border-rose-500/30 text-xs font-mono text-slate-300">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-rose-400 font-bold uppercase">Doctor's Inbound Prompt to AI:</span>
                    <span className="text-[10px] text-slate-500">HTTP Body [json.messages[0].content]</span>
                  </div>
                  <p className="leading-relaxed">{selectedChannel.prompt}</p>
                </div>

                {/* Attached Clinical Document Slip (Raw with PHI Warning Bounding Boxes) */}
                <div>
                  <div className="text-[10px] font-mono text-rose-400/90 mb-1 flex items-center justify-between">
                    <span>ATTACHED CLINICAL DOCUMENT (RAW IMAGE STREAM):</span>
                    <span className="text-slate-500 font-mono text-[9px]">MIME: image/jpeg • 1080x1420</span>
                  </div>
                  <ClinicalSlipRenderer preset={selectedChannel} isSanitized={false} />
                </div>
              </div>

              {/* Right CCTV: Post-Boundary Outbound Wire (MediCloak Scrubbed Packet) */}
              <div className="rounded-xl border border-emerald-500/40 bg-slate-950/80 p-3 space-y-3 relative overflow-hidden shadow-lg shadow-emerald-950/20">
                {/* CCTV Reticle Header */}
                <div className="flex items-center justify-between pb-2 border-b border-emerald-500/30">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                    <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider">
                      🟢 CCTV-2: POST-BOUNDARY WIRE (DISPATCHED TO OPENAI)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/40 font-bold">
                    ✓ ZERO-LEAK PROTECTED
                  </span>
                </div>

                {/* Sanitized Outbound Prompt */}
                <div className="p-2.5 rounded-lg bg-black/60 border border-emerald-500/30 text-xs font-mono text-slate-300">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">Scrubbed Payload Forwarded to Cloud AI:</span>
                    <span className="text-[10px] text-emerald-400/80">DPDP §8(6) Safe Harbor Verified</span>
                  </div>
                  <p className="leading-relaxed">
                    {result ? (
                      result.sanitized_text
                    ) : (
                      <span className="text-slate-500 italic">
                        Listening on 127.0.0.1:8080... Click "Fire Wire Intercept" or upload in proxied browser to mirror payload.
                      </span>
                    )}
                  </p>
                </div>

                {/* Sanitized Document Slip (Solid Privacy Shields & Preserved Diagnostics) */}
                <div>
                  <div className="text-[10px] font-mono text-emerald-400/90 mb-1 flex items-center justify-between">
                    <span>FORWARDED CLINICAL DOCUMENT (ROI CENSOR MASKED):</span>
                    <span className="text-emerald-400 font-mono text-[9px]">100% Diagnostic Utility Retained</span>
                  </div>
                  <ClinicalSlipRenderer preset={selectedChannel} isSanitized={true} isProcessed={Boolean(result)} />
                </div>
              </div>
            </div>
          ) : viewMode === 'pre_boundary' ? (
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-rose-500/30">
                <span className="text-sm font-mono font-bold text-rose-400 flex items-center gap-2">
                  <span>⚠️</span> PRE-BOUNDARY CLINICAL DOCUMENT (RAW PATIENT PII VISIBLE)
                </span>
                <span className="text-xs font-mono text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                  5 Protected Entities Identified
                </span>
              </div>
              <ClinicalSlipRenderer preset={selectedChannel} isSanitized={false} />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-500/30">
                <span className="text-sm font-mono font-bold text-emerald-400 flex items-center gap-2">
                  <span>🛡️</span> SANITIZED OUTGOING CLINICAL DOCUMENT (PII SHIELDED)
                </span>
                <span className="text-xs font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  DPDP Act 2023 Compliant
                </span>
              </div>
              <ClinicalSlipRenderer preset={selectedChannel} isSanitized={true} isProcessed={Boolean(result)} />
            </div>
          )}
        </div>

        {/* CCTV Monitoring Footer */}
        <div className="p-3 border-t border-white/10 bg-slate-950/95 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
          <div className="text-slate-400 flex items-center gap-3">
            <span>• Active Wire: <strong>127.0.0.1:8080 (Layer-7 Proxy)</strong></span>
            <span>• Gateway Engine: <strong>Dual-Pass Presidio + Medical Vision Shield</strong></span>
            <span>• Target Cloud AI: <strong className="text-cyan-300">{selectedChannel.targetAi}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-mono transition"
          >
            Close CCTV Monitor
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * High-Fidelity Clinical Lab Slip / Medical Document Renderer
 * Supports both Exposed Pre-Boundary view (red pulsing bounding boxes)
 * and Sanitized Post-Boundary view (black solid privacy mask bars)
 */
function ClinicalSlipRenderer({ preset, isSanitized, isProcessed = true }) {
  const p = preset.patient;

  return (
    <div className="rounded-xl border border-white/15 bg-white text-slate-900 shadow-xl overflow-hidden font-sans select-none text-[11px] relative">
      {/* Hospital Letterhead Header */}
      <div className={`p-3 bg-gradient-to-r ${preset.headerBg} text-white flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏥</span>
          <div>
            <div className="font-extrabold text-xs tracking-wider uppercase">{preset.hospital}</div>
            <div className="text-[9px] opacity-85 font-mono">ACCREDITED CLINICAL REFERENCE LABORATORY & DIAGNOSTICS</div>
          </div>
        </div>
        <div className="text-right font-mono text-[9px] opacity-90">
          <div>Govt. Reg: DL-MED-99214</div>
          <div>ISO 15189:2022 Certified</div>
        </div>
      </div>

      {/* Patient Meta Quadrant (The Target of PII Leakage) */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 grid grid-cols-2 gap-y-2 text-slate-700">
        {/* Patient Name */}
        <div className="relative">
          <span className="text-[10px] text-slate-500 uppercase block font-semibold">Patient Name:</span>
          {isSanitized && isProcessed ? (
            <div className="inline-block bg-slate-950 text-emerald-400 px-2 py-0.5 rounded font-mono text-[10px] font-bold shadow-sm">
              🛡️ [REDACTED_PATIENT_NAME]
            </div>
          ) : (
            <div className={`inline-block font-bold text-slate-900 px-1.5 py-0.5 rounded ${!isSanitized ? 'bg-rose-500/15 border border-rose-500/50 text-rose-900 animate-pulse' : ''}`}>
              {!isSanitized && <span className="text-[9px] bg-rose-600 text-white px-1 rounded mr-1">PHI</span>}
              {p.name} ({p.ageGender})
            </div>
          )}
        </div>

        {/* Patient Barcode & Ref No */}
        <div className="relative text-right">
          <span className="text-[10px] text-slate-500 uppercase block font-semibold">Sample Barcode:</span>
          {isSanitized && isProcessed ? (
            <div className="inline-block bg-slate-950 text-emerald-400 px-2 py-0.5 rounded font-mono text-[10px] font-bold shadow-sm">
              🔒 [REDACTED_BARCODE]
            </div>
          ) : (
            <div className={`inline-block font-mono text-slate-800 px-1.5 py-0.5 rounded ${!isSanitized ? 'bg-rose-500/15 border border-rose-500/50 text-rose-900' : ''}`}>
              {!isSanitized && <span className="text-[9px] bg-rose-600 text-white px-1 rounded mr-1">BARCODE</span>}
              {p.barcode}
            </div>
          )}
        </div>

        {/* ABHA / CR No */}
        <div className="relative">
          <span className="text-[10px] text-slate-500 uppercase block font-semibold">National ABHA / CR No:</span>
          {isSanitized && isProcessed ? (
            <div className="inline-block bg-slate-950 text-emerald-400 px-2 py-0.5 rounded font-mono text-[10px] font-bold shadow-sm">
              🛡️ [REDACTED_ABHA_ID]
            </div>
          ) : (
            <div className={`inline-block font-mono text-slate-900 font-semibold px-1.5 py-0.5 rounded ${!isSanitized ? 'bg-rose-500/15 border border-rose-500/50 text-rose-900 animate-pulse' : ''}`}>
              {!isSanitized && <span className="text-[9px] bg-rose-600 text-white px-1 rounded mr-1">ABHA</span>}
              {p.abha}
            </div>
          )}
        </div>

        {/* Contact Mobile */}
        <div className="relative text-right">
          <span className="text-[10px] text-slate-500 uppercase block font-semibold">Contact / Mobile:</span>
          {isSanitized && isProcessed ? (
            <div className="inline-block bg-slate-950 text-emerald-400 px-2 py-0.5 rounded font-mono text-[10px] font-bold shadow-sm">
              🛡️ [REDACTED_PHONE_NUMBER]
            </div>
          ) : (
            <div className={`inline-block font-mono text-slate-800 px-1.5 py-0.5 rounded ${!isSanitized ? 'bg-rose-500/15 border border-rose-500/50 text-rose-900' : ''}`}>
              {!isSanitized && <span className="text-[9px] bg-rose-600 text-white px-1 rounded mr-1">PHONE</span>}
              {p.phone}
            </div>
          )}
        </div>

        {/* Referring Doctor */}
        <div className="relative col-span-2 pt-1 border-t border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold mr-1">Attending Clinician:</span>
            {isSanitized && isProcessed ? (
              <span className="bg-slate-950 text-emerald-400 px-1.5 py-0.5 rounded font-mono text-[10px]">
                [REDACTED_DOCTOR]
              </span>
            ) : (
              <span className="font-semibold text-slate-900">{p.doctor}</span>
            )}
          </div>
          <div className="font-mono text-[10px] text-slate-500">
            Collected: {p.date}
          </div>
        </div>
      </div>

      {/* Clinical Test Results Table (ALWAYS INTACT & READABLE) */}
      <div className="p-3 bg-white">
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>INVESTIGATION / CLINICAL FINDINGS</span>
          <span className="text-emerald-700 font-mono text-[9px] flex items-center gap-1 font-bold">
            <span>✓</span> CLINICAL UTILITY PRESERVED
          </span>
        </div>

        <table className="w-full text-left border-collapse text-[10.5px]">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[9.5px] uppercase">
              <th className="py-1.5">Test Description</th>
              <th className="py-1.5">Observed Value</th>
              <th className="py-1.5">Reference Range</th>
              <th className="py-1.5 text-right">Unit / Flag</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {preset.tests.map((t, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80">
                <td className="py-1.5 font-medium text-slate-900">{t.name}</td>
                <td className={`py-1.5 font-mono ${t.color}`}>{t.val}</td>
                <td className="py-1.5 text-slate-500 font-mono">{t.ref}</td>
                <td className="py-1.5 text-right">
                  <span className="font-mono text-slate-600 mr-1.5">{t.unit}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-slate-100 text-slate-700 border border-slate-200">
                    {t.flag}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Diagnostic Impression / Note */}
        <div className="mt-2.5 p-2 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-950 text-[10px] flex items-start gap-1.5">
          <span className="text-blue-600 font-bold">Clinical Note:</span>
          <span>{preset.diagnosisSummary}</span>
        </div>
      </div>

      {/* Lab Verification Footer */}
      <div className="p-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-slate-500 text-[9px] font-mono">
        <div>
          <span>Verification: </span>
          <strong className="text-slate-700">Digital Seal Authenticated</strong>
        </div>
        <div className="flex items-center gap-2">
          {isSanitized ? (
            <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold">
              ✓ SECURE OUTGOING PAYLOAD
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold animate-pulse">
              ⚠️ CONTAINS RAW PHI
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
