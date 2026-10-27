import React, { useState, useRef } from 'react';
import { 
  Zap, 
  Search, 
  Globe, 
  FileText, 
  Trash2, 
  ChevronDown, 
  ShieldAlert, 
  Loader2,
  Sparkles,
  ArrowRight,
  UploadCloud,
  FileCheck,
  FileType,
  AlertCircle,
  FileUp,
  File,
  X
} from 'lucide-react';
import { SAMPLE_CASES, SampleCase } from '../data/samples';
import { FileScanRequest } from '../types';

interface IngestionPanelProps {
  offerText: string;
  senderDomain: string;
  onOfferTextChange: (text: string) => void;
  onSenderDomainChange: (domain: string) => void;
  onScan: () => void;
  onScanFile: (fileData: FileScanRequest) => void;
  isLoading: boolean;
  onLoadSample: (sample: SampleCase) => void;
}

interface StagedFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  base64?: string;
  text?: string;
  previewSnippet?: string;
}

export const IngestionPanel: React.FC<IngestionPanelProps> = ({
  offerText,
  senderDomain,
  onOfferTextChange,
  onSenderDomainChange,
  onScan,
  onScanFile,
  isLoading,
  onLoadSample,
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'domain' | 'upload'>('paste');
  const [showPresetsDropdown, setShowPresetsDropdown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [stagedFile, setStagedFile] = useState<StagedFile | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const highRiskSample = SAMPLE_CASES.find((s) => s.id === 'high-risk-equipment-scam') || SAMPLE_CASES[0];
  const charCount = offerText.length;
  const wordCount = offerText.trim() ? offerText.trim().split(/\s+/).length : 0;

  const allowedExtensions = ['.pdf', '.docx', '.txt', '.eml'];

  const validateAndProcessFile = (file: File) => {
    setFileError(null);
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setFileError(`Unsupported format "${ext}". Supported: .pdf, .docx, .txt, .eml`);
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setFileError('File size exceeds 25 MB limit.');
      return;
    }

    const reader = new FileReader();

    if (ext === '.txt' || ext === '.eml') {
      reader.onload = (e) => {
        const textContent = (e.target?.result as string) || '';
        setStagedFile({
          name: file.name,
          size: file.size,
          type: file.type || 'text/plain',
          lastModified: file.lastModified,
          text: textContent,
          previewSnippet: textContent.slice(0, 240),
        });
      };
      reader.readAsText(file);
    } else {
      // PDF or DOCX - read as base64
      reader.onload = (e) => {
        const dataUrl = (e.target?.result as string) || '';
        const base64Data = dataUrl.split(',')[1] || '';
        setStagedFile({
          name: file.name,
          size: file.size,
          type: file.type || 'application/pdf',
          lastModified: file.lastModified,
          base64: base64Data,
          previewSnippet: `Binary forensic document (${ext.toUpperCase()}) ingested into memory. Ready for visual/structural AI parsing.`,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  // Instant demo file loader for hackathon evaluators
  const handleLoadDemoFile = (type: 'pdf' | 'eml') => {
    setFileError(null);
    if (type === 'pdf') {
      // Simulated realistic PDF document payload with cashier's check scam clauses
      const demoPdfText = `%PDF-1.4
%EXECUTIVE OFFER LETTER - APEX HEALTH GLOBAL HR
EMPLOYMENT APPOINTMENT LETTER
Candidate: Senior Remote Operations Lead
Base Salary: $165,000 / annum + Equipment Allowance
TERMS AND EQUIPMENT REIMBURSEMENT PROTOCOL:
You will receive an official Corporate Cashier's Check in the amount of $4,850.00 USD.
Upon deposit into your personal account, you must immediately wire $4,500.00 via Zelle or Cryptocurrency (Bitcoin) to our certified IT equipment logistics partner within 24 hours to secure your encrypted company workstation.
All communications must strictly take place via Telegram messenger (@ApexHealthRecruitingOps).`;
      
      const b64 = btoa(demoPdfText);
      setStagedFile({
        name: 'executive_offer_letter.pdf',
        size: 145408, // ~142 KB as specified in PRD
        type: 'application/pdf',
        lastModified: Date.now(),
        base64: b64,
        text: demoPdfText,
        previewSnippet: 'EXECUTIVE OFFER LETTER - APEX HEALTH GLOBAL HR. Candidate: Senior Remote Operations Lead. Cashier Check: $4,850. Wire: $4,500 via Zelle / Bitcoin.',
      });
      if (!senderDomain) {
        onSenderDomainChange('apexhealth-careers-hr.com');
      }
    } else {
      const demoEml = `From: "Rev. Thomas Miller" <landlord-mission@charter-rentals.net>
To: recipient@user.com
Subject: OFFICIAL RENTAL LEASE AGREEMENT & KEY DELIVERY - UNIT 402
Date: ${new Date().toUTCString()}

Dear Tenant,
I am currently in West Africa on a Christian Missionary outreach. I am ready to lease my fully furnished 2-Bedroom apartment for $1,100/month with all utilities included.
Due to my remote location, I cannot meet in person. Send a refundable $1,200 security deposit via Apple Pay or CashApp. Once received, I will dispatch the keys and lease via FedEx next-day delivery.`;

      setStagedFile({
        name: 'suspicious_landlord_lease.eml',
        size: 38912,
        type: 'message/rfc822',
        lastModified: Date.now(),
        text: demoEml,
        previewSnippet: 'OFFICIAL RENTAL LEASE AGREEMENT & KEY DELIVERY. Overseas Missionary landlord deposit request via Apple Pay/CashApp.',
      });
      if (!senderDomain) {
        onSenderDomainChange('charter-rentals.net');
      }
    }
    setActiveTab('upload');
  };

  const handleTriggerFileScan = () => {
    if (!stagedFile) return;
    onScanFile({
      fileName: stagedFile.name,
      fileType: stagedFile.type,
      fileSize: stagedFile.size,
      fileBase64: stagedFile.base64,
      fileText: stagedFile.text,
      senderDomain: senderDomain.trim() || undefined,
      documentType: 'auto_detect',
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading && offerText.trim()) {
        onScan();
      }
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-[#0E1522] border border-slate-800 rounded-xl p-5 shadow-2xl relative overflow-hidden">
      {/* Background cyber accent glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar with Mode Tabs & Demo Feature */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <div className="flex bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveTab('paste')}
              id="tab-paste-text"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'paste'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. Offer Letter / Text</span>
            </button>
            <button
              onClick={() => setActiveTab('domain')}
              id="tab-domain-url"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'domain'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>2. Sender Domain</span>
              {senderDomain && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse ml-1" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              id="tab-upload-document"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'upload'
                  ? 'bg-indigo-500/25 text-indigo-300 font-semibold border border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>3. Upload Document / File</span>
              {stagedFile && (
                <span className="w-2 h-2 rounded-full bg-indigo-400 ml-1" />
              )}
            </button>
          </div>
        </div>

        {/* Demo Preset Buttons */}
        <div className="flex items-center space-x-2">
          {/* PRD Required Instant Demo Button */}
          <button
            onClick={() => onLoadSample(highRiskSample)}
            id="btn-load-high-risk-scam"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 bg-rose-500/15 border border-rose-500/40 hover:bg-rose-500/25 transition-all shadow-[0_0_15px_rgba(244,63,94,0.15)] hover:scale-[1.02]"
            title="Instant demo: Remote job fake cashier's check equipment phishing scam"
          >
            <Zap className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-bounce" />
            <span>⚡ Load High-Risk Scam Sample</span>
          </button>

          {/* Preset dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPresetsDropdown(!showPresetsDropdown)}
              id="btn-sample-presets-dropdown"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-900 text-slate-300 border border-slate-700 hover:border-slate-600 transition-all"
            >
              <span>Presets</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showPresetsDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-[#0B0F17] border border-slate-700/80 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 py-1">
                  Select Evaluation Test Case
                </div>
                {SAMPLE_CASES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => {
                      onLoadSample(sample);
                      setShowPresetsDropdown(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800/70 transition-all flex flex-col space-y-0.5 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-200 group-hover:text-emerald-300">
                        {sample.title}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${sample.badgeColor}`}>
                        {sample.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 line-clamp-1">
                      {sample.subtitle}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Ingestion Body */}
      <div className="space-y-4">
        {/* Domain input line */}
        <div className={`transition-all rounded-lg p-3 ${
          activeTab === 'domain' 
            ? 'bg-cyan-950/20 border border-cyan-500/40 ring-1 ring-cyan-500/20' 
            : 'bg-slate-900/60 border border-slate-800/80'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
            <label htmlFor="input-sender-domain" className="text-xs font-mono text-slate-300 flex items-center space-x-2">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sender Domain or Recruitment URL (Optional / Recommended):</span>
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              e.g. <code className="text-cyan-300 bg-slate-800 px-1 py-0.5 rounded">careers@apexhealth-careers-hr.com</code>
            </span>
          </div>
          <div className="relative">
            <input
              id="input-sender-domain"
              type="text"
              value={senderDomain}
              onChange={(e) => onSenderDomainChange(e.target.value)}
              placeholder="Paste sender email (e.g. hr@company-jobs.xyz) or recruitment landing portal URL"
              className="w-full bg-[#080C14] border border-slate-700/80 rounded-lg px-3.5 py-2 text-xs font-mono text-cyan-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
            {senderDomain && (
              <button
                onClick={() => onSenderDomainChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* TAB 3: FILE UPLOAD DROPZONE */}
        {activeTab === 'upload' ? (
          <div className="space-y-3 font-mono">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.eml"
              onChange={handleFileInputChange}
              className="hidden"
              id="file-upload-input"
            />

            {/* Dropzone Container */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden group ${
                isDragging
                  ? 'border-indigo-400 bg-indigo-500/10 shadow-[0_0_25px_rgba(99,102,241,0.25)]'
                  : stagedFile
                  ? 'border-emerald-500/50 bg-emerald-950/15'
                  : 'border-slate-700 hover:border-indigo-400/80 bg-[#080C14] hover:bg-slate-900/60'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform text-indigo-400">
                <UploadCloud className="w-6 h-6" />
              </div>

              <div className="text-sm font-bold text-slate-200 mb-1">
                {stagedFile ? 'Click or drop a different document to replace' : 'Drop suspicious offer letter or contract artifact here'}
              </div>
              <p className="text-xs text-slate-400 max-w-md mb-3 font-sans">
                Drag and drop your document or <span className="text-indigo-400 underline underline-offset-2">browse files</span>. Formats supported: <strong className="text-slate-300">.PDF</strong>, <strong className="text-slate-300">.DOCX</strong>, <strong className="text-slate-300">.TXT</strong>, <strong className="text-slate-300">.EML</strong> (up to 25 MB).
              </p>

              <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Direct Gemini 3.8 Flash Parsing</span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Zero Client-Side Leaks</span>
              </div>
            </div>

            {/* Error banner if file validation fails */}
            {fileError && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 text-xs text-rose-300 flex items-center space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{fileError}</span>
              </div>
            )}

            {/* Staged file card if loaded */}
            {stagedFile && (
              <div className="bg-[#080C14] border border-indigo-500/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-100 truncate">
                        {stagedFile.name}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {stagedFile.name.split('.').pop()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-2">
                      <span>{formatBytes(stagedFile.size)}</span>
                      <span>•</span>
                      <span className="text-emerald-400 flex items-center space-x-1">
                        <FileCheck className="w-3 h-3" />
                        <span>Ready for forensic triage</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => setStagedFile(null)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                    title="Remove uploaded file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleTriggerFileScan}
                    disabled={isLoading}
                    id="btn-scan-uploaded-file"
                    className="px-4 py-2 rounded-lg text-xs font-bold font-mono text-slate-950 bg-indigo-400 hover:bg-indigo-300 transition-all flex items-center space-x-1.5 shadow-[0_0_15px_rgba(99,102,241,0.3)] disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Scanning Document...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5" />
                        <span>Scan Uploaded File for Fraud</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Instant Demo File Options for Hackathon Evaluators */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 bg-slate-900/40 p-3 rounded-lg border border-slate-800/80 gap-2">
              <span className="flex items-center space-x-1.5 text-[11px] text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Instant Demo Files (One-Click Jury Evaluation):</span>
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleLoadDemoFile('pdf')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition-all hover:scale-105"
                  title="Load synthetic PDF offer letter with cashier's check scam"
                >
                  📄 Load Demo PDF: executive_offer_letter.pdf
                </button>
                <button
                  onClick={() => handleLoadDemoFile('eml')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition-all"
                  title="Load rental fraud email payload"
                >
                  ✉️ Load Demo EML: landlord_lease.eml
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* TAB 1: TEXT AREA */
          <div className="relative">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5 px-1">
              <span className="flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Offer Letter Text / Email Headers / Contract Payload:</span>
              </span>
              <div className="flex items-center space-x-3">
                <span>{wordCount} words</span>
                <span className="text-slate-600">|</span>
                <span>{charCount} characters</span>
                {offerText && (
                  <button
                    onClick={() => onOfferTextChange('')}
                    className="text-slate-400 hover:text-rose-400 transition-colors flex items-center space-x-1 ml-2"
                    title="Clear text"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            <textarea
              id="textarea-offer-content"
              rows={8}
              value={offerText}
              onChange={(e) => onOfferTextChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Paste the suspicious email, appointment letter, rental contract, or recruitment communication here...

Example triggers VeriOffer analyzes:
• "We are mailing you a Cashier's Check for equipment..."
• "Wire funds to our approved vendor via Zelle / Bitcoin..."
• "Exclusive Telegram interview for remote operations..."
• "Overseas missionary landlord will express mail apartment keys..."`}
              className="w-full bg-[#080C14] border border-slate-700/80 rounded-lg p-3.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono leading-relaxed"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
              <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500">
                <span>Press <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 text-[10px]">Ctrl + Enter</kbd> to trigger forensic audit</span>
                {stagedFile && (
                  <>
                    <span>•</span>
                    <span className="text-indigo-400 cursor-pointer" onClick={() => setActiveTab('upload')}>
                      1 file staged ({stagedFile.name})
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                {stagedFile && (
                  <button
                    onClick={handleTriggerFileScan}
                    disabled={isLoading}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-xs font-bold font-mono text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 hover:bg-indigo-500/25 transition-all flex items-center justify-center space-x-2"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Scan Staged File</span>
                  </button>
                )}

                <button
                  onClick={onScan}
                  disabled={isLoading || !offerText.trim()}
                  id="btn-trigger-scan"
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-xs font-bold font-mono text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Executing SOC Forensics...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 text-slate-950" />
                      <span>Scan for Fraud</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
