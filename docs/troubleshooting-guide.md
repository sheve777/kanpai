# kanpAI トラブルシューティングガイド

## 📋 目次
1. [サーバー関連問題](#1-サーバー関連問題)
2. [Docker・コンテナ問題](#2-dockerコンテナ問題)
3. [データベース問題](#3-データベース問題)
4. [外部API連携問題](#4-外部api連携問題)
5. [SSL・ネットワーク問題](#5-sslネットワーク問題)
6. [パフォーマンス問題](#6-パフォーマンス問題)
7. [緊急時復旧手順](#7-緊急時復旧手順)

---

## 1. サーバー関連問題

### 1.1 SSH接続できない

**症状:**
```
ssh: connect to host YOUR_SERVER_IP port 22: Connection refused
```

**原因と対処法:**

**原因1: ポート番号が変更されている**
```bash
# 解決方法: ポート22022で試行
ssh ubuntu@YOUR_SERVER_IP -p 22022
```

**原因2: ファイアウォールでブロック**
```bash
# さくらVPSコントロールパネルで確認
# パケットフィルタ設定でSSHポートが許可されているか確認
```

**原因3: サーバーダウン**
```bash
# さくらVPSコントロールパネルで再起動
# コンソール > 電源操作 > 再起動
```

### 1.2 サーバー容量不足

**症状:**
```
No space left on device
```

**確認コマンド:**
```bash
# ディスク使用量確認
df -h

# 大きなファイル検索
du -sh /var/log/*
du -sh ~/kanpai/logs/*
du -sh ~/kanpai/backups/*
```

**対処法:**
```bash
# ログファイル削除
sudo rm /var/log/*.log.1
sudo rm ~/kanpai/logs/*.log

# 古いバックアップ削除
find ~/kanpai/backups -name "*.sql" -mtime +7 -delete

# Dockerクリーンアップ
docker system prune -af --volumes
```

### 1.3 メモリ不足

**症状:**
```
Out of memory: Killed process
```

**確認コマンド:**
```bash
# メモリ使用量確認
free -h
htop

# プロセス別メモリ使用量
ps aux --sort=-%mem | head -10
```

**対処法:**
```bash
# swap ファイル作成
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 永続化
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 2. Docker・コンテナ問題

### 2.1 コンテナが起動しない

**症状:**
```
docker-compose up fails
```

**診断コマンド:**
```bash
# サービス状態確認
docker-compose -f docker-compose.prod.yml ps

# ログ確認
docker-compose -f docker-compose.prod.yml logs

# 特定サービスのログ
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs database
```

**よくある原因と対処:**

**原因1: 環境変数未設定**
```bash
# .env ファイル確認
cat .env | grep -v "^#" | grep -v "^$"

# 必須変数チェック
grep -E "(DB_PASSWORD|JWT_SECRET)" .env
```

**原因2: ポート競合**
```bash
# ポート使用状況確認
sudo netstat -tulpn | grep -E "(80|443|3002|5432)"

# 競合サービス停止
sudo systemctl stop nginx  # nginxが競合している場合
```

**原因3: Docker Compose設定エラー**
```bash
# 設定ファイル文法チェック
docker-compose -f docker-compose.prod.yml config

# 問題があれば行番号とエラー内容が表示される
```

### 2.2 イメージビルド失敗

**症状:**
```
Error: failed to solve: failed to build
```

**対処法:**
```bash
# キャッシュクリア後再ビルド
docker-compose -f docker-compose.prod.yml build --no-cache

# 個別サービスビルド
docker-compose -f docker-compose.prod.yml build backend
docker-compose -f docker-compose.prod.yml build frontend

# Dockerファイル構文チェック
docker build -t test-build ./backend
```

### 2.3 コンテナ間通信エラー

**症状:**
```
backend_1 | Error: getaddrinfo ENOTFOUND database
```

**確認コマンド:**
```bash
# ネットワーク確認
docker network ls
docker network inspect kanpai_kanpai_network

# コンテナ内からの接続テスト
docker-compose -f docker-compose.prod.yml exec backend ping database
```

**対処法:**
```bash
# ネットワーク再作成
docker-compose -f docker-compose.prod.yml down
docker network prune
docker-compose -f docker-compose.prod.yml up -d
```

---

## 3. データベース問題

### 3.1 データベースに接続できない

**症状:**
```
Error: database "kanpai_production" does not exist
```

**診断手順:**
```bash
# データベースコンテナ状態確認
docker-compose -f docker-compose.prod.yml exec database pg_isready -U kanpai_user

# データベース一覧確認
docker-compose -f docker-compose.prod.yml exec database psql -U kanpai_user -l

# 接続テスト
docker-compose -f docker-compose.prod.yml exec database psql -U kanpai_user -d kanpai_production
```

**対処法:**

**データベースが存在しない場合:**
```bash
# データベース作成
docker-compose -f docker-compose.prod.yml exec database createdb -U kanpai_user kanpai_production

# テーブル初期化
docker-compose -f docker-compose.prod.yml exec backend node src/db/init-db.js
```

**認証エラーの場合:**
```bash
# パスワード確認
grep DB_PASSWORD .env

# PostgreSQL設定確認
docker-compose -f docker-compose.prod.yml exec database cat /var/lib/postgresql/data/pg_hba.conf
```

### 3.2 データベースパフォーマンス低下

**症状:**
```
Slow query execution
```

**診断コマンド:**
```bash
# 接続数確認
docker-compose -f docker-compose.prod.yml exec database psql -U kanpai_user -d kanpai_production -c "SELECT count(*) FROM pg_stat_activity;"

# 長時間実行クエリ確認
docker-compose -f docker-compose.prod.yml exec database psql -U kanpai_user -d kanpai_production -c "SELECT query, state, query_start FROM pg_stat_activity WHERE state = 'active';"
```

**対処法:**
```bash
# データベース統計更新
docker-compose -f docker-compose.prod.yml exec database psql -U kanpai_user -d kanpai_production -c "ANALYZE;"

# インデックス再構築
docker-compose -f docker-compose.prod.yml exec database psql -U kanpai_user -d kanpai_production -c "REINDEX DATABASE kanpai_production;"
```

### 3.3 データベース破損

**症状:**
```
database disk image is malformed
```

**復旧手順:**
```bash
# 1. 最新バックアップ確認
ls -la ~/kanpai/backups/ | tail -5

# 2. データベース停止
docker-compose -f docker-compose.prod.yml stop database

# 3. データボリューム削除（危険！バックアップ確認後）
docker volume rm kanpai_postgres_data

# 4. データベース再作成・復旧
docker-compose -f docker-compose.prod.yml up -d database
sleep 30
docker-compose -f docker-compose.prod.yml run --rm backup node scripts/backup-database.js restore backups/LATEST_BACKUP.sql
```

---

## 4. 外部API連携問題

### 4.1 OpenAI API エラー

**症状:**
```
OpenAI API error: 401 Unauthorized
```

**確認事項:**
```bash
# APIキー確認
grep OPENAI_API_KEY .env

# APIキー有効性テスト
curl -H "Authorization: Bearer YOUR_OPENAI_API_KEY" https://api.openai.com/v1/models
```

**対処法:**
```bash
# 新しいAPIキー取得
# https://platform.openai.com/api-keys

# 環境変数更新
nano .env
# OPENAI_API_KEY=sk-proj-NEW_KEY_HERE

# サービス再起動
docker-compose -f docker-compose.prod.yml restart backend
```

### 4.2 LINE API エラー

**症状:**
```
LINE webhook verification failed
```

**確認事項:**
```bash
# LINE設定確認
grep LINE_ .env

# Webhook URL確認
curl -X POST https://your-domain.com/api/line/webhook \
  -H "Content-Type: application/json" \
  -d '{"events":[]}'
```

**対処法:**
```bash
# LINE Developers Console で確認
# 1. Webhook URL: https://your-domain.com/api/line/webhook
# 2. Channel Secret が正しいか確認
# 3. Channel Access Token が有効か確認

# 設定更新後サービス再起動
docker-compose -f docker-compose.prod.yml restart backend
```

### 4.3 Stripe 決済エラー

**症状:**
```
Stripe webhook signature verification failed
```

**確認事項:**
```bash
# Stripe設定確認
grep STRIPE_ .env

# Webhook エンドポイント確認
curl https://your-domain.com/api/stripe/webhook
```

**対処法:**
```bash
# Stripe Dashboard で確認
# 1. Webhook エンドポイント: https://your-domain.com/api/stripe/webhook
# 2. 署名シークレットが正しいか確認
# 3. 有効なイベントタイプが設定されているか確認

# テスト決済実行
# Stripe Dashboard > イベント > Webhookテスト
```

---

## 5. SSL・ネットワーク問題

### 5.1 SSL証明書エラー

**症状:**
```
ERR_CERT_AUTHORITY_INVALID
```

**確認コマンド:**
```bash
# 証明書状態確認
sudo certbot certificates

# 証明書の詳細確認
openssl x509 -in /etc/letsencrypt/live/your-domain.com/fullchain.pem -text -noout

# 証明書の有効期限確認
echo | openssl s_client -servername your-domain.com -connect your-domain.com:443 2>/dev/null | openssl x509 -noout -dates
```

**対処法:**
```bash
# 証明書更新
sudo certbot renew

# 証明書再取得（ドメイン変更時）
sudo certbot delete --cert-name your-domain.com
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# nginx 再起動
sudo systemctl restart nginx
```

### 5.2 DNS解決エラー

**症状:**
```
DNS resolution failed
```

**診断コマンド:**
```bash
# DNS解決確認
nslookup your-domain.com
dig your-domain.com

# 他のDNSサーバーで確認
nslookup your-domain.com 8.8.8.8
nslookup your-domain.com 1.1.1.1
```

**対処法:**
```bash
# ドメイン管理画面でDNS設定確認
# Aレコード: your-domain.com → YOUR_SERVER_IP
# Aレコード: www.your-domain.com → YOUR_SERVER_IP

# DNS伝播待ち（最大24-48時間）
# 伝播状況確認: https://www.whatsmydns.net/
```

### 5.3 ファイアウォール問題

**症状:**
```
Connection timeout
```

**確認コマンド:**
```bash
# UFW状態確認
sudo ufw status verbose

# ポート待受状況確認
sudo netstat -tulpn | grep -E "(80|443)"

# さくらVPS パケットフィルタ確認
# コントロールパネル > パケットフィルタ
```

**対処法:**
```bash
# 必要ポート開放
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# さくらVPS側でも設定
# コントロールパネル > パケットフィルタ > HTTP(80), HTTPS(443) 許可
```

---

## 6. パフォーマンス問題

### 6.1 レスポンス速度低下

**診断コマンド:**
```bash
# レスポンス時間測定
curl -w "@-" -o /dev/null -s https://your-domain.com/api/health <<< '
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
           time_total:  %{time_total}\n
'

# サーバー負荷確認
htop
docker stats
```

**対処法:**
```bash
# Redis キャッシュ確認
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping

# データベース最適化
docker-compose -f docker-compose.prod.yml exec database psql -U kanpai_user -d kanpai_production -c "VACUUM ANALYZE;"

# nginx ログ確認
tail -f /var/log/nginx/access.log
```

### 6.2 高負荷時の対応

**確認事項:**
```bash
# CPU使用率
top
htop

# メモリ使用率
free -h

# ディスクI/O
iostat -x 1
```

**対処法:**
```bash
# プロセス制限
# docker-compose.prod.yml で resources 制限追加

# スケールアップ（さくらVPS）
# コントロールパネル > プラン変更 > 上位プラン選択

# CDN導入検討
# Cloudflare 等で静的ファイル配信を最適化
```

---

## 7. 緊急時復旧手順

### 7.1 完全システムダウン

**緊急復旧手順:**
```bash
# 1. サーバー状態確認
ssh ubuntu@YOUR_SERVER_IP -p 22022

# 2. Docker サービス確認
docker-compose -f docker-compose.prod.yml ps

# 3. 全サービス再起動
docker-compose -f docker-compose.prod.yml restart

# 4. 改善しない場合は完全再構築
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# 5. データベース破損の場合はバックアップ復旧
ls -la ~/kanpai/backups/
docker-compose -f docker-compose.prod.yml run --rm backup node scripts/backup-database.js restore backups/LATEST_BACKUP.sql
```

### 7.2 データ消失時の復旧

**復旧手順:**
```bash
# 1. 利用可能なバックアップ確認
ls -la ~/kanpai/backups/

# 2. 最新バックアップの詳細確認
file ~/kanpai/backups/LATEST_BACKUP.sql

# 3. データベース完全復旧
docker-compose -f docker-compose.prod.yml stop backend
docker-compose -f docker-compose.prod.yml run --rm backup node scripts/backup-database.js restore backups/LATEST_BACKUP.sql
docker-compose -f docker-compose.prod.yml start backend

# 4. データ整合性確認
curl https://your-domain.com/api/health/detailed
```

### 7.3 緊急時連絡先

**さくらインターネット:**
- 📞 電話: 048-780-2066 （平日10:00-18:00）
- 💻 サポートサイト: https://help.sakura.ad.jp/

**緊急時判断基準:**
- システム完全停止: 即座に復旧作業開始
- 部分的な機能停止: 1時間以内に調査・復旧
- パフォーマンス低下: 営業時間外に調査

---

## 8. 予防保守チェックリスト

### 8.1 日次チェック項目
- [ ] システム稼働状況確認
- [ ] エラーログ確認
- [ ] バックアップ実行確認
- [ ] ディスク容量確認

### 8.2 週次チェック項目
- [ ] パフォーマンス監視
- [ ] セキュリティアップデート確認
- [ ] 外部API連携状況確認
- [ ] SSL証明書期限確認

### 8.3 月次チェック項目
- [ ] 全システム更新
- [ ] バックアップ復旧テスト
- [ ] パスワード・キー更新検討
- [ ] 利用料金・契約確認

**定期メンテナンス実行:**
```bash
# 月次メンテナンススクリプト実行
~/maintenance.sh
```

このトラブルシューティングガイドで、ほとんどの問題に対応できます。解決しない場合は、ログ情報と症状を詳しく記録して専門サポートに相談してください。