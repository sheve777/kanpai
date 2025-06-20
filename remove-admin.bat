@echo off
echo ========================================
echo Remove Admin Dashboard from Production
echo ========================================

set VPS_USER=ubuntu
set VPS_IP=133.125.41.193

echo [1/5] Stopping admin container...
ssh %VPS_USER%@%VPS_IP% "docker stop kanpai_admin 2>/dev/null || true"

echo [2/5] Removing admin container...
ssh %VPS_USER%@%VPS_IP% "docker rm kanpai_admin 2>/dev/null || true"

echo [3/5] Removing admin files...
ssh %VPS_USER%@%VPS_IP% "rm -rf ~/kanpai/admin/dist"

echo [4/5] Updating nginx configuration to remove admin subdomain...
ssh %VPS_USER%@%VPS_IP% "sed -i '/admin\.kanpai-plus\.jp/,/^$/d' ~/kanpai/nginx.conf"

echo [5/5] Restarting nginx...
ssh %VPS_USER%@%VPS_IP% "docker restart kanpai_nginx"

echo.
echo ========================================
echo Admin dashboard removed from production!
echo Access admin only from local environment
echo ========================================
pause