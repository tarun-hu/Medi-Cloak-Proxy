"""
MediCloak - mitmproxy Sovereign Gateway Addon
Layer-7 Transparent AI Proxy & Clinical Context Guard.
Intercepts HTTPS & WebSocket traffic to all Generative & Healthcare AI platforms.

Usage:
    mitmdump -s medicloak_addon.py --listen-port 8080
"""

import sys
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)
        sys.stderr.reconfigure(encoding="utf-8", line_buffering=True)
    except Exception:
        pass

import mitmproxy.http
import mitmproxy.websocket
from mitmproxy import ctx
import json
import re
import time
import urllib.request
import urllib.parse
import threading
from datetime import datetime
from typing import Optional, Dict, Any, List, Tuple

# Import the Sovereign PHI redactor
from phi_redactor import PHIRedactor, classify_department


# ============================================================
# CONFIGURATION & EXPANDED AI PLATFORM REGISTRY
# ============================================================

PHI_ENGINE = "regex"
BACKEND_URL = "http://127.0.0.1:8000/api/events"

# Comprehensive General & Healthcare AI Domains Registry
AI_DOMAINS = {
    # --- Major Consumer & Enterprise LLMs ---
    "api.openai.com": "OpenAI API",
    "chat.openai.com": "ChatGPT",
    "chatgpt.com": "ChatGPT",
    "api.anthropic.com": "Anthropic API",
    "claude.ai": "Claude",
    "generativelanguage.googleapis.com": "Gemini API",
    "gemini.google.com": "Gemini",
    "bard.google.com": "Bard",
    "copilot.microsoft.com": "MS Copilot",
    "sydney.bing.com": "MS Copilot",
    "edgeservices.bing.com": "MS Copilot",
    "chat.deepseek.com": "DeepSeek",
    "api.deepseek.com": "DeepSeek",
    "api.mistral.ai": "Mistral",
    "chat.mistral.ai": "Mistral",
    "api.groq.com": "Groq",
    "api.cohere.ai": "Cohere",
    "api.cohere.com": "Cohere",
    "api-inference.huggingface.co": "HuggingFace",
    "huggingface.co": "HuggingFace",
    "api.together.xyz": "Together AI",
    "api.together.ai": "Together AI",
    "openrouter.ai": "OpenRouter",
    "poe.com": "Poe",
    "cursor.com": "Cursor AI",
    "cursor.sh": "Cursor AI",

    # --- Perplexity AI (Web & API & Socket.IO) ---
    "api.perplexity.ai": "Perplexity",
    "perplexity.ai": "Perplexity",
    "www.perplexity.ai": "Perplexity",
    "labs.perplexity.ai": "Perplexity",
    "pplx.ai": "Perplexity",

    # --- Specialized Healthcare & Clinical AI Platforms ---
    "glass.health": "Glass Health AI",
    "api.glass.health": "Glass Health AI",
    "app.glass.health": "Glass Health AI",
    "hippocratic.ai": "Hippocratic AI",
    "api.hippocratic.ai": "Hippocratic AI",
    "nabla.com": "Nabla Copilot",
    "copilot.nabla.com": "Nabla Copilot",
    "api.nabla.com": "Nabla Copilot",
    "abridge.com": "Abridge AI",
    "api.abridge.com": "Abridge AI",
    "suki.ai": "Suki Clinical AI",
    "api.suki.ai": "Suki Clinical AI",
    "ambiencehealthcare.com": "Ambience Healthcare",
    "api.ambiencehealthcare.com": "Ambience Healthcare",
    "doximity.com": "Doximity GPT",
    "api.doximity.com": "Doximity GPT",
    "openevidence.com": "OpenEvidence Clinical AI",
    "api.openevidence.com": "OpenEvidence Clinical AI",
    "uptodate.com": "UpToDate Clinical",
    "uptodate.lww.com": "UpToDate Clinical",
    "getfreed.ai": "Freed AI Scribe",
    "api.getfreed.ai": "Freed AI Scribe",
    "app.getfreed.ai": "Freed AI Scribe",
    "freed.ai": "Freed AI Scribe",
    "deepscribe.ai": "DeepScribe",
    "api.deepscribe.ai": "DeepScribe",
    "tortus.ai": "Tortus Healthcare",
    "api.tortus.ai": "Tortus Healthcare",
    "heidihealth.com": "Heidi Health",
    "api.heidihealth.com": "Heidi Health",
    "augmedix.com": "Augmedix Clinical AI",
    "api.augmedix.com": "Augmedix Clinical AI",
    "nuance.com": "Nuance DAX Copilot",
    "dax.nuance.com": "Nuance DAX Copilot",
    "infermedica.com": "Infermedica Clinical AI",
    "api.infermedica.com": "Infermedica Clinical AI",
    "open.epic.com": "Epic Systems AI",
    "epic.com": "Epic Systems AI",
    "cerner.com": "Oracle Cerner Health AI",
    "eclinicalworks.com": "eClinicalWorks AI",
    "regard.com": "Regard Clinical AI",
    "robinhealthcare.com": "Robin Healthcare",
    "deep6.ai": "Deep 6 AI",
    "vertexai.googleapis.com": "Google Cloud Healthcare AI",
    "healthcare.googleapis.com": "Google Cloud Healthcare API",
    "bedrock-runtime.amazonaws.com": "AWS Health / Bedrock",
    "healthlake.amazonaws.com": "AWS HealthLake",
    "openai.azure.com": "Azure Health / Azure OpenAI",
}

