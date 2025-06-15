# サーバー契約後の実装ガイド - kanpAI

## 🎯 現在の状況: さくらVPS契約完了
次はサーバーに接続して、kanpAIシステムを稼働させます。

---

## Step 1: 初回SSH接続

### 1.1 接続情報の確認

**さくらインターネットから届いたメールを確認:**
```
件名: [さくらのVPS] サーバー設定完了のお知らせ
内容: 
- サーバーIPアドレス: XXX.XXX.XXX.XXX
- 初期ユーザー名: ubuntu
- 初期パスワード: XXXXXXXXXX
- コントロールパネル URL
```

### 1.2 SSH接続実行

**Windows（PowerShell）の場合:**
```powershell
# PowerShell を管理者として実行
ssh ubuntu@YOUR_SERVER_IP

# 例: ssh ubuntu@192.168.1.100
```

**Mac/Linux（Terminal）の場合:**
```bash
ssh ubuntu@YOUR_SERVER_IP
```

**初回接続時の質問:**
```
The authenticity of host 'XXX.XXX.XXX.XXX (XXX.XXX.XXX.XXX)' can't be established.
ECDSA key fingerprint is SHA256:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.
Are you sure you want to continue connecting (yes/no/[fingerprint])? 
```
→ **「yes」と入力してEnter**

**パスワード入力:**
```
ubuntu@XXX.XXX.XXX.XXX's password: 
```
→ **メールに記載されたパスワードを入力**（文字は表示されません）

### 1.3 接続成功確認

**以下のような画面が表示されれば成功:**
```
Welcome to Ubuntu 22.04.X LTS (GNU/Linux X.X.X-XX-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

ubuntu@XXXXXXX:~$ 
```

---

## Step 2: サーバー自動セットアップ

### 2.1 システム基本更新

```bash
# パッケージリスト更新
sudo apt update

# システム全体更新（5-10分程度）
sudo apt upgrade -y
```

### 2.2 セットアップスクリプト取得・実行

```bash
# 作業ディレクトリ作成
mkdir -p ~/setup
cd ~/setup

# GitHubからセットアップスクリプト取得
wget https://raw.githubusercontent.com/YOUR_USERNAME/kanpAI/main/scripts/server-setup.sh

# 実行権限付与
chmod +x server-setup.sh

# セットアップ実行（15-20分程度）
./server-setup.sh
```

### 2.3 セットアップ内容確認

**スクリプトが設定する内容:**
- ✅ ファイアウォール（UFW）設定
- ✅ fail2ban（攻撃対策）設定
- ✅ Docker & Docker Compose インストール
- ✅ SSH設定強化（ポート変更・パスワード認証無効化）
- ✅ システム監視スクリプト設定
- ✅ 自動メンテナンススクリプト設定

**完了後の再接続:**
```bash
# 一度ログアウト
exit

# 新しいSSHポートで再接続
ssh ubuntu@YOUR_SERVER_IP -p 22022
```

---

## Step 3: kanpAIソースコード取得

### 3.1 Git設定

```bash
# Git設定（初回のみ）
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

### 3.2 kanpAIクローン

```bash
# kanpAI用ディレクトリに移動
cd ~/kanpai

# リポジトリクローン
git clone https://github.com/YOUR_USERNAME/kanpAI.git
cd kanpAI

# ブランチ確認
git branch -a
git checkout main
```

### 3.3 ディレクトリ構造確認

```bash
# ファイル構造確認
ls -la

# 期待される構造:
# backend/         - バックエンドAPI
# frontend/        - フロントエンドReact
# docs/           - ドキュメント
# scripts/        - デプロイスクリプト
# docker-compose.prod.yml - 本番環境構成
```

---

## Step 4: 環境設定ファイル作成

### 4.1 基本設定ファイル準備

```bash
# 本番環境設定をベースにコピー
cp .env.production .env

# ファイル確認
ls -la .env*
```

### 4.2 強力なパスワード生成

```bash
# データベースパスワード生成
echo "DB_PASSWORD=$(openssl rand -base64 32)"

# Redisパスワード生成
echo "REDIS_PASSWORD=$(openssl rand -base64 24)"

# JWT秘密鍵生成（64文字）
echo "JWT_SECRET=$(openssl rand -hex 32)"
```

### 4.3 環境設定ファイル編集

```bash
# 設定ファイル編集
nano .env
```

**編集内容（最低限必要な設定）:**
```bash
# === データベース・セキュリティ設定 ===
# 上で生成したパスワードを設定
DB_PASSWORD=YOUR_GENERATED_DB_PASSWORD_HERE
REDIS_PASSWORD=YOUR_GENERATED_REDIS_PASSWORD_HERE
JWT_SECRET=YOUR_GENERATED_JWT_SECRET_HERE

