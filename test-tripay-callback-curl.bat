@echo off
REM Test Tripay Callback dengan curl (Windows)
REM Usage: test-tripay-callback-curl.bat

echo === TESTING TRIPAY CALLBACK ===
echo.

REM Sample data
set CALLBACK_URL=https://canvango.com/api/tripay-callback
set MERCHANT_REF=TRX-TEST-%RANDOM%

REM Create JSON payload
set PAYLOAD={"reference":"TEST-%RANDOM%","merchant_ref":"%MERCHANT_REF%","payment_method":"QRIS (Customizable)","payment_method_code":"QRISC","total_amount":15000,"fee_merchant":500,"fee_customer":0,"total_fee":500,"amount_received":14500,"status":"PAID","paid_at":1733097600}

echo URL: %CALLBACK_URL%
echo Merchant Ref: %MERCHANT_REF%
echo.
echo Sending POST request...
echo.

REM Send request (signature will be invalid, but we test HTTP status)
curl -X POST %CALLBACK_URL% ^
  -H "Content-Type: application/json" ^
  -H "X-Callback-Signature: test-signature-12345" ^
  -H "X-Callback-Event: payment_status" ^
  -H "User-Agent: TriPay Payment/1.0 (+https://tripay.co.id/developer?tab=callback)" ^
  -d "%PAYLOAD%" ^
  -v

echo.
echo.
echo === TEST COMPLETE ===
echo Check the response above:
echo - HTTP 200 = SUCCESS
echo - HTTP 307 = REDIRECT (PROBLEM)
echo - HTTP 405 = METHOD NOT ALLOWED
pause