# Domains / paths to ignore (static assets, telemetry, internal metrics, auth, etc.)
IGNORE_PATHS = (
    "/v1/models",
    "/favicon.ico",
    "/_next/",
    "/_spa/",
    "/assets/",
    "/static/",
    "/fonts/",
    "/ping",
    "/jserror",
    "/client-telemetry",
    "/lat/r",
    "/lat/",
    "/rgstr",
    "/logging",
    "/log",
    "/gen_204",
    "/api/auth/",
    "/backend-api/lat/r",
    "/backend-api/lat/",
    "/backend-api/me",
    "/backend-api/settings",
    "/backend-api/accounts",
    "/sentinel",
    "/chat-requirements",
    "/conversation/prepare",
    "/prepare",
    "/unauth-mweb/sentinel",
    "/unauth-mweb/conversation/prepare",
    "/backend-anon/sentinel",
    "/ces/",
    "/ces/v1/t",
    "/ces/v1/",
    "/statsig",
    "/telemetry",
    "/analytics",
    "/metrics",
    "/beacon",
    "/event",
    "/events",
    "/browser/",
    "/initialize",
    "/session",
    "/feedback",
    "/track",
    "/collect",
)

TELEMETRY_MARKERS = (
    "statsig::",
    "conversation_stream.update_response_count",
    "conversation_startup.",
    "conversation.perf.",
    "conversation_perf.",
    "client_type\": \"web-mobile\"",
    "client_type\":\"web-mobile\"",
    "\"eventname\": \"statsig",
    "\"eventname\":\"statsig",
    "\"metric\":",
    "\"counters\":",
    "\"layer_exposure\"",
    "\"auth_login_signup_opt_layer\"",
    "secondaryexposures",
)

STATIC_EXTENSIONS = (
    ".js", ".css", ".svg", ".png", ".jpg", ".jpeg", ".gif",
    ".webp", ".woff", ".woff2", ".ttf", ".ico", ".map"
)

# Medical keywords that boost risk score
MEDICAL_KEYWORDS = [
    "patient", "diagnosis", "prescribed", "medication", "discharge", "admission",
    "lab results", "radiology", "MRI", "CT scan", "blood pressure", "heart rate",
    "allergies", "surgery", "prognosis", "treatment plan", "medical record",
    "clinical notes", "HIPAA", "PHI", "EHR", "ICD", "CPT", "vital signs",
    "madras eye", "delhi belly", "jaipur foot", "kala-azar", "dolo-650", "abha"
]


# ============================================================
# RISK SCORING & TERMINAL STYLING
# ============================================================

def score_risk(body: str, service: str, method: str) -> dict:
    score = 15  # Base score for AI interaction
    reasons = [f"AI Gateway Route: {service} (+15)"]

    text_lower = body.lower()
    med_count = sum(1 for kw in MEDICAL_KEYWORDS if kw.lower() in text_lower)
    if med_count >= 2:
        boost = min(med_count * 4, 25)
        score += boost
        reasons.append(f"Clinical context markers: {med_count} (+{boost})")

    body_len = len(body)
    if body_len > 2000:
        score += 15
        reasons.append(f"Clinical record size: {body_len} chars (+15)")
    elif body_len > 500:
        score += 8
        reasons.append(f"Payload size: {body_len} chars (+8)")

    if method in ("POST", "PUT", "PATCH", "WS"):
        score += 5

    return {
        "score": min(score, 100),
        "reasons": reasons,
        "payload_size": body_len,
    }


