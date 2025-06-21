@echo off
echo ========================================
echo Test Website Accessibility
echo ========================================

set VPS_USER=ubuntu
set VPS_IP=133.125.41.193

echo [1/6] Testing from VPS localhost...
ssh %VPS_USER%@%VPS_IP% "curl -s http://localhost/api/health"

echo.
echo [2/6] Testing frontend from VPS...
ssh %VPS_USER%@%VPS_IP% "curl -s http://localhost/ | head -5"

echo.
echo [3/6] Testing direct IP access...
ssh %VPS_USER%@%VPS_IP% "curl -s http://133.125.41.193/api/health"

echo.
echo [4/6] Checking SSL certificates...
ssh %VPS_USER%@%VPS_IP% "ls -la /etc/letsencrypt/live/kanpai-plus.jp/ 2>/dev/null || echo 'No SSL certificates found'"

echo.
echo [5/6] Checking if port 443 is open...
ssh %VPS_USER%@%VPS_IP% "ss -tlnp | grep :443 || echo 'Port 443 not listening'"

echo.
echo [6/6] Adding HTTPS support to nginx...
ssh %VPS_USER%@%VPS_IP% "echo 'events{worker_connections 1024;}http{upstream backend{server kanpai_backend:3002;}upstream frontend{server kanpai_frontend:3000;}server{listen 80;listen 443 ssl;server_name kanpai-plus.jp;ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;location /api{proxy_pass http://backend;}location /{proxy_pass http://frontend;}}}' > /tmp/nginx-ssl.conf"

echo.
echo ========================================
echo Test complete!
echo ========================================
pause