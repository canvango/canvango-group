@echo off
echo ========================================
echo Deploying Tripay Create Payment Function
echo ========================================
echo.

echo Setting environment variables...
npx supabase secrets set TRIPAY_API_KEY=DEV-V745Csasrrs04BsIYS5dzwbJZ8wLudy5joxBGq1G
npx supabase secrets set TRIPAY_PRIVATE_KEY=BAo71-gUqRM-1ahAp-Gt8AM-1S71q
npx supabase secrets set TRIPAY_MERCHANT_CODE=T47116
npx supabase secrets set TRIPAY_MODE=sandbox

echo.
echo Deploying function...
npx supabase functions deploy tripay-create-payment --no-verify-jwt

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Function URL:
echo https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-create-payment
echo.
echo Test the function now!
pause
