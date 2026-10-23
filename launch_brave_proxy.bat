@echo off
echo ========================================================
echo [MediCloak] Launching Brave Browser with Proxy...
echo Proxy: http://localhost:8080
echo ========================================================

start "" "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe" --proxy-server="127.0.0.1:8080" --disable-quic --user-data-dir="%TEMP%\medicloak_brave" --ignore-certificate-errors

