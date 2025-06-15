#!/bin/bash

# kanpAI Server Setup Script - さくらVPS自動セットアップ
# Ubuntu 22.04 LTS対応

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

# 実行ユーザーチェック
if [[ $EUID -eq 0 ]]; then
   error "このスクリプトはrootユーザーで実行しないでください"
fi

# Ubuntu 22.04チェック
if ! grep -q "Ubuntu 22.04" /etc/os-release; then
    warning "Ubuntu 22.04以外のOSが検出されました。問題が発生する可能性があります。"
    read -p "続行しますか？ (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "=================================================="
echo "       kanpAI Server Setup for さくらVPS"
echo "=================================================="
echo

# Step 1: システム更新
log "システムパッケージを更新中..."
sudo apt update
sudo apt upgrade -y
success "システム更新完了"

# Step 2: 基本パッケージインストール
log "基本パッケージをインストール中..."
sudo apt install -y \
    curl \
    wget \
    git \
    unzip \
    htop \
    nano \
    vim \
    tree \
    jq \
    fail2ban \
    ufw \
    certbot \
    python3-certbot-nginx

success "基本パッケージインストール完了"

# Step 3: セキュリティ設定
log "セキュリティ設定を実行中..."

# UFW（ファイアウォール）設定
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# fail2ban設定
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# SSH設定強化（オプション）
read -p "SSH設定を強化しますか？（ポート変更、パスワード認証無効化）(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # SSH設定バックアップ
    sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
    
    # SSH設定変更
    sudo sed -i 's/#Port 22/Port 22022/' /etc/ssh/sshd_config
    sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
    sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
    
    # UFWでSSHポート更新
    sudo ufw delete allow ssh
    sudo ufw allow 22022/tcp
    
    warning "SSH設定を変更しました。次回接続時は -p 22022 オプションを使用してください"
    warning "ssh ubuntu@YOUR_SERVER_IP -p 22022"
fi

success "セキュリティ設定完了"

# Step 4: Docker インストール
log "Dockerをインストール中..."

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

# Step 5: Docker動作確認
log "Docker動作を確認中..."
if docker --version > /dev/null 2>&1; then
    success "Docker: $(docker --version)"
else
    error "Dockerのインストールに失敗しました"
fi

if docker-compose --version > /dev/null 2>&1; then
    success "Docker Compose: $(docker-compose --version)"
else
    error "Docker Composeのインストールに失敗しました"
fi

# Step 6: kanpAI用ディレクトリ作成
log "kanpAI用ディレクトリを作成中..."
mkdir -p ~/kanpai/{logs,uploads,backups,ssl}
cd ~/kanpai

success "ディレクトリ作成完了"

# Step 7: システム監視設定
log "システム監視を設定中..."

cat > ~/monitor_kanpai.sh << 'EOF'
#!/bin/bash
# kanpAI監視スクリプト

HEALTH_URL="http://localhost/api/health"
LOG_FILE="$HOME/kanpai/logs/monitor.log"
DATE=$(date +'%Y-%m-%d %H:%M:%S')

# ヘルスチェック
if curl -f "$HEALTH_URL" > /dev/null 2>&1; then
    echo "[$DATE] kanpAI is healthy" >> "$LOG_FILE"
else
    echo "[$DATE] kanpAI is down! Attempting restart..." >> "$LOG_FILE"
    
    # システム管理者にメール通知（要設定）
    # echo "kanpAI system is down at $DATE" | mail -s "kanpAI Alert" admin@example.com
    
    # 自動復旧試行
    cd $HOME/kanpai
    if [ -f docker-compose.prod.yml ]; then
        docker-compose -f docker-compose.prod.yml restart >> "$LOG_FILE" 2>&1
        echo "[$DATE] Restart attempt completed" >> "$LOG_FILE"
    fi
fi
EOF

chmod +x ~/monitor_kanpai.sh

# 監視スクリプトのcron設定
(crontab -l 2>/dev/null; echo "*/5 * * * * $HOME/monitor_kanpai.sh") | crontab -

success "システム監視設定完了"

# Step 8: メンテナンススクリプト作成
log "メンテナンススクリプトを作成中..."

cat > ~/maintenance.sh << 'EOF'
#!/bin/bash
# kanpAI定期メンテナンススクリプト

LOG_FILE="$HOME/kanpai/logs/maintenance.log"
DATE=$(date +'%Y-%m-%d %H:%M:%S')

echo "[$DATE] Starting maintenance..." >> "$LOG_FILE"

# システム更新
sudo apt update && sudo apt upgrade -y >> "$LOG_FILE" 2>&1

# Dockerクリーンアップ
docker system prune -f >> "$LOG_FILE" 2>&1

# 古いログファイル削除（30日以上）
find $HOME/kanpai/logs -name "*.log" -mtime +30 -delete

# 古いバックアップ削除（30日以上）
find $HOME/kanpai/backups -name "*.sql" -mtime +30 -delete

echo "[$DATE] Maintenance completed" >> "$LOG_FILE"
EOF

chmod +x ~/maintenance.sh

# 月次メンテナンスのcron設定
(crontab -l 2>/dev/null; echo "0 3 1 * * $HOME/maintenance.sh") | crontab -

success "メンテナンススクリプト作成完了"

# Step 9: システム情報表示
log "システム情報を確認中..."

echo
echo "=================================================="
echo "          セットアップ完了！"
echo "=================================================="
echo
echo "🖥️  システム情報:"
echo "   OS: $(lsb_release -d | cut -f2)"
echo "   カーネル: $(uname -r)"
echo "   Docker: $(docker --version | cut -d' ' -f3 | cut -d',' -f1)"
echo "   Docker Compose: $(docker-compose --version | cut -d' ' -f4 | cut -d',' -f1)"
echo
echo "📁 作成されたディレクトリ:"
echo "   ~/kanpai/logs     - ログファイル"
echo "   ~/kanpai/uploads  - アップロードファイル"
echo "   ~/kanpai/backups  - データベースバックアップ"
echo "   ~/kanpai/ssl      - SSL証明書"
echo
echo "🔧 設定されたサービス:"
echo "   UFW (ファイアウォール): 有効"
echo "   fail2ban: 有効"
echo "   システム監視: 5分間隔"
echo "   自動メンテナンス: 月次"
echo
echo "📋 次のステップ:"
echo "1. kanpAIソースコードをクローン"
echo "   git clone https://github.com/YOUR_USERNAME/kanpAI.git"
echo "   cd kanpAI"
echo
echo "2. 環境設定ファイル作成"
echo "   cp .env.production .env"
echo "   nano .env  # 実際の値を設定"
echo
echo "3. kanpAI起動"
echo "   docker-compose -f docker-compose.prod.yml up -d"
echo
echo "4. 動作確認"
echo "   curl http://localhost/api/health"
echo

if grep -q "Port 22022" /etc/ssh/sshd_config 2>/dev/null; then
    warning "SSH設定を変更しました"
    warning "次回接続時: ssh ubuntu@YOUR_SERVER_IP -p 22022"
    warning "設定反映のため、一度ログアウトして再接続してください"
fi

success "さくらVPSのセットアップが完了しました！"

echo
echo "🔄 Docker設定を反映するため、一度ログアウトして再接続してください："
echo "   exit"
echo "   ssh ubuntu@YOUR_SERVER_IP$([ -f /etc/ssh/sshd_config ] && grep -q 'Port 22022' /etc/ssh/sshd_config && echo ' -p 22022' || echo '')"