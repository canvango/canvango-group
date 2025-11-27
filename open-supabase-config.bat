@echo off
echo.
echo ========================================
echo   Supabase Configuration Quick Access
echo ========================================
echo.
echo Opening Supabase Dashboard pages...
echo.

REM Main Dashboard
start "" "https://supabase.com/dashboard/project/gpittnsfzgkdbqnccncn"
timeout /t 2 /nobreak >nul

REM URL Configuration
echo [1/4] Opening URL Configuration...
start "" "https://supabase.com/dashboard/project/gpittnsfzgkdbqnccncn/auth/url-configuration"
timeout /t 2 /nobreak >nul

REM Email Templates
echo [2/4] Opening Email Templates...
start "" "https://supabase.com/dashboard/project/gpittnsfzgkdbqnccncn/auth/templates"
timeout /t 2 /nobreak >nul

REM Auth Settings
echo [3/4] Opening Auth Settings...
start "" "https://supabase.com/dashboard/project/gpittnsfzgkdbqnccncn/settings/auth"
timeout /t 2 /nobreak >nul

REM Auth Logs
echo [4/4] Opening Auth Logs...
start "" "https://supabase.com/dashboard/project/gpittnsfzgkdbqnccncn/logs/auth-logs"

echo.
echo ========================================
echo   All pages opened in your browser!
echo ========================================
echo.
echo Next steps:
echo 1. Configure Site URL: http://localhost:5173
echo 2. Add Redirect URLs
echo 3. Update Email Template
echo 4. Test the feature
echo.
echo See SUPABASE_CONFIG_CHECKLIST.md for details
echo.
pause
