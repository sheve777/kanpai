@echo off
echo =============================================
echo kanpAI Admin Dashboard Startup Script
echo =============================================
echo.

REM Move to admin directory
cd /d "%~dp0admin"

REM Check if directory exists
if not exist "package.json" (
    echo Error: admin/package.json not found
    echo Please check if admin dashboard is properly set up
    pause
    exit /b 1
)

echo Starting admin dashboard...
echo URL: http://localhost:3001
echo.
echo Login credentials:
echo   Username: admin
echo   Password: admin123
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start development server
npm run dev

pause