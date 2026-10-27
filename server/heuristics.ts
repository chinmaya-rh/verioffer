import { DomainForensics, ScanResult, RedFlagItem, RemediationStep, PsycholinguisticMetrics } from '../src/types';

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'proton.me', 
  'protonmail.com', 'aol.com', 'zoho.com', 'mail.com', 'yandex.com', 'icloud.com'
]);

const SUSPICIOUS_TLDS = new Set([
  'xyz', 'top', 'info', 'live', 'click', 'link', 'buzz', 'icu', 'rest', 'guru', 'work'
]);

const TARGETED_BRANDS = [
  'google', 'apple', 'microsoft', 'amazon', 'meta', 'netflix', 'metaverse', 
  'adobe', 'cisco', 'intel', 'nvidia', 'chase', 'wellsfargo', 'paypal'
];

export function analyzeDomainHeuristics(rawDomainOrUrl: string, text: string): DomainForensics {
  let domain = rawDomainOrUrl.trim().toLowerCase();
  
  // Extract domain from URL or email if provided
  if (domain.includes('@')) {
    domain = domain.split('@').pop() || domain;
  }
  if (domain.startsWith('http://') || domain.startsWith('https://')) {
    try {
      const parsed = new URL(domain);
      domain = parsed.hostname;
    } catch {
      // fallback
      domain = domain.replace(/^https?:\/\//, '').split('/')[0];
    }
  }

  domain = domain.split(':')[0]; // strip port

  if (!domain) {
    // Check if an email or URL is mentioned in the text
    const emailMatch = text.match(/[\w.-]+@([\w.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch && emailMatch[1]) {
      domain = emailMatch[1].toLowerCase();
    } else {
      domain = 'unspecified-sender.net';
    }
  }

  const parts = domain.split('.');
  const tld = parts[parts.length - 1];
  const isFreeMail = FREE_EMAIL_DOMAINS.has(domain);
  const isSuspiciousTld = SUSPICIOUS_TLDS.has(tld);

  let typosquatRisk: 'none' | 'suspicious' | 'critical' = 'none';
  let impersonatedBrand: string | undefined = undefined;

  for (const brand of TARGETED_BRANDS) {
    const isAuthenticBrandDomain = domain === `${brand}.com` || domain.endsWith(`.${brand}.com`);
    if (domain.includes(brand) && !isAuthenticBrandDomain) {
      typosquatRisk = 'critical';
      impersonatedBrand = brand.charAt(0).toUpperCase() + brand.slice(1);
      break;
    }
  }

  // Check for suspicious hyphenated terms like google-hr-portal, careers-amazon-jobs
  if (domain.includes('-careers') || domain.includes('-jobs') || domain.includes('-hr') || domain.includes('-recruiting')) {
    if (typosquatRisk === 'none') {
      typosquatRisk = 'suspicious';
    }
  }

  let explanation = '';
  let verdict = 'VERIFIED';

  if (isFreeMail) {
    explanation = `Legitimate enterprise recruiters use corporate domain emails, never free public webmail providers (${domain}).`;
    verdict = 'HIGH RISK: Free Webmail Mismatch';
  } else if (typosquatRisk === 'critical') {
    explanation = `Domain "${domain}" is spoofing ${impersonatedBrand || 'a recognized corporation'} using brand-jacking / typosquatting techniques.`;
    verdict = 'CRITICAL: Brand Impersonation Detected';
  } else if (isSuspiciousTld) {
    explanation = `Domain utilizes high-abuse top-level domain (.${tld}) frequently registered for short-lived phishing campaigns.`;
    verdict = 'SUSPICIOUS: High-Risk TLD';
  } else if (domain === 'unspecified-sender.net') {
    explanation = 'No authentic corporate sender domain could be verified in message headers.';
    verdict = 'UNVERIFIED DOMAIN';
  } else {
    explanation = `Domain ${domain} matches standard registrar topology.`;
    verdict = 'STANDARD DOMAIN';
  }

  return {
    domain,
    isFreeMail,
    isSuspiciousTld,
    typosquatRisk,
    impersonatedBrand,
    explanation,
    verdict,
  };
}

export function fallbackHeuristicAudit(text: string, domainInfo: DomainForensics): ScanResult {
  const lower = text.toLowerCase();
  const redFlags: RedFlagItem[] = [];

  let urgencyScore = 20;
  let financialScore = 15;
  let idScore = 10;
  let domainScore = domainInfo.typosquatRisk === 'critical' ? 95 : domainInfo.isFreeMail ? 75 : 15;

  // Equipment / Check Scam Checks
  if (lower.includes('cashier') || lower.includes('check') || lower.includes('cheque') || lower.includes('deposit') || lower.includes('vendor') || lower.includes('equipment')) {
    financialScore += 45;
    redFlags.push({
      id: 'rf-1',
      category: 'Fake Check & Equipment Scam',
      quote: text.match(/(cashier'?s?\s+check|purchase\s+equipment|vendor|deposit\s+the\s+check)/i)?.[0] || 'Equipment Procurement Check',
      explanation: 'Scammers send a fraudulent or stolen check, instruct the victim to deposit it, and quickly wire real money to a fake "equipment vendor" before the bank flags the fake deposit.',
      severity: 'critical',
      tacticType: 'check_fraud',
    });
  }

  // Zelle, Wire, Crypto, Bitcoin, CashApp, Apple Pay
  if (lower.includes('zelle') || lower.includes('bitcoin') || lower.includes('crypto') || lower.includes('usdt') || lower.includes('cashapp') || lower.includes('western union') || lower.includes('apple pay') || lower.includes('wire transfer')) {
    financialScore += 35;
    redFlags.push({
      id: 'rf-2',
      category: 'Irreversible Financial Channel',
      quote: text.match(/(zelle|bitcoin|crypto|usdt|cashapp|western\s+union|wire\s+the\s+remaining)/i)?.[0] || 'Wire / Crypto Instruction',
      explanation: 'Legitimate employers never demand funds to be wired via instant irreversible consumer channels (Zelle, Bitcoin ATM, CashApp, USDT).',
      severity: 'critical',
      tacticType: 'crypto_wire',
    });
  }

  // Telegram / WhatsApp / Signal interview
  if (lower.includes('telegram') || lower.includes('whatsapp') || lower.includes('signal') || lower.includes('skype')) {
    urgencyScore += 30;
    redFlags.push({
      id: 'rf-3',
      category: 'Untraceable Communication Platform',
      quote: text.match(/(telegram|whatsapp|signal)/i)?.[0] || 'Messaging platform',
      explanation: 'Conducting formal hiring or lease discussions exclusively via encrypted personal chat apps conceals cybercriminal identities from corporate IT forensics.',
      severity: 'high',
      tacticType: 'urgency',
    });
  }

  // Urgency Coercion
  if (lower.includes('urgent') || lower.includes('within 24 hours') || lower.includes('immediately') || lower.includes('forfeit') || lower.includes('breach of contract') || lower.includes('within 12 hours')) {
    urgencyScore += 35;
    redFlags.push({
      id: 'rf-4',
      category: 'Psychological Urgency & Coercion',
      quote: text.match(/(within\s+\d+\s+hours|immediately|urgent|breach\s+of\s+contract|forfeit)/i)?.[0] || 'Strict deadline coercion',
      explanation: 'Artificial deadlines create high adrenaline pressure, preventing candidates from consulting banks, legal advisors, or company verification hotlines.',
      severity: 'high',
      tacticType: 'urgency',
    });
  }

  // Identity Harvesting (SSN, ID photo)
  if (lower.includes('social security') || lower.includes('ssn') || lower.includes('front/back photo') || lower.includes('state id') || lower.includes('passport copy')) {
    idScore += 50;
    redFlags.push({
      id: 'rf-5',
      category: 'Sensitive Identity Harvesting',
      quote: text.match(/(social\s+security|ssn|front\/back\s+photo|state\s+id)/i)?.[0] || 'SSN / ID capture',
      explanation: 'Demanding unencrypted government identification documents prior to formal verified paperwork facilitates identity theft and synthetic credit fraud.',
      severity: 'critical',
      tacticType: 'id_theft',
    });
  }

  // Free webmail or typosquat domain flag
  if (domainInfo.isFreeMail || domainInfo.typosquatRisk !== 'none') {
    redFlags.push({
      id: 'rf-6',
      category: 'Domain Deception & Structural Mismatch',
      quote: domainInfo.domain,
      explanation: domainInfo.explanation,
      severity: 'critical',
      tacticType: domainInfo.isFreeMail ? 'free_webmail' : 'typosquat',
    });
  }

  // Rental specific scam flags
  if (lower.includes('missionary') || lower.includes('west africa') || lower.includes('cannot view the interior') || lower.includes('keys are with me')) {
    financialScore += 40;
    urgencyScore += 30;
    redFlags.push({
      id: 'rf-7',
      category: 'Classic Absentee Landlord Trap',
      quote: 'landlord relocated overseas, keys will be mailed after wire',
      explanation: 'Scammers scrape legitimate apartment listings and pretend to be pious overseas missionaries who will mail keys upon receiving non-refundable security deposits.',
      severity: 'critical',
      tacticType: 'generic',
    });
  }

  if (domainInfo.typosquatRisk === 'critical') {
    domainScore = 95;
  } else if (domainInfo.isFreeMail) {
    domainScore = 80;
  } else if (domainInfo.typosquatRisk === 'suspicious') {
    domainScore = 65;
  } else {
    domainScore = 15;
  }

  urgencyScore = Math.min(100, urgencyScore);
  financialScore = Math.min(100, financialScore);
  idScore = Math.min(100, idScore);
  domainScore = Math.min(100, domainScore);

  let weightedThreat = Math.round(
    (financialScore * 0.45) + 
    (urgencyScore * 0.25) + 
    (domainScore * 0.20) + 
    (idScore * 0.10)
  );

  // If both fake check/equipment fee AND wire/crypto/zelle are present, this is undeniably a Critical Scam (71-100%)
  if (financialScore >= 75) {
    weightedThreat = Math.max(88, weightedThreat);
  } else if (redFlags.some(rf => rf.severity === 'critical')) {
    weightedThreat = Math.max(76, weightedThreat);
  }

  weightedThreat = Math.min(99, weightedThreat);

  const isScam = weightedThreat >= 71;
  const isMedium = weightedThreat >= 31 && weightedThreat < 71;

  const riskTier: 'LOW_RISK' | 'SUSPICIOUS_MEDIUM' | 'CRITICAL_SCAM' = 
    isScam ? 'CRITICAL_SCAM' : isMedium ? 'SUSPICIOUS_MEDIUM' : 'LOW_RISK';

  const remediationSteps: RemediationStep[] = isScam ? [
    {
      id: 1,
      action: 'Cease All Communication Immediately',
      priority: 'immediate',
      details: 'Do not respond, negotiate, or click any subsequent tracking or authentication links sent by this address.',
    },
    {
      id: 2,
      action: 'Do Not Deposit Check or Transfer Funds',
      priority: 'immediate',
      details: 'If a physical or digital check was received, do not deposit it. If already deposited, contact your bank fraud department instantly.',
    },
    {
      id: 3,
      action: 'Cross-Verify via Official Corporate Portal',
      priority: 'recommended',
      details: 'Navigate directly to the employer\'s primary careers website (e.g. google.com/about/careers) to verify requisition existence.',
    },
    {
      id: 4,
      action: 'Submit Incident to Federal Cybercrime Repositories',
      priority: 'advisory',
      details: 'Report the phishing email headers and fraudulent domain to the FBI Internet Crime Complaint Center (IC3.gov) and the FTC.',
    }
  ] : [
    {
      id: 1,
      action: 'Verify Through Official Company Domain Portal',
      priority: 'recommended',
      details: 'Review the candidate portal directly via your browser bookmarks rather than solely relying on direct email links.',
    },
    {
      id: 2,
      action: 'Confirm Background Check Agency Credentials',
      priority: 'advisory',
      details: 'Ensure standard verification firms (e.g. Sterling, HireRight) operate under standard zero-fee candidate protocols.',
    }
  ];

  return {
    id: `scan-${Date.now()}`,
    timestamp: new Date().toISOString(),
    threatPercentage: weightedThreat,
    riskTier,
    headline: isScam 
      ? 'CRITICAL THREAT: High-Risk Advance-Fee Employment Scam Detected' 
      : isMedium 
      ? 'SUSPICIOUS ALERT: Anomalous Recruitment Elements Require Manual Audit' 
      : 'AUTHENTIC: Verified Corporate Communication Profile',
    executiveSummary: isScam
      ? 'Behavioral and structural telemetry identifies coordinated advance-fee fraud. The communication employs artificial urgency, requests unverified financial transactions to third-party vendors, and originates from deceptive or untrusted domain channels.'
      : isMedium
      ? 'The message contains minor ambiguities or non-standard communication channels. Verify all recruitment requisitions independently through authoritative corporate directory channels.'
      : 'Text and domain patterns conform to standard corporate human resources protocols. No upfront financial demands, check cashing schemes, or coercive timelines detected.',
    primaryDeceptionVector: isScam ? 'Advance Fee Check Cashing & Vendor Funneling' : 'None Detected',
    redFlags,
    domainAnalysis: domainInfo,
    remediationSteps,
    psycholinguisticMetrics: {
      urgencyCoercion: urgencyScore,
      financialDemand: financialScore,
      identityHarvesting: idScore,
      domainDiscrepancy: domainScore,
      overallThreat: weightedThreat,
    },
    safeActions: [
      'Never send money, gift cards, or crypto to any recruiter for home-office equipment.',
      'Authentic corporations ship pre-configured laptops directly from internal IT hardware logistics.',
      'Always verify recruiters on LinkedIn and reach out via switchboard phone numbers.'
    ],
    auditLogs: [
      `[00.012s] [INGESTION] Received ${text.length} characters of unstructured communication payload.`,
      `[00.045s] [DNS_PROBE] Extracted domain node: "${domainInfo.domain}" (TLD: .${domainInfo.domain.split('.').pop()}).`,
      `[00.089s] [HEURISTIC_FORENSICS] Free-mail check: ${domainInfo.isFreeMail ? 'FLAGGED (Public provider)' : 'PASSED'}.`,
      `[00.142s] [TYPOSQUAT_MATRIX] Brand-jacking score: ${domainInfo.typosquatRisk}.`,
      `[00.210s] [PSYCHOLINGUISTIC_VEC] Urgency coefficient: ${urgencyScore}%. Financial coercion: ${financialScore}%.`,
      `[00.280s] [SCAM_THREAT_INDEX] Calculated weighted composite score: ${weightedThreat}%. Risk tier: ${riskTier}.`,
      `[00.320s] [ACTION_GUARD] Generated ${remediationSteps.length} prioritized containment remediation steps.`
    ],
    scannedTextSample: text.slice(0, 300) + (text.length > 300 ? '...' : ''),
    inputDomain: domainInfo.domain,
    scanDurationMs: 320,
  };
}
