@echo off
echo ========================================
echo Debug Login Issue
echo ========================================

set VPS_USER=ubuntu
set VPS_IP=133.125.41.193

echo [1/4] Checking backend logs...
ssh %VPS_USER%@%VPS_IP% "docker logs kanpai_backend | tail -10"

echo.
echo [2/4] Testing login API directly...
ssh %VPS_USER%@%VPS_IP% "curl -s -X POST http://localhost/api/auth/login -H 'Content-Type: application/json' -d '{\"storeId\":\"local-store-1750425531728\",\"password\":\"local-store-1750425531728123\"}'"

echo.
echo [3/4] Testing with demo passwords...
ssh %VPS_USER%@%VPS_IP% "curl -s -X POST http://localhost/api/auth/login -H 'Content-Type: application/json' -d '{\"storeId\":\"local-store-1750425531728\",\"password\":\"kanpai123\"}'"

echo.
echo [4/4] Testing with demo password 'demo'...
ssh %VPS_USER%@%VPS_IP% "curl -s -X POST http://localhost/api/auth/login -H 'Content-Type: application/json' -d '{\"storeId\":\"local-store-1750425531728\",\"password\":\"demo\"}'"

echo.
echo ========================================
echo Debug complete!
echo ========================================
pause