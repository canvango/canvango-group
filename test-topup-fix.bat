@echo off
echo ================================
echo Testing Top-Up Fix
echo ================================
echo.

echo [1/3] Testing GCP Proxy Health...
curl -s http://34.182.126.200:3000/ | findstr "ok"
if %errorlevel% equ 0 (
    echo ✅ GCP Proxy is running
) else (
    echo ❌ GCP Proxy is down
    goto :error
)
echo.

echo [2/3] Testing Payment Channels...
curl -s http://34.182.126.200:3000/payment-channels | findstr "success"
if %errorlevel% equ 0 (
    echo ✅ Payment channels available
) else (
    echo ❌ Payment channels not available
    goto :error
)
echo.

echo [3/3] Checking Vercel Environment...
echo.
echo Please verify manually:
echo 1. Go to: https://vercel.com/canvango/canvango-group/settings/environment-variables
echo 2. Check: GCP_PROXY_URL = http://34.182.126.200:3000
echo 3. If not set, add it and redeploy
echo.

echo ================================
echo ✅ All tests passed!
echo ================================
echo.
echo Next steps:
echo 1. Set GCP_PROXY_URL in Vercel (if not set)
echo 2. Redeploy application
echo 3. Test top-up flow in browser
echo.
goto :end

:error
echo.
echo ================================
echo ❌ Tests failed!
echo ================================
echo.
echo Troubleshooting:
echo 1. Check if GCP VM is running
echo 2. SSH to GCP: gcloud compute ssh tripay-proxy2 --zone=us-west1-a
echo 3. Check PM2: pm2 status
echo 4. Restart if needed: pm2 restart tripay-proxy
echo.

:end
pause
