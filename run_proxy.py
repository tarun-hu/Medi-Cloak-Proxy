import sys
import os

# Set UTF-8 encoding on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)
        sys.stderr.reconfigure(encoding="utf-8", line_buffering=True)
    except Exception:
        pass

from mitmproxy.tools.main import mitmdump

if __name__ == "__main__":
    sys.argv = [
        "mitmdump",
        "-s", "medicloak_addon.py",
        "--listen-port", "8080",
        "--ssl-insecure",                  # Accept upstream server certs without verification
        "--set", "block_global=false",     # Allow connections to all hosts
    ]
    print("==================================================")
    print("🛡️  MediCloak Interceptor Proxy Starting...")
    print("👉 Listening on: http://localhost:8080")
    print("👉 HTTPS interception enabled (ssl-insecure mode)")
    print("👉 Web Traffic (ChatGPT/Claude/Gemini/Perplexity) will be intercepted")
    print("==================================================")
    mitmdump()
