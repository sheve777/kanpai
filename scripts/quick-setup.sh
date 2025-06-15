#!/bin/bash

# kanpAI Quick Setup Script - サーバー契約後の自動セットアップ
# このスクリプトをサーバーで実行すると、kanpAIが自動的に稼働開始します

set -e  # エラー時に停止

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

echo "=================================================="
echo "       kanpAI Quick Setup - サーバー契約後"
echo "=================================================="
echo
echo "このスクリプトは以下を自動実行します："
echo "1. システム更新・基本パッケージインストール"
echo "2. Docker環境構築"
echo "3. kanpAIソースコード取得"
echo "4. 環境設定ファイル生成"
echo "5. kanpAI起動・動作確認"
echo

read -p "続行しますか？ (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "セットアップをキャンセルしました"
    exit 0
fi

# Step 1: システム更新
log "Step 1: システムを更新中..."
sudo apt update
sudo apt upgrade -y
success "システム更新完了"

# Step 2: 基本パッケージインストール
log "Step 2: 基本パッケージをインストール中..."
sudo apt install -y curl wget git unzip htop nano jq
success "基本パッケージインストール完了"

# Step 3: Docker インストール
log "Step 3: Dockerをインストール中..."

# Docker公式GPGキー追加
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Dockerリポジトリ追加
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# パッケージ更新・Docker インストール
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Docker Compose スタンドアロン版インストール
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | jq -r .tag_name)
sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# ubuntuユーザーをdockerグループに追加
sudo usermod -aG docker $USER

success "Docker インストール完了"

# Step 4: kanpAI用ディレクトリ作成
log "Step 4: kanpAI用ディレクトリを作成中..."
mkdir -p ~/kanpai/{logs,uploads,backups,ssl}
cd ~/kanpai
success "ディレクトリ作成完了"

# Step 5: kanpAIソースコード取得
log "Step 5: kanpAIソースコードを取得中..."

# GitHubリポジトリをクローン（ユーザーに確認）
echo
echo "GitHubリポジトリのURLを入力してください："
echo "例: https://github.com/YOUR_USERNAME/kanpAI.git"
read -p "Repository URL: " REPO_URL

if [[ -z "$REPO_URL" ]]; then
    error "リポジトリURLが入力されていません"
fi

git clone "$REPO_URL" kanpAI
cd kanpAI

success "ソースコード取得完了"

# Step 6: 環境設定ファイル生成
log "Step 6: 環境設定ファイルを生成中..."

# 強力なパスワード生成
DB_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 24)
JWT_SECRET=$(openssl rand -hex 32)

# サーバーIPアドレス取得
SERVER_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || hostname -I | awk '{print $1}')

# .env ファイル作成
cat > .env << EOF
# kanpAI Production Environment - Auto Generated
# Generated on: $(date)

# === サーバー設定 ===
PORT=3002
NODE_ENV=production
LOG_LEVEL=info

# === データベース・セキュリティ設定 ===
DB_PASSWORD=${DB_PASSWORD}
REDIS_PASSWORD=${REDIS_PASSWORD}
JWT_SECRET=${JWT_SECRET}

# === URL設定（ドメイン取得後に変更してください） ===
FRONTEND_URL=http://${SERVER_IP}
ADMIN_URL=http://${SERVER_IP}/admin
API_BASE_URL=http://${SERVER_IP}
CORS_ORIGIN=http://${SERVER_IP}

# === セキュリティ設定 ===
FORCE_HTTPS=false
SECURE_COOKIES=false
SESSION_SECURE=false
DEMO_MODE=false

# === 外部API設定（実際のキーに変更してください） ===
OPENAI_API_KEY=sk-proj-temp-dummy-key-replace-with-real-key
LINE_CHANNEL_ACCESS_TOKEN=temp-dummy-line-token-replace-with-real
LINE_CHANNEL_SECRET=temp-dummy-line-secret-replace-with-real
STRIPE_API_KEY=sk_test_temp-dummy-stripe-key-replace-with-real
STRIPE_WEBHOOK_SECRET=whsec_temp-dummy-webhook-secret-replace-with-real
STRIPE_PUBLISHABLE_KEY=pk_test_temp-dummy-publishable-key-replace-with-real

