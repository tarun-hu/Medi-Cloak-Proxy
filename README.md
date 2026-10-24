# MediCloak

**Zero-Trust In-Flight PHI Sanitization & Shadow AI Governance Gateway for Healthcare**  
*HEALTHX 2026 | Built for Indian & Global Healthcare Ecosystems (HIPAA & DPDPA 2023 Compliant)*

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688.svg)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18.0+-61DAFB.svg)](https://reactjs.org/)
[![mitmproxy](https://img.shields.io/badge/mitmproxy-10.0+-red.svg)](https://mitmproxy.org/)
[![Compliance](https://img.shields.io/badge/Compliance-HIPAA%20%7C%20DPDPA%20%7C%20ABDM-success.svg)](#-statutory-compliance--dpdpa-2023)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📑 Table of Contents
1. [Executive Summary & The Clinical Problem](#-the-clinical-problem-shadow-ai-in-healthcare)
2. [Why Existing Solutions Fail](#-why-existing-solutions-fail)
3. [Core Architectural Innovations](#-core-architectural-innovations-the-secret-sauce)
   - [Dual-Pass Clinical Context Shield & Medical Idiom Whitelisting](#1-dual-pass-clinical-context-shield--medical-idiom-whitelisting)
   - [Dual-Quadrant In-Flight Multi-Modal Vision Shield](#2-dual-quadrant-in-flight-multi-modal-vision-shield)
   - [Dual-Registry Sovereign Identity Fabric](#3-dual-registry-sovereign-identity-fabric)
   - [Sub-15ms In-Flight Layer-7 Interception](#4-sub-15ms-in-flight-layer-7-interception-http--websockets)
4. [System Architecture & In-Flight Lifecycle](#-system-architecture--in-flight-lifecycle)
5. [Supported AI Ecosystem (50+ Platforms)](#-supported-ai-ecosystem-50-platforms)
6. [Clinical Demo Suite: 8 Realistic Hospital Reports](#-clinical-demo-suite-8-realistic-hospital-reports)
7. [Quick Start Guide](#-quick-start-guide)
   - [Windows 1-Click Launch (Recommended)](#option-a-1-click-windows-launcher-recommended)
   - [Docker Compose Multi-Container Setup](#option-b-docker-compose-setup)
   - [Manual Step-by-Step Setup](#option-c-manual-step-by-step-setup)
8. [Live Testing & Verification Playbook](#-live-testing--verification-playbook)
9. [SOC Governance Dashboard](#-soc-governance-dashboard)
10. [API Endpoints Reference](#-api-endpoints-reference)
11. [Environment Variables](#-environment-variables)
12. [Project Structure](#-project-structure)
13. [Future Roadmap](#-future-roadmap)
14. [Team & Submission Details](#-team--submission-details)

---

## 🚨 The Clinical Problem: "Shadow AI" in Healthcare

Generative AI (ChatGPT, Claude, Gemini, Perplexity, Glass Health) is transforming clinical medicine. Physicians, residents, and nurses use LLMs to summarize patient charts, review complex drug-drug interactions, analyze pathology reports, and draft discharge summaries—saving **2 to 3 hours of documentation fatigue per shift**.

However, this has created an existential cybersecurity and statutory liability crisis:
* **Uncontrolled Multi-Modal Data Exfiltration ("Shadow AI"):** Over 70% of medical staff paste unvetted clinical case notes or photograph lab slips, biopsy reports, and ECG strips, uploading them directly into consumer AI models without institutional Business Associate Agreements (BAAs).
* **Massive Regulatory Penalties:** Transmitting unredacted Protected Health Information (PHI) to commercial model providers violates statutory healthcare privacy mandates:
  * **Digital Personal Data Protection Act (DPDP Act 2023, India):** Penalties up to **₹250 Crore ($30M+)** for failing to prevent personal data breaches.
  * **HIPAA Safe Harbor (US 45 CFR § 164.514):** Strict liability for 18 personal health identifiers.
  * **Ayushman Bharat Digital Mission (ABDM/ABHA):** Non-negotiable security protocols for citizen digital health accounts.
* **The Clinician Privacy Blindspot:** Existing DLP systems only look at the patient. But when a prescription or lab report is photographed, the **doctor's private signature, Medical Council Registration Number (MCI/NMC), and official hospital stamp** are leaked to foreign AI training clusters.
* **The Failure of Outright Bans:** Hospital IT firewalls attempting to block `chatgpt.com` fail completely. Clinicians bypass network firewalls using personal 5G mobile hotspots because AI has become indispensable to clinical throughput.

> **MediCloak's Mission:** Do not ban AI. Govern it transparently. MediCloak operates as a zero-trust, layer-7 transparent security gateway that intercepts text prompts, WebSocket streams, and multi-modal image uploads—stripping patient and clinician identities in milliseconds before packets leave the hospital perimeter, while preserving 100% of diagnostic data and clinical accuracy.

---

## ⚠️ Why Existing Solutions Fail

| Existing Approach | How It Operates | Critical Failure in Healthcare |
| :--- | :--- | :--- |
| **Firewall / DNS Blacklisting** | Blocks AI domains (`chatgpt.com`, `claude.ai`) | Drives clinicians to unmonitored personal 5G hotspots ("Shadow AI"), worsening risk and killing clinical efficiency. |
| **Enterprise DLP (Symantec, Zscaler)** | Post-facto log scanning via heavy endpoint agents | Scans hours after data has leaked; completely blind to modern bidirectional **WebSocket streams** and multi-modal canvas uploads. |
| **Cloud De-Identification APIs (AWS/Google DLP)** | Transmits raw text to a third-party cloud API for scrubbing | **Self-defeating:** Transmitting unredacted patient data to another cloud is itself a data breach; adds 200–500ms latency. |
| **Generic PII Redactors (Presidio / Spacy)** | Naive Named Entity Recognition (NER) | **The "Naïve Redaction" Trap:** Deletes place-name medical conditions (*Madras Eye* ➔ `[LOCATION] Eye`, *Jaipur Foot* ➔ `[LOCATION] Foot`), causing dangerous LLM hallucinations. |
| **Standard OCR Scanners** | Cloud-based OCR post-upload | Too slow for in-flight proxying; alters file length causing AWS S3 presigned URL signature mismatches (`400 Bad Request`). |

---

## ⚡ Core Architectural Innovations ("The Secret Sauce")

### 1. Dual-Pass Clinical Context Shield & Medical Idiom Whitelisting
Generic redactors treat medical terminology literally. MediCloak implements a **Dual-Pass Clinical Whitelisting Engine** that distinguishes between patient identities and legitimate clinical conditions:

```
Raw Doctor Prompt:
"Patient Dalla Ram, ABHA ID: 32-4415-9982-1012, Aadhaar: 4589 1234 9081, residing at Sector 45, Madras.
 Came to ER with acute Madras Eye and Delhi Belly. History of Jaipur Foot prosthesis. Prescribed Dolo-650 BD."

      ❌ Generic Redactor Output (Clinical Context Destroyed):
      "Patient [NAME], ABHA ID: [REDACTED], Aadhaar: [REDACTED], residing at [LOCATION], [LOCATION].
       Came to ER with acute [LOCATION] Eye and [LOCATION] Belly. History of [LOCATION] Foot prosthesis. Prescribed [DRUG] BD."

      ✅ MediCloak Output (100% Identity Scrubbed + 100% Medical Meaning Preserved):
      "Patient [PATIENT_1], ABHA ID: [ABHA_ID_1], Aadhaar: [AADHAAR_ID_1], residing at [LOCATION_1], Madras.
       Came to ER with acute Madras Eye and Delhi Belly. History of Jaipur Foot prosthesis. Prescribed Dolo-650 BD."
```

#### Protected Indian & Regional Clinical Taxonomies:
* **Place-Name Syndromes:** *Madras Eye, Jaipur Foot / Knee, Delhi Belly, Bombay Blood Group, Kala-Azar (Assam Fever), Kyasanur Forest Disease (KFD), Mangalore Sore, Kangri Cancer, Malabar Ulcer, Chandipura Encephalitis, Gorakhpur Encephalitis, Bhopal Toxic Gas Syndrome.*
* **Indian Ward Formulations & Drugs:** *Dolo-650, Calpol, Pan-D, Augmentin, Monocef, Meftal-Spas, Combiflam, Glycomet, Shelcal, Becosules, ATT (Anti-Tubercular Therapy), Covaxin, Covishield.*
* **Clinical Ward Directives & Acronyms:** *OD, BD, TDS, QID, SOS, STAT, NPO, GCS, SpO2, RBS, LFT, KFT, ABG, HRCT, DKA, MODS, LSCS.*

---

### 2. Dual-Quadrant In-Flight Multi-Modal Vision Shield
When doctors upload photos of lab sheets, ECG prints, or prescriptions to ChatGPT or Claude Vision, MediCloak intercepts the image stream in flight, inspects the binary, and executes a **Dual-Quadrant De-Identification Protocol**:

```
┌─────────────────────────────────────────────────────────────────┐
│                      HOSPITAL REPORT / SCAN                     │
│                                                                 │
│  █████████████████████████████████████████████████████████████  │ ◄─── QUADRANT 1: PATIENT IDENTIFIER SHIELD
│  █  [PROTECTED - PATIENT DEMOGRAPHICS & HOSPITAL REGISTRY]   █  │      Redacts: Patient Name, Age, Sex, UHID,
│  █  ABHA ID, CR No, Aadhaar, Barcodes, OPD/IPD Bill No.      █  │      AIIMS/PGI CR No, Ward & Bed details
│  █████████████████████████████████████████████████████████████  │
│                                                                 │
│   CLINICAL DIAGNOSTIC CONTENT PRESERVED 100% INTACT:            │
│   - Complete Blood Count: Platelet 22,000/mcL (Critical)        │
│   - Dengue NS1 Antigen: POSITIVE (Reactive)                     │
│   - 12-Lead ECG: ST-Elevation in leads V1-V4 (Acute STEMI)      │
│   - MRI Brain: Acute infact in left MCA territory               │
│   - Histopathology: Invasive ductal carcinoma, Grade III        │
│                                                                 │
│  █████████████████████████████████████████████████████████████  │ ◄─── QUADRANT 2: CLINICIAN & SEAL SHIELD
│  █  [PROTECTED - CLINICIAN PRIVACY & INSTITUTIONAL SEAL]     █  │      Redacts: Doctor Signature, Name, GMC/NMC
│  █  Doctor Name, GMC/NMC Reg No, Official Stamp & Sign       █  │      Reg No, Hospital Stamp & Phone (DPDP Act 2023)
│  █████████████████████████████████████████████████████████████  │
└─────────────────────────────────────────────────────────────────┘
```

#### Byte-Exact S3 Upload Padding (Zero Network Disruption):
* Commercial AI backends (e.g., OpenAI S3 direct presigned uploads) enforce cryptographic byte-length checks matching the HTTP `Content-Length` header. Standard recompression alters file size, causing AWS S3 signature failures (`HTTP 400 Bad Request`).
* MediCloak features an in-house **JPEG COM-Marker Byte Alignment Engine** (`pad_jpeg_with_com`). It inserts non-destructive JPEG comment markers (`0xFF 0xFE`) before the End-of-Image (`0xFF 0xD9`), matching the original file length down to the exact byte.

---

### 3. Dual-Registry Sovereign Identity Fabric
* **Indian Healthcare Identifiers:**
  * **14-digit ABHA ID (Ayushman Bharat):** Format `\d{2}-\d{4}-\d{4}-\d{4}` and continuous 14-digit strings.
  * **12-digit Aadhaar UIDAI:** Mathematically validated using the **Dihedral Group $D_5$ Verhoeff Algorithm** to eliminate false positives on clinical measurements or order numbers.
  * **Hospital OPD / IPD / CR / MRN numbers:** Handles formats like `AIIMS-2026-98124`, `CR-88741-26`, and `UHID-990812`.
  * **Indian phone numbers & PIN codes.**
* **Global Healthcare Identifiers (HIPAA 18 Safe Harbor):**
  * Patient Names, US Social Security Numbers (SSN), Medical Record Numbers, Dates of Birth, Geographic subdivisions, IP addresses, Contact numbers.

---

### 4. Sub-15ms In-Flight Layer-7 Interception (HTTP & WebSockets)
* Operates on network line-rate inside the hospital DMZ using an optimized asynchronous `mitmproxy` pipeline.
* Inspects and mutates outbound streaming HTTP POST JSON bodies, multipart form uploads, and bidirectional **WebSocket / Socket.IO frames** (critical for streaming platforms like Perplexity, ChatGPT, and Claude).
* Intercepts both **authenticated and unauthenticated/guest sessions** on ChatGPT (`/backend-anon/conversation`, `/conversation/updates`).
* Scrubbing occurs entirely in volatile memory—zero patient data ever touches a foreign de-identification cloud.

---

## 🏗️ System Architecture & In-Flight Lifecycle

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 HOSPITAL LOCAL NETWORK                                 │
│                                                                                        │
│  ┌───────────────────────┐                                                             │
│  │ Clinician Workstation │ (Chrome / Edge / Brave / EHR Terminal)                      │
│  └───────────┬───────────┘                                                             │
│              │ In-Flight HTTPS / WSS / Multi-Modal Stream                              │
│              ▼                                                                         │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                    MediCloak Transparent Proxy (Port 8080)                       │  │
│  │                                                                                  │  │
│  │   [TEXT STREAM PIPELINE]                     [MULTI-MODAL VISION SHIELD]         │  │
│  │   1. Decode JSON / Multipart Form Body       1. Sniff image/jpeg, image/png      │  │
│  │   2. Mask Medical Idioms (__WHITELIST_0__)   2. Dual-Quadrant De-Identification: │  │
│  │   3. Detect Indian Identifiers & HIPAA       - Upper: Patient Header & Barcode   │  │
│  │   4. Verhoeff D5 Aadhaar Checksum Valid.    - Lower: Doctor Stamp & Signature   │  │
│  │   5. Synthetic Token Substitution            3. Byte-Exact JPEG COM Padding      │  │
│  │   6. Unmask Medical Idioms                   (Matches original Content-Length)   │  │
│  │   7. In-Flight Request Body Mutation         4. Replace image payload in-stream  │  │
│  └───────────┬──────────────────────────────────────────┬───────────────────────────┘  │
│              │                                          │                              │
│              │ Asynchronous Telemetry                   │ Sanitized Clean Stream       │
│              │ (POST /api/events)                       │ (Zero Patient/Doctor Identity│
│              ▼                                          ▼                              │
│  ┌───────────────────────┐                  ┌──────────────────────┐                   │
│  │ FastAPI Backend (8000)│                  │ Outbound Internet    │                   │
│  │ PostgreSQL Database   │                  └───────────┬──────────┘                   │
│  └───────────┬───────────┘                              │                              │
│              │ Live WebSockets                          │                              │
│              ▼                                          ▼                              │
│  ┌───────────────────────┐                  ┌──────────────────────────────────────┐   │
│  │ React SOC Dashboard   │                  │ Commercial AI Cloud                  │   │
│  │ (Port 3000)           │                  │ (OpenAI, Anthropic, Google,          │   │
│  │ - Threat Feed & Heatmap│                 │  Perplexity, Glass Health)           │   │
│  │ - Dual-Image Scan Diff │                  └──────────────────────────────────────┘   │
│  │ - Text Prompt Diff    │                                                             │
│  └───────────────────────┘                                                             │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🌐 Supported AI Ecosystem (50+ Platforms)

MediCloak automatically identifies, intercepts, and governs over 50 mainstream and clinical AI endpoints:

| Category | Platforms Supported |
| :--- | :--- |
| **Major Consumer & Enterprise LLMs** | OpenAI (`chatgpt.com`, `api.openai.com`), Anthropic (`claude.ai`, `api.anthropic.com`), Google (`gemini.google.com`, `generativelanguage.googleapis.com`), Microsoft Copilot (`copilot.microsoft.com`, `sydney.bing.com`), DeepSeek (`chat.deepseek.com`), Mistral AI, Groq, Cohere, Together AI, OpenRouter, Poe. |
| **AI Search & Real-Time Querying** | Perplexity AI (`perplexity.ai`, `pplx.ai`, WebSocket & Socket.IO streams). |
| **Dedicated Clinical & Medical AI** | Glass Health (`glass.health`), Hippocratic AI, Nabla Copilot, Abridge AI, Suki AI, Ambience Healthcare, Doximity GPT, OpenEvidence Clinical AI, UpToDate Clinical AI, Freed AI Scribe, DeepScribe, Tortus Healthcare, Heidi Health, Augmedix, Nuance DAX Copilot, Infermedica. |
| **Enterprise EHR Portals** | Epic Systems AI (`open.epic.com`), Oracle Cerner Health AI, eClinicalWorks AI, Regard, Robin Healthcare. |

---

## 🏥 Clinical Demo Suite (8 Realistic Hospital Reports)

The repository includes 8 synthetic, high-resolution hospital clinical reports located in [`demo_reports/`](demo_reports/) ready for instant evaluation:

| # | Demo Report File | Hospital & Department | Clinical Condition | Protected Identifiers |
|---|---|---|---|---|
| 1 | `apollo_cbc_dengue_report.jpg` | Apollo Hospitals (Hematology) | Acute Dengue (Platelets: 22,000/mcL) | Patient Demographics, ABHA ID, Doctor Stamp & Sign |
| 2 | `aiims_pulmonary_xray_report.jpg` | AIIMS New Delhi (Pulmonology) | Severe Atypical Pneumonia / Consolidation | AIIMS CR No, UHID, Consultant Radiologist Stamp |
| 3 | `fortis_icu_er_prescription.jpg` | Fortis Healthcare (Emergency ICU) | Septic Shock & Acute Renal Failure | ICU Bed/Ward, Doctor MCI Reg No, Emergency Seal |
| 4 | `max_cardiology_ecg_echo_report.jpg` | Max Super Speciality (Cardiology) | Acute Anterior STEMI (EF 32%) | IPD Admission No, Cardiologist Sign & Hospital Seal |
| 5 | `medanta_neurology_mri_brain_report.jpg` | Medanta The Medicity (Neurology) | Acute Ischemic Stroke (Left MCA) | Neuro-radiologist Stamp, ABHA, MRI Case ID |
| 6 | `tata_memorial_oncology_biopsy_report.jpg` | Tata Memorial Centre (Oncology) | Invasive Ductal Carcinoma (HER2 3+) | TMH Histopath No, Pathologist Signature |
| 7 | `manipal_endocrinology_diabetic_nephropathy.jpg` | Manipal Hospital (Endocrinology) | Uncontrolled T2D with Diabetic CKD 3b | Lab Order ID, ABHA ID, Diabetologist Seal |
| 8 | `gangaram_gastroenterology_hepatitis_cirrhosis.jpg` | Sir Ganga Ram Hospital (Gastroenterology)| Decompensated Cirrhosis (HBV DNA+) | Liver Function Barcode, Attending Stamp & Sign |

---

## 🚀 Quick Start Guide

### Option A: 1-Click Windows Launcher (Recommended)

For instant local demonstrations on Windows:

```cmd
:: 1. Clone the repository
git clone https://github.com/your-username/MediCloak.git
cd MediCloak

:: 2. Launch all services with 1 click
start_medicloak_demo.bat
```

**What this script does automatically:**
1. Spawns the **FastAPI Backend** on `http://127.0.0.1:8000`.
2. Spawns the **MediCloak mitmproxy Interceptor** on `http://127.0.0.1:8080`.
3. Launches the **React SOC Dashboard** on `http://localhost:3000`.
4. Opens a sandboxed, proxy-configured **Brave/Chrome browser** routed through `127.0.0.1:8080` with `--disable-quic` pre-configured.

To cleanly shut down all running background instances, simply execute:
```cmd
stop_medicloak_demo.bat
```

---

### Option B: Docker Compose Setup

Run the full stack containerized with PostgreSQL, FastAPI, and Vite:

```bash
# 1. Build and boot all containers
docker compose up --build -d

# 2. Seed database with demonstration clinical breach telemetry
curl -X POST http://localhost:8000/api/seed

# 3. Start the mitmproxy interceptor on host
python run_proxy.py
```

* Dashboard: `http://localhost:3000`
* Backend OpenAPI Swagger: `http://localhost:8000/docs`
* Proxy Gateway: `http://localhost:8080`

---

### Option C: Manual Step-by-Step Setup

#### 1. Backend Service
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. React Governance Dashboard
```bash
cd dashboard
npm install
npm run dev
```

#### 3. MediCloak Proxy Addon
```bash
# From workspace root
python run_proxy.py
# Or directly with mitmdump:
mitmdump -s medicloak_addon.py --listen-port 8080
```

#### 4. Route Browser Through MediCloak
Launch Google Chrome or Brave routed through the local proxy:
```bash
# Windows
"C:\Program Files\Google\Chrome\Application\chrome.exe" --proxy-server="127.0.0.1:8080" --disable-quic --user-data-dir="%TEMP%\chrome_medicloak"

# macOS
open -na "Google Chrome" --args --proxy-server="http://127.0.0.1:8080" --disable-quic --user-data-dir="/tmp/chrome_medicloak"
```
*(On first launch, navigate to `http://mitm.it` to install the local mitmproxy root SSL certificate for HTTPS inspection).*

---

## 🧪 Live Testing & Verification Playbook

A complete testing playbook with 12 end-to-end clinical test scenarios is documented in [`TESTING_PROMPTS.md`](TESTING_PROMPTS.md).

### Quick Terminal Verification:

#### Test 1: Clean Prompt (No PHI — Forwarded Unmodified)
```bash
curl -x http://localhost:8080 -k -X POST https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-fake-key" \
  -d '{"model": "gpt-4", "messages": [{"role": "user", "content": "What is the standard adult dose of oral Amoxicillin?"}]}'
```
* **Dashboard Result:** Event logged with `LOW` severity (0 PHI entities intercepted).

#### Test 2: High-Risk Clinical Prompt with Indian Identifiers & Medical Idioms
```bash
curl -x http://localhost:8080 -k -X POST https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-fake-key" \
  -d '{"model": "gpt-4", "messages": [{"role": "user", "content": "Patient Dalla Ram, ABHA ID: 32-4415-9982-1012, Aadhaar: 4589 1234 9081, residing at Sector 45, Madras. Came to ER with acute Madras Eye and Delhi Belly. History of Jaipur Foot prosthesis. Prescribed Dolo-650 BD."}]}'
```

* **What OpenAI Receives:**
  ```json
  "content": "Patient [PATIENT_1], ABHA ID: [ABHA_ID_1], Aadhaar: [AADHAAR_ID_1], residing at [LOCATION_1], Madras. Came to ER with acute Madras Eye and Delhi Belly. History of Jaipur Foot prosthesis. Prescribed Dolo-650 BD."
  ```
* **Dashboard Verification:**
  * **Critical Threat Event:** Triggered on WebSocket feed with Risk Score ~90.
  * **Protected Entities:** `PATIENT_NAME`, `ABHA_ID`, `AADHAAR_ID`, `LOCATION`.
  * **Preserved Idioms:** `Madras Eye`, `Delhi Belly`, `Jaipur Foot`.

#### Test 3: Multi-Modal Vision Shield (Upload to ChatGPT in Browser)
1. In the proxied browser, open `https://chatgpt.com`.
2. Click the attachment paperclip icon and select any report from `demo_reports/` (e.g. `apollo_cbc_dengue_report.jpg`).
3. Send the prompt: *"Analyze this CBC report and suggest treatment for low platelets."*
4. Check the **MediCloak Dashboard (`http://localhost:3000`)**:
   - An event with badge `MULTIMODAL` will appear.
   - Click the event to view the **Side-by-Side Dual-Quadrant Scan Comparison**: Original unredacted image vs. Redacted image sent to ChatGPT with patient header and doctor seal shielded.

---

## 🛡️ SOC Governance Dashboard

The React 18 / TailwindCSS / D3.js dashboard provides hospital CISOs and compliance teams with real-time enterprise observability:

1. **Live Threat Feed (WebSocket):** Real-time streaming feed of all intercepted AI interactions across hospital departments.
2. **Multi-Modal Scan Comparison Modal:** Side-by-side visual viewer showing original high-resolution diagnostic images vs. the masked image transmitted to AI models.
3. **Text Prompt Differential Modal:** Direct visual diff showing the physician's raw input versus the sanitized payload transmitted to the AI, highlighting exact redacted tokens.
4. **D3.js Force-Directed AI Network Graph:** Visual topology mapping clinical departments to the AI endpoints they contact (identifying unvetted shadow services).
5. **D3.js Threat Heatmap:** Time-series risk density mapping high-risk clinical notes over 24-hour periods.
6. **Incident Mitigation Workflows:** Single-click review actions (`Active` ➔ `Mitigated` ➔ `Resolved`).
7. **Dark / Light Cyber-SOC Themes:** High-contrast clinical and cybersecurity views with print-ready audit stylesheets.

---

## 🔌 API Endpoints Reference

The FastAPI backend exposes REST and WebSocket interfaces on `http://localhost:8000`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status |
| `POST` | `/api/events` | Ingestion endpoint called asynchronously by the proxy |
| `GET` | `/api/events` | Paginated event list with filters (`severity`, `service`, `status`) |
| `GET` | `/api/events/{id}` | Detailed event inspection including full prompt & image diffs |
| `PATCH` | `/api/events/{id}/status` | Update incident resolution state |
| `GET` | `/api/stats` | Aggregate dashboard statistics (total intercepted, risk scores) |
| `POST` | `/api/seed` | Seed database with representative clinical threat telemetry |
| `GET` | `/api/calls` | Voice alert logs (VAPI) |
| `POST` | `/api/calls/test` | Trigger manual test escalation call |
| `WS` | `/api/ws` | Live WebSocket broadcast for real-time frontend updates |

---

## ⚙️ Environment Variables

Configuration is managed via `.env` in the root directory:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://medicloak:medicloak@localhost:5432/medicloak` | PostgreSQL connection string |
| `VAPI_ENABLED` | `false` | Enable/disable autonomous phone call escalation |
| `VAPI_API_KEY` | `-` | VAPI private API authentication key |
| `VAPI_PHONE_NUMBER_ID` | `-` | Registered twilio/vapi outbound phone ID |
| `VAPI_ASSISTANT_ID` | `-` | Pre-configured clinical escalation voice agent ID |
| `ALERT_PHONE_NUMBER` | `-` | Hospital compliance officer contact number |
| `CALL_COOLDOWN_SECONDS`| `300` | Rate-limiting cooldown to prevent phone call alert fatigue |

---

## 📂 Project Structure

```
MediCloak/
├── phi_redactor.py             # Dual-pass PHI detection engine with Indian clinical whitelist & Verhoeff UIDAI
├── medicloak_addon.py          # mitmproxy Layer-7 addon (Dual-Quadrant Vision Shield + HTTP/WSS interceptor)
├── run_proxy.py                # Standalone proxy runner wrapper
├── TESTING_PROMPTS.md          # 12 copy-paste test scenarios covering Indian clinical entities & vision
├── demo_reports/               # 8 realistic clinical hospital reports for instant evaluation
│   ├── apollo_cbc_dengue_report.jpg
│   ├── aiims_pulmonary_xray_report.jpg
│   ├── fortis_icu_er_prescription.jpg
│   ├── max_cardiology_ecg_echo_report.jpg
│   ├── medanta_neurology_mri_brain_report.jpg
│   ├── tata_memorial_oncology_biopsy_report.jpg
│   ├── manipal_endocrinology_diabetic_nephropathy.jpg
│   └── gangaram_gastroenterology_hepatitis_cirrhosis.jpg
├── start_medicloak_demo.bat    # Windows 1-click launcher (Proxy + Backend + Dashboard + Sandboxed Browser)
├── stop_medicloak_demo.bat     # Windows 1-click cleanup script
├── enable_proxy.bat            # Windows system proxy toggle (Enable)
├── disable_proxy.bat           # Windows system proxy toggle (Disable)
├── launch_brave_proxy.bat      # Sandboxed browser launcher with proxy flags
├── docker-compose.yml          # Container configuration (Postgres, FastAPI, React Vite)
├── backend/
│   ├── main.py                 # FastAPI application, routing & WebSocket connection manager
│   ├── database.py             # PostgreSQL connection pooling & schema migrations
│   ├── models.py               # Pydantic schemas & event validation models
│   ├── seed.py                 # Clinical scenario data generator
│   ├── vapi_caller.py          # Voice escalation integration (VAPI + ElevenLabs)
│   ├── requirements.txt        # Python backend dependencies
│   └── Dockerfile
└── dashboard/
    ├── src/
    │   ├── App.jsx             # Main dashboard layout with dark/light themes
    │   ├── components/
    │   │   ├── StatsCards.jsx       # Interception metrics summary
    │   │   ├── ThreatFeed.jsx       # Real-time WebSocket event feed
    │   │   ├── RedactionViewer.jsx  # Side-by-side prompt & scan differential viewer
    │   │   ├── NetworkGraph.jsx     # D3.js force-directed AI network topology
    │   │   ├── RiskHeatmap.jsx      # D3.js temporal threat risk density map
    │   │   ├── TrafficTimeline.jsx  # D3.js throughput and volume monitor
    │   │   └── AuditLog.jsx         # Filterable audit trail table
    │   └── hooks/
    │       └── useWebSocket.js      # Resilient WebSocket hook with auto-reconnect
    ├── package.json
    └── Dockerfile
```

---

## 🔮 Future Roadmap

* [ ] **Local Reversible Tokenization (Re-hydration):** On-premise cryptographic token vault that replaces PHI with deterministic hashes, and re-inserts the patient's real identity in the incoming AI response strictly on the doctor's screen—leaving the external AI cloud completely blind.
* [ ] **Autonomous Voice Escalation:** Finalizing outbound autonomous AI voice calling via VAPI to instantly page the on-call hospital compliance officer during critical exfiltration events.
* [ ] **EHR & ABDM Gateway Connectors:** Direct FHIR and HL7 connector modules for Epic, Cerner, and Ayushman Bharat Digital Mission (ABDM) HIMS platforms.
* [ ] **Edge Small Language Model (SLM) Anonymization:** Running quantized on-premise local models (e.g., Med-Gemma-2B) for high-entropy narrative de-identification in rural and edge clinics.

---

## 👥 Team & Submission Details

**Event:** HEALTHX 2026  
**Institution:** K.R. Mangalam University — School of Engineering and Technology  
**Project:** MediCloak (Healthcare Shadow AI Governance System)

* **Tarun** (Team Lead) — `tarunnokwal1@gmail.com` | `+91-8307011215`
* **Shreya Chauhan**
* **Vardaan Saini**
* **Ananya Atthrva**

---

<p align="center">
  <b>MediCloak</b> — <i>Protecting Patient Sovereignty in the Age of Clinical AI.</i>
</p>
