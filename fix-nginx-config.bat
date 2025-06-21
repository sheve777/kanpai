@echo off
echo ========================================
echo Fix Nginx Configuration
echo ========================================

set VPS_USER=ubuntu
set VPS_IP=133.125.41.193

echo [1/5] Creating new nginx.conf without admin...
ssh %VPS_USER%@%VPS_IP% "cat > /tmp/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream kanpai_backend {
        server kanpai_backend:3002;
    }

    upstream kanpai_frontend {
        server kanpai_frontend:3000;
    }

    server {
        listen 80;
        server_name kanpai-plus.jp;

        location /api {
            proxy_pass http://kanpai_backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        location / {
            proxy_pass http://kanpai_frontend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
EOF"

echo.
echo [2/5] Stopping nginx...
ssh %VPS_USER%@%VPS_IP% "docker stop kanpai_nginx 2>/dev/null || true"

echo.
echo [3/5] Removing nginx container...
ssh %VPS_USER%@%VPS_IP% "docker rm kanpai_nginx 2>/dev/null || true"

echo.
echo [4/5] Starting new nginx with fixed config...
ssh %VPS_USER%@%VPS_IP% "docker run -d --name kanpai_nginx --network kanpai_net -p 80:80 -v /tmp/nginx.conf:/etc/nginx/nginx.conf:ro nginx:alpine"

echo.
echo [5/5] Testing nginx...
timeout /t 5 /nobreak >nul
ssh %VPS_USER%@%VPS_IP% "curl -s http://localhost/api/health || echo 'Still not working'"

echo.
echo ========================================
echo Nginx fix complete!
echo ========================================
pause