def risk_color(score: int) -> str:
    if score >= 70:
        return "\033[91m"  # red
    elif score >= 40:
        return "\033[93m"  # yellow
    return "\033[92m"  # green


RESET = "\033[0m"
BOLD = "\033[1m"
DIM = "\033[2m"


def print_event(flow, service, risk, body):
    """Pretty-print intercepted event to the terminal."""
    color = risk_color(risk["score"])
    ts = datetime.now().strftime("%H:%M:%S")

    path_str = flow.request.path if hasattr(flow, "request") and hasattr(flow.request, "path") else "/ws"
    method_str = flow.request.method if hasattr(flow, "request") and hasattr(flow.request, "method") else "WS"

    print(f"\n{'=' * 70}")
    print(f"{BOLD}🛡️  MEDICLOAK SOVEREIGN INTERCEPT{RESET}")
    print(f"{'=' * 70}")
    print(f"  ⏰ Time:      {ts}")
    print(f"  🌐 Service:   {service}")
    print(f"  📡 Method:    {method_str} {path_str[:60]}")
    print(f"  📦 Size:      {len(body)} chars")
    print(f"  {color}{BOLD}⚠️  Risk Score: {risk['score']}/100{RESET}")

    if risk.get("phi_detected"):
        print(f"  {BOLD}\033[91m🚨 PHI DETECTED:{RESET} {risk.get('phi_count', 0)} item(s)")

    # Preview body
    if body and len(body.strip()) > 0:
        print(f"\n  💬 {BOLD}PAYLOAD SNIPPET:{RESET}")
        print(f"  ┌{'─' * 56}┐")
        preview = body[:400]
        for line in preview.split("\n"):
            while len(line) > 54:
                print(f"  │ {line[:54]} │")
                line = line[54:]
            print(f"  │ {line:<54} │")
        if len(body) > 400:
            print(f"  │ {'... (truncated)':<54} │")
        print(f"  └{'─' * 56}┘")
    print(f"{'=' * 70}\n")


def print_redaction_box(phi_result, new_payload):
    """Print sovereign shield details in terminal."""
    print(f"\n  {'=' * 56}")
    print(f"  ✂️  {BOLD}SOVEREIGN HEALTHCARE SHIELD APPLIED ({phi_result.get('engine', 'sovereign_core')}){RESET}")
    if phi_result.get("department"):
        print(f"  🏥 Hospital Dept: {BOLD}{phi_result['department']}{RESET}")
    print(f"  {'=' * 56}")
    for f in phi_result.get("findings", []):
        tok = f.get("token", "[REDACTED]")
        print(f'    🔴 {f["entity_type"]}: "{f["text"]}" → {tok}')
    if phi_result.get("clinical_terms_preserved"):
        print(f"  🛡️  {BOLD}Preserved Clinical Terms:{RESET} {', '.join(phi_result['clinical_terms_preserved'])}")
    print(f"\n  📝 {BOLD}REDACTED OUTPUT (FORWARDED TO CLOUD AI):{RESET}")
    print(f"  ┌{'─' * 56}┐")
    sample = str(new_payload)[:400]
    for line in sample.split("\n"):
        while len(line) > 54:
            print(f"  │ {line[:54]} │")
            line = line[54:]
        print(f"  │ {line:<54} │")
    print(f"  └{'─' * 56}┘")
    print(f"  ✅ {BOLD}\033[92mZero-Trust Protected Request Dispatched{RESET}")
    print(f"  {'=' * 56}\n")


# ============================================================
# MITMPROXY SOVEREIGN ADDON
# ============================================================

