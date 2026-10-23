# 🛡️ MediCloak — Evaluation & Live Testing Playbook

This document contains ready-to-use testing prompts and multimodal test cases for hackathon judges, hospital Chief Medical Officers (CMO), and Data Protection Officers (DPO).

---

## ⚡ 10-Second Quick Start Checklist

Before running tests, ensure the 3 core microservices are running:
1. **MediCloak Interceptor Proxy**: Listening on `http://localhost:8080` (`python run_proxy.py`)
2. **Dashboard Backend**: `http://localhost:8000/docs` (`python -m uvicorn main:app --host 127.0.0.1 --port 8000`)
3. **Sovereign Governance Dashboard**: `http://localhost:3000` (`npm run dev` in `/dashboard`)

---

## 📷 Category 1: Multi-Modal In-Flight Vision Shield (Drag & Drop Reports)

Drag any of these 7 real-world clinical reports into ChatGPT, attach the prompt, and hit enter. Watch the **Dual-Quadrant Shield** mask both the **Top Demographic Header** and **Bottom Clinician Signature / Stamp** while keeping 100% of diagnostic findings intact!

---

### Case 1: Cardiology & Acute STEMI (Max Healthcare)
- **File**: `demo_reports/max_cardiology_ecg_echo_report.jpg`
- **Copy-Paste Prompt**:
```text
Attached is the emergency stat cardiac biomarker and 12-lead ECG dossier for patient Vikramaditya Singhania (UHID MAX-SKT-2026-90412, ABHA 91-7723-9081-3321, contact 9811044219). hs-cTnI is 1,420.5 pg/mL with anterior ST elevations in V1-V4 and LVEF 38%. Admitting doctor Sanjeev K. Aggarwal has recommended primary PCI. Analyze coronary occlusion territory and confirm pre-cath pharmacological directives.
```
- **What MediCloak Redacts**:
  - Image: Top Patient Demographics Box + Bottom Max Cardiology Stamp & Dr. Aggarwal's Signature.
  - Text: Vikramaditya Singhania ➔ `[PATIENT_1]`, `[MRN_1]`, `[ABHA_1]`, `[PHONE_1]`, `[PATIENT_2]`.
- **Preserved Clinical Data**: hs-cTnI 1,420.5 pg/mL, CK-MB 78.4 ng/mL, Anterior STEMI, LAD territory, LVEF 38%, Aspirin/Ticagrelor/Heparin.

---

### Case 2: Acute Ischemic Stroke & Neurovascular Protocol (Medanta The Medicity)
- **File**: `demo_reports/medanta_neurology_mri_brain_report.jpg`
- **Copy-Paste Prompt**:
```text
Patient Smt. Anandi Devi, 68 yrs female, CR No MDNT-NEURO-2026-8819 (attending Dr. Arun Garg, family contact 9810355219) presented with dense right hemiplegia and severe aphasia, baseline NIHSS 14. MRI Brain shows acute left MCA M1 occlusion with DWI-FLAIR mismatch and ASPECTS 7. LKW is 2.5 hours ago. Confirm eligibility for IV Tenecteplase thrombolysis vs mechanical thrombectomy.
```
- **What MediCloak Redacts**:
  - Image: Top Demographics Box + Bottom Medanta Stroke Center Stamp & Dr. Arun Garg's Signature.
  - Text: Anandi Devi ➔ `[PATIENT_1]`, `[MRN_1]`, `[PATIENT_2]`, `[PHONE_1]`.
- **Preserved Clinical Data**: Right hemiplegia, NIHSS 14, Left M1 MCA occlusion, DWI-FLAIR mismatch, ASPECTS 7, Tenecteplase 0.25 mg/kg, Labetalol BP target.

---

### Case 3: Oncology & Triple-Positive Breast Biopsy (Tata Memorial Centre)
- **File**: `demo_reports/tata_memorial_oncology_biopsy_report.jpg`
- **Copy-Paste Prompt**:
```text
Histopathology report for Mrs. Priyanka Deshmukh, 44F, TMC Case No TMC-ACTREC-2026-B9402 (phone 9822089144, surgeon Dr. Rajendra Badwe). Biopsy of right breast mass shows Infiltrating Ductal Carcinoma Grade 3, ER 80% positive, PR 65% positive, HER2/neu 3+ strongly positive, Ki-67 48%. Recommend optimal neoadjuvant chemotherapy regimen and targeted HER2 blockade protocol.
```
- **What MediCloak Redacts**:
  - Image: Top Demographics Box + Bottom TMC Surgical Pathology Stamp & Dr. Shubhada Kane's Signature.
  - Text: Priyanka Deshmukh ➔ `[PATIENT_1]`, `[MRN_1]`, `[PHONE_1]`, `[PATIENT_2]`.
