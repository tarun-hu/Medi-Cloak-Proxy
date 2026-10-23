import React, { useState, useEffect } from 'react';

const ROLES = [
  { id: 'doctor', label: '👨‍⚕️ Duty Doctor (ER)', desc: 'Clinical notes & diagnostic stream' },
  { id: 'cmo', label: '🏥 Chief Medical Officer', desc: 'Accuracy preservation & department risk' },
  { id: 'dpo', label: '🛡️ Hospital DPO', desc: 'DPDP compliance & SHA-256 vault' },
];

export default function Header({
  connected,
  totalEvents,
  currentRole = 'dpo',
  onRoleChange = () => {},
  onOpenDemoSandbox = () => {},
}) {
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('medicloak_theme');
    if (savedTheme === 'light') {
      setIsLightMode(true);
      document.documentElement.classList.add('light');
    }
  }, []);

  const toggleTheme = () => {
    const nextState = !isLightMode;
    setIsLightMode(nextState);
    if (nextState) {
      document.documentElement.classList.add('light');
      localStorage.setItem('medicloak_theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('medicloak_theme', 'dark');
    }
  };

  return (
    <header className="glass-panel px-6 py-3 flex items-center justify-between mb-4 flex-wrap gap-3 sticky-header">
      {/* Left: Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="text-2xl">🛡️</div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-wider text-slate-100">
              MEDICLOAK
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              Sovereign Suite
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            North Indian Healthcare Compliance & DPDP Gateway
          </p>
        </div>
      </div>

      {/* Middle: 1-Click Role Persona Switcher */}
      <div className="flex items-center gap-2 bg-slate-950/70 p-1 rounded-xl border border-white/10 no-print">
        <span className="text-[11px] font-mono text-slate-300 pl-2 pr-1">Persona:</span>
        {ROLES.map((role) => (
          <button
            key={role.id}
            onClick={() => onRoleChange(role.id)}
            title={role.desc}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
              currentRole === role.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {role.label}
          </button>
        ))}
      </div>

      {/* Right: Actions, Theme & Status */}
      <div className="flex items-center gap-2 flex-wrap no-print">
        {/* Judges Demo Sandbox */}
        <button
          onClick={onOpenDemoSandbox}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 hover:from-cyan-500/30 hover:to-emerald-500/30 text-white border border-cyan-400/40 transition text-xs font-mono font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-500/10"
        >
          <span>⚡</span>
          <span>Judges Demo Sandbox</span>
        </button>

        {/* Print / Export Report */}
        <button
          onClick={() => window.print()}
          title="Print official audit compliance report"
          className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition text-xs font-mono flex items-center gap-1"
        >
          <span>🖨️</span>
          <span>Print</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={isLightMode ? 'Switch to Cyber Dark Mode' : 'Switch to Clinical Daylight Mode'}
          className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition text-xs font-mono flex items-center gap-1"
        >
          <span>{isLightMode ? '🌙' : '☀️'}</span>
          <span>{isLightMode ? 'Dark' : 'Light'}</span>
        </button>

        {/* Live indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-black/40 border border-white/10">
          <div
            className={`w-2 h-2 rounded-full ${
              connected
                ? 'bg-emerald-400 live-dot-connected'
                : 'bg-rose-500 live-dot-disconnected'
            }`}
          />
          <span
            className={`text-[11px] font-mono font-semibold tracking-wider ${
              connected ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {connected ? 'LIVE' : 'DISCONNECTED'}
          </span>
          <span className="text-slate-500 font-mono text-[11px]">•</span>
          <span className="text-[11px] font-mono text-cyan-300">
            {totalEvents} events
          </span>
        </div>
      </div>
    </header>
  );
}
