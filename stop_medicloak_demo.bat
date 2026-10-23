@echo off
title Stop MediCloak Services
color 0c

echo ========================================================
echo   [MediCloak] Stopping all MediCloak Suite Services...
echo ========================================================
echo.

echo [1/3] Terminating Port 8000 processes (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /f /pid %%a 2>nul
)

echo [2/3] Terminating Port 8080 processes (Proxy)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    taskkill /f /pid %%a 2>nul
)

echo [3/3] Terminating Port 3000 processes (Dashboard)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /f /pid %%a 2>nul
)

echo.
echo ========================================================
echo   All MediCloak services stopped cleanly.
echo   Ports 8000, 8080, and 3000 are freed.
echo ========================================================
echo.
timeout /t 3
