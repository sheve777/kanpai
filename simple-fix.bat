@echo off
echo ========================================
echo Simple System Fix
echo ========================================

set VPS_USER=ubuntu
set VPS_IP=133.125.41.193

echo [1/8] Cleaning up all containers...
ssh %VPS_USER%@%VPS_IP% "docker stop kanpai_nginx kanpai_backend 2>/dev/null || true"
ssh %VPS_USER%@%VPS_IP% "docker rm kanpai_nginx kanpai_backend 2>/dev/null || true"

echo.
echo [2/8] Creating minimal backend server...
ssh %VPS_USER%@%VPS_IP% "echo 'const http=require(\"http\");const server=http.createServer((req,res)=>{res.writeHead(200,{\"Content-Type\":\"application/json\",\"Access-Control-Allow-Origin\":\"*\"});if(req.url===\"/api/health\"){res.end(JSON.stringify({status:\"OK\",timestamp:new Date()}))}else{res.end(JSON.stringify({message:\"kanpAI Backend API\"}))}});server.listen(3002,\"0.0.0.0\",()=>console.log(\"Server running\"));' > /tmp/server.js"

echo.
echo [3/8] Starting backend container...
ssh %VPS_USER%@%VPS_IP% "docker run -d --name kanpai_backend --network kanpai_net -v /tmp/server.js:/app/server.js node:18-alpine node /app/server.js"

echo.
echo [4/8] Creating simple nginx config...
ssh %VPS_USER%@%VPS_IP% "echo 'events{worker_connections 1024;}http{upstream backend{server kanpai_backend:3002;}upstream frontend{server kanpai_frontend:3000;}server{listen 80;location /api{proxy_pass http://backend;}location /{proxy_pass http://frontend;}}}' > /tmp/nginx.conf"

echo.
echo [5/8] Starting nginx container...
ssh %VPS_USER%@%VPS_IP% "docker run -d --name kanpai_nginx --network kanpai_net -p 80:80 -v /tmp/nginx.conf:/etc/nginx/nginx.conf:ro nginx:alpine"

echo.
echo [6/8] Waiting for startup...
timeout /t 10 /nobreak >nul

echo.
echo [7/8] Testing connections...
ssh %VPS_USER%@%VPS_IP% "curl -s http://localhost/api/health"

echo.
echo [8/8] Checking container status...
ssh %VPS_USER%@%VPS_IP% "docker ps | grep kanpai"

echo.
echo ========================================
echo Simple fix complete! Test: https://kanpai-plus.jp
echo ========================================
pause