# === URL設定（後でドメイン取得後に変更） ===
FRONTEND_URL=http://YOUR_SERVER_IP
ADMIN_URL=http://YOUR_SERVER_IP/admin
API_BASE_URL=http://YOUR_SERVER_IP

# === 一時的なダミー設定（後で実際のAPIキーに変更） ===
OPENAI_API_KEY=sk-proj-temp-dummy-key-for-initial-setup
LINE_CHANNEL_ACCESS_TOKEN=temp-dummy-line-token
LINE_CHANNEL_SECRET=temp-dummy-line-secret
STRIPE_API_KEY=sk_test_temp-dummy-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_temp-dummy-webhook-secret
STRIPE_PUBLISHABLE_KEY=pk_test_temp-dummy-publishable-key

# === Google Calendar（後で設定） ===
GOOGLE_CALENDAR_ID=temp@example.com
GOOGLE_SERVICE_ACCOUNT_EMAIL=temp@example.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTEMP_DUMMY_KEY\n-----END PRIVATE KEY-----"

# === 本番環境設定 ===
NODE_ENV=production
DEMO_MODE=false
FORCE_HTTPS=false
```

**保存方法（nano）:**
- Ctrl + X → Y → Enter で保存終了

---

## Step 5: 初回デプロイ・動作確認

### 5.1 Docker環境確認

```bash
# Docker動作確認
docker --version
docker-compose --version

# 権限確認
docker ps
```

### 5.2 kanpAI初回起動

```bash
# イメージビルド・サービス起動
docker-compose -f docker-compose.prod.yml up -d

# 起動状況確認（全サービスが "Up" になるまで待機）
docker-compose -f docker-compose.prod.yml ps
```

**期待される結果:**
```
      Name                     Command               State           Ports
--------------------------------------------------------------------------------
kanpai_backend_1      node src/server.js              Up      3002/tcp
kanpai_database_1     docker-entrypoint.sh postgres   Up      5432/tcp
kanpai_frontend_1     nginx -g daemon off;            Up      3000/tcp
kanpai_nginx_1        nginx -g daemon off;            Up      0.0.0.0:80->80/tcp
kanpai_redis_1        docker-entrypoint.sh redis ...  Up      6379/tcp
```

### 5.3 動作確認テスト

```bash
# ヘルスチェック
curl http://localhost/api/health

# 期待される結果:
# {"status":"healthy","timestamp":"2024-XX-XX...","uptime":XXX}

# フロントエンド確認
curl -I http://localhost/

# 期待される結果:
# HTTP/1.1 200 OK
```

### 5.4 ブラウザ確認

**ブラウザで以下にアクセス:**
```
http://YOUR_SERVER_IP
```

**kanpAIダッシュボードが表示されれば成功！**

---

## Step 6: 次のステップ準備

### 6.1 現在の状況確認

```bash
# システム全体の状況確認
docker-compose -f docker-compose.prod.yml logs --tail=20

# エラーがないかチェック
docker-compose -f docker-compose.prod.yml logs | grep -i error
```

### 6.2 バックアップ設定確認

```bash
# 初回バックアップテスト
docker-compose -f docker-compose.prod.yml run --rm backup node scripts/backup-database.js create

# バックアップファイル確認
ls -la backups/
```

### 6.3 セキュリティ確認

```bash
# ファイアウォール状態確認
sudo ufw status

# SSH設定確認
sudo systemctl status ssh

# fail2ban状態確認
sudo systemctl status fail2ban
```

---

## 🎯 次に進むべきステップ

### **現在完了：**
- ✅ サーバー契約・基本設定
- ✅ kanpAI基本システム稼働
- ✅ セキュリティ設定完了

### **次のステップ選択：**

**A. ドメイン取得・HTTPS対応（推奨）**
- お店用のドメイン名取得
- SSL証明書設定でHTTPS化
- より信頼性の高いサイトに

**B. 外部サービス設定開始**
- OpenAI API（AI機能）
- LINE公式アカウント連携
- Stripe決済システム
- Google Calendar連携

**C. お店の実データ設定**
- 実際のメニュー情報入力
- 営業時間・店舗情報設定
- 予約設定のカスタマイズ

---

## 🚨 トラブル時の対処

### SSH接続できない場合

**パスワードが合わない:**
```bash
# さくらVPSコントロールパネル > VPS操作 > OSインストール
# 新しいパスワードを設定して再インストール
```

**接続が拒否される:**
```bash
# さくらVPSコントロールパネル > パケットフィルタ
# SSH(22)ポートが許可されているか確認
```

### kanpAI起動失敗の場合

**ログ確認:**
```bash
# エラーログ詳細確認
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs database
```

**再起動試行:**
```bash
# 全サービス停止・再起動
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

---

**現在の状況をお聞かせください！**
- SSH接続は成功しましたか？
- セットアップスクリプトは完了しましたか？
- kanpAIの起動確認はできましたか？

状況に応じて、次の具体的なステップをご案内します！