import React from 'react';
import { Globe, AlertOctagon, CheckCircle2, ShieldAlert, AlertTriangle, ExternalLink } from 'lucide-react';
import { DomainForensics } from '../types';

interface DomainForensicsCardProps {
  domainAnalysis: DomainForensics;
}

export const DomainForensicsCard: React.FC<DomainForensicsCardProps> = ({ domainAnalysis }) => {
  const { domain, isFreeMail, isSuspiciousTld, typosquatRisk, impersonatedBrand, explanation, verdict } = domainAnalysis;

  const isCritical = typosquatRisk === 'critical' || isFreeMail;
  const isSuspicious = typosquatRisk === 'suspicious' || isSuspiciousTld;

  const statusColor = isCritical
    ? {
        border: 'border-rose-500/30',
        badge: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
        icon: ShieldAlert,
        iconColor: 'text-rose-400',
      }
    : isSuspicious
    ? {
        border: 'border-amber-500/30',
        badge: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
        icon: AlertTriangle,
        iconColor: 'text-amber-400',
      }
    : {
        border: 'border-emerald-500/30',
        badge: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
        icon: CheckCircle2,
        iconColor: 'text-emerald-400',
      };

  const StatusIcon = statusColor.icon;

  return (
    <div className={`bg-[#0E1522] border ${statusColor.border} rounded-xl p-5 shadow-xl`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
            Domain Structural Forensics
          </h3>
        </div>
        <span className={`px-2.5 py-0.5 text-xs font-mono font-bold rounded border ${statusColor.badge}`}>
          {verdict}
        </span>
      </div>

      {/* Main Analysis Grid */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#080C14] border border-slate-800 p-3 rounded-lg gap-2">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Investigated Domain Host:</div>
            <div className="text-sm font-mono font-bold text-cyan-300 break-all">
              {domain}
            </div>
          </div>
          <div className="text-xs font-mono text-slate-400">
            TLD: <span className="text-slate-200 font-bold">.{domain.split('.').pop()}</span>
          </div>
        </div>

        {/* Heuristic Checks Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
          {/* Free Webmail Check */}
          <div className="bg-[#080C14] border border-slate-800 p-2.5 rounded-lg flex items-center justify-between">
            <span className="text-slate-400">Free Webmail:</span>
            {isFreeMail ? (
              <span className="text-rose-400 font-bold flex items-center space-x-1">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>MISMATCH</span>
              </span>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CORPORATE</span>
              </span>
            )}
          </div>

          {/* Typosquatting / Brand Spoof */}
          <div className="bg-[#080C14] border border-slate-800 p-2.5 rounded-lg flex items-center justify-between">
            <span className="text-slate-400">Brand-Jacking:</span>
            {typosquatRisk === 'critical' ? (
              <span className="text-rose-400 font-bold">
                {impersonatedBrand ? `Spoofs ${impersonatedBrand}` : 'CRITICAL'}
              </span>
            ) : typosquatRisk === 'suspicious' ? (
              <span className="text-amber-400 font-bold">ANOMALOUS</span>
            ) : (
              <span className="text-emerald-400 font-bold">CLEAN</span>
            )}
          </div>

          {/* TLD Reputation */}
          <div className="bg-[#080C14] border border-slate-800 p-2.5 rounded-lg flex items-center justify-between">
            <span className="text-slate-400">TLD Risk:</span>
            {isSuspiciousTld ? (
              <span className="text-rose-400 font-bold">HIGH ABUSE</span>
            ) : (
              <span className="text-emerald-400 font-bold">STANDARD</span>
            )}
          </div>
        </div>

        {/* Forensic Detailed Assessment */}
        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg flex items-start space-x-2.5">
          <StatusIcon className={`w-4 h-4 shrink-0 mt-0.5 ${statusColor.iconColor}`} />
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {explanation}
          </p>
        </div>
      </div>
    </div>
  );
};
