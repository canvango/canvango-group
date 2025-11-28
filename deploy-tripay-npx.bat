@echo off
REM Tripay Deployment via NPX (No Installation Required)
REM This uses npx to run Supabase CLI without installing it

echo.
echo ========================================
echo   Tripay Deployment via NPX
echo   (No Installation Required)
echo ========================================
echo.

echo [INFO] This will use NPX to deploy without installing Supabase CLI
echo [INFO] Make sure you have Node.js installed
echo.

pause

echo.
echo [STEP 1/4] Login to Supabase...
echo.
npx supabase@latest login

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Login failed!
    pause
    exit /b 1
)

echo.
echo [OK] Login successful
echo.

echo [STEP 2/4] Linking to project...
echo.
npx supabase@latest link --project-ref gpittnsfzgkdbqnccncn

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Link failed!
    pause
    exit /b 1
)

echo.
echo [OK] Project linked
echo.

echo [STEP 3/4] Deploying Edge Function...
echo.
npx supabase@latest functions deploy tripay-callback

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Deploy failed!
    pause
    exit /b 1
)

echo.
echo [OK] Edge Function deployed
echo.

echo [STEP 4/4] Setting environment variables...
echo.
npx supabase@latest secrets set TRIPAY_PRIVATE_KEY=BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to set secrets!
    pause
    exit /b 1
)

echo.
echo [OK] Secrets configured
echo.

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
echo.
echo   3. View logs:
echo      npx supabase@latest functions logs tripay-callback --tail
echo.
echo ========================================
echo.

pause