- **Preserved Clinical Data**: Infiltrating Ductal Carcinoma Grade 3, ER+, PR+, HER2 3+, Ki-67 48%, TCHP regimen (Docetaxel + Carboplatin + Trastuzumab + Pertuzumab).

---

### Case 4: Uncontrolled Diabetes & Diabetic Nephropathy (Manipal Hospitals)
- **File**: `demo_reports/manipal_endocrinology_diabetic_nephropathy.jpg`
- **Copy-Paste Prompt**:
```text
Review diabetic kidney profile for Sardar Gurpreet Singh, 59M, UHID MH-BLR-2026-66412 (consultant Dr. Shailesh Kumar, phone 9448032194). Fasting blood sugar 248 mg/dL, HbA1c 10.8%, Serum Creatinine 2.14 mg/dL, eGFR 34.2 mL/min (CKD Stage 3b), Urine ACR 480 mcg/mg. He is currently on Metformin. Provide safe oral hypoglycemic modifications and renal-protective dosing.
```
- **What MediCloak Redacts**:
  - Image: Top Demographics Box + Bottom Manipal Endocrinology Stamp & Dr. Shailesh Kumar's Signature.
  - Text: Gurpreet Singh ➔ `[PATIENT_1]`, `[MRN_1]`, `[PATIENT_2]`, `[PHONE_1]`.
- **Preserved Clinical Data**: HbA1c 10.8%, FBS 248 mg/dL, Creatinine 2.14, eGFR 34.2, Macroalbuminuria 480, Stop Metformin, Start Linagliptin 5mg, SGLT2i, Glargine.

---

### Case 5: Chronic Hepatitis B & Decompensated Cirrhosis (Sir Ganga Ram Hospital)
- **File**: `demo_reports/gangaram_gastroenterology_hepatitis_cirrhosis.jpg`
- **Copy-Paste Prompt**:
```text
Attached hepatology panel for Shri Harish Chander, 51M, UHID SGRH-LIVER-2026-1940 (primary hepatologist Dr. Randhir Sud, emergency contact 9818877412). Patient has deep jaundice (total bilirubin 6.8 mg/dL), INR 1.84, ascites, and HBsAg reactive with HBV DNA viral load 1.42 x 10^7 IU/mL. FibroScan shows 24.8 kPa (F4 Cirrhosis). Evaluate antiviral therapy and decompensated ascites management.
```
- **What MediCloak Redacts**:
  - Image: Top Demographics Box + Bottom Ganga Ram Liver Stamp & Dr. Randhir Sud's Signature.
  - Text: Harish Chander ➔ `[PATIENT_1]`, `[MRN_1]`, `[PATIENT_2]`, `[PHONE_1]`.
- **Preserved Clinical Data**: Total Bilirubin 6.8, INR 1.84, HBsAg Reactive, HBV DNA 1.4x10^7, F4 Cirrhosis, Entecavir 0.5mg OD, Spironolactone 100mg + Furosemide 40mg.

---

### Case 6: Dengue Fever & Severe Thrombocytopenia (Apollo Diagnostics)
- **File**: `demo_reports/apollo_cbc_dengue_report.jpg`
- **Copy-Paste Prompt**:
```text
CBC report attached for Rajesh Verma, 48 Yrs male, ABHA 91-8821-4412-0051 (phone +91 98201 44102, referred by Dr. A. K. Banerjee). Platelets dropped to 85,000 /mcL, Dengue NS1 Antigen is POSITIVE, WBC 12,400 /mcL. Suggest fluid resuscitation protocol and platelet transfusion trigger thresholds.
```

---

### Case 7: Atypical Pneumonia & Consolidation (AIIMS New Delhi)
- **File**: `demo_reports/aiims_pulmonary_xray_report.jpg`
- **Copy-Paste Prompt**:
```text
Patient Meena Kumari, female 36 yrs, CR No AIIMS-2026-004921 (attending Dr. Priya Narang, contact 9411209844) ki chest X-ray report attach ki hai. Report shows bilateral lower lobe patchy pneumonic consolidation with blunted left costophrenic angle. SpO2 91% hai. Community-acquired atypical pneumonia ke liye empirical IV antibiotic combination suggest karo.
```

---

## 💬 Category 2: Pure Text Clinical Prompts (Hinglish, Emergency & OPD)

Type any of these prompts directly into ChatGPT, Claude, Gemini, or Perplexity through the proxied browser.

---

