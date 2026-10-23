@echo off
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyEnable /t REG_DWORD /d 0 /f >nul
echo ========================================================
echo [MediCloak] Windows System Proxy is now DISABLED.
echo Browser traffic direct ho chuka hai.
echo ========================================================
pause
