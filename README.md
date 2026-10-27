# 🛡️ VeriOffer v3.1 — Enterprise Cyber-Command & Forensic Audit Suite

[![PromptWars x Gen AI Challenge](https://img.shields.io/badge/PromptWars-Gen%20AI%20Challenge-FF5722?style=for-the-badge&logo=google)](https://hack2skill.com)
[![Google AI Studio](https://img.shields.io/badge/Powered%20By-Google%20AI%20Studio-4285F4?style=for-the-badge&logo=google)](https://aistudio.google.com)
[![Gemini 2.5 Flash](https://img.shields.io/badge/Model-Gemini%202.5%20%2F%203.8%20Flash-0F9D58?style=for-the-badge&logo=googlegemini)](https://ai.google.dev)
[![Live Demo](https://img.shields.io/badge/Live%20App-Cloud%20Run%20Production-673AB7?style=for-the-badge&logo=googlecloud)](https://ais-pre-52dzmkd3jd6xe2o2umt7bk-894915607018.asia-southeast1.run.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)

> **Real-World AI-Powered Phishing, Fake Job Offer & Rental Advance-Fee Deception Forensics with Interactive SOC Terminal (`TTY0`) and Automated Report Archiving.**  
> Built for the **PromptWars x Gen AI Challenge** organized by **@Hack2Skill**, **@Google For Developers**, and **@GEN AI CLUB** (`#promptwars`).

---

## 🌐 Live Production Deployment

| Environment | Live URL | Status |
| :--- | :--- | :--- |
| 🚀 **Primary Live App (Cloud Run)** | **[Open VeriOffer Live](https://ais-pre-52dzmkd3jd6xe2o2umt7bk-894915607018.asia-southeast1.run.app)** | `ONLINE` 🟢 |
| 🛠️ **Dev Preview App** | **[Open Dev Mirror](https://ais-dev-52dzmkd3jd6xe2o2umt7bk-894915607018.asia-southeast1.run.app)** | `ACTIVE` 🟡 |
| 📦 **GitHub Repository** | **[github.com/chinmaya-rh/verioffer](https://github.com/chinmaya-rh/verioffer)** | `OFFICIAL` 🔗 |

---

## 🎯 The Real-World Problem

Job seekers, freelancers, and renters lose millions of dollars every year to sophisticated employment and housing fraud:
- **Fake Cashier's Checks & Home Office Equipment Schemes**: Victims receive an inflated check and are instructed to wire funds to an "approved equipment vendor" before the check bounces.
- **Advance-Fee Rental Traps**: Overseas landlords demanding Western Union, Zelle, or Bitcoin security deposits before mailing keys to properties they do not own.
- **Identity Harvesting & Unsolicited Recruiter Phishing**: Instant job offers via Telegram or WhatsApp demanding unencrypted Social Security Numbers, passport scans, and banking logins.

Standard spam filters fail because scammers use clean domains and human-crafted psychological coercion. Traditional security products act as opaque black boxes without operational transparency or structured evidence collection.

**VeriOffer solves this with an enterprise-grade cyber defense posture: instant, explainable, and auditable forensic triage.**

---

## ⚡ Core Innovation & Key Features

### 1. 🔬 Dual-Vector Forensic Telemetry Engine
Simultaneously evaluates unstructured payload text and domain heuristics:
- **Vector A (Psycholinguistic Manipulation)**: Powered by Google AI Studio (`gemini-2.5-flash` / `@google/genai`), quantifying **Urgency & Coercion**, **Financial Demands**, **Identity Harvesting**, and **Deception Vectors**.
- **Vector B (Structural Domain Heuristics)**: Static analysis detecting free webmail mismatches (e.g., claiming to be Google HR from `@gmail.com` or `@exec-search-careers.top`), high-abuse TLDs (`.xyz`, `.top`, `.tk`), typosquatting, and brand-jacking.

### 2. 💻 Command-Driven SOC Terminal (`TTY0`)
An embedded, fully functional terminal emulator that gives analysts tactile, command-line control:
- Live streaming execution telemetry during scans (`[AUDIT_START]`, `[GEMINI_API]`, `[PSYCHOLINGUISTIC_VECTORS]`, `[SCAM_THREAT_INDEX]`).
- Interactive CLI commands:
  - `help` — displays the analyst command manual
  - `scan` — executes forensic analysis on the active payload
  - `status` — inspects engine health, model runtime, and memory stats
  - `ls reports` — lists all locally archived audit files
  - `cat <filename>` — previews structured JSON telemetry directly in the terminal
  - `download <filename>` — exports stored audit reports to the host system
  - `clear` — resets the terminal buffer

### 3. 📂 Document & File Upload Ingestion Core (v3.1)
- Seamless drag-and-drop zone supporting `.pdf`, `.docx`, `.txt`, and `.eml` files.
- Extracts document text and header metadata to analyze raw contract artifacts without manual copying.
- Includes pre-loaded high-risk and legitimate enterprise sample cases for instantaneous testing.

### 4. 📊 0–100% Scam Threat Index & Visual Radar
- **0–30% (Low Risk / Authentic)**: Standard corporate hiring, verified corporate domains, zero fees.
- **31–70% (Suspicious / Medium)**: Missing interview process, generic templates, unverified recruiters.
- **71–100% (Critical Threat)**: High-confidence fraud (equipment check schemes, wire transfer demands, Telegram-only hiring).
- Visual telemetry radar breaking down urgency, financial demands, identity theft risks, and domain legitimacy.

### 5. 🗄️ Automated Forensic Archiving (`/reports/`)
- Every completed audit is automatically assigned a cryptographic reference ID (e.g., `REP-2026-XXXX`).
- Persisted to local server storage with timestamps, exact extracted evidence quotes, confidence score, and remediation steps.
- One-click PDF / JSON export for victim reporting to IC3 (FBI Internet Crime Complaint Center) or internal HR security.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        VERIOFFER CLIENT (REACT SPA)                     │
│                                                                        │
│  ┌───────────────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
│  │ Ingestion Hub         │  │ Threat Radar    │  │ SOC Terminal     │  │
│  │ (Text, Domain, Files) │  │ & Gauge (0-100%)│  │ (TTY0 Emulator)  │  │
│  └───────────┬───────────┘  └────────┬────────┘  └────────┬─────────┘  │
└──────────────┼───────────────────────┼────────────────────┼────────────┘
               │                       │                    │
               ▼                       ▼                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    NODE.JS / EXPRESS FORENSIC PROXY                    │
│                        (PORT 3000 / SERVER.TS)                         │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Heuristic Domain Engine (TLD Abuse, Typosquatting, Webmail Check) │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Google GenAI SDK (gemini-2.5-flash with strict JSON schema)      │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Forensic Report Storage Pipeline (/reports/ filesystem)          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **AI Model & Reasoning**: Google AI Studio (`gemini-2.5-flash` / `@google/genai` TypeScript SDK)
- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend**: Node.js, Express, tsx
- **Archiving**: Server-side local JSON report storage with client-side forensic downloader
- **Build / Bundler**: Vite 6, PostCSS

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+ installed
- Google AI Studio API Key (`GEMINI_API_KEY`)

### 2. Clone the Repository
```bash
git clone https://github.com/chinmaya-rh/verioffer.git
cd verioffer
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the project root:
```env
GEMINI_API_KEY="your-google-ai-studio-api-key"
PORT=3000
```

### 5. Launch the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 🔄 Synchronizing with GitHub (`chinmaya-rh/verioffer`)

To synchronize this complete codebase to the remote repository `https://github.com/chinmaya-rh/verioffer`, you have two simple options:

### Option A: Using the Automated Push Script
Run the helper script provided in the repository:
```bash
chmod +x push_to_github.sh
./push_to_github.sh
```
*Note: If prompted, enter your GitHub Personal Access Token (PAT) with `repo` scope.*

### Option B: Using the Standalone Git Bundle
A verified, self-contained Git bundle `verioffer-v3.1-repo.bundle` is generated in the repository root. You can import and push it from any machine:
```bash
# Verify the bundle integrity
git bundle verify verioffer-v3.1-repo.bundle

# Fetch directly from the bundle to your local git repository
git clone verioffer-v3.1-repo.bundle verioffer-local
cd verioffer-local

# Push to your GitHub repo
git remote set-url origin https://github.com/chinmaya-rh/verioffer.git
git push -u origin main
```

---

## 🏆 Hackathon Attributions & Event Metadata

- **Event**: PromptWars x Gen AI Challenge
- **Organizers**: 
  - **@Hack2Skill**
  - **@Google For Developers**
  - **@GEN AI CLUB**
- **Hashtags**: `#promptwars`, `#genai`, `#googleaistudio`, `#gemini`
- **Project Lead / Author**: [chinmaya-rh](https://github.com/chinmaya-rh)
- **Evaluation Criteria Addressed**:
  - ✅ **Technical Depth**: Dual-vector linguistic and heuristic analysis with strict JSON schema enforcement.
  - ✅ **Innovation**: Interactive SOC Terminal (`TTY0`) with real-time operational execution telemetry.
  - ✅ **Real-World Impact**: Direct protection against financial advance-fee scams, equipment check fraud, and identity theft.
  - ✅ **Enterprise Readiness**: File upload ingestion, persistent report archiving, and audit trail export.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.
