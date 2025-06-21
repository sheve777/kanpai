@echo off
echo ========================================
echo Restore HTTPS Support
echo ========================================

set VPS_USER=ubuntu
set VPS_IP=133.125.41.193

echo [1/6] Checking existing SSL certificates...
ssh %VPS_USER%@%VPS_IP% "ls -la /etc/letsencrypt/live/kanpai-plus.jp/ 2>/dev/null || echo 'No Let''s Encrypt certificates found'"

echo.
echo [2/6] Creating self-signed certificate (no sudo needed)...
ssh %VPS_USER%@%VPS_IP% "mkdir -p ~/ssl"
ssh %VPS_USER%@%VPS_IP% "openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ~/ssl/nginx-selfsigned.key -out ~/ssl/nginx-selfsigned.crt -subj '/C=JP/ST=Tokyo/L=Tokyo/O=kanpAI/CN=kanpai-plus.jp'"

echo.
echo [3/6] Stopping current nginx...
ssh %VPS_USER%@%VPS_IP% "docker stop kanpai_nginx && docker rm kanpai_nginx"

echo.
echo [4/6] Creating nginx config with HTTPS support...
ssh %VPS_USER%@%VPS_IP% "cat > /tmp/nginx-https.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server kanpai_backend:3002;
    }

    upstream frontend {
        server kanpai_frontend:3000;
    }

    server {
        listen 80;
        server_name kanpai-plus.jp;
        return 301 https://\$server_name\$request_uri;
    }

    server {
        listen 443 ssl;
        server_name kanpai-plus.jp;
        
        ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
        ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;
        
        location /api {
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
EOF"

echo.
echo [5/6] Starting nginx with HTTPS support...
ssh %VPS_USER%@%VPS_IP% "docker run -d --name kanpai_nginx --network kanpai_net -p 80:80 -p 443:443 -v /tmp/nginx-https.conf:/etc/nginx/nginx.conf:ro -v ~/ssl/nginx-selfsigned.crt:/etc/ssl/certs/nginx-selfsigned.crt:ro -v ~/ssl/nginx-selfsigned.key:/etc/ssl/private/nginx-selfsigned.key:ro nginx:alpine"

echo.
echo [6/6] Testing HTTPS...
timeout /t 10 /nobreak >nul
ssh %VPS_USER%@%VPS_IP% "curl -k -s https://localhost/api/health || echo 'HTTPS test failed'"
ssh %VPS_USER%@%VPS_IP% "curl -s http://localhost/api/health || echo 'HTTP redirect test failed'"

echo.
echo ========================================
echo HTTPS restored!
echo - HTTP:  http://kanpai-plus.jp (redirects to HTTPS)
echo - HTTPS: https://kanpai-plus.jp (self-signed certificate)
echo - API:   https://kanpai-plus.jp/api/health
echo Note: You may see security warnings due to self-signed certificate
echo ========================================
pause