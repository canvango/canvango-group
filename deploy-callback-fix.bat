@echo off
echo ========================================
echo Deploying Tripay Callback Fix
echo ========================================
echo.

echo Step 1: Adding files to git...
git add api/tripay-callback.ts
git add TRIPAY_CALLBACK_FIX_500.md
git add DEPLOY_TRIPAY_CALLBACK_FIX.md
git add TRIPAY_CALLBACK_FINAL_FIX.md
git add test-callback-safe.js
git add deploy-callback-fix.bat

echo.
echo Step 2: Committing changes...
git commit -m "fix: prevent FUNCTION_INVOCATION_FAILED in Tripay callback - Move env var checks inside handler - Add graceful handling for missing env vars - Add guard for test callbacks without merchant_ref - Always return HTTP 200 OK to Tripay"

echo.
echo Step 3: Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo Deployment initiated!
echo ========================================
echo.
echo Vercel will auto-deploy in 1-2 minutes
echo.
echo Next steps:
echo 1. Wait for Vercel deployment to complete
echo 2. Test callback at Tripay Dashboard
echo 3. Check Vercel logs for confirmation
echo.
echo Test URL: https://canvango.com/api/tripay-callback
echo.
pause
