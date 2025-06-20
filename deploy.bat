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
ssh %VPS_USER%@%VPS_IP% "cd ~/kanpai && git reset --hard HEAD && git pull && echo 'Code updated!'"
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
echo 6. Emergency recovery (sequential start)
echo 7. Check status only
echo 8. Backend logs (troubleshoot)
echo 9. Force backend restart
echo a. Fix npm install (backend)
echo b. Rebuild backend container
echo c. Debug backend interactively
echo 0. Skip restart
echo.
set /p RESTART_CHOICE="Enter your choice (0-9,a,b,c): "

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
) else if "%RESTART_CHOICE%"=="6" (
    ssh %VPS_USER%@%VPS_IP% "docker stop kanpai_nginx kanpai_backend kanpai_frontend kanpai_admin && docker start kanpai_backend && sleep 3 && docker start kanpai_frontend kanpai_admin kanpai_nginx && echo 'Emergency recovery completed!'"
) else if "%RESTART_CHOICE%"=="7" (
    ssh %VPS_USER%@%VPS_IP% "docker ps -a && echo '--- Container Logs ---' && docker logs kanpai_nginx | tail -10"
) else if "%RESTART_CHOICE%"=="8" (
    ssh %VPS_USER%@%VPS_IP% "echo '=== Backend Logs ===' && docker logs kanpai_backend --tail 30"
) else if "%RESTART_CHOICE%"=="9" (
    ssh %VPS_USER%@%VPS_IP% "docker stop kanpai_backend && docker rm kanpai_backend && docker run -d --name kanpai_backend --network kanpai_default -p 3002:3002 node:18-alpine sh -c 'cd /app && npm start' && echo 'Backend force restarted!'"
) else if "%RESTART_CHOICE%"=="a" (
    ssh %VPS_USER%@%VPS_IP% "docker start kanpai_backend && sleep 5 && docker exec kanpai_backend sh -c 'cd /app && npm install' && docker restart kanpai_backend && echo 'NPM install fixed and backend restarted!'"
) else if "%RESTART_CHOICE%"=="b" (
    ssh %VPS_USER%@%VPS_IP% "cd ~/kanpai && docker stop kanpai_backend && docker rm kanpai_backend && docker run -d --name kanpai_backend -v ~/kanpai/backend:/app -w /app -p 3002:3002 node:18-alpine sh -c 'npm install && npm start' && echo 'Backend container rebuilt with fresh install!'"
) else if "%RESTART_CHOICE%"=="c" (
    ssh %VPS_USER%@%VPS_IP% "docker run --rm -it -v ~/kanpai/backend:/app -w /app node:18-alpine sh"
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