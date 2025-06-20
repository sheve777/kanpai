@echo off
echo ========================================
echo Rebuild and Deploy Real Backend
echo ========================================

set VPS_USER=ubuntu
set VPS_IP=133.125.41.193

echo [1/7] Updating code...
ssh %VPS_USER%@%VPS_IP% "cd ~/kanpai && git pull"

echo.
echo [2/7] Stopping old backend...
ssh %VPS_USER%@%VPS_IP% "docker stop kanpai_backend && docker rm kanpai_backend"

echo.
echo [3/7] Building backend image...
ssh %VPS_USER%@%VPS_IP% "cd ~/kanpai/backend && docker build -t kanpai-backend ."

echo.
echo [4/7] Creating .env file if not exists...
ssh %VPS_USER%@%VPS_IP% "cd ~/kanpai/backend && if [ ! -f .env ]; then cp .env.example .env; fi"

echo.
echo [5/7] Starting backend container...
ssh %VPS_USER%@%VPS_IP% "docker run -d --name kanpai_backend --network kanpai_net -p 3002:3002 -v ~/kanpai/backend/.env:/app/.env --env-file ~/kanpai/backend/.env kanpai-backend"

echo.
echo [6/7] Waiting for startup...
timeout /t 10 /nobreak >nul

echo.
echo [7/7] Testing backend...
ssh %VPS_USER%@%VPS_IP% "curl -s http://localhost:3002/api/health"

echo.
echo ========================================
echo Backend rebuild complete!
echo ========================================
pause