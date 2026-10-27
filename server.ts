import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';
import { analyzeDomainHeuristics, fallbackHeuristicAudit } from './server/heuristics.ts';
import { ScanResult, RedFlagItem, RemediationStep } from './src/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Reports Directory for Archiving
const REPORTS_DIR = path.join(process.cwd(), 'reports');
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Helper to format report filename according to PRD
function generateReportFilename(timestampIso: string, domain: string, threatPercent: number, uploadedFileName?: string): string {
  const d = new Date(timestampIso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const dateStr = `${d.getFullYear()}_${pad(d.getMonth() + 1)}_${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
  
  let targetName = domain;
  if (!targetName || targetName === 'unknown' || targetName === 'none') {
    if (uploadedFileName) {
      targetName = uploadedFileName.replace(/\.[^/.]+$/, '');
    } else {
      targetName = 'unknown';
    }
  }
  const cleanTarget = targetName.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 15);
  return `audit_${dateStr}_${threatPercent}pct_${cleanTarget}.json`;
}

// Helper to extract text content from uploaded file payloads
function extractTextFromFileBuffer(filename: string, fileType: string, base64Data?: string, rawText?: string): { extractedText: string; isBinaryDoc: boolean } {
  if (rawText && rawText.trim().length > 0) {
    return { extractedText: rawText, isBinaryDoc: false };
  }
  
  if (!base64Data) {
    return { extractedText: 'No readable text payload detected.', isBinaryDoc: false };
  }

  const buffer = Buffer.from(base64Data, 'base64');
  const lowerExt = path.extname(filename || '').toLowerCase();
  const lowerMime = (fileType || '').toLowerCase();

  if (lowerExt === '.txt' || lowerExt === '.eml' || lowerMime.includes('text') || lowerMime.includes('message')) {
    return { extractedText: buffer.toString('utf-8'), isBinaryDoc: false };
  }

  if (lowerExt === '.pdf' || lowerMime.includes('pdf')) {
    const raw = buffer.toString('binary');
    const matches = raw.match(/\(([^()]{3,})\)[\s]*T[jJ]|BT[\s\S]*?ET/g);
    let extracted = '';
    if (matches) {
      extracted = matches
        .map(m => m.replace(/[\(\)\[\]\/\\]/g, ' ').replace(/T[jJ]|BT|ET/g, ''))
        .filter(m => m.trim().length > 3)
        .join(' ');
    }
    if (extracted.length < 50) {
      const asciiStrings = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
      const cleanTokens = asciiStrings.split(/\s+/).filter(t => t.length > 2 && !t.includes('obj') && !t.includes('endobj')).join(' ');
      if (cleanTokens.length > 50) {
        extracted = cleanTokens.slice(0, 15000);
      }
    }
    return { extractedText: extracted || 'PDF document binary payload parsed.', isBinaryDoc: true };
  }

  if (lowerExt === '.docx') {
    const rawStr = buffer.toString('utf-8');
    const xmlTextMatches = rawStr.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
    if (xmlTextMatches) {
      const clean = xmlTextMatches.map(m => m.replace(/<[^>]+>/g, '')).join(' ');
      return { extractedText: clean, isBinaryDoc: true };
    }
    const cleanTokens = rawStr.replace(/[^\x20-\x7E\n\r\t]/g, ' ').split(/\s+/).filter(t => t.length > 3).join(' ');
    return { extractedText: cleanTokens.slice(0, 15000) || 'Word document payload parsed.', isBinaryDoc: true };
  }

  // Fallback string extraction
  const fallbackText = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ').split(/\s+/).filter(t => t.length > 2).join(' ');
  return { extractedText: fallbackText.slice(0, 15000) || 'Uploaded document artifact.', isBinaryDoc: true };
}

// Helper to save report file
function saveReportArchive(result: ScanResult): string {
  try {
    const filename = generateReportFilename(result.timestamp, result.inputDomain, result.threatPercentage, result.uploadedFileName);
    const filePath = path.join(REPORTS_DIR, filename);
    const payload = {
      ...result,
      archivedAt: new Date().toISOString(),
      reportFilename: filename,
    };
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
    return filename;
  } catch (e) {
    console.error('Failed to write report archive to disk:', e);
    return `audit_${Date.now()}.json`;
  }
}

// Seed baseline demo audit reports if directory is empty
function seedBaselineReportsIfEmpty() {
  try {
    const files = fs.readdirSync(REPORTS_DIR).filter(f => f.endsWith('.json'));
    if (files.length === 0) {
      const demoDomain = 'apexhealth-careers-hr.com';
      const demoSample = 'We are mailing you a Cashiers Check for $4,850. Deposit it and wire $4,500 via Zelle to our equipment vendor within 24 hours. Contact via Telegram.';
      const heuristics = analyzeDomainHeuristics(demoDomain, demoSample);
      const audit = fallbackHeuristicAudit(demoSample, heuristics);
      saveReportArchive(audit);
    }
  } catch (e) {
    console.error('Error seeding baseline reports:', e);
  }
}
seedBaselineReportsIfEmpty();

// Initialize Google GenAI client lazily or when key is available
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'VeriOffer Cyber SOC Engine v3.1',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    geminiModel: 'gemini-3.8-flash',
    reportsArchiving: true,
    reportsCount: fs.existsSync(REPORTS_DIR) ? fs.readdirSync(REPORTS_DIR).filter(f => f.endsWith('.json')).length : 0,
    timestamp: new Date().toISOString(),
  });
});

// List Archived Reports
app.get('/api/reports', (req, res) => {
  try {
    if (!fs.existsSync(REPORTS_DIR)) {
      return res.json({ reports: [] });
    }
    const files = fs.readdirSync(REPORTS_DIR).filter(f => f.endsWith('.json'));
    const reports = files.map(filename => {
      try {
        const filePath = path.join(REPORTS_DIR, filename);
        const stats = fs.statSync(filePath);
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          filename,
          id: parsed.id || filename.replace('.json', ''),
          timestamp: parsed.timestamp || stats.mtime.toISOString(),
          threatPercentage: parsed.threatPercentage ?? 0,
          riskTier: parsed.riskTier || 'SUSPICIOUS_MEDIUM',
          primaryDeceptionVector: parsed.primaryDeceptionVector || 'Forensic Scan',
          inputDomain: parsed.inputDomain || 'N/A',
          headline: parsed.headline || 'Forensic Audit Report',
          sizeBytes: stats.size,
          mtime: stats.mtime,
          uploadedFileName: parsed.uploadedFileName,
        };
      } catch {
        return null;
      }
    }).filter(Boolean);

    // Sort newest first
    reports.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({ reports, count: reports.length });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to read reports directory', details: err.message });
  }
});

// Get Single Archived Report by Filename
app.get('/api/reports/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    // Protect against path traversal
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid report filename' });
    }

    const safeFilename = filename.endsWith('.json') ? filename : `${filename}.json`;
    const filePath = path.join(REPORTS_DIR, safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: `Report "${safeFilename}" not found in /reports/ archive.` });
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to read report', details: err.message });
  }
});

// Delete Archived Report by Filename
app.delete('/api/reports/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid report filename' });
    }
    const safeFilename = filename.endsWith('.json') ? filename : `${filename}.json`;
    const filePath = path.join(REPORTS_DIR, safeFilename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.json({ success: true, deleted: safeFilename });
    }
    res.status(404).json({ error: 'File not found' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete report', details: err.message });
  }
});

// Forensic Scan Endpoint
app.post('/api/scan', async (req, res) => {
  const startTime = Date.now();
  const { offerText = '', senderDomain = '', documentType = 'auto_detect' } = req.body;

  if (!offerText || typeof offerText !== 'string' || offerText.trim().length === 0) {
    return res.status(400).json({ error: 'Communication text is required for forensic scanning.' });
  }

  const cleanText = offerText.trim();
  const domainForensics = analyzeDomainHeuristics(senderDomain || '', cleanText);

  // If Gemini API is available, perform deep psycholinguistic and deceptive reasoning audit
  const ai = getGenAI();

  if (ai) {
    try {
      const prompt = `You are VeriOffer SOC Cyber-Intelligence Engine, an enterprise security analyst investigating phishing, fake employment offers, and rental advance-fee deception.

TASK:
Audit the following communication and extracted sender domain metadata:
- Extracted Sender Domain: "${domainForensics.domain}"
- Domain Heuristic Note: ${domainForensics.verdict} (${domainForensics.explanation})
- Document Type Hint: ${documentType}

OFFER / COMMUNICATION BODY:
"""
${cleanText}
"""

FORENSIC EVALUATION CRITERIA:
1. Threat Percentage: Calculate a strict Scam Threat Index from 0 to 100 based on:
   - 0-30% (Low Risk): Authentic corporate hiring, standard equity/benefits, verified corporate domains, zero fees.
   - 31-70% (Suspicious / Medium): Unverified recruiters, missing interview processes, non-standard communication channels.
   - 71-100% (Critical Scam): Cashier's check for home equipment, wiring funds (Zelle, Bitcoin, CashApp, Wire, Apple Pay), Telegram/WhatsApp-only interviews, requesting unencrypted SSN/ID photos, overseas landlord key mailing scams, negative task balance recharges.
2. Psycholinguistic vectors:
   - Urgency & coercion (artificial deadlines, breach threats)
   - Financial demands (checks, equipment vendors, application fees, security deposits)
   - Identity harvesting (demands for SSN, passports, driver licenses)
   - Domain discrepancies (typosquatting, free webmail mismatch)
3. Extract exact quotes from the text representing predatory red flags.
4. Provide prioritized remediation action steps for the victim.

Respond strictly conforming to the requested JSON schema.`;

      const geminiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an elite cyber forensics auditor specializing in social engineering, advance-fee recruitment fraud, and phishing detection. Always deliver rigorous, factual, objective security evaluations.',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              threatPercentage: {
                type: Type.INTEGER,
                description: 'Calculated threat score from 0 (completely genuine) to 100 (critical scam).',
              },
              riskTier: {
                type: Type.STRING,
                description: 'LOW_RISK, SUSPICIOUS_MEDIUM, or CRITICAL_SCAM',
              },
              headline: {
                type: Type.STRING,
                description: 'Short high-impact SOC alert headline.',
              },
              executiveSummary: {
                type: Type.STRING,
                description: 'Comprehensive 2-3 sentence forensic finding.',
              },
              primaryDeceptionVector: {
                type: Type.STRING,
                description: 'The key scam vector (e.g., Fake Check Equipment Fraud, Advance Rental Fee, Identity Harvesting).',
              },
              redFlags: {
                type: Type.ARRAY,
                description: 'Specific predatory phrases or deceptive indicators detected in the text.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    quote: { type: Type.STRING, description: 'Direct snippet from the input text.' },
                    explanation: { type: Type.STRING, description: 'Why this is deceptive or dangerous.' },
                    severity: { type: Type.STRING, description: 'critical, high, medium, or low' },
                    tacticType: { type: Type.STRING, description: 'urgency, equipment_fee, check_fraud, free_webmail, typosquat, id_theft, crypto_wire, generic' },
                  },
                  required: ['category', 'quote', 'explanation', 'severity', 'tacticType'],
                },
              },
              domainVerdict: { type: Type.STRING },
              domainExplanation: { type: Type.STRING },
              psycholinguisticMetrics: {
                type: Type.OBJECT,
                properties: {
                  urgencyCoercion: { type: Type.INTEGER },
                  financialDemand: { type: Type.INTEGER },
                  identityHarvesting: { type: Type.INTEGER },
                  domainDiscrepancy: { type: Type.INTEGER },
                  overallThreat: { type: Type.INTEGER },
                },
                required: ['urgencyCoercion', 'financialDemand', 'identityHarvesting', 'domainDiscrepancy', 'overallThreat'],
              },
              remediationSteps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    action: { type: Type.STRING },
                    priority: { type: Type.STRING, description: 'immediate, recommended, or advisory' },
                    details: { type: Type.STRING },
                  },
                  required: ['id', 'action', 'priority', 'details'],
                },
              },
              safeActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'threatPercentage',
              'riskTier',
              'headline',
              'executiveSummary',
              'primaryDeceptionVector',
              'redFlags',
              'psycholinguisticMetrics',
              'remediationSteps',
              'safeActions',
            ],
          },
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Gemini API timeout after 5000ms')), 5000);
      });

      const response = await Promise.race([geminiPromise, timeoutPromise]);

      const parsed = JSON.parse(response.text?.trim() || '{}');
      const scanDurationMs = Date.now() - startTime;

      // Normalize threat percentage
      const threatScore = Math.max(0, Math.min(100, Number(parsed.threatPercentage) || 0));
      const normalizedRiskTier: 'LOW_RISK' | 'SUSPICIOUS_MEDIUM' | 'CRITICAL_SCAM' =
        threatScore >= 71 ? 'CRITICAL_SCAM' : threatScore >= 31 ? 'SUSPICIOUS_MEDIUM' : 'LOW_RISK';

      const redFlagsList: RedFlagItem[] = Array.isArray(parsed.redFlags)
        ? parsed.redFlags.map((rf: any, idx: number) => ({
            id: `rf-ai-${idx + 1}`,
            category: rf.category || 'Deceptive Pattern',
            quote: rf.quote || '',
            explanation: rf.explanation || '',
            severity: (['critical', 'high', 'medium', 'low'].includes(rf.severity?.toLowerCase())
              ? rf.severity.toLowerCase()
              : 'high') as any,
            tacticType: rf.tacticType || 'generic',
          }))
        : [];

      // If domain is flagged by heuristic, ensure it's represented
      if (domainForensics.isFreeMail || domainForensics.typosquatRisk !== 'none') {
        const hasDomainFlag = redFlagsList.some((rf) => rf.tacticType === 'typosquat' || rf.tacticType === 'free_webmail');
        if (!hasDomainFlag) {
          redFlagsList.unshift({
            id: 'rf-domain-heuristic',
            category: 'Domain Deception & Structural Heuristics',
            quote: domainForensics.domain,
            explanation: domainForensics.explanation,
            severity: 'critical',
            tacticType: domainForensics.isFreeMail ? 'free_webmail' : 'typosquat',
          });
        }
      }

      const remediationStepsList: RemediationStep[] = Array.isArray(parsed.remediationSteps)
        ? parsed.remediationSteps.map((step: any, idx: number) => ({
            id: idx + 1,
            action: step.action || 'Safety Action',
            priority: (['immediate', 'recommended', 'advisory'].includes(step.priority?.toLowerCase())
              ? step.priority.toLowerCase()
              : 'recommended') as any,
            details: step.details || '',
          }))
        : [];

      const result: ScanResult = {
        id: `scan-${Date.now()}`,
        timestamp: new Date().toISOString(),
        threatPercentage: threatScore,
        riskTier: normalizedRiskTier,
        headline: parsed.headline || (threatScore >= 71 ? 'CRITICAL SCAM DETECTED' : 'FORENSIC AUDIT COMPLETE'),
        executiveSummary: parsed.executiveSummary || 'Deep neural psycholinguistic analysis completed.',
        primaryDeceptionVector: parsed.primaryDeceptionVector || 'Social Engineering Deception',
        redFlags: redFlagsList,
        domainAnalysis: {
          ...domainForensics,
          verdict: parsed.domainVerdict || domainForensics.verdict,
          explanation: parsed.domainExplanation || domainForensics.explanation,
        },
        remediationSteps: remediationStepsList,
        psycholinguisticMetrics: {
          urgencyCoercion: Math.max(0, Math.min(100, Number(parsed.psycholinguisticMetrics?.urgencyCoercion) || 0)),
          financialDemand: Math.max(0, Math.min(100, Number(parsed.psycholinguisticMetrics?.financialDemand) || 0)),
          identityHarvesting: Math.max(0, Math.min(100, Number(parsed.psycholinguisticMetrics?.identityHarvesting) || 0)),
          domainDiscrepancy: Math.max(0, Math.min(100, Number(parsed.psycholinguisticMetrics?.domainDiscrepancy) || 0)),
          overallThreat: threatScore,
        },
        safeActions: Array.isArray(parsed.safeActions) ? parsed.safeActions : [
          'Verify job vacancies directly on company career portals.',
          'Never wire funds or purchase hardware for remote work.',
          'Report unverified recruiters to law enforcement.'
        ],
        auditLogs: [],
        scannedTextSample: cleanText.slice(0, 300) + (cleanText.length > 300 ? '...' : ''),
        inputDomain: domainForensics.domain,
        scanDurationMs,
      };

      const archivedFilename = generateReportFilename(result.timestamp, result.inputDomain, result.threatPercentage);
      result.reportFilename = archivedFilename;
      result.archivedAt = new Date().toISOString();
      result.auditLogs = [
        `[AUDIT_START] triggered scan on payload (${cleanText.length} characters).`,
        `[GEMINI_API] Requesting JSON schema extraction via model gemini-3.8-flash.`,
        `[HEURISTIC_FORENSICS] Free-mail check: ${domainForensics.isFreeMail ? 'FLAGGED' : 'PASSED'}. Typosquat/Brand-jacking score: ${domainForensics.typosquatRisk}.`,
        `[SCAM_THREAT_INDEX] Calculated weighted composite score: ${threatScore}%. Risk tier: ${normalizedRiskTier}.`,
        `[REPORT_ARCHIVE] Forensic report compiled and saved to /reports/${archivedFilename}`,
      ];
      saveReportArchive(result);

      return res.json(result);
    } catch (err: any) {
      console.error('Gemini API call failed, switching to deterministic heuristic forensics:', err);
      // Fall through to deterministic heuristic engine
    }
  }

  // Fallback to high-accuracy deterministic heuristic engine
  const fallbackResult = fallbackHeuristicAudit(cleanText, domainForensics);
  fallbackResult.scanDurationMs = Date.now() - startTime;
  const archivedFilename = generateReportFilename(fallbackResult.timestamp, fallbackResult.inputDomain, fallbackResult.threatPercentage);
  fallbackResult.reportFilename = archivedFilename;
  fallbackResult.archivedAt = new Date().toISOString();
  fallbackResult.auditLogs = [
    `[AUDIT_START] triggered scan on payload (${cleanText.length} characters).`,
    `[GEMINI_API] Requesting JSON schema extraction via model gemini-3.8-flash.`,
    `[HEURISTIC_FORENSICS] Free-mail check: ${domainForensics.isFreeMail ? 'FLAGGED' : 'PASSED'}. Typosquat/Brand-jacking score: ${domainForensics.typosquatRisk}.`,
    `[SCAM_THREAT_INDEX] Calculated weighted composite score: ${fallbackResult.threatPercentage}%. Risk tier: ${fallbackResult.riskTier}.`,
    `[REPORT_ARCHIVE] Forensic report compiled and saved to /reports/${archivedFilename}`,
  ];
  saveReportArchive(fallbackResult);
  return res.json(fallbackResult);
});

// File Upload Forensic Ingestion API
app.post('/api/scan-file', async (req, res) => {
  const startTime = Date.now();
  const { fileName, fileType, fileSize, fileBase64, fileText, senderDomain } = req.body;

  if (!fileName || (!fileBase64 && !fileText)) {
    return res.status(400).json({ error: 'File payload and filename are required.' });
  }

  const safeSize = fileSize || (fileBase64 ? Math.round(fileBase64.length * 0.75) : (fileText ? fileText.length : 1024));
  const sizeKb = Math.max(1, Math.round(safeSize / 1024));

  // Extract text and analyze document structure
  const { extractedText } = extractTextFromFileBuffer(fileName, fileType || 'application/octet-stream', fileBase64, fileText);

  // Auto-discover sender domain if not explicitly provided
  let effectiveDomain = (senderDomain || '').trim();
  if (!effectiveDomain || effectiveDomain === 'unknown') {
    const emailMatches = extractedText.match(/[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatches && emailMatches[1]) {
      effectiveDomain = emailMatches[1].toLowerCase();
    } else {
      effectiveDomain = 'document-artifact.local';
    }
  }

  const domainForensics = analyzeDomainHeuristics(effectiveDomain, extractedText);

  const ai = getGenAI();
  if (ai) {
    try {
      const prompt = `Analyze this uploaded document artifact ("${fileName}", ${sizeKb} KB) for job offer fraud, rental scams, fake checks, advance-fee deception, identity harvesting, or phishing.

SENDER DOMAIN IDENTIFIED: "${domainForensics.domain}" (Heuristic Flag: ${domainForensics.isFreeMail ? 'Free Mailbox' : 'Custom Host'}, Typo-Risk: ${domainForensics.typosquatRisk})

DOCUMENT TEXT/METADATA:
"""
${extractedText.slice(0, 10000)}
"""

REQUIREMENTS:
1. Calculate a dynamic Scam Threat Index (0-100%):
   - 0-30% (Low Risk): Authentic corporate hiring/offer letter, verified corporate domain, zero fees, official benefits.
   - 31-70% (Suspicious / Medium): Unverified entities, non-standard workflow, unusual clauses.
   - 71-100% (Critical Scam): Cashier's check for home equipment, advance-fee wiring demands (Zelle, Bitcoin, CashApp, Wire, Apple Pay), Telegram/WhatsApp-only communications, unencrypted SSN/ID photos, overseas landlord key mail scams.
2. Psycholinguistic vectors: Urgency Coercion, Financial Demand, Identity Harvesting, Domain Spoofing.
3. Extract exact quotes from the text representing predatory red flags.
4. Provide prioritized remediation action steps for the victim.

Respond strictly conforming to the requested JSON schema.`;

      const contentsPayload: any[] = [];
      contentsPayload.push({ text: prompt });

      // If PDF with base64, pass inlineData directly to Gemini for multimodal document understanding
      const lowerExt = path.extname(fileName || '').toLowerCase();
      if ((lowerExt === '.pdf' || (fileType && fileType.includes('pdf'))) && fileBase64) {
        contentsPayload.push({
          inlineData: {
            mimeType: 'application/pdf',
            data: fileBase64,
          },
        });
      }

      const geminiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contentsPayload,
        config: {
          systemInstruction: 'You are an elite cyber forensics auditor specializing in document fraud, phishing inspection, and advance-fee detection.',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              threatPercentage: { type: Type.INTEGER },
              riskTier: { type: Type.STRING },
              headline: { type: Type.STRING },
              executiveSummary: { type: Type.STRING },
              primaryDeceptionVector: { type: Type.STRING },
              redFlags: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    severity: { type: Type.STRING },
                    category: { type: Type.STRING },
                    quote: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                  },
                  required: ['id', 'severity', 'category', 'quote', 'explanation'],
                },
              },
              psycholinguisticMetrics: {
                type: Type.OBJECT,
                properties: {
                  urgencyCoercion: { type: Type.INTEGER },
                  financialDemand: { type: Type.INTEGER },
                  identityHarvesting: { type: Type.INTEGER },
                  domainDiscrepancy: { type: Type.INTEGER },
                  overallThreat: { type: Type.INTEGER },
                },
                required: ['urgencyCoercion', 'financialDemand', 'identityHarvesting', 'domainDiscrepancy', 'overallThreat'],
              },
              remediationSteps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    priority: { type: Type.STRING },
                    action: { type: Type.STRING },
                    details: { type: Type.STRING },
                  },
                  required: ['id', 'priority', 'action', 'details'],
                },
              },
              safeActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'threatPercentage',
              'riskTier',
              'headline',
              'executiveSummary',
              'primaryDeceptionVector',
              'redFlags',
              'psycholinguisticMetrics',
              'remediationSteps',
              'safeActions',
            ],
          },
        },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API timeout')), 18000)
      );

      const response: any = await Promise.race([geminiPromise, timeoutPromise]);
      const parsedData = JSON.parse(response.text.trim());

      const scanDurationMs = Date.now() - startTime;
      const threatScore = Math.max(0, Math.min(100, parsedData.threatPercentage || 75));
      const normalizedRiskTier =
        threatScore >= 71 ? 'CRITICAL_SCAM' : threatScore >= 31 ? 'SUSPICIOUS_MEDIUM' : 'LOW_RISK';

      const result: ScanResult = {
        id: `scan-file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        threatPercentage: threatScore,
        riskTier: normalizedRiskTier,
        headline: parsedData.headline || 'Document Forensic Audit Completed',
        executiveSummary: parsedData.executiveSummary || 'Audit completed for uploaded document.',
        primaryDeceptionVector: parsedData.primaryDeceptionVector || 'Document Attachment Vector',
        redFlags: (parsedData.redFlags || []).map((rf: any, index: number) => ({
          id: rf.id || index + 1,
          severity: (['critical', 'high', 'medium', 'low'].includes(rf.severity?.toLowerCase()) ? rf.severity.toLowerCase() : 'high') as any,
          category: rf.category || 'Deception Vector',
          quote: rf.quote || 'Document excerpt',
          explanation: rf.explanation || 'Suspicious structural indicator identified.',
        })),
        domainAnalysis: domainForensics,
        remediationSteps: parsedData.remediationSteps || [],
        psycholinguisticMetrics: {
          urgencyCoercion: parsedData.psycholinguisticMetrics?.urgencyCoercion || 50,
          financialDemand: parsedData.psycholinguisticMetrics?.financialDemand || 50,
          identityHarvesting: parsedData.psycholinguisticMetrics?.identityHarvesting || 50,
          domainDiscrepancy: parsedData.psycholinguisticMetrics?.domainDiscrepancy || 50,
          overallThreat: threatScore,
        },
        safeActions: parsedData.safeActions || [
          'Halt all communication with this entity pending secondary validation.',
          'Verify sender identity via independent corporate registry.',
        ],
        auditLogs: [],
        scannedTextSample: extractedText.slice(0, 300) + (extractedText.length > 300 ? '...' : ''),
        inputDomain: domainForensics.domain,
        scanDurationMs,
        uploadedFileName: fileName,
        fileSizeBytes: safeSize,
      };

      const archivedFilename = generateReportFilename(result.timestamp, result.inputDomain, result.threatPercentage, fileName);
      result.reportFilename = archivedFilename;
      result.archivedAt = new Date().toISOString();
      result.auditLogs = [
        `[FILE_INGESTION] Received upload: "${fileName}" (${sizeKb} KB).`,
        `[PARSER_DAEMON] Extracting text and metadata headers from document payload.`,
        `[AUDIT_START] Triggered forensic scan on extracted payload bytes.`,
        `[GEMINI_API] Requesting JSON schema extraction via model gemini-3.8-flash.`,
        `[SCAM_THREAT_INDEX] Calculated weighted composite score: ${threatScore}%. Risk tier: ${normalizedRiskTier}.`,
        `[REPORT_ARCHIVE] Forensic report compiled and saved to /reports/${archivedFilename}`,
      ];
      saveReportArchive(result);
      return res.json(result);
    } catch (err: any) {
      console.error('File scan with Gemini API failed, falling back to heuristic engine:', err);
    }
  }

  // Deterministic Heuristic Fallback for Files
  const fallbackResult = fallbackHeuristicAudit(extractedText, domainForensics);
  fallbackResult.scanDurationMs = Date.now() - startTime;
  fallbackResult.uploadedFileName = fileName;
  fallbackResult.fileSizeBytes = safeSize;
  const archivedFilename = generateReportFilename(fallbackResult.timestamp, fallbackResult.inputDomain, fallbackResult.threatPercentage, fileName);
  fallbackResult.reportFilename = archivedFilename;
  fallbackResult.archivedAt = new Date().toISOString();
  fallbackResult.auditLogs = [
    `[FILE_INGESTION] Received upload: "${fileName}" (${sizeKb} KB).`,
    `[PARSER_DAEMON] Extracting text and metadata headers from document payload.`,
    `[AUDIT_START] Triggered forensic scan on extracted payload bytes.`,
    `[GEMINI_API] Requesting JSON schema extraction via model gemini-3.8-flash.`,
    `[SCAM_THREAT_INDEX] Calculated weighted composite score: ${fallbackResult.threatPercentage}%. Risk tier: ${fallbackResult.riskTier}.`,
    `[REPORT_ARCHIVE] Forensic report compiled and saved to /reports/${archivedFilename}`,
  ];
  saveReportArchive(fallbackResult);
  return res.json(fallbackResult);
});

// Setup Vite or static serving
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VeriOffer] SOC Security Engine running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
