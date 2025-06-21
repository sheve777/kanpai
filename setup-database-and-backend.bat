@echo off
echo ========================================
echo Setup Database and Deploy Real Backend
echo ========================================

set VPS_USER=ubuntu
set VPS_IP=133.125.41.193

echo [1/10] Checking and configuring PostgreSQL...
ssh %VPS_USER%@%VPS_IP% "docker exec kanpai_db psql -U postgres -c \"ALTER USER postgres PASSWORD 'password';\""

echo.
echo [2/10] Creating kanpai database...
ssh %VPS_USER%@%VPS_IP% "docker exec kanpai_db psql -U postgres -c 'DROP DATABASE IF EXISTS kanpai; CREATE DATABASE kanpai;'"

echo.
echo [3/10] Deploying latest code...
call deploy.bat

echo.
echo [4/10] Copying production environment file...
scp backend/.env.production %VPS_USER%@%VPS_IP%:~/kanpai/backend/.env

echo.
echo [5/10] Stopping current backend...
ssh %VPS_USER%@%VPS_IP% "docker stop kanpai_backend 2>/dev/null && docker rm kanpai_backend 2>/dev/null"

echo.
echo [6/10] Building production backend...
ssh %VPS_USER%@%VPS_IP% "cd ~/kanpai/backend && docker build -t kanpai-backend-prod ."

echo.
echo [7/10] Starting production backend with database...
ssh %VPS_USER%@%VPS_IP% "docker run -d --name kanpai_backend --network kanpai_net --env-file ~/kanpai/backend/.env --restart unless-stopped kanpai-backend-prod"

echo.
echo [8/10] Waiting for backend startup...
timeout /t 15 /nobreak >nul

echo.
echo [9/10] Testing backend connection...
ssh %VPS_USER%@%VPS_IP% "curl -s http://localhost:3002/api/health"

echo.
echo [10/10] Container status...
ssh %VPS_USER%@%VPS_IP% "docker ps | grep kanpai"

echo.
echo ========================================
echo Production backend deployment complete!
echo Testing at: https://kanpai-plus.jp/api/health
echo ========================================
pause