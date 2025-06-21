@echo off
echo ========================================
echo Build Complete Production Environment
echo ========================================

set VPS_USER=ubuntu
set VPS_IP=133.125.41.193

echo [1/12] Checking database connection...
ssh %VPS_USER%@%VPS_IP% "docker exec kanpai_db psql -U postgres -d postgres -c '\l'"

echo.
echo [2/12] Creating kanpai database if not exists...
ssh %VPS_USER%@%VPS_IP% "docker exec kanpai_db psql -U postgres -c 'CREATE DATABASE kanpai;' 2>/dev/null || echo 'Database already exists'"

echo.
echo [3/12] Setting up environment variables...
ssh %VPS_USER%@%VPS_IP% "cat > ~/kanpai/backend/.env << 'EOF'
PORT=3002
NODE_ENV=production
DATABASE_URL=postgresql://postgres:postgres@kanpai_db:5432/kanpai
JWT_SECRET=kanpai-production-jwt-secret-key-2025
DEMO_MODE=false
OPENAI_API_KEY=dummy-openai-key
LINE_CHANNEL_ACCESS_TOKEN=dummy-line-token
LINE_CHANNEL_SECRET=dummy-line-secret
STRIPE_API_KEY=dummy-stripe-key
LOG_LEVEL=info
EOF"

echo.
echo [4/12] Creating complete package.json...
ssh %VPS_USER%@%VPS_IP% "cat > ~/kanpai/backend/package.json << 'EOF'
{
  \"name\": \"kanpai-backend\",
  \"version\": \"1.0.0\",
  \"type\": \"module\",
  \"main\": \"src/server.js\",
  \"scripts\": {
    \"start\": \"node src/server.js\",
    \"dev\": \"nodemon src/server.js\"
  },
  \"dependencies\": {
    \"express\": \"^4.18.2\",
    \"cors\": \"^2.8.5\",
    \"helmet\": \"^7.0.0\",
    \"dotenv\": \"^16.3.1\",
    \"pg\": \"^8.11.3\",
    \"bcrypt\": \"^5.1.1\",
    \"jsonwebtoken\": \"^9.0.2\",
    \"express-validator\": \"^7.0.1\",
    \"winston\": \"^3.10.0\"
  }
}
EOF"

echo.
echo [5/12] Creating production Dockerfile...
ssh %VPS_USER%@%VPS_IP% "cat > ~/kanpai/backend/Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3002
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e \"require('http').get('http://localhost:3002/api/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))\"
CMD [\"npm\", \"start\"]
EOF"

echo.
echo [6/12] Stopping current minimal backend...
ssh %VPS_USER%@%VPS_IP% "docker stop kanpai_backend 2>/dev/null && docker rm kanpai_backend 2>/dev/null"

echo.
echo [7/12] Building production backend image...
ssh %VPS_USER%@%VPS_IP% "cd ~/kanpai/backend && docker build -t kanpai-backend-prod ."

echo.
echo [8/12] Starting production backend...
ssh %VPS_USER%@%VPS_IP% "docker run -d --name kanpai_backend --network kanpai_net -p 3002:3002 --env-file ~/kanpai/backend/.env --restart unless-stopped kanpai-backend-prod"

echo.
echo [9/12] Waiting for backend startup...
timeout /t 20 /nobreak >nul

echo.
echo [10/12] Checking backend logs...
ssh %VPS_USER%@%VPS_IP% "docker logs kanpai_backend | tail -10"

echo.
echo [11/12] Testing backend connection...
ssh %VPS_USER%@%VPS_IP% "curl -s http://localhost:3002/api/health || echo 'Backend not responding'"

echo.
echo [12/12] Final container status...
ssh %VPS_USER%@%VPS_IP% "docker ps | grep kanpai"

echo.
echo ========================================
echo Production environment build complete!
echo Next: Database tables and authentication setup
echo ========================================
pause