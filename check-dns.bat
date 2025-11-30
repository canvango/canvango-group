@echo off
REM Quick DNS Check Script for canvango.com
REM This script checks if domain is pointing to Vercel/Cloudflare

echo ========================================
echo DNS CHECK - canvango.com
echo ========================================
echo.

echo [1] Checking current IP address...
echo.
nslookup canvango.com
echo.

echo ========================================
echo [2] Checking nameservers...
echo.
nslookup -type=NS canvango.com
echo.

echo ========================================
echo [3] Checking with Google DNS (8.8.8.8)...
echo.
nslookup canvango.com 8.8.8.8
echo.

echo ========================================
echo [4] Checking with Cloudflare DNS (1.1.1.1)...
echo.
nslookup canvango.com 1.1.1.1
echo.

echo ========================================
echo EXPECTED RESULTS:
echo ========================================
echo.
echo Option A (Cloudflare):
echo   IP: 104.xxx.xxx.xxx or 172.xxx.xxx.xxx
echo   NS: ns1.cloudflare.com, ns2.cloudflare.com
echo.
echo Option B (Direct Vercel):
echo   IP: 76.76.21.21
echo   NS: ns1.idwebhost.id, ns2.idwebhost.id
echo.
echo CURRENT (WRONG):
echo   IP: 216.198.79.1 (Parking Server)
echo   NS: ns1.idwebhost.id, ns2.idwebhost.id
echo.
echo ========================================
echo.

pause
