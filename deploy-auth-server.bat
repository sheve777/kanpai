@echo off
echo ========================================
echo Deploy Authentication Server
echo ========================================

set VPS_USER=ubuntu
set VPS_IP=133.125.41.193

echo [1/4] Copying auth server to VPS...
scp /tmp/auth-server.js %VPS_USER%@%VPS_IP%:/tmp/auth-server.js

echo.
echo [2/4] Stopping current backend...
ssh %VPS_USER%@%VPS_IP% "docker stop kanpai_backend && docker rm kanpai_backend"

echo.
echo [3/4] Starting new backend with authentication...
ssh %VPS_USER%@%VPS_IP% "docker run -d --name kanpai_backend --network kanpai_net -v /tmp/auth-server.js:/app/server.js node:18-alpine node /app/server.js"

echo.
echo [4/4] Testing authentication...
timeout /t 5 /nobreak >nul
ssh %VPS_USER%@%VPS_IP% "curl -k -s -X POST https://localhost/api/auth/login -H 'Content-Type: application/json' -d '{\"storeId\":\"local-store-1750425531728\",\"password\":\"local-store-1750425531728123\"}'"

echo.
echo ========================================
echo Authentication server deployed!
echo Test login at: https://kanpai-plus.jp
echo Store ID: local-store-1750425531728
echo Password: local-store-1750425531728123
echo ========================================
pause