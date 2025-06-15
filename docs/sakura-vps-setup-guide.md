# さくらVPS セットアップガイド - kanpAI導入完全版

## 📋 目次
1. [さくらVPS申込み手順](#1-さくらvps申込み手順)
2. [初回ログイン・セキュリティ設定](#2-初回ログインセキュリティ設定)
3. [サーバー環境構築](#3-サーバー環境構築)
4. [kanpAIデプロイ](#4-kanpaiデプロイ)
5. [ドメイン・SSL設定](#5-ドメインssl設定)
6. [運用・メンテナンス](#6-運用メンテナンス)

---

## 1. さくらVPS申込み手順

### 1.1 事前準備
**必要なもの:**
- クレジットカードまたは銀行口座
- メールアドレス（重要な通知用）
- SSH接続用端末（Windows: PowerShell、Mac: Terminal）

### 1.2 さくらVPS申込み

**Step 1: さくらインターネット公式サイトにアクセス**
```
https://vps.sakura.ad.jp/
```

**Step 2: プラン選択**
```
推奨プラン: 2GB
料金: 1,848円/月（税込）
初期費用: 無料

スペック:
- CPU: 3コア
- メモリ: 2GB
- SSD: 100GB
- 転送量: 無制限
```

**Step 3: サーバー設定**
```
プラン: 2GB
リージョン: 石狩第1ゾーン（推奨・最新設備）
OS: Ubuntu 22.04 LTS（推奨）
インストールタイプ: 標準
```

**Step 4: 管理者情報入力**
```
ユーザー名: ubuntu（デフォルト推奨）
パスワード: 強力なパスワード設定
（大文字・小文字・数字・記号を含む12文字以上）

例: KanpAI2024!@#$
```

**Step 5: お客様情報・支払い方法**
- 個人情報入力
- クレジットカード情報登録
- 利用規約同意

### 1.3 サーバー作成完了
```
作成時間: 約5-10分
完了メール: 登録メールアドレスに届く

重要情報:
- サーバーIPアドレス
- 初期ログイン情報
- コントロールパネルURL
```

---

## 2. 初回ログイン・セキュリティ設定

### 2.1 SSH接続テスト

**Windows（PowerShell）:**
```powershell
ssh ubuntu@YOUR_SERVER_IP
```

**Mac/Linux:**
```bash
ssh ubuntu@YOUR_SERVER_IP
```

初回接続時:
```
The authenticity of host 'YOUR_IP' can't be established.
ECDSA key fingerprint is SHA256:...
Are you sure you want to continue connecting (yes/no)? yes
```

### 2.2 システム更新
```bash
# パッケージリスト更新
sudo apt update

# システム全体更新
sudo apt upgrade -y

# 再起動（重要な更新がある場合）
sudo reboot
```

### 2.3 セキュリティ強化

**SSH鍵認証設定（推奨）:**
```bash
# ローカルマシンで鍵生成
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# 公開鍵をサーバーにコピー
ssh-copy-id ubuntu@YOUR_SERVER_IP

# SSH設定強化
sudo nano /etc/ssh/sshd_config
```

**SSH設定変更内容:**
```
PasswordAuthentication no
PermitRootLogin no
Port 22022  # デフォルトポート変更
```

**ファイアウォール設定:**
```bash
# UFW有効化
sudo ufw enable

# SSH許可（変更したポートを指定）
sudo ufw allow 22022

# HTTP/HTTPS許可
sudo ufw allow 80
sudo ufw allow 443

# 設定確認
sudo ufw status
```

### 2.4 基本ツールインストール
```bash
# 必要なパッケージ
sudo apt install -y \
    curl \
    wget \
    git \
    unzip \
    htop \
    nano \
    fail2ban

# fail2ban設定（ブルートフォース攻撃対策）
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 3. サーバー環境構築

### 3.1 Docker インストール
```bash
# Docker公式GPGキー追加
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Dockerリポジトリ追加
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# パッケージ更新・Docker インストール
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Docker Compose インストール
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# ubuntuユーザーをdockerグループに追加
sudo usermod -aG docker ubuntu

# 設定反映のため再ログイン
exit
ssh ubuntu@YOUR_SERVER_IP
```

### 3.2 Docker動作確認
```bash
# Docker バージョン確認
docker --version
docker-compose --version

# テスト実行
docker run hello-world
```

### 3.3 必要なディレクトリ作成
```bash
# kanpAI用ディレクトリ
mkdir -p ~/kanpai
cd ~/kanpai

# ログ・データ用ディレクトリ
mkdir -p logs uploads backups ssl
```

---

## 4. kanpAIデプロイ

### 4.1 ソースコード取得
```bash
# Git設定（初回のみ）
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"

# kanpAIクローン
git clone https://github.com/YOUR_USERNAME/kanpAI.git
cd kanpAI
```

### 4.2 環境変数設定
```bash
# 本番環境設定ファイル作成
cp .env.production .env

# 環境変数編集
nano .env
```

**必須設定項目:**
```bash
# データベース
DB_PASSWORD=強力なパスワード設定

# JWT認証
JWT_SECRET=64文字の英数字ランダム文字列

# 外部API（実際の値に変更）
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY
LINE_CHANNEL_ACCESS_TOKEN=YOUR_ACTUAL_TOKEN
STRIPE_API_KEY=sk_live_YOUR_ACTUAL_KEY

# ドメイン（取得後に設定）
FRONTEND_URL=https://your-restaurant-domain.com
API_BASE_URL=https://api.your-restaurant-domain.com
```

### 4.3 kanpAI起動
```bash
# 本番環境でコンテナ起動
docker-compose -f docker-compose.prod.yml up -d

# 起動確認
docker-compose -f docker-compose.prod.yml ps

# ログ確認
docker-compose -f docker-compose.prod.yml logs -f
```

### 4.4 動作確認
```bash
# ヘルスチェック
curl http://localhost/api/health

# 詳細ステータス
curl http://localhost/api/health/detailed
```

---

## 5. ドメイン・SSL設定

### 5.1 ドメイン取得
**推奨業者:**
- お名前.com: 1,408円/年（.com）
- ムームードメイン: 1,628円/年（.com）
- さくらドメイン: 1,886円/年（.com）

### 5.2 DNS設定
```
Aレコード設定:
your-domain.com → YOUR_SERVER_IP
www.your-domain.com → YOUR_SERVER_IP
api.your-domain.com → YOUR_SERVER_IP
```

### 5.3 SSL証明書設定（Let's Encrypt）
```bash
# Certbot インストール
sudo apt install -y certbot python3-certbot-nginx

# 証明書取得
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自動更新設定
sudo crontab -e
# 以下を追加
0 12 * * * /usr/bin/certbot renew --quiet
```

### 5.4 Nginx設定更新
```bash
# nginx設定ファイル編集
nano nginx/nginx.conf

# ドメイン名を実際のものに変更
# your-domain.com → 実際のドメイン名

# SSL設定有効化（コメントアウト解除）
```

---

## 6. 運用・メンテナンス

### 6.1 定期バックアップ設定
```bash
# cron設定
crontab -e

# 毎日深夜2時にバックアップ実行
0 2 * * * cd ~/kanpai && docker-compose -f docker-compose.prod.yml run --rm backup node scripts/backup-database.js create
```

### 6.2 監視・アラート設定
```bash
# システム監視スクリプト
nano ~/monitor.sh
```

**monitor.sh内容:**
```bash
#!/bin/bash
# kanpAI監視スクリプト

HEALTH_URL="http://localhost/api/health"
EMAIL="your-email@example.com"

if ! curl -f $HEALTH_URL > /dev/null 2>&1; then
    echo "kanpAI system is down!" | mail -s "kanpAI Alert" $EMAIL
    # 自動復旧試行
    cd ~/kanpai
    docker-compose -f docker-compose.prod.yml restart
fi
```

### 6.3 ログ管理
```bash
# ログローテーション設定
sudo nano /etc/logrotate.d/kanpai
```

**ログローテーション設定:**
```
~/kanpai/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 ubuntu ubuntu
}
```

### 6.4 定期メンテナンス
```bash
# 月次メンテナンススクリプト
nano ~/monthly_maintenance.sh
```

**monthly_maintenance.sh:**
```bash
#!/bin/bash
# 月次メンテナンス

# システム更新
sudo apt update && sudo apt upgrade -y

# Docker イメージクリーンアップ
docker system prune -f

# ログクリーンアップ
find ~/kanpai/logs -name "*.log" -mtime +30 -delete

# 古いバックアップ削除（30日以上）
find ~/kanpai/backups -name "*.sql" -mtime +30 -delete
```

---

## 🚨 緊急時対応

### システムダウン時
```bash
# 1. 状況確認
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs

# 2. 再起動試行
docker-compose -f docker-compose.prod.yml restart

# 3. 完全再構築（最後の手段）
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### データベース復旧
```bash
# バックアップ一覧確認
ls -la backups/

# 復旧実行
docker-compose -f docker-compose.prod.yml run --rm backup node scripts/backup-database.js restore backups/BACKUP_FILE_NAME.sql
```

---

## 📞 サポート連絡先

**さくらインターネット:**
- 電話: 048-780-2066
- 受付: 平日 10:00-18:00

**緊急時（24時間）:**
- さくらVPSコントロールパネル
- サポートリクエスト機能

---

**完了チェックリスト:**
- [ ] さくらVPS申込み・初期設定完了
- [ ] SSH鍵認証・セキュリティ設定完了  
- [ ] Docker環境構築完了
- [ ] kanpAIデプロイ・動作確認完了
- [ ] ドメイン取得・DNS設定完了
- [ ] SSL証明書設定完了
- [ ] バックアップ・監視設定完了

この手順通りに進めれば、お父様の店舗用kanpAIシステムが安全・安定して稼働します！