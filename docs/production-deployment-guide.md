# kanpAI 本番環境デプロイメントガイド

## 🚀 概要

このガイドでは、kanpAIシステムを実店舗での本番運用に向けてデプロイするための手順を説明します。

## ⚠️ 重要な前提条件

### 必要なソフトウェア
- **Docker**: v20.10+
- **Docker Compose**: v2.0+
- **Node.js**: v18+ (バックアップスクリプト用)
- **PostgreSQL Client**: pg_dump/pg_restore
- **SSL証明書**: Let's Encrypt推奨

### 必要なアカウント・サービス
- **PostgreSQL**: 本番用データベース
- **OpenAI API**: GPT-4アクセス用
- **LINE Developers**: LINE Bot用
- **Stripe**: 決済処理用
- **Google Cloud**: Calendar API用
- **AWS S3**: ファイルストレージ・バックアップ用（オプション）

## 📋 デプロイメント手順

### 1. サーバー環境準備

```bash
# 1. システム更新
sudo apt update && sudo apt upgrade -y

# 2. Docker インストール
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 3. Docker Compose インストール
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. PostgreSQL Client インストール
sudo apt install postgresql-client-15 -y
```

### 2. プロジェクトファイルのデプロイ

```bash
# 1. プロジェクトクローン
git clone https://github.com/your-org/kanpAI.git
cd kanpAI

# 2. 本番用環境変数ファイルを設定
cp backend/.env.production backend/.env
cp frontend/.env.production frontend/.env

# 3. 環境変数を編集（重要！）
nano backend/.env
nano frontend/.env
```

### 3. SSL証明書の設定

```bash
# 1. SSL ディレクトリ作成
mkdir -p ssl

# 2. Let's Encrypt でSSL証明書取得
sudo apt install certbot -y
sudo certbot certonly --standalone -d your-domain.com

# 3. 証明書をコピー
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/certificate.crt
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/private.key
sudo chmod 644 ssl/certificate.crt
sudo chmod 600 ssl/private.key
```

### 4. 本番環境設定ファイルの編集

#### backend/.env の重要な設定項目

```bash
# 必ず変更が必要な項目
JWT_SECRET="CHANGE_TO_STRONG_RANDOM_STRING"
DATABASE_URL="postgresql://user:password@postgres:5432/kanpai"
POSTGRES_PASSWORD="STRONG_DB_PASSWORD"

# API キー設定
OPENAI_API_KEY="sk-proj-your_production_key"
LINE_CHANNEL_ACCESS_TOKEN="your_line_token"
LINE_CHANNEL_SECRET="your_line_secret"
STRIPE_API_KEY="sk_live_your_stripe_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# ドメイン設定
FRONTEND_URL="https://your-domain.com"
CORS_ORIGIN="https://your-domain.com"
```

### 5. データベースの初期化

```bash
# 1. データベースコンテナを起動
docker-compose -f docker-compose.prod.yml up -d postgres

# 2. データベーステーブル作成
docker exec -it kanpai-postgres psql -U kanpai_user -d kanpai -c "\\l"

# 3. 初期データ投入スクリプト実行
docker-compose -f docker-compose.prod.yml exec kanpai-backend node src/db/init-db.js
```

### 6. アプリケーションの起動

```bash
# 1. フロントエンドビルド
cd frontend
npm install
npm run build
cd ..

# 2. 全サービス起動
docker-compose -f docker-compose.prod.yml up -d

# 3. サービス状態確認
docker-compose -f docker-compose.prod.yml ps
```

### 7. 動作確認

```bash
# 1. ヘルスチェック
curl -f https://your-domain.com/api/health

# 2. 詳細ヘルスチェック
curl -f https://your-domain.com/api/health/detailed

# 3. フロントエンドアクセス
# ブラウザで https://your-domain.com にアクセス
```

## 🔒 セキュリティ設定

### 1. ファイアウォール設定

```bash
# UFW設定
sudo ufw enable
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw deny 3001   # Backend port (direct access blocked)
sudo ufw deny 5432   # PostgreSQL (direct access blocked)
```

### 2. SSL証明書の自動更新

```bash
# crontab 設定
sudo crontab -e

# 以下を追加
0 3 * * * certbot renew --quiet && docker-compose -f /path/to/kanpAI/docker-compose.prod.yml restart nginx
```

### 3. バックアップ設定

```bash
# バックアップスクリプト設定
cd /path/to/kanpAI/backend
chmod +x scripts/setup-backup-cron.sh
./scripts/setup-backup-cron.sh
```

