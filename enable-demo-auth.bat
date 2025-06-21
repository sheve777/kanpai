@echo off
echo ========================================
echo Enable Demo Authentication
echo ========================================

set VPS_USER=ubuntu
set VPS_IP=133.125.41.193

echo [1/5] Creating enhanced minimal backend with auth...
ssh %VPS_USER%@%VPS_IP% "cat > /tmp/auth-server.js << 'JSEOF'
const http = require('http');
const url = require('url');

const demoUsers = {
  'local-store-1750425531728': 'local-store-1750425531728123',
  'test': 'kanpai123',
  'demo': 'demo',
  'admin': 'admin123'
};

const server = http.createServer((req, res) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  
  if (parsedUrl.pathname === '/api/health') {
    res.writeHead(200, headers);
    res.end(JSON.stringify({
      status: 'OK',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  if (parsedUrl.pathname === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const { storeId, password } = JSON.parse(body);
        
        if (demoUsers[storeId] === password) {
          res.writeHead(200, headers);
          res.end(JSON.stringify({
            success: true,
            token: 'demo-jwt-token-' + Date.now(),
            store: {
              id: storeId,
              name: 'Demo Store ' + storeId,
              phone: '03-1234-5678',
              address: 'Tokyo'
            },
            isTemporaryPassword: storeId.includes('local-store')
          }));
        } else {
          res.writeHead(401, headers);
          res.end(JSON.stringify({
            success: false,
            error: '店舗IDまたはパスワードが正しくありません'
          }));
        }
      } catch (e) {
        res.writeHead(400, headers);
        res.end(JSON.stringify({
          success: false,
          error: 'Invalid request format'
        }));
      }
    });
    return;
  }

  res.writeHead(200, headers);
  res.end(JSON.stringify({
    message: 'kanpAI Backend API with Demo Auth',
    endpoints: ['/api/health', '/api/auth/login']
  }));
});

server.listen(3002, '0.0.0.0', () => {
  console.log('Auth server running on port 3002');
});
JSEOF"

echo.
echo [2/5] Stopping current backend...
ssh %VPS_USER%@%VPS_IP% "docker stop kanpai_backend 2>/dev/null && docker rm kanpai_backend 2>/dev/null"

echo.
echo [3/5] Starting new backend with auth support...
ssh %VPS_USER%@%VPS_IP% "docker run -d --name kanpai_backend --network kanpai_net -v /tmp/auth-server.js:/app/server.js node:18-alpine node /app/server.js"

echo.
echo [4/5] Waiting for startup...
timeout /t 10 /nobreak >nul

echo.
echo [5/5] Testing login...
ssh %VPS_USER%@%VPS_IP% "curl -k -s -X POST https://localhost/api/auth/login -H 'Content-Type: application/json' -d '{\"storeId\":\"local-store-1750425531728\",\"password\":\"local-store-1750425531728123\"}'"

echo.
echo ========================================
echo Demo authentication enabled!
echo Try logging in with:
echo - Store ID: local-store-1750425531728
echo - Password: local-store-1750425531728123
echo ========================================
pause