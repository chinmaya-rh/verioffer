import React, { useState } from 'react';
import { AlertCircle, Tag, CheckCircle2, ChevronRight, Quote, Filter } from 'lucide-react';
import { RedFlagItem } from '../types';

interface RedFlagBreakdownProps {
  redFlags: RedFlagItem[];
}

export const RedFlagBreakdown: React.FC<RedFlagBreakdownProps> = ({ redFlags }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const filtered = filterSeverity === 'all'
    ? redFlags
    : redFlags.filter((rf) => rf.severity === filterSeverity);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-rose-300 bg-rose-500/20 border-rose-500/40';
      case 'high':
        return 'text-amber-300 bg-amber-500/20 border-amber-500/40';
      case 'medium':
        return 'text-yellow-300 bg-yellow-500/20 border-yellow-500/40';
      default:
        return 'text-slate-300 bg-slate-800 border-slate-700';
    }
  };

  if (redFlags.length === 0) {
    return (
      <div className="bg-[#0E1522] border border-slate-800 rounded-xl p-6 text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-100 font-mono">Zero Predatory Red Flags Detected</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          The psycholinguistic audit found no evidence of advance-fee coercion, check cashing traps, or identity harvesting requests.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#0E1522] border border-slate-800 rounded-xl p-5 shadow-xl">
      {/* Header with filter controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-rose-400" />
          <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
            Predatory Phrases & Red Flags ({redFlags.length})
          </h3>
        </div>

        {/* Severity filter pills */}
        <div className="flex items-center space-x-1.5 text-xs font-mono">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-1" />
          <button
            onClick={() => setFilterSeverity('all')}
            className={`px-2 py-0.5 rounded transition-all ${
              filterSeverity === 'all'
                ? 'bg-slate-700 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({redFlags.length})
          </button>
          <button
            onClick={() => setFilterSeverity('critical')}
            className={`px-2 py-0.5 rounded transition-all ${
              filterSeverity === 'critical'
                ? 'bg-rose-500/30 text-rose-300 font-semibold border border-rose-500/40'
                : 'text-slate-400 hover:text-rose-300'
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => setFilterSeverity('high')}
            className={`px-2 py-0.5 rounded transition-all ${
              filterSeverity === 'high'
                ? 'bg-amber-500/30 text-amber-300 font-semibold border border-amber-500/40'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            High
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filtered.map((flag) => (
          <div
            key={flag.id}
            className="bg-[#080C14] border border-slate-800 hover:border-slate-700 rounded-lg p-3.5 transition-all flex flex-col justify-between space-y-2.5 group"
          >
            <div>
              {/* Category & Severity Tag */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                  <Tag className="w-3 h-3 text-cyan-400" />
                  <span>{flag.category}</span>
                </span>
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-bold ${getSeverityBadge(flag.severity)}`}>
                  {flag.severity}
                </span>
              </div>

              {/* Exact Quote Extracted */}
              {flag.quote && (
                <div className="bg-slate-900/90 border-l-2 border-rose-500 rounded-r px-2.5 py-1.5 mb-2 font-mono text-xs text-rose-200/90 italic flex items-start space-x-1.5">
                  <Quote className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">"{flag.quote}"</span>
                </div>
              )}

              {/* Forensic Reasoning */}
              <p className="text-xs text-slate-300 leading-relaxed">
                {flag.explanation}
              </p>
            </div>

            {/* Micro forensic insight tag */}
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span className="text-slate-400 flex items-center space-x-1">
                <span>Vector:</span>
                <code className="text-cyan-400/80 bg-slate-900 px-1 py-0.5 rounded text-[10px]">
                  {flag.tacticType}
                </code>
              </span>
              <span className="text-rose-400/70 group-hover:text-rose-400 transition-colors flex items-center space-x-0.5">
                <span>Deception Flagged</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
