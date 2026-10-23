#!/bin/bash
# MediCloak - Quick Setup Script
# Run this on your laptop (macOS or Linux)

set -e

echo "🛡️  MediCloak Test Setup"
echo "========================="
echo ""

# Detect OS
OS=$(uname -s)
echo "Detected OS: $OS"

# Step 1: Install mitmproxy
echo ""
echo "📦 Step 1: Installing mitmproxy..."
if command -v mitmdump &> /dev/null; then
    echo "  ✅ mitmproxy already installed: $(mitmdump --version | head -1)"
else
    if [ "$OS" == "Darwin" ]; then
        echo "  Installing via brew..."
        brew install mitmproxy
    else
        echo "  Installing via pip..."
        pip install mitmproxy
    fi
    echo "  ✅ mitmproxy installed"
fi

# Step 2: Install Python dependencies for the addon
echo ""
echo "📦 Step 2: Installing Python dependencies..."
pip install requests 2>/dev/null || pip install requests --break-system-packages 2>/dev/null
echo "  ✅ Dependencies installed"

# Step 3: Generate mitmproxy CA cert (first run creates it)
echo ""
echo "🔐 Step 3: Generating mitmproxy CA certificate..."
# Start and immediately stop mitmdump to generate certs
timeout 2 mitmdump --listen-port 18080 2>/dev/null || true
CERT_DIR="$HOME/.mitmproxy"
if [ -f "$CERT_DIR/mitmproxy-ca-cert.pem" ]; then
    echo "  ✅ CA cert generated at: $CERT_DIR/mitmproxy-ca-cert.pem"
else
    echo "  ⚠️  Cert not found. It'll be generated on first run."
fi

# Step 4: Install CA cert into system trust store
echo ""
echo "🔐 Step 4: Installing CA certificate..."
if [ "$OS" == "Darwin" ]; then
    echo "  On macOS, we'll open Keychain Access."
    echo "  You need to:"
    echo "    1. Double-click the cert to add it"
    echo "    2. Find 'mitmproxy' in Keychain"
    echo "    3. Double-click it → Trust → 'Always Trust'"
    echo ""
    read -p "  Press Enter to open the cert in Keychain Access..."
    open "$CERT_DIR/mitmproxy-ca-cert.pem" 2>/dev/null || echo "  Open manually: $CERT_DIR/mitmproxy-ca-cert.pem"
    echo ""
    echo "  ⚠️  IMPORTANT: After adding, set it to 'Always Trust'!"
    echo "  (Double-click the cert in Keychain → Trust → Always Trust)"
    read -p "  Press Enter once you've trusted the cert..."
elif [ "$OS" == "Linux" ]; then
    echo "  Installing cert system-wide (needs sudo)..."
    sudo cp "$CERT_DIR/mitmproxy-ca-cert.pem" /usr/local/share/ca-certificates/mitmproxy.crt
    sudo update-ca-certificates
    echo "  ✅ CA cert installed system-wide"
fi

# Step 5: Summary
echo ""
echo "========================================="
echo "✅ Setup complete!"
echo ""
echo "To start intercepting:"
echo "  1. Start the proxy:
     mitmdump -s medicloak_addon.py --listen-port 8080"
echo ""
echo "  2. Test with browser (open a new Chrome window):"
echo "     On macOS:"
echo "       open -na 'Google Chrome' --args --proxy-server='http://localhost:8080'"
echo "     On Linux:"
echo "       google-chrome --proxy-server='http://localhost:8080'"
echo ""
echo "  3. Test with terminal:"
echo "     export HTTPS_PROXY=http://localhost:8080"
echo "     export SSL_CERT_FILE=$CERT_DIR/mitmproxy-ca-cert.pem"
echo "     curl https://api.openai.com/v1/models"
echo ""
echo "  4. Or run the test script:"
echo "     python3 test_interception.py"
echo "========================================="