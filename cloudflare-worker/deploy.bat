@echo off
echo ========================================
echo Cloudflare Worker Deployment
echo ========================================
echo.

echo Select deployment environment:
echo 1. Staging
echo 2. Production
echo 3. Cancel
echo.
set /p choice="Enter choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo Deploying to STAGING...
    call npm run deploy:staging
    if errorlevel 1 (
        echo.
        echo ❌ Deployment failed
        pause
        exit /b 1
    )
    echo.
    echo ✅ Deployed to staging successfully!
    echo.
    echo Next steps:
    echo 1. Set environment variables in Cloudflare Dashboard
    echo 2. Test the worker URL
    echo 3. Update frontend .env with worker URL
    echo.
) else if "%choice%"=="2" (
    echo.
    echo ⚠️  WARNING: You are about to deploy to PRODUCTION
    set /p confirm="Are you sure? (yes/no): "
    if /i "%confirm%"=="yes" (
        echo.
        echo Deploying to PRODUCTION...
        call npm run deploy:production
        if errorlevel 1 (
            echo.
            echo ❌ Deployment failed
            pause
            exit /b 1
        )
        echo.
        echo ✅ Deployed to production successfully!
        echo.
        echo Next steps:
        echo 1. Set environment variables in Cloudflare Dashboard
        echo 2. Test the worker URL
        echo 3. Update frontend .env.production with worker URL
        echo 4. Deploy frontend
        echo.
    ) else (
        echo Deployment cancelled
    )
) else if "%choice%"=="3" (
    echo Deployment cancelled
) else (
    echo Invalid choice
)

pause
