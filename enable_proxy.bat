@echo off
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyEnable /t REG_DWORD /d 1 /f >nul
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyServer /t REG_SZ /d "127.0.0.1:8080" /f >nul
echo ========================================================
echo [MediCloak] Windows System Proxy is now ENABLED!
echo Address: 127.0.0.1:8080
echo Ab aap kisi bhi browser me direct test kar sakte hain.
echo ========================================================
pause
