import React, { useState, useEffect, useRef } from 'react';
import { Terminal, X, Maximize2, Minimize2, Copy, Check, Radio, CornerDownLeft, Sparkles, FolderArchive, Play, HelpCircle } from 'lucide-react';
import { ScanResult, ArchivedReportSummary } from '../types';

interface ExecutionTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: string[];
  isScanning: boolean;
  onClearLogs?: () => void;
  onLoadReport?: (report: ScanResult) => void;
  onTriggerScan?: () => void;
  onLoadSampleByIndex?: (index: number) => void;
}

interface TerminalHistoryEntry {
  type: 'log' | 'command' | 'output' | 'error' | 'success';
  text: string;
  time?: string;
  isTable?: boolean;
}

export const ExecutionTerminal: React.FC<ExecutionTerminalProps> = ({
  isOpen,
  onClose,
  logs,
  isScanning,
  onClearLogs,
  onLoadReport,
  onTriggerScan,
  onLoadSampleByIndex,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputCommand, setInputCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [customOutputs, setCustomOutputs] = useState<TerminalHistoryEntry[]>([]);
  const [isExecutingCmd, setIsExecutingCmd] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, customOutputs, isScanning, isExecutingCmd]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLogs = async () => {
    const allText = [
      ...logs,
      ...customOutputs.map((e) => (e.type === 'command' ? `$ ${e.text}` : e.text)),
    ].join('\n');
    await navigator.clipboard.writeText(allText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const executeCommand = async (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    // Record in history
    setCommandHistory((prev) => [cmd, ...prev.filter((c) => c !== cmd)]);
    setHistoryIndex(-1);

    const parts = cmd.split(/\s+/);
    const primary = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').trim();

    // Echo command
    const timestamp = new Date().toLocaleTimeString();
    setCustomOutputs((prev) => [
      ...prev,
      { type: 'command', text: cmd, time: timestamp },
    ]);

    setIsExecutingCmd(true);

    try {
      if (primary === 'clear' || primary === 'cls') {
        setCustomOutputs([]);
        if (onClearLogs) onClearLogs();
        setIsExecutingCmd(false);
        return;
      }

      if (primary === 'help') {
        setCustomOutputs((prev) => [
          ...prev,
          {
            type: 'output',
            text: `+-----------------------------------------------------------------------------------+
|          VERIOFFER v3.1 ENTERPRISE SOC TERMINAL COMMAND & INGESTION GUIDE         |
+-----------------------------------------------------------------------------------+
  COMMAND                 DESCRIPTION
  ---------------------------------------------------------------------------------
  ls reports / ls         List all archived forensic reports stored in /reports/
  cat <filename>          Read & view forensic audit report, loading into dashboard
  status                  Check SOC engine health, active Gemini model & diagnostics
  scan                    Trigger immediate forensic audit on current payload
  load-sample <1|2|3>     Load benchmark threat case (1=Check Scam, 2=Rental, 3=Safe)
  clear / cls             Clear terminal buffer and command outputs
  export <filename>       Download raw JSON audit report to disk
  help                    Print this operational instruction manual
+-----------------------------------------------------------------------------------+`,
          },
        ]);
      } else if (primary === 'ls' || primary === 'list-reports') {
        // Handle "ls reports" or "ls"
        const res = await fetch('/api/reports');
        if (!res.ok) throw new Error(`HTTP ${res.status} accessing /reports/`);
        const data = await res.json();
        const reports: ArchivedReportSummary[] = data.reports || [];

        if (reports.length === 0) {
          setCustomOutputs((prev) => [
            ...prev,
            { type: 'output', text: '[INFO] No forensic reports archived yet. Run a scan to generate /reports/ archives.' },
          ]);
        } else {
          const header = `[DIRECTORY LISTING: /reports/] Total archived audits: ${reports.length}\n` +
            '-----------------------------------------------------------------------------------------\n' +
            'FILENAME                                        THREAT   RISK TIER         DOMAIN\n' +
            '-----------------------------------------------------------------------------------------';
          const rows = reports
            .map((r) => {
              const fn = r.filename.length > 44 ? r.filename.slice(0, 41) + '...' : r.filename.padEnd(46, ' ');
              const threat = `${r.threatPercentage}%`.padEnd(9, ' ');
              const tier = (r.riskTier || 'SUSPICIOUS').padEnd(18, ' ');
              const dom = r.inputDomain || 'N/A';
              return `${fn} ${threat} ${tier} ${dom}`;
            })
            .join('\n');
          const footer = '-----------------------------------------------------------------------------------------\n' +
            "Execute 'cat <filename>' to load report into active audit matrix.";

          setCustomOutputs((prev) => [
            ...prev,
            { type: 'output', text: `${header}\n${rows}\n${footer}`, isTable: true },
          ]);
        }
      } else if (primary === 'cat') {
        if (!arg) {
          setCustomOutputs((prev) => [
            ...prev,
            { type: 'error', text: 'Syntax Error: Missing filename. Usage: cat <filename> (e.g. cat audit_...json)' },
          ]);
        } else {
          const res = await fetch(`/api/reports/${encodeURIComponent(arg)}`);
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `File "${arg}" not found in /reports/`);
          }
          const report: ScanResult = await res.json();

          setCustomOutputs((prev) => [
            ...prev,
            {
              type: 'success',
              text: `[REPORT_OPEN] Successfully loaded "${arg}":
  * Timestamp: ${report.timestamp}
  * Scam Threat Index: ${report.threatPercentage}% (${report.riskTier})
  * Primary Vector: ${report.primaryDeceptionVector}${report.uploadedFileName ? `\n  * Ingested File: ${report.uploadedFileName}` : ''}
  * Sender Domain: ${report.inputDomain} (${report.domainAnalysis?.verdict || 'AUDITED'})
  * Red Flags Identified: ${report.redFlags?.length || 0}
  * Executive Summary: ${report.executiveSummary}
  -> Report synchronized to active SOC dashboard views.`,
            },
          ]);

          if (onLoadReport) {
            onLoadReport(report);
          }
        }
      } else if (primary === 'status') {
        const res = await fetch('/api/health');
        const data = await res.json().catch(() => ({}));
        setCustomOutputs((prev) => [
          ...prev,
          {
            type: 'output',
            text: `[SOC ENGINE TELEMETRY]
  * Service: ${data.service || 'VeriOffer Cyber SOC Engine v3.1'}
  * Google AI Studio: ${data.geminiConfigured ? 'CONNECTED (Active API Key)' : 'NOT CONFIGURED'}
  * Target Model: ${data.geminiModel || 'gemini-3.8-flash'} (Structured JSON Schema Enforced)
  * Heuristics Pipeline: Typosquatting Matrix, Free-mail Filter, Urgency Scorer, Multimodal File Ingestion
  * Persistent Archive: Active (/reports/) -> ${data.reportsCount ?? 'N/A'} audit records stored
  * Runtime Host: Node.js / Express / Vite / Antigravity Container (Port 3000)
  * System Time: ${data.timestamp || new Date().toISOString()}`,
          },
        ]);
      } else if (primary === 'scan') {
        setCustomOutputs((prev) => [
          ...prev,
          { type: 'output', text: '[SOC_DAEMON] Dispatching forensic analysis on active payload...' },
        ]);
        if (onTriggerScan) {
          onTriggerScan();
        } else {
          setCustomOutputs((prev) => [
            ...prev,
            { type: 'error', text: 'Scan dispatch handler unavailable.' },
          ]);
        }
      } else if (primary === 'load-sample' || primary === 'sample') {
        const num = parseInt(arg, 10);
        if (num >= 1 && num <= 3) {
          if (onLoadSampleByIndex) {
            onLoadSampleByIndex(num - 1);
            setCustomOutputs((prev) => [
              ...prev,
              { type: 'success', text: `[LOADED] Ingested benchmark threat sample #${num} into inspection buffer.` },
            ]);
          }
        } else {
          setCustomOutputs((prev) => [
            ...prev,
            { type: 'error', text: 'Invalid sample number. Choose: 1 (Check Scam), 2 (Rental Scam), 3 (Legitimate Offer)' },
          ]);
        }
      } else if (primary === 'export') {
        if (!arg) {
          setCustomOutputs((prev) => [
            ...prev,
            { type: 'error', text: 'Syntax Error: Missing filename. Usage: export <filename>' },
          ]);
        } else {
          const res = await fetch(`/api/reports/${encodeURIComponent(arg)}`);
          if (!res.ok) throw new Error(`Report "${arg}" not found.`);
          const report = await res.json();
          const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = arg.endsWith('.json') ? arg : `${arg}.json`;
          a.click();
          URL.revokeObjectURL(url);
          setCustomOutputs((prev) => [
            ...prev,
            { type: 'success', text: `[EXPORT] Download initiated for ${arg}` },
          ]);
        }
      } else {
        setCustomOutputs((prev) => [
          ...prev,
          {
            type: 'error',
            text: `Command not recognized: "${cmd}". Type "help" to view valid commands.`,
          },
        ]);
      }
    } catch (err: any) {
      setCustomOutputs((prev) => [
        ...prev,
        { type: 'error', text: `[COMMAND_ERROR] ${err.message || 'Execution failed.'}` },
      ]);
    } finally {
      setIsExecutingCmd(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(inputCommand);
      setInputCommand('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
        setHistoryIndex(nextIndex);
        setInputCommand(commandHistory[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInputCommand(commandHistory[nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputCommand('');
      }
    }
  };

  return (
    <div
      id="verioffer-soc-terminal"
      className={`fixed z-50 transition-all duration-300 font-mono ${
        isExpanded
          ? 'inset-4 md:inset-8'
          : 'bottom-4 right-4 left-4 md:left-auto md:w-[720px] h-[400px]'
      }`}
    >
      <div className="w-full h-full bg-[#05080E] border border-emerald-500/40 rounded-xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-emerald-500/20">
        {/* Terminal Header */}
        <div className="bg-[#090E16] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between select-none">
          <div className="flex items-center space-x-2.5">
            <div className="flex space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 cursor-pointer hover:bg-rose-600 transition-colors" onClick={onClose} title="Close" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)} title="Toggle Size" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-300 ml-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold tracking-wide">SOC-FORENSIC-DAEMON // TTY0</span>
            </div>
            {isScanning && (
              <span className="flex items-center space-x-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 animate-pulse">
                <Radio className="w-3 h-3" />
                <span>ACTIVE_PROBE</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Shortcut chips */}
            <div className="hidden sm:flex items-center space-x-1 mr-2">
              <button
                onClick={() => executeCommand('help')}
                className="text-[10px] text-slate-400 hover:text-emerald-300 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-emerald-500/40"
              >
                help
              </button>
              <button
                onClick={() => executeCommand('ls reports')}
                className="text-[10px] text-slate-400 hover:text-emerald-300 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-emerald-500/40"
              >
                ls reports
              </button>
              <button
                onClick={() => executeCommand('status')}
                className="text-[10px] text-slate-400 hover:text-emerald-300 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-emerald-500/40"
              >
                status
              </button>
            </div>

            <button
              onClick={handleCopyLogs}
              className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded hover:bg-slate-800 transition-colors flex items-center space-x-1"
              title="Copy terminal session"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span className="text-[10px]">Copy</span>
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-400 hover:text-slate-200 text-xs p-1 rounded hover:bg-slate-800"
              title={isExpanded ? 'Minimize' : 'Expand'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-rose-400 text-xs p-1 rounded hover:bg-slate-800"
              title="Close terminal"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div
          ref={scrollRef}
          onClick={() => inputRef.current?.focus()}
          className="flex-1 p-4 overflow-y-auto space-y-1.5 text-xs text-slate-300 leading-relaxed font-mono select-text bg-[#05080E] cursor-text"
        >
          <div className="text-emerald-500/70 text-[11px] pb-1 border-b border-slate-900/90 flex items-center justify-between">
            <span>[SYS_INIT] VeriOffer SOC Daemon v2.5.0-antigravity | Kernel telemetry active</span>
            <span className="text-slate-500 text-[10px]">Interactive CLI Ready</span>
          </div>

          {/* System logs */}
          {logs.map((log, index) => {
            const isFlag = log.includes('FLAGGED') || log.includes('CRITICAL');
            const isGemini = log.includes('GEMINI');
            const isHeuristic = log.includes('HEURISTIC');
            const isArchive = log.includes('REPORT_ARCHIVE');

            return (
              <div
                key={`sys-log-${index}`}
                className={`font-mono text-[11px] transition-opacity ${
                  isFlag
                    ? 'text-rose-300 font-semibold'
                    : isArchive
                    ? 'text-cyan-300 font-semibold'
                    : isGemini
                    ? 'text-indigo-300'
                    : isHeuristic
                    ? 'text-amber-300'
                    : 'text-emerald-300/90'
                }`}
              >
                {log}
              </div>
            );
          })}

          {/* Custom executed command outputs */}
          {customOutputs.map((item, index) => {
            if (item.type === 'command') {
              return (
                <div key={`cmd-${index}`} className="flex items-center space-x-2 text-emerald-400 pt-1 font-bold">
                  <span className="text-slate-500">root@verioffer-soc:~$</span>
                  <span className="text-slate-100">{item.text}</span>
                  {item.time && <span className="text-[10px] text-slate-600 font-normal">[{item.time}]</span>}
                </div>
              );
            }

            return (
              <div
                key={`out-${index}`}
                className={`whitespace-pre-wrap font-mono text-[11px] ${
                  item.type === 'error'
                    ? 'text-rose-400'
                    : item.type === 'success'
                    ? 'text-emerald-300 font-semibold'
                    : item.isTable
                    ? 'text-cyan-200 bg-slate-950/60 p-2 rounded border border-slate-800'
                    : 'text-slate-300'
                }`}
              >
                {item.text}
              </div>
            );
          })}

          {isExecutingCmd && (
            <div className="text-emerald-400 text-[11px] animate-pulse">
              [EXEC] Processing command payload...
            </div>
          )}

          {isScanning && (
            <div className="flex items-center space-x-2 text-emerald-400 text-[11px] pt-1 animate-pulse">
              <span className="w-1.5 h-3 bg-emerald-400 animate-ping inline-block" />
              <span>Analyzing psycholinguistic vectors & registrar nodes via Gemini...</span>
            </div>
          )}
        </div>

        {/* Command Line Input Bar */}
        <div className="bg-[#090E16] px-3 py-2 border-t border-slate-800/80 flex items-center space-x-2">
          <span className="text-emerald-400 text-xs font-bold font-mono shrink-0 select-none">
            analyst@verioffer-soc:~$
          </span>
          <input
            ref={inputRef}
            type="text"
            value={inputCommand}
            onChange={(e) => setInputCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type 'help', 'ls reports', 'cat <file>', 'status'..."
            className="flex-1 bg-transparent text-xs text-slate-200 font-mono focus:outline-none placeholder-slate-600"
            disabled={isExecutingCmd}
          />
          <button
            onClick={() => {
              if (inputCommand.trim()) {
                executeCommand(inputCommand);
                setInputCommand('');
              }
            }}
            className="text-slate-400 hover:text-emerald-400 p-1 transition-colors"
            title="Execute Command"
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Terminal Footer Info */}
        <div className="bg-[#060910] px-4 py-1 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500 select-none">
          <div className="flex items-center space-x-3">
            <span>PIPELINE: Dual-Vector SOC</span>
            <span>ARCHIVE: /reports/</span>
          </div>
          <div className="flex items-center space-x-2 text-[10px]">
            <span>Press <kbd className="px-1 py-0.2 bg-slate-800 text-slate-300 rounded text-[9px]">Enter</kbd> to run</span>
            <span>•</span>
            <span><kbd className="px-1 py-0.2 bg-slate-800 text-slate-300 rounded text-[9px]">↑</kbd><kbd className="px-1 py-0.2 bg-slate-800 text-slate-300 rounded text-[9px]">↓</kbd> history</span>
          </div>
        </div>
      </div>
    </div>
  );
};
