import React from 'react';
import { Award, X, CheckCircle, ExternalLink, Share2, Github, Sparkles } from 'lucide-react';

interface HackathonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HackathonModal: React.FC<HackathonModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0B0F17] border border-amber-500/40 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-amber-500/20">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-cyan-500/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wide">
                PromptWars x Gen AI Challenge
              </h3>
              <p className="text-xs text-amber-300 font-mono">
                Official Hackathon Compliance Dossier
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
          <div className="bg-[#080C14] border border-slate-800 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-mono font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Project: VeriOffer (Fake Offer & Phishing Inspector)</span>
            </div>
            <p className="text-slate-400 text-xs">
              Transitioning from reactive email spam filtering to proactive behavioral and structural deception detection by translating complex fraudulent job offers and rental scams into an interactive SOC security audit with dynamic <strong className="text-slate-200">Scam Threat Index (0–100%)</strong>.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-mono uppercase text-slate-400 font-bold">
              Event Compliance Checklist:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="flex items-center space-x-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Google Antigravity Workflows</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Google AI Studio (Gemini 3.8 Flash)</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Strict JSON Schema Validation</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Under 3s Forensic Triage Latency</span>
              </div>
            </div>
          </div>

          {/* Social Submission Metadata */}
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-2 font-mono text-[11px]">
            <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              Mandatory Social Media Handles & Hashtags:
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                @Hack2Skill
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                @Google For Developers
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                @GEN AI CLUB
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 font-bold">
                #promptwars
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400">
            PromptWars 2026 Submission
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-emerald-400 transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
