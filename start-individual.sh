#!/bin/bash
# kanpAI 個別起動スクリプト

echo "kanpAI - Docker個別起動"
echo "======================"

# 既存のコンテナを停止（エラーは無視）
echo "既存のコンテナを停止中..."
docker stop kanpai_db kanpai_redis kanpai_backend kanpai_frontend kanpai_nginx 2>/dev/null || true
docker rm kanpai_db kanpai_redis kanpai_backend kanpai_frontend kanpai_nginx 2>/dev/null || true

# ネットワーク作成
echo "ネットワーク作成..."
docker network create kanpai_net 2>/dev/null || true

# 1. PostgreSQL
echo "PostgreSQL起動..."
docker run -d \
  --name kanpai_db \
  --network kanpai_net \
  -e POSTGRES_DB=kanpai_production \
  -e POSTGRES_USER=kanpai_user \
  -e POSTGRES_PASSWORD=C9gF+GzuAh/DpFLj6yJbV7uuew9GYO8zo2xmNkqJ1JI= \
  -v kanpai_pgdata:/var/lib/postgresql/data \
  postgres:15-alpine

# 2. Redis
echo "Redis起動..."
docker run -d \
  --name kanpai_redis \
  --network kanpai_net \
  redis:7-alpine redis-server --appendonly yes --requirepass w2qwOISIw44mlczSG03OSURrbIUcXFnC

# 少し待つ
echo "データベース起動待ち..."
sleep 10

# 3. Backend
echo "Backend起動..."
docker run -d \
  --name kanpai_backend \
  --network kanpai_net \
  -p 3001:3002 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://kanpai_user:C9gF+GzuAh/DpFLj6yJbV7uuew9GYO8zo2xmNkqJ1JI=@kanpai_db:5432/kanpai_production \
  -e REDIS_URL=redis://:w2qwOISIw44mlczSG03OSURrbIUcXFnC@kanpai_redis:6379 \
  -e JWT_SECRET=6cad23d5a0ec265d8d3e791d869741d265412300eb98fbf9395596c79617bb45 \
  -e OPENAI_API_KEY=sk-dummy-key-for-testing \
  -e LINE_CHANNEL_ACCESS_TOKEN=dummy-line-token \
  -e LINE_CHANNEL_SECRET=dummy-line-secret \
  -e STRIPE_API_KEY=sk_test_dummy \
  -e STRIPE_WEBHOOK_SECRET=whsec_dummy \
  -e FRONTEND_URL=https://kanpai-plus.jp \
  -e ADMIN_URL=https://admin.kanpai-plus.jp \
  -v $(pwd)/backend/uploads:/app/uploads \
  -v $(pwd)/backend/logs:/app/logs \
  node:18-alpine sh -c "cd /app && npm start"

# 4. Frontend
echo "Frontend起動..."
docker run -d \
  --name kanpai_frontend \
  --network kanpai_net \
  -p 3000:3000 \
  -e REACT_APP_API_BASE_URL=https://api.kanpai-plus.jp \
  -e REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_dummy \
  -e REACT_APP_ENVIRONMENT=production \
  node:18-alpine sh -c "cd /app && npm start"

# 5. Nginx
echo "Nginx起動..."
docker run -d \
  --name kanpai_nginx \
  --network kanpai_net \
  -p 80:80 \
  -p 443:443 \
  -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro \
  -v $(pwd)/nginx/ssl:/etc/nginx/ssl:ro \
  nginx:alpine

echo "======================"
echo "起動完了！"
echo ""
echo "確認コマンド:"
echo "docker ps"
echo ""
echo "ログ確認:"
echo "docker logs kanpai_backend"
echo "docker logs kanpai_frontend"
echo "docker logs kanpai_nginx"