import React from 'react';
import { ShieldAlert, Terminal, History, Award, Activity, Cpu } from 'lucide-react';

interface CyberNavbarProps {
  onOpenHistory: () => void;
  onOpenCompliance: () => void;
  onToggleTerminal: () => void;
  isTerminalOpen: boolean;
  historyCount: number;
}

export const CyberNavbar: React.FC<CyberNavbarProps> = ({
  onOpenHistory,
  onOpenCompliance,
  onToggleTerminal,
  isTerminalOpen,
  historyCount,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-[#0B0F17]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-wider text-slate-100 uppercase">
                Veri<span className="text-emerald-400">Offer</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded">
                SOC v2.5
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              AI-Powered Phishing & Fake Offer Inspector
            </p>
          </div>
        </div>

        {/* Live System Telemetry */}
        <div className="hidden md:flex items-center space-x-4 border-x border-slate-800/60 px-4 py-1 text-xs font-mono">
          <div className="flex items-center space-x-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>CORE: <span className="text-emerald-400 font-semibold">ONLINE</span></span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>MODEL: <span className="text-cyan-400 font-semibold">Gemini 3.8 Flash</span></span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Terminal log toggle */}
          <button
            onClick={onToggleTerminal}
            id="btn-toggle-terminal"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-mono border transition-all ${
              isTerminalOpen
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-slate-900/80 text-slate-300 border-slate-700/60 hover:border-slate-600 hover:text-white'
            }`}
            title="Toggle Live Cyber Execution Terminal"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SOC Terminal</span>
          </button>

          {/* History button */}
          <button
            onClick={onOpenHistory}
            id="btn-open-history"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-mono bg-slate-900/80 text-slate-300 border border-slate-700/60 hover:border-slate-600 hover:text-white transition-all"
            title="View Past Forensic Audits"
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold">
                {historyCount}
              </span>
            )}
          </button>

          {/* Hackathon Challenge Badge */}
          <button
            onClick={onOpenCompliance}
            id="btn-hackathon-badge"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-cyan-500/10 text-amber-300 border border-amber-500/30 hover:border-amber-400 transition-all shadow-[0_0_12px_rgba(245,158,11,0.1)]"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold tracking-wide">PromptWars</span>
          </button>
        </div>
      </div>
    </header>
  );
};
