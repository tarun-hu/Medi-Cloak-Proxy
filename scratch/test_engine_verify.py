import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from phi_redactor import PHIRedactor
import json

redactor = PHIRedactor()

test_cases = [
    (
        "Complex Clinical Indian Scenario",
        "Patient Dalla Ram, ABHA ID: 32-4415-9982-1012, Aadhaar: 4589 1234 9081, residing at Sector 45, Madras. Came to ER with acute Madras Eye and Delhi Belly. History of Jaipur Foot prosthesis. Prescribed Dolo-650 BD and ATT protocol."
    ),
    (
        "Doctor + Patient + DOB + Phone + City",
        "Doctor Rajesh Sharma evaluated Mrs. Sunita Devi, age 45, phone 9876543210, DOB 12/04/1979 in New Delhi. Suspected Kala-Azar or Bengal Cholera."
    ),
    (
        "Western HIPAA Scenario",
        "Patient John Doe, SSN: 423-91-8847, MRN: 948271. Prescribed Augmentin."
    ),
    (
        "Clean Non-PHI Technical Query",
        "How do I sort a list of integers in Python?"
    )
]

for title, text in test_cases:
    print("=" * 60)
    print(f"TEST: {title}")
    print("INPUT: ", text)
    res = redactor.analyze_and_redact(text)
    print("OUTPUT:", res["redacted_text"])
    print("PHI DETECTED:", res["phi_detected"], f"({res['phi_count']} items)")
    findings = [f"{f['entity_type']}: {f['text']} -> {f.get('token', '')}" for f in res["findings"]]
    print("FINDINGS:", findings)
    print("PRESERVED CLINICAL TERMS:", res.get("clinical_terms_preserved", []))
    print("DEPARTMENT:", res.get("department"))
    print("DPDP COMPLIANT:", res.get("dpdp_compliance", {}).get("is_compliant"))
print("=" * 60)
print("ALL REDACTION TESTS COMPLETED SUCCESSFULLY!")
