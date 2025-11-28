@echo off
REM Tripay Integration Deployment Script for Windows
REM This script deploys the Tripay Edge Function to Supabase

echo.
echo ========================================
echo   Tripay Integration Deployment
echo ========================================
echo.

REM Check if Supabase CLI is installed
where supabase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Supabase CLI not found!
    echo [INFO] Installing Supabase CLI...
    npm install -g supabase
)

echo [OK] Supabase CLI found
echo.

REM Check if logged in
echo [INFO] Checking Supabase login...
supabase projects list >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Not logged in to Supabase
    echo [INFO] Please login...
    supabase login
)

echo [OK] Logged in to Supabase
echo.

REM Link project
echo [INFO] Linking to project...
supabase link --project-ref gpittnsfzgkdbqnccncn

echo [OK] Project linked
echo.

REM Deploy Edge Function
echo [INFO] Deploying Edge Function...
supabase functions deploy tripay-callback

echo [OK] Edge Function deployed
echo.

REM Set secrets
echo [INFO] Setting environment variables...
supabase secrets set TRIPAY_PRIVATE_KEY=BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz

echo [OK] Secrets configured
echo.

REM Show summary
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Edge Function URL:
echo   https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback
echo.
echo Next Steps:
echo   1. Configure Tripay Dashboard:
echo      - Login to https://tripay.co.id/member
echo      - Set Callback URL to the URL above
echo      - Enable callback for all payment methods
echo.
echo   2. Test the integration:
echo      npm run dev
echo      - Login as member
echo      - Go to Top-Up page
echo      - Test payment flow
echo.
echo   3. Monitor logs:
echo      supabase functions logs tripay-callback --tail
echo.
echo ========================================
echo.

pause
