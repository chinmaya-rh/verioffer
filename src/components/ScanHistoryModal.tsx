import React, { useState, useEffect } from 'react';
import { History, X, Trash2, ArrowUpRight, FolderArchive, Download, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';
import { ScanResult, ArchivedReportSummary } from '../types';

interface ScanHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ScanResult[];
  onSelectResult: (result: ScanResult) => void;
  onClearHistory: () => void;
}

export const ScanHistoryModal: React.FC<ScanHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectResult,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'archive' | 'session'>('archive');
  const [archivedReports, setArchivedReports] = useState<ArchivedReportSummary[]>([]);
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const fetchArchivedReports = async () => {
    setIsLoadingArchive(true);
    setArchiveError(null);
    try {
      const res = await fetch('/api/reports');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setArchivedReports(data.reports || []);
    } catch (err: any) {
      setArchiveError('Failed to load reports from /reports/ directory.');
    } finally {
      setIsLoadingArchive(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchArchivedReports();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectArchivedReport = async (filename: string) => {
    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(filename)}`);
      if (!res.ok) throw new Error('Failed to fetch full report');
      const report: ScanResult = await res.json();
      onSelectResult(report);
      onClose();
    } catch (err: any) {
      alert(`Could not load report: ${err.message}`);
    }
  };

  const handleDownloadReport = async (e: React.MouseEvent, filename: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(filename)}`);
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0A0E17] border border-slate-700/80 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] font-mono">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
          <div className="flex items-center space-x-3">
            <FolderArchive className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Forensic Audit Repository
              </h3>
              <p className="text-[11px] text-slate-400 font-sans">
                Persistent disk archives & session inspection records
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchArchivedReports}
              disabled={isLoadingArchive}
              className="text-slate-400 hover:text-emerald-400 p-1.5 rounded hover:bg-slate-800 transition-colors"
              title="Refresh repository"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingArchive ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800/90 bg-[#070A11] px-4 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('archive')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'archive'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>Server Archive (/reports/)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
              {archivedReports.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('session')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'session'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Session History</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
              {history.length}
            </span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {activeTab === 'archive' ? (
            isLoadingArchive ? (
              <div className="text-center py-12 text-slate-500 text-xs flex items-center justify-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Reading /reports/ disk repository...</span>
              </div>
            ) : archiveError ? (
              <div className="text-center py-12 text-rose-400 text-xs">{archiveError}</div>
            ) : archivedReports.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No archived report JSON files detected in /reports/. Run a scan to auto-archive.
              </div>
            ) : (
              archivedReports.map((report) => {
                const isCrit = report.threatPercentage >= 71;
                const isMed = report.threatPercentage >= 31 && report.threatPercentage < 71;

                return (
                  <div
                    key={report.filename}
                    onClick={() => handleSelectArchivedReport(report.filename)}
                    className="bg-[#080C14] border border-slate-800 hover:border-emerald-500/50 p-3.5 rounded-xl cursor-pointer transition-all hover:bg-slate-900/90 group flex items-center justify-between"
                  >
                    <div className="space-y-1.5 pr-3 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            isCrit
                              ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                              : isMed
                              ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                              : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                          }`}
                        >
                          {report.threatPercentage}% RISK
                        </span>
                        <span className="text-xs text-slate-200 font-semibold truncate group-hover:text-emerald-300">
                          {report.filename}
                        </span>
                        {report.uploadedFileName && (
                          <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/15 px-1.5 py-0.5 rounded border border-indigo-500/30">
                            📄 {report.uploadedFileName}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                        <span className="text-slate-300">{report.primaryDeceptionVector}</span>
                        <span>•</span>
                        <span className="text-slate-500">{new Date(report.timestamp).toLocaleString()}</span>
                        <span>•</span>
                        <span className="text-slate-500 font-mono text-[10px]">{Math.round(report.sizeBytes / 1024)} KB</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={(e) => handleDownloadReport(e, report.filename)}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
                        title="Download raw JSON report"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <div className="text-slate-500 group-hover:text-emerald-400 transition-colors p-1.5">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            /* Session Tab */
            <>
              {history.length > 0 && (
                <div className="flex justify-end pb-1">
                  <button
                    onClick={onClearHistory}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-rose-500/10 border border-rose-500/20"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear Session Cache</span>
                  </button>
                </div>
              )}
              {history.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No previous scans recorded in this browser session.
                </div>
              ) : (
                history.map((item) => {
                  const isCrit = item.threatPercentage >= 71;
                  const isMed = item.threatPercentage >= 31 && item.threatPercentage < 71;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelectResult(item);
                        onClose();
                      }}
                      className="bg-[#080C14] border border-slate-800 hover:border-slate-700 p-3 rounded-xl cursor-pointer transition-all hover:bg-slate-900/80 group flex items-center justify-between"
                    >
                      <div className="space-y-1 pr-3">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              isCrit
                                ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                                : isMed
                                ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                                : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                            }`}
                          >
                            {item.threatPercentage}%
                          </span>
                          <span className="text-xs text-slate-200 font-semibold line-clamp-1 group-hover:text-emerald-300">
                            {item.primaryDeceptionVector || item.headline}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                          <span>Domain: {item.inputDomain}</span>
                          <span>•</span>
                          <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>

                      <div className="text-slate-500 group-hover:text-emerald-400 transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-[#070A11] border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
          <span>Target Architecture: Enterprise SOC Storage</span>
          <span>Tip: Access reports via terminal: <code className="text-emerald-400">ls reports</code></span>
        </div>
      </div>
    </div>
  );
};
