# kanpAI セットアップガイド

## 🚀 クイックスタート

### 1. 環境要件

- Node.js 18.x 以上
- PostgreSQL 13.x 以上
- Git

### 2. プロジェクトのクローン

```bash
git clone <repository-url>
cd kanpAI
```

### 3. バックエンドのセットアップ

```bash
cd backend

# 依存関係のインストール
npm install

# 環境変数ファイルの作成
cp .env.example .env

# .envファイルを編集（下記の「環境変数設定」を参照）
nano .env
```

### 4. フロントエンドのセットアップ

```bash
cd ../frontend

# 依存関係のインストール
npm install

# 環境変数ファイルの作成（必要に応じて）
echo "REACT_APP_API_BASE_URL=http://localhost:3002" > .env
```

### 5. データベースのセットアップ

```bash
cd ../backend

# データベーステーブルの作成
npm run db:init
npm run db:create-menus
npm run db:create-chat-tables
npm run db:create-reservation-tables
npm run db:create-billing-tables
npm run db:create-auth-tables
```

### 6. アプリケーションの起動

バックエンドとフロントエンドを別々のターミナルで起動：

```bash
# ターミナル1: バックエンド
cd backend
npm start

# ターミナル2: フロントエンド
cd frontend
npm start
```

アクセス先：
- フロントエンド: http://localhost:3000
- バックエンド API: http://localhost:3002

## ⚙️ 環境変数設定

### 必須設定

```env
# サーバー設定
PORT=3002
NODE_ENV=development

# データベース
DATABASE_URL="postgresql://username:password@localhost:5432/kanpai_db"

# JWT認証
JWT_SECRET="your-super-secret-jwt-key-here"

# ログレベル
LOG_LEVEL=info
```

### オプション設定

```env
# デモモード（開発用）
DEMO_MODE=true
DEMO_PASSWORDS="kanpai123,demo"

# LINE Bot API
LINE_CHANNEL_ACCESS_TOKEN="your_line_token"
LINE_CHANNEL_SECRET="your_line_secret"

# OpenAI API
OPENAI_API_KEY="your_openai_key"

# Stripe決済
STRIPE_API_KEY="your_stripe_key"
STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret"

# レート制限
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🧪 テストの実行

### バックエンドテスト

```bash
cd backend

# 全テスト実行
npm test

# ウォッチモード
npm run test:watch

# カバレッジレポート
npm run test:coverage
```

### フロントエンドテスト

```bash
cd frontend

# テスト実行
npm test
```

## 🔧 開発ツール

### データベース管理コマンド

```bash
# 特定のテーブル作成
npm run db:create-menus          # メニューテーブル
npm run db:create-reservations   # 予約テーブル
npm run db:create-chat-tables    # チャットテーブル

# データベース初期化
npm run db:init
```

### ログの確認

```bash
# バックエンドログ
tail -f backend/logs/combined.log
tail -f backend/logs/error.log
```

## 🐛 トラブルシューティング

### よくある問題

#### 1. データベース接続エラー

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**解決方法：**
- PostgreSQLが起動しているか確認
- DATABASE_URLが正しいか確認
- データベースが存在するか確認

#### 2. JWT_SECRET missing エラー

```
JWT_SECRET環境変数が設定されていません
```

**解決方法：**
- `.env`ファイルに`JWT_SECRET`を追加
- 十分に長い（32文字以上）ランダムな文字列を使用

#### 3. ポート使用中エラー

```
Error: listen EADDRINUSE :::3002
```

**解決方法：**
- 他のプロセスがポートを使用していないか確認
- `lsof -i :3002` でプロセスを確認
- `kill -9 <PID>` で停止

#### 4. フロントエンド接続エラー

**解決方法：**
- バックエンドが起動しているか確認
- CORS設定を確認
- `REACT_APP_API_BASE_URL`が正しいか確認

### ログレベルの調整

デバッグ時はログレベルを`debug`に設定：

```env
LOG_LEVEL=debug
```

### デモモードでの動作確認

データベースなしで動作を確認したい場合：

```env
DEMO_MODE=true
```

## 📚 API仕様

### 認証エンドポイント

- `POST /api/auth/login` - ログイン
- `POST /api/auth/verify` - トークン検証
- `POST /api/auth/change-password` - パスワード変更

### 予約エンドポイント

- `GET /api/reservations` - 予約一覧
- `POST /api/reservations` - 新規予約
- `PUT /api/reservations/:id` - 予約更新
- `DELETE /api/reservations/:id` - 予約削除

### レポートエンドポイント

- `GET /api/reports` - レポート一覧
- `GET /api/reports/:id` - レポート詳細
- `GET /api/reports/:id/chart-data` - チャート用データ

## 🔒 セキュリティ

### 実装済みセキュリティ機能

- JWT認証
- bcryptによるパスワードハッシュ化
- レート制限（認証: 5回/15分、API: 30回/分）
- 入力検証（express-validator）
- エラーハンドリング
- ログ監視

### 本番環境での推奨設定

```env
NODE_ENV=production
LOG_LEVEL=warn
DEMO_MODE=false
```

## 📈 パフォーマンス

### 推奨設定

- Redisキャッシュの使用
- データベースインデックスの最適化
- CDNの使用（静的ファイル）
- ログローテーション

## 🤝 開発への貢献

1. フィーチャーブランチの作成
2. 変更の実装
3. テストの作成・実行
4. プルリクエストの作成

### コーディング規約

- ESLintの使用
- Prettierでのフォーマット
- JSDocでのコメント
- テストカバレッジ80%以上

---

## サポート

問題が解決しない場合は、GitHubのIssuesでお知らせください。