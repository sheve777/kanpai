@echo off
echo ========================================
echo Deploy Code and Rebuild Backend
echo ========================================

set VPS_USER=ubuntu
set VPS_IP=133.125.41.193

echo [1/9] Deploying latest code...
call deploy.bat

echo.
echo [2/9] Stopping old backend...
ssh %VPS_USER%@%VPS_IP% "docker stop kanpai_backend 2>/dev/null || true"
ssh %VPS_USER%@%VPS_IP% "docker rm kanpai_backend 2>/dev/null || true"

echo.
echo [3/9] Building backend image...
ssh %VPS_USER%@%VPS_IP% "cd ~/kanpai/backend && docker build -t kanpai-backend ."

echo.
echo [4/9] Checking environment variables...
ssh %VPS_USER%@%VPS_IP% "cd ~/kanpai/backend && if [ ! -f .env ]; then cp .env.example .env && echo 'Created .env from .env.example'; else echo '.env file exists'; fi"

echo.
echo [5/9] Starting backend container...
ssh %VPS_USER%@%VPS_IP% "docker run -d --name kanpai_backend --network kanpai_net -p 3002:3002 -v ~/kanpai/backend/.env:/app/.env --restart unless-stopped kanpai-backend"

echo.
echo [6/9] Waiting for startup...
timeout /t 15 /nobreak >nul

echo.
echo [7/9] Checking container status...
ssh %VPS_USER%@%VPS_IP% "docker ps | grep kanpai_backend"

echo.
echo [8/9] Testing backend health...
ssh %VPS_USER%@%VPS_IP% "curl -s http://localhost:3002/api/health || echo 'Health check failed'"

echo.
echo [9/9] Restarting nginx...
ssh %VPS_USER%@%VPS_IP% "docker restart kanpai_nginx"

echo.
echo ========================================
echo Backend deployment complete!
echo Test: https://kanpai-plus.jp/api/health
echo ========================================
pause