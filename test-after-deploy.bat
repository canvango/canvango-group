@echo off
echo ========================================
echo Testing Tripay Callback After Deployment
echo ========================================
echo.
echo Endpoint: https://canvango.com/api/tripay-callback
echo.
echo Waiting 10 seconds for deployment to complete...
timeout /t 10 /nobreak >nul
echo.
echo Testing endpoint...
echo.

curl -X POST https://canvango.com/api/tripay-callback ^
  -H "Content-Type: application/json" ^
  -H "X-Callback-Signature: test-signature" ^
  -H "X-Callback-Event: payment_status" ^
  -d "{\"status\":\"PAID\",\"amount_received\":190000,\"note\":\"Test Callback\"}"

echo.
echo.
echo ========================================
echo Test Complete
echo ========================================
echo.
echo Expected Response:
echo {
echo   "success": true,
echo   "message": "Callback processed (test mode - no database update)"
echo }
echo.
echo If you see HTTP 200 and success:true, the fix is working!
echo.
echo Next: Test in Tripay Dashboard
echo Go to: Pengaturan -^> Callback -^> Test Callback
echo.
pause
