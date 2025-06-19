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

:: VPS operations - Updated for individual containers
ssh %VPS_USER%@%VPS_IP% "cd ~/kanpai && git pull && echo 'Code updated!'"
if %ERRORLEVEL% neq 0 (
    echo [ERROR] SSH connection or git pull failed
    pause
    exit /b 1
)

echo.
echo [3/4] Which service to restart?
echo 1. Backend only
echo 2. Frontend only
echo 3. Admin only
echo 4. Nginx only
echo 5. All services
echo 0. Skip restart
echo.
set /p RESTART_CHOICE="Enter your choice (0-5): "

if "%RESTART_CHOICE%"=="1" (
    ssh %VPS_USER%@%VPS_IP% "docker restart kanpai_backend && echo 'Backend restarted!'"
) else if "%RESTART_CHOICE%"=="2" (
    ssh %VPS_USER%@%VPS_IP% "docker restart kanpai_frontend && echo 'Frontend restarted!'"
) else if "%RESTART_CHOICE%"=="3" (
    ssh %VPS_USER%@%VPS_IP% "docker restart kanpai_admin && echo 'Admin restarted!'"
) else if "%RESTART_CHOICE%"=="4" (
    ssh %VPS_USER%@%VPS_IP% "docker restart kanpai_nginx && echo 'Nginx restarted!'"
) else if "%RESTART_CHOICE%"=="5" (
    ssh %VPS_USER%@%VPS_IP% "docker restart kanpai_backend kanpai_frontend kanpai_admin kanpai_nginx && echo 'All services restarted!'"
) else (
    echo Skipping restart...
)

echo.
echo [4/4] Deploy complete!
echo ========================================
echo URLs:
echo - Main: https://kanpai-plus.jp
echo - Admin: https://admin.kanpai-plus.jp
echo - API: https://kanpai-plus.jp/api/health
echo ========================================
echo.
pause