### Prompt 8: Hinglish Emergency Relatives & Preserved Indian Ward Drugs
```text
Emergency room me mareez Ram Lal (age 62, contact 9871203491) ko unke bete Deepak Sharma ne admit karwaya. Unke relative Rajesh Kumar bol rahe the ki Gurgaon se aate waqt tez pet me dard aur ultiyan shuru hui. Baseline BP 160/100 mmHg, SpO2 94%. Duty doctor ne stat Inj PCM, Pan-D 40mg IV aur Dolo-650 diya hai. Differentiate acute pancreatitis vs perforated peptic ulcer.
```
- **Redacted**: Ram Lal ➔ `[PATIENT_1]`, Deepak Sharma ➔ `[PATIENT_2]`, Rajesh Kumar ➔ `[PATIENT_3]`, Gurgaon ➔ `[LOCATION_1]`, 9871203491 ➔ `[PHONE_1]`.
- **Preserved 100%**: Pet me dard, Ultiyan, Dolo-650, Pan-D, Inj PCM, SpO2 94%, BP 160/100.

---

### Prompt 9: Indian Endemic Syndromes & Regional Place-Name Whitelist
```text
A 34-year-old male traveler presenting with high-grade intermittent fever, hepatosplenomegaly, and hyperpigmentation over hands and forehead (Kala-azar presentation). He also reports persistent burning conjunctivitis resembling Madras eye and a non-healing trophic foot ulcer similar to Madura foot. Evaluate diagnostic workup with rK39 dipstick and bone marrow aspirate.
```
- **Preserved 100%**: `Kala-azar`, `Madras eye`, `Madura foot` (Whitelisted Indian geographical clinical terms - ZERO false-positive redaction!).

---

### Prompt 10: Pediatric ER Fever & Dehydration
```text
Master Aarav Gupta, 4 years old (father Sandeep Gupta, phone 9811234900, dwelling in Lajpat Nagar, New Delhi) has acute watery diarrhea for 24 hours, dry mucous membranes, sunken fontanelle, and fever 102.4 F. Prescribed Electral ORS and Zinc supplementation. Calculate WHO Plan B oral rehydration fluid requirement for 14 kg child.
```
- **Redacted**: Aarav Gupta ➔ `[PATIENT_1]`, Sandeep Gupta ➔ `[PATIENT_2]`, Lajpat Nagar, New Delhi ➔ `[LOCATION_1]`, 9811234900 ➔ `[PHONE_1]`.
- **Preserved**: Electral ORS, Zinc, diarrhea, 14 kg child, fever 102.4 F.

---

### Prompt 11: ICU Sepsis & Arterial Blood Gas (ABG)
```text
Patient Smt. Kamlesh Rani, 72F (CR No PGI-CH-2026-0912, daughter Anjali contact 9814400192) in ICU bed 08 on mechanical ventilation. ABG reveals pH 7.21, PaCO2 58 mmHg, PaO2 62 mmHg on FiO2 60%, HCO3 16 mEq/L, Serum Lactate 4.2 mmol/L. She is in septic shock refractory to IVF resuscitation. Calculate target Noradrenaline infusion rate and ventilator adjustments.
```
- **Redacted**: Kamlesh Rani ➔ `[PATIENT_1]`, PGI-CH-2026-0912 ➔ `[MRN_1]`, Anjali ➔ `[PATIENT_2]`, 9814400192 ➔ `[PHONE_1]`.
- **Preserved**: Septic shock, pH 7.21, PaCO2 58, Lactate 4.2, Noradrenaline, FiO2 60%.

---

### Prompt 12: Neurology & Epilepsy Protocol
```text
Patient Mohammad Farooq (31M, ABHA 91-0021-4491-7712, resident of Charminar, Hyderabad, contact 9989012345) experienced two generalized tonic-clonic seizures lasting 4 minutes with post-ictal confusion. Emergency CT brain is normal. Attending neurologist prescribed Inj Levetiracetam (Keppra) 1000mg IV stat. Advise maintenance dosage and driving restrictions under Indian law.
```
- **Redacted**: Mohammad Farooq ➔ `[PATIENT_1]`, ABHA 91-0021-4491-7712 ➔ `[ABHA_1]`, Charminar, Hyderabad ➔ `[LOCATION_1]`, 9989012345 ➔ `[PHONE_1]`.
- **Preserved**: Tonic-clonic seizures, Keppra (Levetiracetam) 1000mg IV stat, CT brain.

---

## 📊 Live Verification on Dashboard (`http://localhost:3000`)

Whenever you submit any of the above:
1. Open the **Audit Log** table: Click on the newly created event.
2. In the modal:
   - For image uploads: Look at the **Sovereign Vision Shield** side-by-side view to see both the Top Demographic Shield and Bottom Clinician Shield.
   - For text prompts: Click the **🔑 Rehydration Map** tab to see how `[PATIENT_1]`, `[MRN_1]`, `[PHONE_1]` were tokenized in-memory and prevented from leaking across Indian borders.
3. Review the **DPDP Compliance Hub**: Check the Real-time DPDP Act 2023 Statutory score (98/100) and zero cross-border data leakage proof.
