@echo off
echo ========================================
echo System Diagnosis - Check All Services
echo ========================================

set VPS_USER=ubuntu
set VPS_IP=133.125.41.193

echo [1/8] Checking all containers...
ssh %VPS_USER%@%VPS_IP% "docker ps -a"

echo.
echo [2/8] Checking networks...
ssh %VPS_USER%@%VPS_IP% "docker network ls"

echo.
echo [3/8] Checking kanpai_net network details...
ssh %VPS_USER%@%VPS_IP% "docker network inspect kanpai_net | grep -A 10 Containers"

echo.
echo [4/8] Testing internal connections...
ssh %VPS_USER%@%VPS_IP% "docker exec kanpai_backend curl -s http://localhost:3002/api/health || echo 'Backend internal test failed'"

echo.
echo [5/8] Testing nginx to backend...
ssh %VPS_USER%@%VPS_IP% "docker exec kanpai_nginx curl -s http://kanpai_backend:3002/api/health || echo 'Nginx to backend failed'"

echo.
echo [6/8] Testing external access...
ssh %VPS_USER%@%VPS_IP% "curl -s http://localhost/api/health || echo 'External access failed'"

echo.
echo [7/8] Checking nginx logs...
ssh %VPS_USER%@%VPS_IP% "docker logs kanpai_nginx | tail -5"

echo.
echo [8/8] Checking backend logs...
ssh %VPS_USER%@%VPS_IP% "docker logs kanpai_backend | tail -5"

echo.
echo ========================================
echo Diagnosis complete!
echo ========================================
pause