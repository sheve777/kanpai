@echo off
chcp 65001 >nul
echo ========================================
echo kanpAI Deploy Tool
echo ========================================
echo.

:: Settings
set VPS_USER=ubuntu
set VPS_IP=133.125.41.193
set LOCAL_PATH=C:\Users\acmsh\kanpAI

:: Change directory
echo [INFO] Moving to %LOCAL_PATH%...
cd /d %LOCAL_PATH%
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to change directory
    pause
    exit /b 1
)
echo [INFO] Current directory: %CD%
echo.

:: Check Git
echo [INFO] Checking Git...
where git >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Git not found. Please install Git.
    pause
    exit /b 1
)
echo [INFO] Git OK
echo.

:: Check SSH
echo [INFO] Checking SSH...
where ssh >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] SSH not found.
    pause
    exit /b 1
)
echo [INFO] SSH OK
echo.

:: Git operations
echo [1/4] Checking local changes...
git add .
git status --short

echo.
set /p COMMIT_MSG="Enter commit message (press Enter to skip): "
if "%COMMIT_MSG%"=="" (
    echo Skipping commit...
) else (
    git commit -m "%COMMIT_MSG%"
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Commit failed
        pause
        exit /b 1
    )
    echo Pushing to GitHub...
    git push
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Push failed
        pause
        exit /b 1
    )
)

echo.
echo [2/4] Connecting to VPS and deploying...
echo ========================================

:: VPS operations
ssh %VPS_USER%@%VPS_IP% "cd ~/kanpai && git pull && docker-compose -f docker-compose.prod.yml restart && echo 'Restart complete!'"
if %ERRORLEVEL% neq 0 (
    echo [ERROR] SSH connection or VPS command failed
    echo.
    echo Possible causes:
    echo 1. SSH key not configured
    echo 2. Wrong VPS IP address
    echo 3. Different directory structure on VPS
    pause
    exit /b 1
)

echo.
echo Deploy complete!
echo ========================================
echo URL: https://kanpai-plus.jp
echo ========================================
echo.
pause