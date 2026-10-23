"""
Seed the database with realistic demo data for MediCloak demo.
Generates 50-100 events spanning the last 2 hours.
"""

import random
import json
import uuid
from datetime import datetime, timedelta, timezone

import hashlib

DEPARTMENTS = ["Emergency Room (ER)", "Oncology", "Radiology", "Pediatrics", "OPD / General Medicine"]

SERVICES = [
    ("ChatGPT", 60),
    ("Claude", 30),
    ("Gemini", 10),
]

SEVERITY_WEIGHTS = {
    "critical": 20,
    "high": 15,
    "medium": 25,
    "low": 15,
    "clean": 25,
}

PHI_TYPES_POOL = [
    "PERSON", "ABHA_ID", "AADHAAR_ID", "PHONE_NUMBER", "EMAIL_ADDRESS",
    "DATE_OF_BIRTH", "MEDICAL_RECORD_NUMBER", "LOCATION",
    "DIAGNOSIS_CODE", "MEDICATION",
]

REALISTIC_MESSAGES = [
    {
        "original": "Patient Dalla Ram, ABHA ID: 32-4415-9982-1012, Aadhaar: 4589 1234 9081, residing at Sector 45, Madras. Came to ER with acute Madras Eye and Delhi Belly. History of Jaipur Foot prosthesis. Prescribed Dolo-650 BD and ATT protocol.",
        "redacted": "Patient [PATIENT_1], ABHA ID: [HEALTH_ID_1], Aadhaar: [AADHAAR_ID_1], residing at [LOCATION_1]. Came to ER with acute Madras Eye and Delhi Belly. History of Jaipur Foot prosthesis. Prescribed Dolo-650 BD and ATT protocol.",
        "phi_types": ["PERSON", "ABHA_ID", "AADHAAR_ID", "LOCATION"],
        "department": "Emergency Room (ER)",
        "clinical_terms_preserved": ["Jaipur Foot", "Madras Eye", "Delhi Belly", "Dolo-650", "ATT", "BD"],
        "rehydration_map": {"[PATIENT_1]": "Dalla Ram", "[HEALTH_ID_1]": "32-4415-9982-1012", "[AADHAAR_ID_1]": "4589 1234 9081", "[LOCATION_1]": "Sector 45, Madras"},
        "findings": [
            {"entity_type": "PERSON", "text": "Dalla Ram", "score": 0.98},
            {"entity_type": "ABHA_ID", "text": "32-4415-9982-1012", "score": 0.99},
            {"entity_type": "AADHAAR_ID", "text": "4589 1234 9081", "score": 0.99},
            {"entity_type": "LOCATION", "text": "Sector 45, Madras", "score": 0.96},
        ],
    },
    {
        "original": "Patient Rajesh Verma, ABHA ID: 14-8891-2304-5512, DLF Phase 3, Cyber City, Gurgaon. Histopathology confirms stage 2 adenocarcinoma. Vaccinated with Covishield and Covaxin regimens. Advised urgent referral to AIIMS New Delhi for radiation oncology evaluation.",
        "redacted": "Patient [PATIENT_1], ABHA ID: [HEALTH_ID_1], [LOCATION_1]. Histopathology confirms stage 2 adenocarcinoma. Vaccinated with Covishield and Covaxin regimens. Advised urgent referral to AIIMS New Delhi for radiation oncology evaluation.",
        "phi_types": ["PERSON", "ABHA_ID", "LOCATION"],
        "department": "Oncology",
        "clinical_terms_preserved": ["Covishield", "Covaxin", "AIIMS New Delhi", "Oncology"],
        "rehydration_map": {"[PATIENT_1]": "Rajesh Verma", "[HEALTH_ID_1]": "14-8891-2304-5512", "[LOCATION_1]": "DLF Phase 3, Cyber City, Gurgaon"},
        "findings": [
            {"entity_type": "PERSON", "text": "Rajesh Verma", "score": 0.97},
            {"entity_type": "ABHA_ID", "text": "14-8891-2304-5512", "score": 0.99},
            {"entity_type": "LOCATION", "text": "DLF Phase 3, Cyber City, Gurgaon", "score": 0.94},
        ],
    },
    {
        "original": "Baby Ananya, mother Priya Nair, phone +91 9811234567, Sector 18, Noida. Suspected Kala-azar / Assam Fever with severe AGE symptoms. Prescribed PCM 250mg TDS and oral rehydration salts.",
        "redacted": "Baby [PATIENT_1], mother [PATIENT_2], phone [PHONE_1], [LOCATION_1]. Suspected Kala-azar / Assam Fever with severe AGE symptoms. Prescribed PCM 250mg TDS and oral rehydration salts.",
        "phi_types": ["PERSON", "PHONE_NUMBER", "LOCATION"],
        "department": "Pediatrics",
        "clinical_terms_preserved": ["Kala-azar", "Assam Fever", "AGE", "PCM", "TDS"],
        "rehydration_map": {"[PATIENT_1]": "Ananya", "[PATIENT_2]": "Priya Nair", "[PHONE_1]": "+91 9811234567", "[LOCATION_1]": "Sector 18, Noida"},
        "findings": [
            {"entity_type": "PERSON", "text": "Ananya", "score": 0.94},
            {"entity_type": "PERSON", "text": "Priya Nair", "score": 0.96},
            {"entity_type": "PHONE_NUMBER", "text": "+91 9811234567", "score": 0.99},
            {"entity_type": "LOCATION", "text": "Sector 18, Noida", "score": 0.93},
        ],
    },
    {
        "original": "Patient Gurpreet Singh, ABHA ID: 45-1234-5678-9012, Sector 17, Chandigarh. Admitted under Dr. Ramesh Aggarwal for acute necrotizing pancreatitis. Prescribed Pan-D and Pantoprazole 40mg IV OD.",
        "redacted": "Patient [PATIENT_1], ABHA ID: [HEALTH_ID_1], [LOCATION_1]. Admitted under [DOCTOR_1] for acute necrotizing pancreatitis. Prescribed Pan-D and Pantoprazole 40mg IV OD.",
        "phi_types": ["PERSON", "ABHA_ID", "LOCATION"],
        "department": "Emergency Room (ER)",
        "clinical_terms_preserved": ["Pan-D", "Pantoprazole", "IV", "OD"],
        "rehydration_map": {"[PATIENT_1]": "Gurpreet Singh", "[HEALTH_ID_1]": "45-1234-5678-9012", "[LOCATION_1]": "Sector 17, Chandigarh", "[DOCTOR_1]": "Dr. Ramesh Aggarwal"},
        "findings": [
            {"entity_type": "PERSON", "text": "Gurpreet Singh", "score": 0.97},
            {"entity_type": "ABHA_ID", "text": "45-1234-5678-9012", "score": 0.99},
            {"entity_type": "LOCATION", "text": "Sector 17, Chandigarh", "score": 0.94},
            {"entity_type": "PERSON", "text": "Dr. Ramesh Aggarwal", "score": 0.92},
        ],
    },
    {
        "original": "Patient Kavita Chauhan, Aadhaar: 8901 2345 6789, Karol Bagh, New Delhi. History of postpartum hypertension and pre-eclampsia. Admitted at Sir Ganga Ram Hospital. Prescribed Labetalol 100mg BD.",
        "redacted": "Patient [PATIENT_1], Aadhaar: [AADHAAR_ID_1], [LOCATION_1]. History of postpartum hypertension and pre-eclampsia. Admitted at [HOSPITAL_1]. Prescribed Labetalol 100mg BD.",
        "phi_types": ["PERSON", "AADHAAR_ID", "LOCATION"],
        "department": "OPD / General Medicine",
        "clinical_terms_preserved": ["Labetalol", "BD", "pre-eclampsia"],
        "rehydration_map": {"[PATIENT_1]": "Kavita Chauhan", "[AADHAAR_ID_1]": "8901 2345 6789", "[LOCATION_1]": "Karol Bagh, New Delhi", "[HOSPITAL_1]": "Sir Ganga Ram Hospital"},
        "findings": [
            {"entity_type": "PERSON", "text": "Kavita Chauhan", "score": 0.97},
            {"entity_type": "AADHAAR_ID", "text": "8901 2345 6789", "score": 0.99},
            {"entity_type": "LOCATION", "text": "Karol Bagh, New Delhi", "score": 0.93},
        ],
    },
    {
        "original": "What are the recommended ICMR clinical treatment protocols for dengue hemorrhagic fever with severe thrombocytopenia?",
        "redacted": None,
        "phi_types": [],
        "findings": [],
        "department": "Emergency Room (ER)",
    },
    {
        "original": "Explain the difference between Type 1 and Type 2 diabetes in simple Hindi and English terms for a patient education handout.",
        "redacted": None,
        "phi_types": [],
        "findings": [],
        "department": "OPD / General Medicine",
    },
    {
        "original": "What are the current AIIMS emergency triage criteria for acute coronary syndrome vs musculoskeletal chest pain?",
        "redacted": None,
        "phi_types": [],
        "findings": [],
        "department": "Emergency Room (ER)",
    },
    {
        "original": "Suggest a clinical template for pediatric OPD growth chart documentation following Indian Academy of Pediatrics (IAP) guidelines.",
        "redacted": None,
        "phi_types": [],
        "findings": [],
        "department": "Pediatrics",
    },
]

