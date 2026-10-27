export interface RedFlagItem {
  id: string;
  category: string;
  quote: string;
  explanation: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  tacticType: 'urgency' | 'equipment_fee' | 'check_fraud' | 'free_webmail' | 'typosquat' | 'id_theft' | 'crypto_wire' | 'generic';
}

export interface DomainForensics {
  domain: string;
  isFreeMail: boolean;
  isSuspiciousTld: boolean;
  typosquatRisk: 'none' | 'suspicious' | 'critical';
  impersonatedBrand?: string;
  explanation: string;
  verdict: string;
}

export interface RemediationStep {
  id: number;
  action: string;
  priority: 'immediate' | 'recommended' | 'advisory';
  details: string;
}

export interface PsycholinguisticMetrics {
  urgencyCoercion: number; // 0 - 100
  financialDemand: number; // 0 - 100
  identityHarvesting: number; // 0 - 100
  domainDiscrepancy: number; // 0 - 100
  overallThreat: number; // 0 - 100
}

export interface ScanResult {
  id: string;
  timestamp: string;
  threatPercentage: number; // 0 - 100
  riskTier: 'LOW_RISK' | 'SUSPICIOUS_MEDIUM' | 'CRITICAL_SCAM';
  headline: string;
  executiveSummary: string;
  primaryDeceptionVector: string;
  redFlags: RedFlagItem[];
  domainAnalysis: DomainForensics;
  remediationSteps: RemediationStep[];
  psycholinguisticMetrics: PsycholinguisticMetrics;
  safeActions: string[];
  auditLogs: string[];
  scannedTextSample: string;
  inputDomain: string;
  scanDurationMs: number;
  reportFilename?: string;
  archivedAt?: string;
  uploadedFileName?: string;
  fileSizeBytes?: number;
}

export interface ArchivedReportSummary {
  filename: string;
  id: string;
  timestamp: string;
  threatPercentage: number;
  riskTier: 'LOW_RISK' | 'SUSPICIOUS_MEDIUM' | 'CRITICAL_SCAM';
  primaryDeceptionVector: string;
  inputDomain: string;
  headline?: string;
  sizeBytes: number;
  uploadedFileName?: string;
}

export interface ScanRequest {
  offerText: string;
  senderDomain?: string;
  documentType?: 'job_offer' | 'rental_agreement' | 'internship' | 'general_contract' | 'auto_detect';
  uploadedFileName?: string;
  fileSizeBytes?: number;
}

export interface FileScanRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  fileBase64?: string;
  fileText?: string;
  senderDomain?: string;
  documentType?: 'job_offer' | 'rental_agreement' | 'internship' | 'general_contract' | 'auto_detect';
}