## 📊 監視とメンテナンス

### 1. ログ監視

```bash
# アプリケーションログ
docker-compose -f docker-compose.prod.yml logs -f kanpai-backend

# nginx ログ
docker-compose -f docker-compose.prod.yml logs -f nginx

# データベースログ
docker-compose -f docker-compose.prod.yml logs -f postgres
```

### 2. パフォーマンス監視

```bash
# システムリソース
docker stats

# ヘルスチェック
curl https://your-domain.com/api/health/detailed

# nginx ステータス
curl http://localhost:8080/nginx_status
```

### 3. バックアップの確認

```bash
# バックアップファイル一覧
node scripts/backup-database.js list

# 手動バックアップ実行
node scripts/backup-database.js backup

# バックアップからの復元（緊急時）
node scripts/backup-database.js restore /path/to/backup.sql
```

## 🚨 トラブルシューティング

### よくある問題と解決方法

#### 1. サービスが起動しない

```bash
# 原因確認
docker-compose -f docker-compose.prod.yml logs kanpai-backend

# 設定確認
docker-compose -f docker-compose.prod.yml config

# コンテナ再起動
docker-compose -f docker-compose.prod.yml restart kanpai-backend
```

#### 2. データベース接続エラー

```bash
# PostgreSQL 接続確認
docker exec -it kanpai-postgres psql -U kanpai_user -d kanpai

# データベース設定確認
echo $DATABASE_URL

# ネットワーク確認
docker network ls
```

#### 3. SSL証明書エラー

```bash
# 証明書の有効期限確認
openssl x509 -in ssl/certificate.crt -text -noout

# 証明書更新
sudo certbot renew
```

#### 4. メモリ不足

```bash
# メモリ使用量確認
free -h
docker stats

# 不要なコンテナ削除
docker system prune -f
```

## 🔄 更新とメンテナンス

### アプリケーション更新手順

```bash
# 1. メンテナンスモード（nginxでメンテナンスページ表示）
# 2. データベースバックアップ
node scripts/backup-database.js backup

# 3. コード更新
git pull origin main

# 4. フロントエンドビルド
cd frontend && npm run build && cd ..

# 5. サービス再起動
docker-compose -f docker-compose.prod.yml build --no-cache kanpai-backend
docker-compose -f docker-compose.prod.yml up -d

# 6. 動作確認
curl https://your-domain.com/api/health/detailed

# 7. メンテナンスモード解除
```

### 定期メンテナンス（月次推奨）

```bash
# 1. システム更新
sudo apt update && sudo apt upgrade -y

# 2. Docker イメージ更新
docker-compose -f docker-compose.prod.yml pull

# 3. 不要なファイル削除
docker system prune -f

# 4. ログローテーション確認
ls -la logs/

# 5. バックアップファイル確認
ls -la backups/
```

## 📞 緊急時対応

### システム障害時の対応手順

1. **即座の対応**
   ```bash
   # サービス状態確認
   docker-compose -f docker-compose.prod.yml ps
   
   # ログ確認
   docker-compose -f docker-compose.prod.yml logs --tail=100
   ```

2. **データベース復旧**
   ```bash
   # 最新バックアップから復旧
   node scripts/backup-database.js restore /path/to/latest/backup.sql
   ```

3. **サービス復旧**
   ```bash
   # 全サービス再起動
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml up -d
   ```

## 📋 本番運用チェックリスト

### デプロイ前確認項目

- [ ] すべての環境変数が本番用に設定済み
- [ ] SSL証明書が正しく設定済み
- [ ] データベースパスワードが強力
- [ ] JWT_SECRETが独自の値に変更済み
- [ ] 外部APIキーがすべて本番用に設定済み
- [ ] ファイアウォール設定完了
- [ ] バックアップ設定完了
- [ ] 監視設定完了

### 運用開始後の確認項目

- [ ] ヘルスチェックが正常
- [ ] SSL証明書が有効
- [ ] バックアップが正常に実行されている
- [ ] ログが正常に出力されている
- [ ] パフォーマンスが正常
- [ ] 外部API連携が正常

## 📚 関連ドキュメント

- [セキュリティガイド](security-guide.md)
- [バックアップ・復旧ガイド](backup-recovery-guide.md)
- [監視・アラートガイド](monitoring-guide.md)
- [トラブルシューティングガイド](troubleshooting-guide.md)