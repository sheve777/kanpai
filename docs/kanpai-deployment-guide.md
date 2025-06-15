# kanpAI 本番デプロイメント完全ガイド

## 📋 目次
1. [デプロイ前準備](#1-デプロイ前準備)
2. [環境変数設定](#2-環境変数設定)
3. [外部サービス設定](#3-外部サービス設定)
4. [kanpAIデプロイ実行](#4-kanpaiデプロイ実行)
5. [動作確認・テスト](#5-動作確認テスト)
6. [LINE公式アカウント連携](#6-line公式アカウント連携)
7. [決済システム設定](#7-決済システム設定)

---

## 1. デプロイ前準備

### 1.1 前提条件チェック

**完了済み項目確認:**
- [ ] さくらVPS契約・初期設定完了
- [ ] ドメイン取得・DNS設定完了
- [ ] SSL証明書設定完了
- [ ] サーバー環境構築完了（Docker等）

### 1.2 必要な外部サービスアカウント

**取得が必要なアカウント:**
1. **OpenAI API** - AI機能（レポート生成等）
2. **LINE Developers** - LINE公式アカウント連携
3. **Stripe** - オンライン決済処理
4. **Google Cloud** - カレンダー連携・認証

### 1.3 準備するパスワード・キー

**強力なパスワード生成例:**
```bash
# データベースパスワード生成
openssl rand -base64 32

# JWT秘密鍵生成（64文字推奨）
openssl rand -hex 32

# Redis パスワード生成  
openssl rand -base64 24
```

---

## 2. 環境変数設定

### 2.1 .env ファイル準備

**Step 1: kanpAIソースコード取得**
```bash
# サーバーにSSH接続
ssh ubuntu@YOUR_SERVER_IP -p 22022

# kanpAIクローン
cd ~/kanpai
git clone https://github.com/YOUR_USERNAME/kanpAI.git
cd kanpAI

# 本番環境設定をベースにコピー
cp .env.production .env
```

**Step 2: 基本設定の更新**
```bash
nano .env
```

### 2.2 必須環境変数設定

**データベース・セキュリティ設定:**
```bash
# データベースパスワード（生成した強力なパスワード）
DB_PASSWORD=YOUR_STRONG_DB_PASSWORD_HERE

# Redis パスワード
REDIS_PASSWORD=YOUR_STRONG_REDIS_PASSWORD_HERE

# JWT秘密鍵（64文字のランダム文字列）
JWT_SECRET=YOUR_64_CHAR_RANDOM_JWT_SECRET_HERE
```

**ドメイン・URL設定:**
```bash
# 実際のドメイン名に変更
FRONTEND_URL=https://your-actual-domain.com
ADMIN_URL=https://admin.your-actual-domain.com  
API_BASE_URL=https://api.your-actual-domain.com

# CORS設定
CORS_ORIGIN=https://your-actual-domain.com
```

### 2.3 一時的なダミー設定

**初回デプロイ時は一時的に以下を設定:**
```bash
# OpenAI（後で実際のキーに変更）
OPENAI_API_KEY=sk-proj-dummy-key-for-initial-deployment

# LINE（後で実際のトークンに変更）  
LINE_CHANNEL_ACCESS_TOKEN=dummy-channel-access-token
LINE_CHANNEL_SECRET=dummy-channel-secret

# Stripe（後で実際のキーに変更）
STRIPE_API_KEY=sk_test_dummy-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_dummy-webhook-secret
STRIPE_PUBLISHABLE_KEY=pk_test_dummy-publishable-key

# Google Calendar（後で設定）
GOOGLE_CALENDAR_ID=dummy@gmail.com
GOOGLE_SERVICE_ACCOUNT_EMAIL=dummy@example.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nDUMMY_KEY\n-----END PRIVATE KEY-----"
```

---

## 3. 外部サービス設定

### 3.1 OpenAI API設定

**Step 1: OpenAI アカウント作成**
```
https://platform.openai.com/
```

**Step 2: API キー取得**
1. 「API keys」タブに移動
2. 「Create new secret key」をクリック
3. キー名：「kanpAI-production」
4. 生成されたキーをコピー

**Step 3: 課金設定**
1. 「Billing」タブで支払い方法設定
2. 利用限度額設定：月$50推奨（小規模店舗）

**Step 4: 環境変数更新**
```bash
# .env ファイル更新
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_OPENAI_KEY_HERE
```

### 3.2 Google Calendar API設定

**Step 1: Google Cloud Console**
```
https://console.cloud.google.com/
```

**Step 2: プロジェクト作成**
1. 新しいプロジェクト作成：「kanpAI-restaurant」
2. Calendar API有効化
3. サービスアカウント作成

**Step 3: サービスアカウント設定**
```bash
# サービスアカウント名：kanpai-calendar-service
# 権限：Google Calendar API
# JSON キーファイルダウンロード
```

**Step 4: Googleカレンダー設定**
1. レストラン用Googleカレンダー作成
2. サービスアカウントに共有権限付与
3. カレンダーIDをコピー

**Step 5: 環境変数更新**
```bash
GOOGLE_CALENDAR_ID=your-restaurant-calendar@group.calendar.google.com
GOOGLE_SERVICE_ACCOUNT_EMAIL=kanpai-calendar-service@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY\n-----END PRIVATE KEY-----"
```

---

## 4. kanpAIデプロイ実行

### 4.1 デプロイ前チェック

**設定確認:**
```bash
# 環境変数ファイル確認
cat .env | grep -v "dummy\|DUMMY"

# Docker Compose 設定確認
docker-compose -f docker-compose.prod.yml config
```

### 4.2 初回デプロイ実行

**Step 1: 自動デプロイスクリプト実行**
```bash
# 実行権限確認
chmod +x scripts/deploy.sh

# デプロイ実行
./scripts/deploy.sh
```

**Step 2: 手動デプロイ（スクリプトが失敗した場合）**
```bash
# イメージビルド
docker-compose -f docker-compose.prod.yml build --no-cache

# サービス開始
docker-compose -f docker-compose.prod.yml up -d

# ログ確認
docker-compose -f docker-compose.prod.yml logs -f
```

### 4.3 データベース初期化

**Step 1: データベース接続確認**
```bash
# データベースコンテナに接続
docker-compose -f docker-compose.prod.yml exec database psql -U kanpai_user -d kanpai_production
```

**Step 2: 必要なテーブル作成**
```bash
# バックエンドコンテナで初期化スクリプト実行
docker-compose -f docker-compose.prod.yml exec backend node src/db/init-db.js

# 成功確認
echo $?  # 0が返れば成功
```

---

## 5. 動作確認・テスト

### 5.1 基本動作確認

**Step 1: サービス状態確認**
```bash
# 全サービス状態確認
docker-compose -f docker-compose.prod.yml ps

# 期待される状態：全サービスが「Up」
```

**Step 2: ヘルスチェック**
```bash
# 基本ヘルスチェック
curl https://your-domain.com/api/health

# 詳細システム状態
curl https://your-domain.com/api/health/detailed
```

**Step 3: フロントエンド確認**
```bash
# ブラウザで確認
# https://your-domain.com にアクセス
# kanpAI ダッシュボードが表示されることを確認
```

### 5.2 機能別テスト

**データベース接続テスト:**
```bash
# 店舗情報取得API
curl https://your-domain.com/api/stores

# 予約システム状態確認
curl https://your-domain.com/api/reservations/business-status?store_id=test
```

**認証システムテスト:**
```bash
# 管理者ログイン画面確認
# https://your-domain.com/admin にアクセス
```

### 5.3 パフォーマンステスト

**レスポンス時間確認:**
```bash
# API レスポンス時間測定
curl -w "@-" -o /dev/null -s https://your-domain.com/api/health <<< '
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
           time_total:  %{time_total}\n
'
```

**同時接続テスト:**
```bash
# 複数リクエスト同時実行
for i in {1..10}; do
  curl -s https://your-domain.com/api/health &
done
wait
```

---

## 6. LINE公式アカウント連携

### 6.1 LINE公式アカウント作成

**Step 1: LINE公式アカウント申請**
```
https://www.linebiz.com/jp/entry/
```

**Step 2: LINE Developers設定**
```
https://developers.line.biz/
```

**Step 3: Messaging API設定**
1. 新しいプロバイダー作成
2. Messaging API チャンネル作成
3. チャンネルアクセストークン発行

### 6.2 Webhook設定

**Step 1: Webhook URL設定**
```
Webhook URL: https://your-domain.com/api/line/webhook
```

**Step 2: 環境変数更新**
```bash
# 実際のLINEトークンに更新
LINE_CHANNEL_ACCESS_TOKEN=YOUR_ACTUAL_LINE_ACCESS_TOKEN
LINE_CHANNEL_SECRET=YOUR_ACTUAL_LINE_CHANNEL_SECRET
```

**Step 3: サービス再起動**
```bash
docker-compose -f docker-compose.prod.yml restart backend
```

### 6.3 LINE動作確認

**Webhook テスト:**
```bash
# LINE Developers Console でWebhookテスト実行
# または実際のLINE公式アカウントにメッセージ送信
```

---

## 7. 決済システム設定

### 7.1 Stripe本番アカウント設定

**Step 1: Stripeアカウント作成**
```
https://stripe.com/jp
```

**Step 2: 本番環境アクティベート**
1. 事業者情報入力
2. 銀行口座情報登録
3. 本人確認書類アップロード

**Step 3: APIキー取得**
```
ダッシュボード > 開発者 > APIキー
- 公開可能キー（pk_live_...）
- 秘密キー（sk_live_...）
```

### 7.2 Webhook設定

**Step 1: Webhook エンドポイント追加**
```
URL: https://your-domain.com/api/stripe/webhook
イベント: checkout.session.completed, payment_intent.succeeded
```

**Step 2: 環境変数更新**
```bash
STRIPE_API_KEY=sk_live_YOUR_ACTUAL_STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_WEBHOOK_SECRET
```

### 7.3 決済テスト

**テストカード情報:**
```
カード番号: 4242 4242 4242 4242
有効期限: 12/25
CVC: 123
```

**決済フロー確認:**
1. フロントエンドで予約作成
2. 決済画面表示確認
3. テスト決済実行
4. 予約確定確認

---

## 8. 最終確認・本番稼働開始

### 8.1 全機能統合テスト

**顧客利用フロー:**
1. LINE公式アカウント友達追加
2. メニュー確認
3. 予約システム利用
4. 決済完了
5. Googleカレンダー反映確認

**管理者機能テスト:**
1. 管理画面ログイン
2. 予約一覧確認
3. メニュー管理
4. レポート生成確認

### 8.2 監視・アラート確認

**システム監視:**
```bash
# 監視スクリプト動作確認
~/monitor_kanpai.sh

# ログ確認
tail -f ~/kanpai/logs/monitor.log
```

**バックアップ確認:**
```bash
# 手動バックアップ実行
docker-compose -f docker-compose.prod.yml run --rm backup node scripts/backup-database.js create

# バックアップファイル確認
ls -la backups/
```

### 8.3 パフォーマンス最適化

**キャッシュ設定確認:**
```bash
# Redis 接続確認
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping
```

**CDN設定（オプション）:**
```bash
# 静的ファイル配信最適化
# Cloudflare等のCDN導入検討
```

---

## 🚨 緊急時対応手順

### システム障害時
```bash
# 1. 状況確認
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs --tail=100

# 2. サービス再起動  
docker-compose -f docker-compose.prod.yml restart

# 3. 完全再構築（最終手段）
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### データベース障害時
```bash
# 最新バックアップから復旧
ls -la backups/ | tail -5
docker-compose -f docker-compose.prod.yml run --rm backup node scripts/backup-database.js restore backups/LATEST_BACKUP.sql
```

---

## ✅ デプロイ完了チェックリスト

### システム基盤
- [ ] サーバー環境構築完了
- [ ] ドメイン・SSL設定完了
- [ ] Docker環境稼働確認
- [ ] データベース初期化完了

### 外部サービス連携
- [ ] OpenAI API設定・動作確認
- [ ] Google Calendar API設定・動作確認  
- [ ] LINE公式アカウント連携確認
- [ ] Stripe決済システム動作確認

### セキュリティ・運用
- [ ] HTTPS接続確認
- [ ] 自動バックアップ設定確認
- [ ] 監視システム動作確認
- [ ] ログ収集・管理設定確認

### 機能テスト
- [ ] 予約システム動作確認
- [ ] メニュー管理機能確認
- [ ] 管理者ダッシュボード確認
- [ ] レポート生成機能確認

**🎉 すべて完了で本番稼働開始！**

これでお父様の店舗でkanpAIシステムが安全・安定して稼働します。