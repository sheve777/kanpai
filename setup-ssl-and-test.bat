@echo off
echo ========================================
echo Setup SSL and Complete Testing
echo ========================================

set VPS_USER=ubuntu
set VPS_IP=133.125.41.193

echo [1/8] Creating self-signed SSL certificate...
ssh %VPS_USER%@%VPS_IP% "sudo mkdir -p /etc/ssl/certs /etc/ssl/private"
ssh %VPS_USER%@%VPS_IP% "sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/nginx-selfsigned.key -out /etc/ssl/certs/nginx-selfsigned.crt -subj '/C=JP/ST=Tokyo/L=Tokyo/O=kanpAI/CN=kanpai-plus.jp'"

echo.
echo [2/8] Stopping current nginx...
ssh %VPS_USER%@%VPS_IP% "docker stop kanpai_nginx && docker rm kanpai_nginx"

echo.
echo [3/8] Creating nginx with SSL support...
ssh %VPS_USER%@%VPS_IP% "echo 'events{worker_connections 1024;}http{upstream backend{server kanpai_backend:3002;}upstream frontend{server kanpai_frontend:3000;}server{listen 80;listen 443 ssl;server_name kanpai-plus.jp;ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;location /api{proxy_pass http://backend;proxy_set_header Host \$host;}location /{proxy_pass http://frontend;proxy_set_header Host \$host;}}}' > /tmp/nginx-ssl.conf"

echo.
echo [4/8] Starting nginx with SSL and volume mounts...
ssh %VPS_USER%@%VPS_IP% "docker run -d --name kanpai_nginx --network kanpai_net -p 80:80 -p 443:443 -v /tmp/nginx-ssl.conf:/etc/nginx/nginx.conf:ro -v /etc/ssl/certs:/etc/ssl/certs:ro -v /etc/ssl/private:/etc/ssl/private:ro nginx:alpine"

echo.
echo [5/8] Waiting for nginx startup...
timeout /t 10 /nobreak >nul

echo.
echo [6/8] Testing HTTP access...
ssh %VPS_USER%@%VPS_IP% "curl -s http://localhost/api/health"

echo.
echo [7/8] Testing HTTPS access...
ssh %VPS_USER%@%VPS_IP% "curl -k -s https://localhost/api/health"

echo.
echo [8/8] Final container status...
ssh %VPS_USER%@%VPS_IP% "docker ps | grep kanpai"

echo.
echo ========================================
echo SSL setup complete!
echo HTTP:  http://kanpai-plus.jp
echo HTTPS: https://kanpai-plus.jp (self-signed)
echo API:   https://kanpai-plus.jp/api/health
echo ========================================
pause