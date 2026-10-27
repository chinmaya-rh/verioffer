# VeriOffer v3.1: GitHub Repository Deployment & Git Bundle Delivery

Deliver the production-ready VeriOffer v3.1 codebase, documentation, and live preview links to `https://github.com/chinmaya-rh/verioffer` via a verified standalone Git bundle and updated repository documentation.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following operational choices were confirmed during Phase 1 clarification:

- **Confirmed Decision 1 (Repository Packaging)**: Package the complete repository (all commits, branches, full tree, and history) into a self-contained Git bundle (`verioffer-v3.1-repo.bundle`) along with a direct terminal push script. This allows seamless local one-command push to `origin main` or manual drag-and-drop ingestion without requiring GitHub credentials or tokens inside the container.
- **Confirmed Decision 2 (Real-Time Live Deployment)**: Embed the verified Google AI Studio Cloud Run live deployment endpoints directly in the repository's `README.md` badge header and deployment section for instant evaluation by Hack2Skill judges and evaluators:
  - **Shared Live URL**: `https://ais-pre-52dzmkd3jd6xe2o2umt7bk-894915607018.asia-southeast1.run.app`
  - **Development Live URL**: `https://ais-dev-52dzmkd3jd6xe2o2umt7bk-894915607018.asia-southeast1.run.app`

---

## 1. Overview & Core Concept

- **What It Does**: VeriOffer v3.1 is an enterprise-grade cyber-threat detection and forensic triage engine built for the **PromptWars x Gen AI Challenge** (`@Hack2Skill`, `@Google For Developers`, `@GEN AI CLUB`, `#promptwars`). It analyzes suspicious job offers, rental agreements, and freelance contracts using dual-vector telemetric analysis (`gemini-3.8-flash` psycholinguistics + heuristic domain reputation), featuring an interactive SOC Terminal (`TTY0`), automated `/reports/` forensic archiving, and a drag-and-drop document upload dropzone (`.pdf`, `.txt`, `.docx`, `.eml`).
- **Target Audience**: Hackathon judges, security analysts, job seekers, and recruiters evaluating phishing resistance.
- **Key Value**: Zero-friction repository export and instant cloud accessibility with complete forensic capabilities.

---

## 2. User Experience & Visual Design

- **Live Site Badges & Header**:
  - Prominent status indicator showing active SOC engine status (`ONLINE - PORT 3000`).
  - Direct live demo link banner in `README.md` linking to the live Cloud Run application.
  - Hackathon attribution badges with official tags (`#promptwars`, `@Hack2Skill`, `@Google For Developers`).
- **Terminal & Ingestion UX**:
  - Tri-panel cyber layout: Payload Ingestion (Paste / URL / File Upload) on the left, Interactive SOC Terminal (`TTY0`) on the right, and Forensic Threat Dashboard below.
  - Monochromatic security palette: Phosphor amber (`#f59e0b`), cyber emerald (`#10b981`), critical red (`#ef4444`), and deep matte black (`#090d16`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Standalone Git Bundle vs. Direct Credential Prompt**
  - *Chosen Approach*: Generate a verified, full-history `.bundle` file and provide an automated 1-line script for the user's local terminal (`git clone verioffer.bundle && git push origin main`).
  - *Why*: Strict security posture—no personal access tokens (PAT) or credentials are stored or transmitted inside third-party environments.
- **Decision 2: Live AI Studio Cloud Run Hosting**
  - *Chosen Approach*: Highlight the pre-warmed Google AI Studio Cloud Run container deployment.
  - *Why*: Eliminates cold-start delays, provides native server-side Gemini 3.8 Flash execution on Google Cloud infrastructure, and allows evaluators to interact with the full stack immediately.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       VERIOFFER v3.1 REPOSITORY PIPELINE                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
   ┌───────────────────────────┐             ┌───────────────────────────┐
   │    Active Cloud Server    │             │   Git Distribution Unit   │
   │   (Google Cloud Run)      │             │  (chinmaya-rh/verioffer)  │
   │                           │             │                           │
   │ • Port 3000 Express Proxy │             │ • Complete Commit Tree    │
   │ • Gemini 3.8 Flash Engine │             │ • verioffer-v3.1.bundle   │
   │ • Live Preview Endpoints  │             │ • Comprehensive README    │
   └─────────────┬─────────────┘             └─────────────┬─────────────┘
                 │                                         │
                 ▼                                         ▼
   ┌───────────────────────────┐             ┌───────────────────────────┐
   │    Live Hackathon URL     │             │    1-Line Push Script     │
   │  ais-pre-*.run.app        │             │  git push origin main     │
   └───────────────────────────┘             └───────────────────────────┘
```

### Proposed Execution Steps:
1. **Update `README.md`**: Embed the live Cloud Run URLs (`https://ais-pre-52dzmkd3jd6xe2o2umt7bk-894915607018.asia-southeast1.run.app`), deployment status badges, and git clone instructions.
2. **Verify Git History**: Ensure all project files, source code, server files, tests, sample payloads, and license are included in branch `main`.
3. **Generate Production Bundle**: Build `verioffer-v3.1-repo.bundle` containing all refs and commits.
4. **Publish Push Helper Script**: Create `push_to_github.sh` with direct commands for pushing to `chinmaya-rh/verioffer`.
5. **Verify Clean Build**: Run `compile_applet` and check dev server status.