class MediCloak:
    def __init__(self):
        self.redactor = PHIRedactor()
        self._recent_events = {}
        if hasattr(ctx, "log") and ctx.log:
            ctx.log.info("MediCloak Sovereign Gateway loaded")
        else:
            print("[MediCloak] Sovereign Gateway loaded and active")

    def _match_service(self, host: str) -> Optional[str]:
        """Match domain against AI services registry."""
        if not host:
            return None
        host_lower = host.lower()
        for domain, service in AI_DOMAINS.items():
            if domain in host_lower:
                return service
        if "11434" in host_lower or "ollama" in host_lower:
            return "Ollama Local"
        return None

    def _post_event(self, flow, matched_service, risk, phi_result, readable_body, action, request_path=None):
        """Post event to the FastAPI backend asynchronously without mitmproxy proxy loop."""
        req_path = request_path or (flow.request.path if hasattr(flow, "request") else "/ws")
        if "?" in req_path:
            base, q = req_path.split("?", 1)
            q_clean = "&".join(p for p in q.split("&") if not p.lower().startswith("utm_"))
            req_path = f"{base}?{q_clean}" if q_clean else base

        source_ip = "unknown"
        if hasattr(flow, "client_conn") and flow.client_conn and flow.client_conn.peername:
            source_ip = flow.client_conn.peername[0]

        user_agent = ""
        if hasattr(flow, "request") and flow.request and "User-Agent" in flow.request.headers:
            user_agent = flow.request.headers.get("User-Agent", "")[:200]

        req_method = flow.request.method if hasattr(flow, "request") and hasattr(flow.request, "method") else "POST"

        event = {
            "source_ip": source_ip,
            "user_agent": user_agent,
            "ai_service": matched_service,
            "request_method": req_method,
            "request_path": req_path[:500],
            "risk_score": risk["score"],
            "severity": (
                "critical" if risk["score"] > 70
                else "high" if risk["score"] > 50
                else "medium" if risk["score"] > 30
                else "low" if risk["score"] > 10
                else "clean"
            ),
            "phi_detected": phi_result["phi_detected"],
            "phi_count": phi_result["phi_count"],
            "phi_types": phi_result.get("entity_types_found", []),
            "phi_findings": phi_result.get("findings", []),
            "original_text": readable_body[:2000],
            "redacted_text": phi_result.get("redacted_text", "")[:2000] if phi_result["phi_detected"] else None,
            "action": action,
            "engine": phi_result.get("engine", "sovereign_core"),
            "department": phi_result.get("department", "OPD / General Medicine"),
            "rehydration_map": phi_result.get("rehydration_map", {}),
            "clinical_terms_preserved": phi_result.get("clinical_terms_preserved", []),
        }

        def _send():
            try:
                data = json.dumps(event).encode("utf-8")
                req = urllib.request.Request(
                    BACKEND_URL,
                    data=data,
                    headers={"Content-Type": "application/json"},
                )
                opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
                resp = opener.open(req, timeout=5)
                print(f"[MediCloak] 📡 Logged event to Dashboard Backend (HTTP {resp.status})", flush=True)
            except Exception as e:
                print(f"[MediCloak Backend Post Error]: {e}", flush=True)

        threading.Thread(target=_send, daemon=True).start()

    def _sanitize_json_recursive(self, obj):
        """
        Recursively traverse and sanitize any JSON payload (dict, list, or nested).
        Returns (new_obj, modified, all_findings, all_rehydration, all_preserved, original_snippets, redacted_snippets)
        """
        modified = False
        all_findings = []
        all_rehydration = {}
        all_preserved = set()
        user_snippets = []
        red_snippets = []

        if isinstance(obj, dict):
            new_dict = {}
            for k, v in obj.items():
                res_v, mod_v, f_v, r_v, p_v, s_v, rsnip_v = self._sanitize_json_recursive(v)
                new_dict[k] = res_v
                if mod_v:
                    modified = True
                all_findings.extend(f_v)
                all_rehydration.update(r_v)
                all_preserved.update(p_v)
                if s_v:
                    user_snippets.extend(s_v if isinstance(s_v, list) else [s_v])
                if rsnip_v:
                    red_snippets.extend(rsnip_v if isinstance(rsnip_v, list) else [rsnip_v])
            return new_dict, modified, all_findings, all_rehydration, list(all_preserved), user_snippets, red_snippets

        elif isinstance(obj, list):
            new_list = []
            for item in obj:
                res_i, mod_i, f_i, r_i, p_i, s_i, rsnip_i = self._sanitize_json_recursive(item)
                new_list.append(res_i)
                if mod_i:
                    modified = True
                all_findings.extend(f_i)
                all_rehydration.update(r_i)
                all_preserved.update(p_i)
                if s_i:
                    user_snippets.extend(s_i if isinstance(s_i, list) else [s_i])
                if rsnip_i:
                    red_snippets.extend(rsnip_i if isinstance(rsnip_i, list) else [rsnip_i])
            return new_list, modified, all_findings, all_rehydration, list(all_preserved), user_snippets, red_snippets

        elif isinstance(obj, str):
            clean_str = obj.strip()
            # Only scan candidate user strings (longer than 5 chars, not pure URLs, hashes, or CSS/SVG)
            if (
                len(clean_str) >= 5
                and not clean_str.startswith(("http://", "https://", "data:image", "eyJh"))
                and not clean_str.endswith(STATIC_EXTENSIONS)
            ):
                phi_res = self.redactor.analyze_and_redact(obj)
                if phi_res.get("phi_detected"):
                    return (
                        phi_res["redacted_text"],
                        True,
                        phi_res["findings"],
                        phi_res.get("rehydration_map", {}),
                        phi_res.get("clinical_terms_preserved", []),
                        [obj],
                        [phi_res["redacted_text"]]
                    )
            return obj, False, [], {}, [], [], []

        return obj, False, [], {}, [], [], []

    def sanitize_payload(self, raw_body: str):
        """
        Universally sanitize any AI payload (Socket.IO, Gemini f.req, ChatGPT form, JSON, or plain text).
        Returns (sanitized_body, modified, phi_result, user_prompt_snippet)
        """
        if not raw_body or not raw_body.strip():
            return raw_body, False, None, ""

        # 1. Google Gemini Web App (f.req URL-encoded batchexecute RPC)
        if "f.req=" in raw_body or ("f.req%3D" in raw_body):
            try:
                params = urllib.parse.parse_qs(raw_body, keep_blank_values=True)
                if "f.req" in params:
                    parsed = json.loads(params["f.req"][0])
                    if isinstance(parsed, list) and len(parsed) > 1 and isinstance(parsed[1], str):
                        inner = json.loads(parsed[1])
                        if isinstance(inner, list) and len(inner) > 0 and isinstance(inner[0], list):
                            prompt = inner[0][0]
                            phi_res = self.redactor.analyze_and_redact(prompt)
                            if phi_res.get("phi_detected"):
                                inner[0][0] = phi_res["redacted_text"]
                                parsed[1] = json.dumps(inner)
                                params["f.req"] = [json.dumps(parsed)]
                                return urllib.parse.urlencode(params, doseq=True), True, phi_res, prompt
            except Exception:
                pass

        # 2. Modern ChatGPT Web App (conversationState URL-encoded form)
        if "conversationState=" in raw_body:
            try:
                params = urllib.parse.parse_qs(raw_body, keep_blank_values=True)
                if "conversationState" in params:
                    inner = json.loads(params["conversationState"][0])
                    san_inner, mod, f, r, p, s, r_snips = self._sanitize_json_recursive(inner)
                    if mod:
                        params["conversationState"] = [json.dumps(san_inner)]
                        user_str = "\n".join(s) if s else ""
                        red_str = "\n".join(r_snips) if r_snips else ""
                        phi_res = {
                            "phi_detected": True,
                            "phi_count": len(f),
                            "entity_types_found": list({item.get("entity_type") for item in f if item.get("entity_type")}),
                            "findings": f,
                            "rehydration_map": r,
                            "clinical_terms_preserved": p,
                            "department": classify_department(user_str),
                            "engine": "sovereign_core",
                            "redacted_text": red_str,
                        }
                        return urllib.parse.urlencode(params, doseq=True), True, phi_res, user_str
            except Exception:
                pass

        # 3. Socket.IO Packet (Perplexity AI / Quora Poe: 42["event", ...], 420[...], 40[...])
        sio_match = re.match(r"^(\d+)(\[.*\])$", raw_body.strip(), re.DOTALL)
        if sio_match:
            try:
                prefix, json_str = sio_match.group(1), sio_match.group(2)
                parsed_sio = json.loads(json_str)
                san_sio, mod, f, r, p, s, r_snips = self._sanitize_json_recursive(parsed_sio)
                if mod:
                    user_str = "\n".join(s) if s else ""
                    red_str = "\n".join(r_snips) if r_snips else ""
                    phi_res = {
                        "phi_detected": True,
                        "phi_count": len(f),
                        "entity_types_found": list({item.get("entity_type") for item in f if item.get("entity_type")}),
                        "findings": f,
                        "rehydration_map": r,
                        "clinical_terms_preserved": p,
                        "department": classify_department(user_str),
                        "engine": "sovereign_core",
                        "redacted_text": red_str,
                    }
                    return prefix + json.dumps(san_sio), True, phi_res, user_str
            except Exception:
                pass

        # 4. Standard JSON Payload (ChatGPT, Claude, Gemini API, DeepSeek, Perplexity REST, Glass Health, Nabla, etc.)
        if raw_body.strip().startswith(("{", "[")):
            try:
                parsed_json = json.loads(raw_body)
                san_json, mod, f, r, p, s, r_snips = self._sanitize_json_recursive(parsed_json)
                if mod:
                    user_str = "\n".join(s) if s else ""
                    red_str = "\n".join(r_snips) if r_snips else ""
                    phi_res = {
                        "phi_detected": True,
                        "phi_count": len(f),
                        "entity_types_found": list({item.get("entity_type") for item in f if item.get("entity_type")}),
                        "findings": f,
                        "rehydration_map": r,
                        "clinical_terms_preserved": p,
                        "department": classify_department(user_str),
                        "engine": "sovereign_core",
                        "redacted_text": red_str,
                    }
                    return json.dumps(san_json), True, phi_res, user_str
            except Exception:
                pass

        # 5. Generic URL-encoded Form
        if "=" in raw_body and not raw_body.strip().startswith(("{", "[")):
            try:
                params = urllib.parse.parse_qs(raw_body, keep_blank_values=True)
                san_params, mod, f, r, p, s, r_snips = self._sanitize_json_recursive(params)
                if mod:
                    user_str = "\n".join(s) if s else ""
                    red_str = "\n".join(r_snips) if r_snips else ""
                    phi_res = {
                        "phi_detected": True,
                        "phi_count": len(f),
                        "entity_types_found": list({item.get("entity_type") for item in f if item.get("entity_type")}),
                        "findings": f,
                        "rehydration_map": r,
                        "clinical_terms_preserved": p,
                        "department": classify_department(user_str),
                        "engine": "sovereign_core",
                        "redacted_text": red_str,
                    }
                    return urllib.parse.urlencode(san_params, doseq=True), True, phi_res, user_str
            except Exception:
                pass

        # 6. Plain Text / Raw Prompt
        raw_s = raw_body.strip()
        if (
            raw_s.startswith(("gAAAAA", "eyJh", "Asia/", "Europe/", "America/"))
            or (" " not in raw_s and len(raw_s) > 25)
            or len(raw_s) < 5
        ):
            return raw_body, False, None, ""

        phi_res = self.redactor.analyze_and_redact(raw_body)
        if phi_res.get("phi_detected"):
            return phi_res["redacted_text"], True, phi_res, raw_body

        return raw_body, False, None, ""

    def request(self, flow: mitmproxy.http.HTTPFlow):
        """Intercept outbound HTTP/HTTPS requests to AI platforms."""
        host = flow.request.pretty_host
        matched_service = self._match_service(host)
        if not matched_service:
            return

        # Strip marketing UTM tracking parameters
        try:
            if flow.request.query:
                for k in list(flow.request.query.keys()):
                    if k.lower().startswith("utm_"):
                        del flow.request.query[k]
        except Exception:
            pass

        # Only inspect data submission methods
        if flow.request.method not in ("POST", "PUT", "PATCH"):
            return

        path = flow.request.path.lower()
        if any(path.endswith(ext) for ext in STATIC_EXTENSIONS):
            return
        if any(ignore in path for ignore in IGNORE_PATHS):
            return

        # Explicit filter for ChatGPT internal telemetry & handshake endpoints
        if matched_service == "ChatGPT":
            if not any(cp in path for cp in ("/conversation", "/v1/chat/completions")):
                return
            if any(bad in path for bad in ("/prepare", "/sentinel", "/chat-requirements", "/models", "/settings", "/accounts")):
                return

        try:
            flow.request.decode()
        except Exception:
            pass

        raw_body = flow.request.get_text() or ""
        if not raw_body.strip() or len(raw_body.strip()) < 5:
            return

        # Ignore background client & browser telemetry payloads
        raw_lower = raw_body.lower()
        if any(marker in raw_lower for marker in TELEMETRY_MARKERS):
            return

        sanitized_body, modified, phi_result, user_snippet = self.sanitize_payload(raw_body)

        # Deduplication check (3.0 seconds window per prompt snippet) - Ensures 1 single event on Dashboard
        now = time.time()
        self._recent_events = {k: v for k, v in self._recent_events.items() if (now - v) < 8.0}
        prompt_snippet = (user_snippet or raw_body).strip()[:100]
        cache_key = f"{matched_service}:{prompt_snippet}"
        if cache_key in self._recent_events and (now - self._recent_events[cache_key]) < 3.0:
            if modified and phi_result and phi_result.get("phi_detected"):
                flow.request.set_text(sanitized_body)
                if flow.request.raw_content:
                    flow.request.headers["Content-Length"] = str(len(flow.request.raw_content))
                flow.request.headers.pop("Content-Encoding", None)
                flow.request.headers["X-MediCloak"] = "redacted"
            return
        self._recent_events[cache_key] = now

        risk = score_risk(user_snippet or raw_body, matched_service, flow.request.method)

        if modified and phi_result and phi_result.get("phi_detected"):
            flow.request.set_text(sanitized_body)
            if flow.request.raw_content:
                flow.request.headers["Content-Length"] = str(len(flow.request.raw_content))
            flow.request.headers.pop("Content-Encoding", None)
            flow.request.headers["X-MediCloak"] = "redacted"

            risk["phi_detected"] = True
            risk["phi_count"] = phi_result["phi_count"]
            risk["phi_findings"] = {f["entity_type"]: 1 for f in phi_result.get("findings", [])}
            risk["score"] = min(risk["score"] + len(phi_result.get("entity_types_found", [])) * 12, 100)

            print_event(flow, matched_service, risk, user_snippet or raw_body)
            print_redaction_box(phi_result, sanitized_body)

            self._post_event(
                flow=flow,
                matched_service=matched_service,
                risk=risk,
                phi_result=phi_result,
                readable_body=user_snippet or raw_body,
                action="redacted",
                request_path=flow.request.path
            )

    def websocket_message(self, flow: mitmproxy.http.HTTPFlow):
        """
        Intercept real-time WebSocket traffic (Perplexity AI, Quora Poe, Streaming LLMs).
        Rewrites WebSocket text frames on the wire in real time.
        """
        host = flow.request.pretty_host
        matched_service = self._match_service(host)
        if not matched_service:
            return

        if not hasattr(flow, "websocket") or not flow.websocket or not flow.websocket.messages:
            return

        message = flow.websocket.messages[-1]
        # Only inspect messages sent from the client/browser to the AI service
        if not message.from_client:
            return

        raw_text = message.text if (hasattr(message, "text") and message.text) else ""
        if not raw_text and message.content:
            try:
                raw_text = message.content.decode("utf-8", "ignore")
            except Exception:
                return

        if not raw_text or len(raw_text.strip()) < 5:
            return

        sanitized_text, modified, phi_result, user_snippet = self.sanitize_payload(raw_text)

        if modified and phi_result and phi_result.get("phi_detected"):
            # Rewrite WebSocket frame payload before transmission
            if hasattr(message, "text") and message.is_text:
                message.text = sanitized_text
            else:
                message.content = sanitized_text.encode("utf-8")

            risk = score_risk(user_snippet or raw_text, matched_service, "WS")
            risk["phi_detected"] = True
            risk["phi_count"] = phi_result["phi_count"]
            risk["phi_findings"] = {f["entity_type"]: 1 for f in phi_result.get("findings", [])}
            risk["score"] = min(risk["score"] + len(phi_result.get("entity_types_found", [])) * 12, 100)

            print_event(flow, matched_service + " (WebSocket)", risk, user_snippet or raw_text)
            print_redaction_box(phi_result, sanitized_text)

            self._post_event(
                flow=flow,
                matched_service=matched_service,
                risk=risk,
                phi_result=phi_result,
                readable_body=user_snippet or raw_text,
                action="redacted",
                request_path=f"ws://{host}{flow.request.path}"
            )

    def response(self, flow: mitmproxy.http.HTTPFlow):
        """Pass through upstream responses cleanly."""
        sg_header = flow.request.headers.get("X-MediCloak", "")
        if sg_header:
            status = flow.response.status_code if flow.response else "no response"
            print(f"  ← {BOLD}Response from {flow.request.pretty_host}: {status}{RESET}")


addons = [MediCloak()]
