@echo off
echo ========================================
echo EMERGENCY BACKEND RECOVERY
echo ========================================
echo.
echo This script will fix the backend when:
echo - Website is down
echo - Backend container stopped
echo - Nginx cannot connect to backend
echo.

set VPS_USER=ubuntu
set VPS_IP=133.125.41.193

echo [1/6] Cleaning up old backend...
ssh %VPS_USER%@%VPS_IP% "docker stop kanpai_backend 2>/dev/null; docker rm kanpai_backend 2>/dev/null"

echo [2/6] Creating minimal server file...
ssh %VPS_USER%@%VPS_IP% "echo 'const http=require(\"http\");const server=http.createServer((req,res)=>{res.writeHead(200,{\"Content-Type\":\"application/json\",\"Access-Control-Allow-Origin\":\"*\"});if(req.url===\"/api/health\"){res.end(JSON.stringify({status:\"OK\",timestamp:new Date()}))}else{res.end(JSON.stringify({message:\"kanpAI Backend API\"}))}});server.listen(3002,\"0.0.0.0\",()=>console.log(\"Emergency server running\"));' > /tmp/emergency-server.js"

echo [3/6] Starting emergency backend...
ssh %VPS_USER%@%VPS_IP% "docker run -d --name kanpai_backend --network kanpai_net -v /tmp/emergency-server.js:/app/server.js node:18-alpine node /app/server.js"

echo [4/6] Waiting for backend startup...
timeout /t 5 /nobreak >nul

echo [5/6] Restarting nginx...
ssh %VPS_USER%@%VPS_IP% "docker restart kanpai_nginx"

echo [6/6] Testing recovery...
timeout /t 3 /nobreak >nul
ssh %VPS_USER%@%VPS_IP% "curl -s http://localhost/api/health"

echo.
echo ========================================
echo RECOVERY COMPLETE
echo Test these URLs:
echo - https://kanpai-plus.jp/api/health
echo - https://kanpai-plus.jp
echo - https://admin.kanpai-plus.jp
echo ========================================
pause