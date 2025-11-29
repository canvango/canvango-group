@echo off
echo ========================================
echo Cloudflare Worker Setup - Tripay Proxy
echo ========================================
echo.

echo Step 1: Installing dependencies...
call npm install
if errorlevel 1 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

echo Step 2: Checking .dev.vars file...
if not exist .dev.vars (
    echo Creating .dev.vars template...
    (
        echo TRIPAY_API_KEY=DEV-xxxxxxxxxxxxx
        echo TRIPAY_PRIVATE_KEY=xxxxx-xxxxx-xxxxx-xxxxx-xxxxx
        echo TRIPAY_MERCHANT_CODE=T0000
        echo ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
    ) > .dev.vars
    echo ✓ .dev.vars created - PLEASE UPDATE WITH YOUR CREDENTIALS
    echo.
    echo ⚠️  IMPORTANT: Edit .dev.vars with your Tripay credentials before continuing
    pause
) else (
    echo ✓ .dev.vars already exists
)
echo.

echo Step 3: Checking Wrangler installation...
where wrangler >nul 2>&1
if errorlevel 1 (
    echo Wrangler not found. Installing globally...
    call npm install -g wrangler
    if errorlevel 1 (
        echo Error: Failed to install Wrangler
        pause
        exit /b 1
    )
    echo ✓ Wrangler installed
) else (
    echo ✓ Wrangler already installed
)
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit .dev.vars with your Tripay credentials
echo 2. Run: npm run dev (for local testing)
echo 3. Run: npm run deploy (for production)
echo.
echo For detailed instructions, see CLOUDFLARE_WORKER_DEPLOYMENT_GUIDE.md
echo.
pause