REQUEST_PATHS = [
    "/v1/chat/completions",
    "/api/messages",
    "/v1/messages",
    "/backend-api/conversation",
    "/v1beta/models/gemini-pro:generateContent",
]

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) Firefox/121.0",
    "Epic/2024.1 EHR-Integration/3.2",
    "Cerner-PowerChart/2024.2",
]


def _pick_service() -> str:
    r = random.randint(1, 100)
    if r <= 60:
        return "ChatGPT"
    elif r <= 90:
        return "Claude"
    else:
        return "Gemini"


def _pick_severity() -> str:
    r = random.randint(1, 100)
    if r <= 20:
        return "critical"
    elif r <= 35:
        return "high"
    elif r <= 60:
        return "medium"
    elif r <= 75:
        return "low"
    else:
        return "clean"


def _risk_for_severity(severity: str) -> int:
    ranges = {
        "critical": (71, 100),
        "high": (51, 70),
        "medium": (31, 50),
        "low": (11, 30),
        "clean": (0, 10),
    }
    lo, hi = ranges[severity]
    return random.randint(lo, hi)


def generate_seed_events(count: int = 75) -> list[dict]:
    """Generate realistic demo events."""
    now = datetime.now(timezone.utc)
    events = []

    for i in range(count):
        severity = _pick_severity()
        risk_score = _risk_for_severity(severity)
        service = _pick_service()
        has_phi = severity in ("critical", "high")

        # Pick a message template
        if has_phi:
            msg = random.choice([m for m in REALISTIC_MESSAGES if m["phi_types"]])
        else:
            msg = random.choice([m for m in REALISTIC_MESSAGES if not m["phi_types"]])

        # Spread events across last 2 hours
        offset_seconds = random.randint(0, 7200)
        ts = now - timedelta(seconds=offset_seconds)

        # Simulate hospital subnet IPs
        dept_octet = random.choice([10, 20, 30, 40, 50, 60])
        host_octet = random.randint(1, 254)
        source_ip = f"10.0.{dept_octet}.{host_octet}"

        event = {
            "event_id": str(uuid.uuid4()),
            "timestamp": ts.isoformat(),
            "source_ip": source_ip,
            "user_agent": random.choice(USER_AGENTS),
            "ai_service": service,
            "request_method": "POST",
            "request_path": random.choice(REQUEST_PATHS),
            "risk_score": risk_score,
            "severity": severity,
            "phi_detected": has_phi,
            "phi_count": len(msg["findings"]) if has_phi else 0,
            "phi_types": json.dumps(msg["phi_types"]) if msg["phi_types"] else json.dumps([]),
            "phi_findings": json.dumps(msg["findings"]) if msg["findings"] else json.dumps([]),
            "original_text": msg["original"],
            "redacted_text": msg["redacted"],
            "action": "redacted" if has_phi else "clean",
            "status": random.choice(["active", "active", "active", "mitigated", "resolved"]) if has_phi else "active",
            "engine": "presidio" if has_phi else "regex_fallback",
            "response_time_ms": random.randint(50, 500),
            "department": msg.get("department", random.choice(DEPARTMENTS)),
            "rehydration_map": msg.get("rehydration_map", {}),
            "clinical_terms_preserved": msg.get("clinical_terms_preserved", []),
        }
        events.append(event)

    # Sort by timestamp
    events.sort(key=lambda e: e["timestamp"])
    return events


