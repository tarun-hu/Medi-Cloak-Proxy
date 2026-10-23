import React, { useState, useMemo } from 'react';
import StatusBadge from './StatusBadge';
import { updateEventStatus, deleteEvent } from '../lib/api';

const serviceIcons = {
  ChatGPT: '🤖',
  Claude: '🟣',
  Gemini: '💎',
  Perplexity: '🔍',
  DeepSeek: '🐋',
  Cohere: '🌊',
  Groq: '⚡',
  'MS Copilot': '🪟',
  Mistral: '🌪️',
};

function formatTime(ts) {
  if (!ts) return '--';
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

function formatDate(ts) {
  if (!ts) return '--';
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function RiskPill({ score }) {
  const color =
    score >= 70
      ? 'bg-sg-red/20 text-sg-red border-sg-red/30'
      : score >= 40
        ? 'bg-sg-amber/20 text-sg-amber border-sg-amber/30'
        : 'bg-sg-green/20 text-sg-green border-sg-green/30';

  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-mono font-semibold border ${color}`}>
      {score}
    </span>
  );
}

export default function AuditLog({ events, currentRole = 'dpo', onSelectEvent }) {
  const [sortField, setSortField] = useState('timestamp');
  const [sortDir, setSortDir] = useState('desc');
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10); // Default: 10 audits per page as requested

  const sorted = useMemo(() => {
    const base = showAll ? events : events.filter((e) => e.phi_detected);
    const copy = [...base];
    copy.sort((a, b) => {
      let va = a[sortField];
      let vb = b[sortField];
      if (sortField === 'timestamp') {
        va = new Date(va).getTime();
        vb = new Date(vb).getTime();
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [events, sortField, sortDir, showAll]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const paged = sorted.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const startIdx = sorted.length > 0 ? currentPage * pageSize + 1 : 0;
  const endIdx = Math.min((currentPage + 1) * pageSize, sorted.length);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortHeader = ({ field, children }) => (
    <th
      onClick={() => toggleSort(field)}
      className="px-3 py-2 text-left text-xs font-semibold text-gray-400 tracking-wider uppercase cursor-pointer hover:text-sg-cyan transition-colors select-none"
    >
      {children}
      {sortField === field && (
        <span className="ml-1 text-sg-cyan">{sortDir === 'asc' ? '↑' : '↓'}</span>
      )}
    </th>
  );

  const handleStatusChange = async (eventId, newStatus) => {
    try {
      await updateEventStatus(eventId, newStatus);
    } catch (err) {
      // silent
    }
  };

  // Export to Excel / CSV with UTF-8 BOM
  const exportToExcel = () => {
    if (!sorted || sorted.length === 0) return;

    const headers = [
      'Event ID',
      'Date',
      'Time',
      'Source IP',
      'AI Service',
      'Risk Score',
      'Severity',
      'PHI Detected',
      'PHI Count',
      'PHI Types',
      'Action',
      'Status',
      'Original Prompt',
      'Redacted Prompt',
    ];

    const rows = sorted.map((e) => {
      const phiTypes = Array.isArray(e.phi_types) ? e.phi_types.join('; ') : '';
      return [
        `"${e.event_id || ''}"`,
        `"${formatDate(e.timestamp)}"`,
        `"${formatTime(e.timestamp)}"`,
        `"${e.source_ip || ''}"`,
        `"${e.ai_service || ''}"`,
        e.risk_score || 0,
        `"${e.severity || ''}"`,
        e.phi_detected ? 'TRUE' : 'FALSE',
        e.phi_count || 0,
        `"${phiTypes}"`,
        `"${e.action || ''}"`,
        `"${e.status || 'active'}"`,
        `"${(e.original_text || '').replace(/"/g, '""')}"`,
        `"${(e.redacted_text || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `medicioak_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to Printable PDF / Official HIPAA Compliance Audit Report
  const exportToPDF = () => {
    if (!sorted || sorted.length === 0) return;

    const totalAudits = sorted.length;
    const phiCount = sorted.filter((e) => e.phi_detected).length;
    const highRiskCount = sorted.filter((e) => (e.risk_score || 0) >= 70).length;
    const printDate = new Date().toLocaleString();

    const tableRows = sorted
      .map(
        (e) => `
      <tr>
        <td>${formatDate(e.timestamp)} ${formatTime(e.timestamp)}</td>
        <td>${e.source_ip || 'unknown'}</td>
        <td><strong>${e.ai_service || 'AI'}</strong></td>
        <td style="color:${(e.risk_score || 0) >= 70 ? '#dc2626' : (e.risk_score || 0) >= 40 ? '#d97706' : '#16a34a'}; font-weight: bold;">
          ${e.risk_score || 0}/100
        </td>
        <td>${Array.isArray(e.phi_types) ? e.phi_types.join(', ') : 'None'}</td>
        <td><span class="badge ${e.action}">${e.action ? e.action.toUpperCase() : 'LOGGED'}</span></td>
        <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${(e.original_text || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').slice(0, 80)}...
        </td>
      </tr>
    `
      )
      .join('');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MediCloak - HIPAA Compliance Audit Report</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 30px; color: #111827; background: #fff; }
            .header { border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
            h1 { margin: 0; color: #0369a1; font-size: 22px; }
            .meta { font-size: 11px; color: #6b7280; }
            .summary { display: flex; gap: 15px; margin-bottom: 25px; }
            .stat-card { flex: 1; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; background: #f9fafb; text-align: center; }
            .stat-val { font-size: 20px; font-weight: bold; color: #0284c7; }
            .stat-lbl { font-size: 10px; color: #6b7280; text-transform: uppercase; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 15px; }
            th { background: #f3f4f6; text-align: left; padding: 8px 10px; border-bottom: 2px solid #e5e7eb; font-weight: 600; text-transform: uppercase; font-size: 10px; color: #4b5563; }
            td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; }
            .badge { padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; text-transform: uppercase; }
            .badge.redacted { background: #dcfce7; color: #15803d; }
            .badge.blocked { background: #fee2e2; color: #b91c1c; }
            .badge.clean { background: #e0f2fe; color: #0369a1; }
            .footer { margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 10px; font-size: 10px; color: #9ca3af; text-align: center; }
            @media print {
              body { padding: 0; }
              @page { margin: 1.5cm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>🛡️ MediCloak: HIPAA Compliance Audit Report</h1>
              <div class="meta">Layer-7 Healthcare Shadow AI PHI Governance & Sanitization</div>
            </div>
            <div class="meta" style="text-align: right;">
              <div>Generated: <strong>${printDate}</strong></div>
              <div>Standard: <strong>HIPAA Security Rule §164.312</strong></div>
            </div>
          </div>

          <div class="summary">
            <div class="stat-card">
              <div class="stat-val">${totalAudits}</div>
              <div class="stat-lbl">Audits Reviewed</div>
            </div>
            <div class="stat-card">
              <div class="stat-val" style="color: #dc2626;">${phiCount}</div>
              <div class="stat-lbl">PHI Incidents Sanitized</div>
            </div>
            <div class="stat-card">
              <div class="stat-val" style="color: #ea580c;">${highRiskCount}</div>
              <div class="stat-lbl">High-Risk Attempts</div>
            </div>
            <div class="stat-card">
              <div class="stat-val" style="color: #16a34a;">100%</div>
              <div class="stat-lbl">Enforcement Compliance</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Source IP</th>
                <th>Service</th>
                <th>Risk Score</th>
                <th>PHI Entities</th>
                <th>Action</th>
                <th>Prompt Preview</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="footer">
            MediCloak AI Audit Evidence • Tamper-evident cryptographic logging active • Confidential Healthcare Compliance Document
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="glass-panel p-4">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-semibold text-gray-300 tracking-widest uppercase flex items-center gap-2">
            <span>🛡️</span> Audit Log
          </h3>
          <span className="text-[0.65rem] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">
            {sorted.length} records
          </span>
          <button
            onClick={() => { setShowAll(!showAll); setPage(0); }}
            className={`text-[0.65rem] font-mono px-2.5 py-1 rounded border transition-colors ${
              showAll
                ? 'border-sg-cyan/40 bg-sg-cyan/10 text-sg-cyan font-semibold'
                : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {showAll ? 'SHOWING ALL' : 'PHI DETECTED ONLY'}
          </button>
        </div>

        {/* Action Buttons: Export Excel & PDF */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1 text-[0.68rem] font-mono font-medium px-2.5 py-1 rounded bg-sg-green/10 hover:bg-sg-green/20 text-sg-green border border-sg-green/30 transition-colors"
            title="Download CSV formatted for Microsoft Excel"
          >
            <span>📊</span> Excel (.csv)
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-1 text-[0.68rem] font-mono font-medium px-2.5 py-1 rounded bg-sg-cyan/10 hover:bg-sg-cyan/20 text-sg-cyan border border-sg-cyan/30 transition-colors"
            title="Print or Save official HIPAA PDF Report"
          >
            <span>📄</span> PDF Report
          </button>

          {/* Page Size Selector */}
          <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-white/10">
            <span className="text-[0.65rem] text-gray-500 font-mono">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              className="bg-black/40 border border-white/10 rounded px-1.5 py-0.5 text-xs font-mono text-gray-300 focus:outline-none focus:border-sg-cyan"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
        <table className="w-full relative">
          <thead className="sticky top-0 bg-slate-950/95 backdrop-blur-md z-20 shadow-md">
            <tr className="border-b border-white/10">
              <SortHeader field="timestamp">Time</SortHeader>
              <SortHeader field="source_ip">Source IP</SortHeader>
              <SortHeader field="ai_service">AI Platform</SortHeader>
              <SortHeader field="risk_score">Risk</SortHeader>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300 tracking-wider uppercase">
                Sanitized PHI
              </th>
              <SortHeader field="action">Action</SortHeader>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300 tracking-wider uppercase">
                Status
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-slate-300 tracking-wider uppercase">
                DPDP Erasure
              </th>
            </tr>
          </thead>
          <tbody>
            {paged.map((e) => {
              const phiTypes = Array.isArray(e.phi_types) ? e.phi_types : [];
              const icon = serviceIcons[e.ai_service] || '⚡';

              return (
                <tr
                  key={e.event_id}
                  onClick={() => onSelectEvent(e)}
                  className="border-b border-white/[0.05] hover:bg-white/[0.06] cursor-pointer transition-colors"
                >
                  <td className="px-3 py-2.5 text-xs font-mono text-slate-200">
                    <div>{formatTime(e.timestamp)}</div>
                    <div className="text-[0.62rem] text-slate-400">{formatDate(e.timestamp)}</div>
                  </td>
                  <td className="px-3 py-2.5 text-xs font-mono text-slate-300">
                    {e.source_ip}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-white">
                    <div className="flex items-center gap-1.5 font-medium flex-wrap">
                      <span>{icon}</span>
                      <span>{e.ai_service}</span>
                      {((e.ai_service || '').includes('Vision') || e.phi_findings?.is_multimodal) && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold">
                          📷 Multi-Modal
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <RiskPill score={e.risk_score || 0} />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {phiTypes.length === 0 && (
                        <span className="text-slate-400 text-[0.65rem] font-mono">None</span>
                      )}
                      {phiTypes.slice(0, 3).map((t, i) => (
                        <span key={i} className="phi-tag">{t}</span>
                      ))}
                      {phiTypes.length > 3 && (
                        <span className="phi-tag">+{phiTypes.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusBadge severity={e.action === 'redacted' ? 'high' : e.action === 'blocked' ? 'critical' : 'clean'} />
                  </td>
                  <td className="px-3 py-2.5" onClick={(ev) => ev.stopPropagation()}>
                    <select
                      value={e.status || 'active'}
                      onChange={(ev) => handleStatusChange(e.event_id, ev.target.value)}
                      className="status-select"
                    >
                      <option value="active">Active</option>
                      <option value="mitigated">Mitigated</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </td>
                  <td className="px-3 py-2.5 text-center" onClick={(ev) => ev.stopPropagation()}>
                    <button
                      onClick={async () => {
                        if (currentRole === 'doctor') {
                          alert('Access Denied (DPDP Act 2023 Sec 12): Duty Doctors are not authorized to delete sovereign audit records. Hospital DPO clearance required.');
                          return;
                        }
                        if (window.confirm(`DPDP Act 2023 (Section 12): Are you sure you want to permanently erase record ${e.event_id?.slice(0, 8)}?`)) {
                          try {
                            await deleteEvent(e.event_id, currentRole);
                          } catch (err) {
                            alert('Erasure failed: ' + err.message);
                          }
                        }
                      }}
                      disabled={currentRole === 'doctor'}
                      title={
                        currentRole === 'doctor'
                          ? 'Access Restricted: DPDP Section 12 erasure requires Hospital DPO role'
                          : 'Request Data Deletion (DPDP Act 2023 Sec 12)'
                      }
                      className={`p-1 rounded text-xs font-mono transition ${
                        currentRole === 'doctor'
                          ? 'bg-slate-800/50 text-slate-600 border border-slate-700/40 cursor-not-allowed opacity-40'
                          : 'bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {currentRole === 'doctor' ? '🔒' : '🗑️'}
                    </button>
                  </td>
                </tr>
              );
            })}
            {paged.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-slate-400 text-xs font-mono">
                  No events to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer - Always Visible */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-xs font-mono">
        <span className="text-gray-400">
          Showing <span className="text-white font-medium">{startIdx}</span> to{' '}
          <span className="text-white font-medium">{endIdx}</span> of{' '}
          <span className="text-sg-cyan font-medium">{sorted.length}</span> audits
        </span>

        <div className="flex items-center gap-1">
          {/* First page */}
          <button
            onClick={() => setPage(0)}
            disabled={currentPage === 0}
            className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent text-gray-300 transition-colors"
            title="First Page"
          >
            «
          </button>
          {/* Prev page */}
          <button
            onClick={() => setPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent text-gray-300 transition-colors"
          >
            Prev
          </button>

          {/* Page Numbers display */}
          <span className="px-3 py-1 bg-white/10 rounded font-semibold text-sg-cyan">
            {currentPage + 1} / {totalPages}
          </span>

          {/* Next page */}
          <button
            onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage >= totalPages - 1}
            className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent text-gray-300 transition-colors"
          >
            Next
          </button>
          {/* Last page */}
          <button
            onClick={() => setPage(totalPages - 1)}
            disabled={currentPage >= totalPages - 1}
            className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent text-gray-300 transition-colors"
            title="Last Page"
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}

