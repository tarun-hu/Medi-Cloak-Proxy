@echo off
title MediCloak Sovereign Healthcare Suite Launcher
color 0b

echo =====================================================================
echo   __  __          _ _  _____ _             _    
echo  ^|  \/  ^|        ^| (_^) / ____^| ^|           ^| ^|   
echo  ^| \  / ^| ___  __^| ^|_ ^| ^|    ^| ^| ___   __ _^| ^| __
echo  ^| ^|\/^| ^|/ _ \/ _` ^| ^| ^| ^|    ^| ^|/ _ \ / _` ^| ^|/ /
echo  ^| ^|  ^| ^|  __/ (_^| ^| ^| ^| ^|____^| ^| (_^) ^| (_^| ^|   ^< 
echo  ^|_^|  ^|_^|\___^|\__,_^|_^|_^|\_____^|_^|\___/ \__,_^|_^|\_\
echo.
echo   THE SOVEREIGN HEALTHCARE COMPLIANCE ADD-ON SUITE (DPDP ACT 2023)
echo =====================================================================
echo.

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo [1/4] Starting MediCloak FastAPI Backend on Port 8000...
start "MediCloak-Backend" cmd /k "cd /d %SCRIPT_DIR%backend && title MediCloak-Backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"
timeout /t 3 /nobreak >nul

echo [2/4] Starting MediCloak Sovereign Interceptor Proxy on Port 8080...
start "MediCloak-Proxy" cmd /k "cd /d %SCRIPT_DIR% && title MediCloak-Proxy && python run_proxy.py"
timeout /t 2 /nobreak >nul

echo [3/4] Starting React Governance Dashboard on Port 3000...
start "MediCloak-Dashboard" cmd /k "cd /d %SCRIPT_DIR%dashboard && title MediCloak-Dashboard && npm run dev"
timeout /t 3 /nobreak >nul

echo [4/4] Launching Proxied Brave Browser & Compliance Dashboard...
echo -> Opening ChatGPT via MediCloak Proxy (127.0.0.1:8080, QUIC Disabled)...
start "" "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe" --proxy-server="127.0.0.1:8080" --disable-quic --user-data-dir="%TEMP%\medicloak_brave" --ignore-certificate-errors https://chatgpt.com

timeout /t 2 /nobreak >nul
echo -> Opening MediCloak Live Dashboard (http://localhost:3000)...
start "" http://localhost:3000

echo.
echo =====================================================================
echo   ALL SYSTEMS LIVE AND SOVEREIGN COMPLIANT!
echo   * Backend API:        http://127.0.0.1:8000/docs
echo   * Mitmproxy Gateway:  http://127.0.0.1:8080
echo   * Dashboard:          http://localhost:3000
echo   * Proxied Browser:    Brave with --disable-quic active
echo.
echo   To cleanly shut down all services, run: stop_medicloak_demo.bat
echo =====================================================================
echo.
pause
