# 🏪 kanpAI 実店舗運用開始前チェックリスト

## 🚨 **緊急対応済み - セキュリティ問題**

### ✅ 完了済み項目

1. **環境設定の本番対応**
   - ✅ `.env.production` ファイル作成完了
   - ✅ `DEMO_MODE=false` に変更済み
   - ✅ デモパスワード無効化済み
   - ✅ JWT_SECRET を開発用に変更（本番では更に変更必要）

2. **URL設定の本番対応**
   - ✅ Stripe決済URLを環境変数化
   - ✅ CORS設定を環境変数化
   - ✅ フロントエンド・バックエンドURL設定分離

3. **監視・ログ機能の実装**
   - ✅ ヘルスチェックエンドポイント実装
   - ✅ 詳細システムメトリクス取得機能
   - ✅ ログローテーション・セキュリティログ分離

4. **バックアップシステム構築**
   - ✅ 自動データベースバックアップスクリプト
   - ✅ S3アップロード機能（オプション）
   - ✅ 古いバックアップ自動削除機能
   - ✅ cron設定スクリプト

5. **デプロイメント環境構築**
   - ✅ Docker本番用設定
   - ✅ nginx リバースプロキシ設定
   - ✅ SSL/HTTPS対応
   - ✅ レート制限・セキュリティヘッダー設定

## 🔥 **本番運用前の必須作業**

### 1. 本番用APIキー・設定値の置換

```bash
# backend/.env.production を編集
JWT_SECRET="REPLACE_WITH_STRONG_64_CHAR_RANDOM_STRING"
OPENAI_API_KEY="sk-proj-YOUR_PRODUCTION_KEY"
LINE_CHANNEL_ACCESS_TOKEN="YOUR_PRODUCTION_LINE_TOKEN"
STRIPE_API_KEY="sk_live_YOUR_PRODUCTION_STRIPE_KEY"
DATABASE_URL="postgresql://user:password@host:port/database"
```

### 2. SSL証明書の取得・設定

```bash
# Let's Encrypt で証明書取得
sudo certbot certonly --standalone -d your-domain.com
```

### 3. データベースの本番環境構築

```bash
# PostgreSQL サーバーセットアップ
# 初期データ投入
node src/db/init-db.js
node src/db/create-auth-tables.js
```

### 4. ドメイン・DNS設定

- 本番ドメインのDNS設定
- nginx.conf のserver_name更新

## 📊 **本番運用で重要な監視項目**

### 1. 基本監視エンドポイント

| エンドポイント | 目的 | 正常値 |
|---|---|---|
| `GET /api/health` | 基本ヘルスチェック | 200 OK |
| `GET /api/health/detailed` | 詳細システム状態 | status: "healthy" |
| `GET /api/health/metrics` | システムメトリクス | メモリ使用量 < 500MB |

### 2. ログファイル監視

```bash
# 重要ログファイル
logs/error.log       # エラーログ
logs/security.log    # セキュリティ関連
logs/combined.log    # 全般ログ
logs/backup.log      # バックアップログ
```

### 3. データベース監視

```bash
# 接続数確認
SELECT count(*) FROM pg_stat_activity;

# データベースサイズ確認
SELECT pg_size_pretty(pg_database_size('kanpai'));
```

## ⚠️ **実店舗運用で注意すべき問題点**

### 1. パフォーマンス問題

**症状**: レスポンスが遅い、タイムアウトが発生
**対策**:
- DBインデックス最適化
- 接続プール設定調整（current: max=20）
- Redis キャッシュ導入検討

### 2. LINE API制限

**症状**: LINE送信が失敗する
**対策**:
- レート制限の監視（1000通/月）
- 送信失敗時のリトライ機能
- 送信ログの詳細記録

### 3. OpenAI API制限・コスト

**症状**: GPT-4 APIが呼び出せない、コストが高い
**対策**:
- 使用量制限の実装（current: usageLimit.js）
- GPT-3.5への切り替えオプション
- プロンプト最適化によるトークン削減