def insert_seed_events(cursor, events: list[dict]):
    """Insert seed events into the database."""
    for e in events:
        dept = e.get("department") or random.choice(DEPARTMENTS)
        rehydration_json = json.dumps(e.get("rehydration_map", {}))
        clinical_json = json.dumps(e.get("clinical_terms_preserved", []))
        hash_seed = f"{e['ai_service']}:{e['risk_score']}:{e['original_text']}:{e['timestamp']}"
        sha256_vault = hashlib.sha256(hash_seed.encode("utf-8")).hexdigest()

        cursor.execute(
            """
            INSERT INTO events (
                event_id, timestamp, source_ip, user_agent, ai_service,
                request_method, request_path, risk_score, severity,
                phi_detected, phi_count, phi_types, phi_findings,
                original_text, redacted_text, action, status, engine,
                response_time_ms, department, sha256_hash, rehydration_map,
                clinical_terms_preserved, dpdp_score, created_at
            ) VALUES (
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s
            )
            """,
            (
                e["event_id"], e["timestamp"], e["source_ip"], e["user_agent"],
                e["ai_service"], e["request_method"], e["request_path"],
                e["risk_score"], e["severity"], e["phi_detected"], e["phi_count"],
                e["phi_types"], e["phi_findings"], e["original_text"],
                e["redacted_text"], e["action"], e["status"], e["engine"],
                e["response_time_ms"], dept, sha256_vault, rehydration_json,
                clinical_json, 99.8, e["timestamp"],
            ),
        )

        # Insert fake VAPI call records for critical/high events
        if e["severity"] in ("critical", "high") and random.random() < 0.6:
            cursor.execute(
                """
                INSERT INTO vapi_calls (call_id, event_id, source_ip, phone_number, status, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    f"call_{uuid.uuid4().hex[:12]}",
                    e["event_id"],
                    e["source_ip"],
                    "+15551234567",
                    random.choice(["queued", "ended", "ended", "failed"]),
                    e["timestamp"],
                ),
            )
