@echo off
echo ========================================
echo Quick HTTPS Setup
echo ========================================

set VPS_USER=ubuntu
set VPS_IP=133.125.41.193

echo [1/4] Checking containers and certificates...
ssh %VPS_USER%@%VPS_IP% "docker ps | grep kanpai && ls -la ~/ssl/"

echo.
echo [2/4] Stop current nginx...
ssh %VPS_USER%@%VPS_IP% "docker stop kanpai_nginx && docker rm kanpai_nginx"

echo.
echo [3/4] Creating simple HTTPS config...
ssh %VPS_USER%@%VPS_IP% "echo 'events{worker_connections 1024;}http{upstream backend{server kanpai_backend:3002;}upstream frontend{server kanpai_frontend:3000;}server{listen 80;return 301 https://\$host\$request_uri;}server{listen 443 ssl;ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;location /api{proxy_pass http://backend;proxy_set_header Host \$host;}location /{proxy_pass http://frontend;proxy_set_header Host \$host;}}}' > /tmp/nginx-ssl.conf"

echo.
echo [4/4] Starting nginx with HTTPS...
ssh %VPS_USER%@%VPS_IP% "docker run -d --name kanpai_nginx --network kanpai_net -p 80:80 -p 443:443 -v /tmp/nginx-ssl.conf:/etc/nginx/nginx.conf:ro -v ~/ssl/nginx-selfsigned.crt:/etc/ssl/certs/nginx-selfsigned.crt:ro -v ~/ssl/nginx-selfsigned.key:/etc/ssl/private/nginx-selfsigned.key:ro nginx:alpine"

echo.
echo Testing...
timeout /t 5 /nobreak >nul
ssh %VPS_USER%@%VPS_IP% "docker ps | grep nginx"

echo.
echo ========================================
echo HTTPS should now be available at:
echo https://kanpai-plus.jp
echo (You may see security warnings for self-signed certificate)
echo ========================================
pause