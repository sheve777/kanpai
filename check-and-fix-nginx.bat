@echo off
echo ========================================
echo Check and Fix Nginx
echo ========================================

set VPS_USER=ubuntu
set VPS_IP=133.125.41.193

echo [1/5] Checking nginx container...
ssh %VPS_USER%@%VPS_IP% "docker ps -a | grep nginx"

echo.
echo [2/5] Checking nginx logs...
ssh %VPS_USER%@%VPS_IP% "docker logs kanpai_nginx 2>/dev/null || echo 'No nginx container logs'"

echo.
echo [3/5] Recreating nginx without SSL (simpler approach)...
ssh %VPS_USER%@%VPS_IP% "docker stop kanpai_nginx 2>/dev/null || true"
ssh %VPS_USER%@%VPS_IP% "docker rm kanpai_nginx 2>/dev/null || true"

echo.
echo [4/5] Starting nginx with HTTP only...
ssh %VPS_USER%@%VPS_IP% "echo 'events{worker_connections 1024;}http{upstream backend{server kanpai_backend:3002;}upstream frontend{server kanpai_frontend:3000;}server{listen 80;server_name kanpai-plus.jp;location /api{proxy_pass http://backend;proxy_set_header Host \$host;proxy_set_header X-Real-IP \$remote_addr;}location /{proxy_pass http://frontend;proxy_set_header Host \$host;proxy_set_header X-Real-IP \$remote_addr;}}}' > /tmp/nginx-http.conf"

ssh %VPS_USER%@%VPS_IP% "docker run -d --name kanpai_nginx --network kanpai_net -p 80:80 -v /tmp/nginx-http.conf:/etc/nginx/nginx.conf:ro nginx:alpine"

echo.
echo [5/5] Testing final setup...
timeout /t 5 /nobreak >nul
ssh %VPS_USER%@%VPS_IP% "curl -s http://localhost/api/health || echo 'Failed'"
ssh %VPS_USER%@%VPS_IP% "docker ps | grep kanpai"

echo.
echo ========================================
echo Final test: Try accessing http://kanpai-plus.jp
echo ========================================
pause