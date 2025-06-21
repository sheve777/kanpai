@echo off
echo ========================================
echo Setup Real Backend with Authentication
echo ========================================

set VPS_USER=ubuntu
set VPS_IP=133.125.41.193

echo [1/8] Stopping minimal backend...
ssh %VPS_USER%@%VPS_IP% "docker stop kanpai_backend && docker rm kanpai_backend"

echo.
echo [2/8] Creating environment file...
ssh %VPS_USER%@%VPS_IP% "cat > ~/kanpai/backend/.env << 'EOF'
PORT=3002
NODE_ENV=production
DEMO_MODE=true
DEMO_PASSWORDS=kanpai123,demo,admin123
JWT_SECRET=your-jwt-secret-key-here
OPENAI_API_KEY=dummy-key
LINE_CHANNEL_ACCESS_TOKEN=dummy-token
LINE_CHANNEL_SECRET=dummy-secret
DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
EOF"

echo.
echo [3/8] Creating simple Dockerfile in backend...
ssh %VPS_USER%@%VPS_IP% "cat > ~/kanpai/backend/Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3002
CMD [\"node\", \"src/server.js\"]
EOF"

echo.
echo [4/8] Building real backend image...
ssh %VPS_USER%@%VPS_IP% "cd ~/kanpai/backend && docker build -t kanpai-real-backend ."

echo.
echo [5/8] Starting real backend...
ssh %VPS_USER%@%VPS_IP% "docker run -d --name kanpai_backend --network kanpai_net --env-file ~/kanpai/backend/.env kanpai-real-backend"

echo.
echo [6/8] Waiting for backend startup...
timeout /t 15 /nobreak >nul

echo.
echo [7/8] Testing authentication API...
ssh %VPS_USER%@%VPS_IP% "curl -k -s -X POST https://localhost/api/auth/login -H 'Content-Type: application/json' -d '{\"storeId\":\"local-store-1750425531728\",\"password\":\"kanpai123\"}'"

echo.
echo [8/8] Container status...
ssh %VPS_USER%@%VPS_IP% "docker ps | grep kanpai_backend"

echo.
echo ========================================
echo Real backend setup complete!
echo Try logging in with: local-store-1750425531728 / kanpai123
echo ========================================
pause