@echo off
echo ========================================
echo Check Backend Container Status
echo ========================================

set VPS_USER=ubuntu
set VPS_IP=133.125.41.193

echo [1/3] Checking containers...
ssh %VPS_USER%@%VPS_IP% "docker ps | grep kanpai"

echo.
echo [2/3] Checking backend image...
ssh %VPS_USER%@%VPS_IP% "docker inspect kanpai_backend --format='{{.Config.Image}}'"

echo.
echo [3/3] Checking backend command...
ssh %VPS_USER%@%VPS_IP% "docker inspect kanpai_backend --format='{{.Config.Cmd}}'"

echo.
echo ========================================
pause