### 4. 決済処理のエラーハンドリング

**症状**: Stripe決済で失敗時の処理が不完全
**対策**:
- Webhook失敗時のリトライ機能
- 決済状態の定期同期
- 手動決済確認機能

## 🏪 **店舗固有の初期設定が必要な項目**

### 1. 店舗基本情報

```sql
-- stores テーブルへの店舗登録
INSERT INTO stores (id, name, phone, address, business_hours, seats)
VALUES ('store-id', '店舗名', '電話番号', '住所', '営業時間', 座席数);
```

### 2. メニューデータ

```bash
# メニューテーブル初期化
node src/db/create-menus.js
```

### 3. LINE公式アカウント設定

- Webhook URL: `https://your-domain.com/api/line/webhook`
- 応答メッセージの無効化
- リッチメニュー設定

### 4. Google Calendar連携

- サービスアカウント作成
- Calendar APIの有効化
- カレンダーID設定

## 🛠 **運用開始後の推奨メンテナンス**

### 日次確認事項

```bash
# ヘルスチェック
curl https://your-domain.com/api/health/detailed

# バックアップ確認
ls -la backups/ | tail -5

# エラーログ確認
tail -n 50 logs/error.log
```

### 週次確認事項

```bash
# システムリソース確認
docker stats

# データベースサイズ確認
docker exec kanpai-postgres psql -U kanpai_user -d kanpai -c "
  SELECT schemaname,tablename,attname,avg_width,n_distinct,null_frac 
  FROM pg_stats 
  WHERE schemaname='public' 
  ORDER BY avg_width DESC LIMIT 10;"
```

### 月次確認事項

```bash
# システム更新
sudo apt update && sudo apt upgrade -y

# SSL証明書有効期限確認
openssl x509 -in ssl/certificate.crt -text -noout | grep "Not After"

# バックアップファイル整理
node scripts/backup-database.js list
```

## 📞 **緊急連絡・サポート体制**

### システム障害時の対応優先順位

1. **Level 1 (即座対応)**: サービス完全停止
2. **Level 2 (1時間以内)**: 重要機能の一部停止
3. **Level 3 (24時間以内)**: 軽微な機能問題

### エスカレーション手順

1. ログ確認・基本トラブルシューティング
2. バックアップからの復旧試行
3. 技術サポートへの連絡
4. 顧客への状況報告

## 📋 **最終チェックリスト（運用開始直前）**

### 本番環境設定確認

- [ ] すべてのAPIキーが本番用に設定済み
- [ ] DATABASE_URLが本番DB向けに設定済み
- [ ] JWT_SECRETが一意の強力な値
- [ ] SSL証明書が有効で自動更新設定済み
- [ ] ドメイン・DNS設定が正しい

### セキュリティ確認

- [ ] DEMO_MODE=false に設定済み
- [ ] ファイアウォール設定完了
- [ ] レート制限が適切に動作
- [ ] HTTPS強制リダイレクト動作確認

### 監視・バックアップ確認

- [ ] ヘルスチェックエンドポイントが正常
- [ ] ログローテーション設定済み
- [ ] 自動バックアップが動作確認済み
- [ ] S3アップロード設定（使用する場合）

### 機能テスト確認

- [ ] 予約機能の動作確認
- [ ] LINE Bot の応答確認
- [ ] 決済処理の動作確認
- [ ] メニュー管理機能確認
- [ ] レポート生成機能確認

### パフォーマンステスト

- [ ] 負荷テスト実施済み
- [ ] レスポンス時間が許容範囲内
- [ ] メモリ・CPU使用率が安定
- [ ] データベース接続プールが適切

---

## 🎉 **運用開始準備完了！**

このチェックリストの全項目を完了すれば、kanpAIシステムは実店舗での本番運用に対応できます。

**⚠️ 重要**: 運用開始後も定期的な監視とメンテナンスを継続し、問題が発生した場合は速やかに対応してください。