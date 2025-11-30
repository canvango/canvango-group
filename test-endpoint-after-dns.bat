@echo off
REM Test Tripay Callback Endpoint After DNS Fix
REM Run this AFTER DNS is pointing to Vercel

echo ========================================
echo ENDPOINT TEST - After DNS Fix
echo ========================================
echo.

echo [1] Testing root domain...
echo.
curl -v https://canvango.com
echo.
echo.

echo ========================================
echo [2] Testing API endpoint (GET - should fail)...
echo.
curl -v https://canvango.com/api/tripay-callback
echo.
echo.

echo ========================================
echo [3] Testing API endpoint (POST - should work)...
echo.
curl -v -X POST https://canvango.com/api/tripay-callback ^
  -H "Content-Type: application/json" ^
  -H "X-Callback-Signature: test-signature" ^
  -H "X-Callback-Event: payment_status" ^
  -d "{\"test\":true,\"merchant_ref\":\"TEST-123\"}"
echo.
echo.

echo ========================================
echo EXPECTED RESULTS:
echo ========================================
echo.
echo [1] Root domain:
echo   - HTTP/2 200 or 301 redirect to www
echo   - HTML content (your React app)
echo.
echo [2] GET request:
echo   - HTTP/2 200
echo   - JSON: {"success":false,"message":"Method not allowed"}
echo.
echo [3] POST request:
echo   - HTTP/2 200
echo   - JSON: {"success":false,"message":"Invalid signature"}
echo.
echo NOT EXPECTED:
echo   - HTTP/1.1 307 Temporary Redirect
echo   - "Redirecting..."
echo   - Parking page HTML
echo.
echo ========================================
echo.

pause
