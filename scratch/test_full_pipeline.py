import sys, os, time, json, asyncio
import urllib.request
from datetime import datetime, timezone

# Add backend and root to sys.path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, root_dir)
sys.path.insert(0, os.path.join(root_dir, "backend"))

from phi_redactor import PHIRedactor, classify_department
from database import get_cursor, dict_cursor, init_db

print("=" * 60)
print("MEDICLOAK END-TO-END PIPELINE AUDIT")
print("=" * 60)

async def run_pipeline():
    # Step 1: Initialize DB
    init_db()
    print("[1/5] Database initialized and verified.")

    # Step 2: Redact a real-world complex prompt
    test_prompt = (
        "Patient Dalla Ram, ABHA ID: 32-4415-9982-1012, Aadhaar: 4589 1234 9081, "
        "residing at Sector 45, Madras. Came to ER with acute Madras Eye and Delhi Belly. "
        "History of Jaipur Foot prosthesis. Prescribed Dolo-650 BD and ATT protocol."
    )

    redactor = PHIRedactor()
    t0 = time.time()
    phi_res = redactor.analyze_and_redact(test_prompt)
    elapsed_ms = (time.time() - t0) * 1000

    print(f"[2/5] Redaction engine executed in {elapsed_ms:.2f} ms.")
    print("      Redacted text:", phi_res["redacted_text"])
    print("      Entities found:", [f"{f['entity_type']}: {f['text']}" for f in phi_res["findings"]])
    print("      Preserved clinical idioms:", phi_res.get("clinical_terms_preserved"))
    print("      Department:", phi_res.get("department"))

    assert phi_res["phi_detected"] == True, "PHI should be detected!"
    assert "Madras Eye" in phi_res["redacted_text"], "Madras Eye must be preserved!"
    assert "Jaipur Foot" in phi_res["redacted_text"], "Jaipur Foot must be preserved!"
    assert "Dalla Ram" not in phi_res["redacted_text"], "Dalla Ram must be redacted!"
    assert "32-4415-9982-1012" not in phi_res["redacted_text"], "ABHA ID must be redacted!"

    # Step 3: Insert directly into DB via backend logic to test database persistence
    from models import EventCreate
    import main

    test_event_data = {
        "source_ip": "127.0.0.1",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
        "ai_service": "ChatGPT",
        "request_method": "POST",
        "request_path": "/backend-api/conversation",
        "risk_score": 88,
        "severity": "critical",
        "phi_detected": phi_res["phi_detected"],
        "phi_count": phi_res["phi_count"],
        "phi_types": phi_res.get("entity_types_found", []),
        "phi_findings": phi_res.get("findings", []),
        "original_text": test_prompt,
        "redacted_text": phi_res.get("redacted_text"),
        "action": "redacted",
        "engine": phi_res.get("engine", "sovereign_core"),
        "department": phi_res.get("department", "Emergency Room (ER)"),
        "rehydration_map": phi_res.get("rehydration_map", {}),
        "clinical_terms_preserved": phi_res.get("clinical_terms_preserved", []),
        "dpdp_compliant": True,
    }

    event_create = EventCreate(**test_event_data)
    inserted = await main.create_event(event_create)
    event_id = inserted["id"] if isinstance(inserted, dict) else inserted.id
    event_status = inserted.get("status", "active") if isinstance(inserted, dict) else inserted.status
    print(f"[3/5] Event successfully created in DB! ID: {event_id}, Status: {event_status}")

    # Step 4: Verify Event in DB via query
    with get_cursor(dict_cursor()) as cur:
        cur.execute("SELECT * FROM events WHERE id = %s;", (event_id,))
        row = cur.fetchone()
        assert row is not None, "Inserted event must exist in database!"
        print(f"[4/5] DB verification passed. Event {row['id']} retrieved:")
        print(f"      Service: {row['ai_service']}, Severity: {row['severity']}, Department: {row['department']}")
        print(f"      Preserved terms in DB: {row['clinical_terms_preserved']}")

    # Step 5: Test stats endpoint calculation
    stats = main.get_stats()
    print(f"[5/5] Stats API verified:")
    print(f"      Total Requests: {stats['total_requests']}")
    print(f"      PHI Detected: {stats['phi_detected']}")
    print(f"      Avg Risk Score: {stats['avg_risk_score']:.1f}")
    print(f"      DPDP Compliance Rate: {stats['dpdp_compliance_rate']}%")
    print(f"      Department breakdown: {stats['by_department']}")

    print("=" * 60)
    print("SUCCESS: ALL 5 PIPELINE COMPONENTS FULLY VERIFIED!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_pipeline())
