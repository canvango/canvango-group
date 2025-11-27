@echo off
echo.
echo ========================================
echo   Test Forgot Password Feature
echo ========================================
echo.
echo Opening test page in browser...
echo.

REM Get current directory
set "CURRENT_DIR=%CD%"

REM Open test HTML file
start "" "%CURRENT_DIR%\test-forgot-password.html"

echo.
echo Test page opened!
echo.
echo Instructions:
echo 1. Select a test user email
echo 2. Click "Send Reset Email"
echo 3. Check email inbox (or spam folder)
echo 4. Click reset link in email
echo 5. Set new password
echo 6. Login with new password
echo.
echo Available test users:
echo - member1@gmail.com
echo - member2@gmail.com
echo - admin1@gmail.com
echo - admin2@gmail.com
echo.
pause