# === Google Calendar設定（後で設定してください） ===
GOOGLE_CALENDAR_ID=temp@example.com
GOOGLE_SERVICE_ACCOUNT_EMAIL=temp@example.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTEMP_DUMMY_KEY_REPLACE_WITH_REAL\n-----END PRIVATE KEY-----"

# === 監視・ログ設定 ===
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# === データベース接続プール ===
DB_POOL_MIN=5
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000
EOF

success "環境設定ファイル生成完了"

# Step 7: 基本セキュリティ設定
log "Step 7: 基本セキュリティを設定中..."

# UFW（ファイアウォール）設定
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# fail2ban インストール・設定
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

success "セキュリティ設定完了"

# Step 8: kanpAI起動
log "Step 8: kanpAIを起動中..."

# Docker グループの設定を反映するため、新しいシェルで実行
sudo su - $USER -c "
cd ~/kanpai/kanpAI
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
"

# 起動待機
sleep 30

success "kanpAI起動完了"

# Step 9: 動作確認
log "Step 9: 動作確認中..."

# ヘルスチェック
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    success "✅ APIサーバー: 正常稼働"
else
    warning "⚠️ APIサーバー: 起動中または設定要確認"
fi

# フロントエンド確認
if curl -f http://localhost/ > /dev/null 2>&1; then
    success "✅ フロントエンド: 正常稼働"
else
    warning "⚠️ フロントエンド: 起動中または設定要確認"
fi

# Step 10: 初回バックアップ作成
log "Step 10: 初回バックアップを作成中..."
cd ~/kanpai/kanpAI
sudo su - $USER -c "
cd ~/kanpai/kanpAI
docker-compose -f docker-compose.prod.yml run --rm backup node scripts/backup-database.js create || true
"

# 完了レポート
echo
echo "=================================================="
echo "          kanpAI セットアップ完了！"
echo "=================================================="
echo
echo "🌐 アクセスURL:"
echo "   メインサイト: http://${SERVER_IP}"
echo "   API確認: http://${SERVER_IP}/api/health"
echo
echo "📋 設定ファイル場所:"
echo "   環境設定: ~/kanpai/kanpAI/.env"
echo "   ログ: ~/kanpai/logs/"
echo "   バックアップ: ~/kanpai/backups/"
echo
echo "🔧 よく使うコマンド:"
echo "   状態確認: cd ~/kanpai/kanpAI && docker-compose -f docker-compose.prod.yml ps"
echo "   ログ確認: cd ~/kanpai/kanpAI && docker-compose -f docker-compose.prod.yml logs -f"
echo "   再起動: cd ~/kanpai/kanpAI && docker-compose -f docker-compose.prod.yml restart"
echo "   停止: cd ~/kanpai/kanpAI && docker-compose -f docker-compose.prod.yml down"
echo
echo "📝 次にやること:"
echo "1. ブラウザで http://${SERVER_IP} にアクセス"
echo "2. ドメイン取得・DNS設定"
echo "3. 外部API設定（OpenAI、LINE、Stripe等）"
echo "4. 実店舗データ設定（メニュー、営業時間等）"
echo
echo "💡 設定変更:"
echo "   nano ~/kanpai/kanpAI/.env で環境設定を編集"
echo "   設定変更後は docker-compose restart で反映"
echo

if [[ "$SERVER_IP" != *"127.0.0.1"* ]] && [[ "$SERVER_IP" != *"localhost"* ]]; then
    success "🎉 kanpAIシステムがhttp://${SERVER_IP}で稼働開始しました！"
else
    warning "サーバーIPの取得に失敗しました。さくらVPSコントロールパネルでIPアドレスを確認してください"
fi

echo
echo "詳細なドキュメント: ~/kanpai/kanpAI/docs/"
echo "トラブル時: ~/kanpai/kanpAI/docs/troubleshooting-guide.md を参照"