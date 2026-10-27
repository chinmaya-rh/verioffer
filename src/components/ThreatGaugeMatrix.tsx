import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Zap, Clock, DollarSign, UserCheck, Globe, FileText } from 'lucide-react';
import { ScanResult } from '../types';

interface ThreatGaugeMatrixProps {
  result: ScanResult;
}

export const ThreatGaugeMatrix: React.FC<ThreatGaugeMatrixProps> = ({ result }) => {
  const { threatPercentage, riskTier, headline, executiveSummary, primaryDeceptionVector, psycholinguisticMetrics } = result;

  // Determine color scheme based on PRD threat thresholds
  const isCritical = threatPercentage >= 71;
  const isMedium = threatPercentage >= 31 && threatPercentage < 71;
  const isLow = threatPercentage < 31;

  const colorStyles = isCritical
    ? {
        text: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        glow: 'shadow-[0_0_30px_rgba(244,63,94,0.25)]',
        gaugeStroke: '#F43F5E',
        badge: 'CRITICAL SCAM (71-100%)',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        icon: ShieldAlert,
      }
    : isMedium
    ? {
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        glow: 'shadow-[0_0_30px_rgba(245,158,11,0.25)]',
        gaugeStroke: '#F59E0B',
        badge: 'SUSPICIOUS / MEDIUM (31-70%)',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        icon: AlertTriangle,
      }
    : {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        glow: 'shadow-[0_0_30px_rgba(16,185,129,0.25)]',
        gaugeStroke: '#10B981',
        badge: 'LOW RISK / VERIFIED (0-30%)',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        icon: ShieldCheck,
      };

  const StatusIcon = colorStyles.icon;

  // Radial Arc Math (semi-circle gauge, radius 80, stroke 14)
  const radius = 70;
  const circumference = Math.PI * radius; // 180 degrees arc
  const strokeDashoffset = circumference - (circumference * threatPercentage) / 100;

  return (
    <div className={`bg-[#0E1522] border ${colorStyles.border} rounded-xl p-5 ${colorStyles.glow} relative overflow-hidden transition-all duration-500`}>
      {/* Background ambient lighting */}
      <div 
        className="absolute -top-12 -left-12 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: colorStyles.gaugeStroke }}
      />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <StatusIcon className={`w-5 h-5 ${colorStyles.text}`} />
          <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider font-mono">
            Scam Threat Index (STI) Matrix
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {result.uploadedFileName && (
            <span className="flex items-center space-x-1 text-[11px] font-mono text-indigo-300 bg-indigo-500/15 px-2.5 py-1 rounded border border-indigo-500/30">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-bold">{result.uploadedFileName}</span>
              {result.fileSizeBytes && (
                <span className="text-slate-400">({Math.max(1, Math.round(result.fileSizeBytes / 1024))} KB)</span>
              )}
            </span>
          )}
          <span className={`px-2.5 py-1 text-xs font-mono font-bold rounded border ${colorStyles.badgeColor}`}>
            {colorStyles.badge}
          </span>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
            Latency: {result.scanDurationMs}ms
          </span>
        </div>
      </div>

      {/* Main Grid: Gauge on Left, Dimensions on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radial Animated Gauge */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-900/60 rounded-xl border border-slate-800 relative">
          <div className="relative w-52 h-32 flex items-end justify-center">
            <svg className="w-52 h-44 overflow-visible" viewBox="0 0 180 110">
              {/* Background Arc */}
              <path
                d="M 20 100 A 70 70 0 0 1 160 100"
                fill="none"
                stroke="#1F2937"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Foreground Gradient Animated Arc */}
              <path
                d="M 20 100 A 70 70 0 0 1 160 100"
                fill="none"
                stroke={colorStyles.gaugeStroke}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: `drop-shadow(0 0 8px ${colorStyles.gaugeStroke})`,
                }}
              />
            </svg>

            {/* Inner Counter Readout */}
            <div className="absolute bottom-1 flex flex-col items-center">
              <span className={`text-4xl font-extrabold font-mono tracking-tight ${colorStyles.text}`}>
                {threatPercentage}%
              </span>
              <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
                Risk Score
              </span>
            </div>
          </div>

          {/* Scale labels */}
          <div className="w-full flex justify-between px-6 text-[10px] font-mono text-slate-500 mt-2">
            <span>0% (Safe)</span>
            <span>50% (Suspect)</span>
            <span>100% (Critical)</span>
          </div>

          {/* Deception Vector Tag */}
          <div className="mt-3 text-center">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Primary Deception Vector:
            </div>
            <div className="text-xs font-semibold text-slate-200 mt-0.5">
              {primaryDeceptionVector}
            </div>
          </div>
        </div>

        {/* Dual-Vector Telemetry Bars */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
              Forensic Vectors Assessment:
            </div>
            <div className="text-sm font-semibold text-slate-100">
              {headline}
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {executiveSummary}
            </p>
          </div>

          {/* Vector Progress Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Urgency & Coercion */}
            <div className="bg-[#080C14] border border-slate-800 p-2.5 rounded-lg">
              <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                <span className="flex items-center space-x-1.5 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Urgency Coercion</span>
                </span>
                <span className="font-bold text-slate-200">
                  {psycholinguisticMetrics.urgencyCoercion}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-700" 
                  style={{ width: `${psycholinguisticMetrics.urgencyCoercion}%` }}
                />
              </div>
            </div>

            {/* Financial Demands */}
            <div className="bg-[#080C14] border border-slate-800 p-2.5 rounded-lg">
              <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                <span className="flex items-center space-x-1.5 text-slate-300">
                  <DollarSign className="w-3.5 h-3.5 text-rose-400" />
                  <span>Financial Demand</span>
                </span>
                <span className="font-bold text-slate-200">
                  {psycholinguisticMetrics.financialDemand}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500 transition-all duration-700" 
                  style={{ width: `${psycholinguisticMetrics.financialDemand}%` }}
                />
              </div>
            </div>

            {/* Identity Harvesting */}
            <div className="bg-[#080C14] border border-slate-800 p-2.5 rounded-lg">
              <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                <span className="flex items-center space-x-1.5 text-slate-300">
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Identity Harvesting</span>
                </span>
                <span className="font-bold text-slate-200">
                  {psycholinguisticMetrics.identityHarvesting}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 transition-all duration-700" 
                  style={{ width: `${psycholinguisticMetrics.identityHarvesting}%` }}
                />
              </div>
            </div>

            {/* Domain Discrepancy */}
            <div className="bg-[#080C14] border border-slate-800 p-2.5 rounded-lg">
              <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                <span className="flex items-center space-x-1.5 text-slate-300">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Domain Spoofing Risk</span>
                </span>
                <span className="font-bold text-slate-200">
                  {psycholinguisticMetrics.domainDiscrepancy}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-700" 
                  style={{ width: `${psycholinguisticMetrics.domainDiscrepancy}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
