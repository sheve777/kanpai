@echo off
echo ========================================
echo Setup Authentication Tables on VPS
echo ========================================

set VPS_USER=ubuntu
set VPS_IP=133.125.41.193

echo [1/4] Checking backend container...
ssh %VPS_USER%@%VPS_IP% "docker ps | grep kanpai_backend"

echo.
echo [2/4] Creating authentication tables...
ssh %VPS_USER%@%VPS_IP% "docker exec kanpai_backend node /app/src/db/create-auth-tables.js"

echo.
echo [3/4] Adding temporary password flag...
ssh %VPS_USER%@%VPS_IP% "docker exec kanpai_backend node /app/src/db/add-temporary-password-flag.js"

echo.
echo [4/4] Restarting backend...
ssh %VPS_USER%@%VPS_IP% "docker restart kanpai_backend"

echo.
echo ========================================
echo Authentication setup complete!
echo ========================================
pause