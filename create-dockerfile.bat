@echo off
echo ========================================
echo Create Dockerfile on VPS and Rebuild
echo ========================================

set VPS_USER=ubuntu
set VPS_IP=133.125.41.193

echo [1/7] Creating Dockerfile on VPS...
ssh %VPS_USER%@%VPS_IP% "cat > ~/kanpai/backend/Dockerfile << 'EOF'
# Node.js 18 Alpine Linux ベースイメージ
FROM node:18-alpine

# 作業ディレクトリの設定
WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./

# 依存関係のインストール
RUN npm ci --only=production

# アプリケーションファイルをコピー
COPY . .

# ポート3002を公開
EXPOSE 3002

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e \"require('http').get('http://localhost:3002/api/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))\"

# アプリケーションの起動
CMD [\"node\", \"src/server.js\"]
EOF"

echo.
echo [2/7] Stopping old backend...
ssh %VPS_USER%@%VPS_IP% "docker stop kanpai_backend 2>/dev/null || true"
ssh %VPS_USER%@%VPS_IP% "docker rm kanpai_backend 2>/dev/null || true"

echo.
echo [3/7] Building backend image...
ssh %VPS_USER%@%VPS_IP% "cd ~/kanpai/backend && docker build -t kanpai-backend ."

echo.
echo [4/7] Checking environment variables...
ssh %VPS_USER%@%VPS_IP% "cd ~/kanpai/backend && if [ ! -f .env ]; then cp .env.example .env && echo 'Created .env from .env.example'; else echo '.env file exists'; fi"

echo.
echo [5/7] Starting backend container...
ssh %VPS_USER%@%VPS_IP% "docker run -d --name kanpai_backend --network kanpai_net -p 3002:3002 -v ~/kanpai/backend/.env:/app/.env --restart unless-stopped kanpai-backend"

echo.
echo [6/7] Waiting for startup...
timeout /t 15 /nobreak >nul

echo.
echo [7/7] Testing backend...
ssh %VPS_USER%@%VPS_IP% "curl -s http://localhost:3002/api/health"

echo.
echo ========================================
echo Backend deployment complete!
echo Test: https://kanpai-plus.jp/api/health
echo ========================================
pause