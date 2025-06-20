# kanpAI 認証システム設定ガイド

## 🔐 認証システムの概要

kanpAIは店舗ごとに独立したログインシステムを実装しています。
各店舗は専用のログインIDとパスワードを使用して自店舗のダッシュボードにアクセスできます。

## 🎯 特徴

- **JWT認証**: セキュアなトークンベース認証
- **店舗間分離**: 他店舗のデータは一切アクセス不可
- **セッション管理**: 7日間の自動ログイン保持
- **API保護**: 全APIエンドポイントで認証チェック

## 🚀 セットアップ手順

### 1. 環境変数の設定

`.env` ファイルに以下を追加：

```bash
# JWT シークレットキー（ランダムな文字列を設定）
JWT_SECRET="your-super-secret-jwt-key-here"
```

### 2. データベーステーブルの作成

```bash
cd backend/src/db
node create-auth-tables.js
```

### 3. 新店舗の追加

#### 方法1: SQLで直接追加
```sql
-- 店舗を追加
INSERT INTO stores (id, name, phone, address)
VALUES ('your-store-id', '店舗名', '電話番号', '住所');

-- パスワードを設定（要ハッシュ化）
INSERT INTO store_auth (store_id, password_hash)
VALUES ('your-store-id', '$2b$10$...');
```

#### 方法2: スクリプトで追加
```javascript
// add-store.js
import bcrypt from 'bcrypt';
const password = 'your-password';
const hash = await bcrypt.hash(password, 10);
// DBに保存
```

## 📱 店舗側の利用方法

### ログイン方法

1. **アクセスURL**
   ```
   https://your-domain.com/?store=YOUR_STORE_ID
   ```

2. **ログイン情報入力**
   - 店舗ID: `YOUR_STORE_ID`
   - パスワード: 設定したパスワード

3. **ダッシュボードアクセス**
   - ログイン成功後、自動的にダッシュボードへ遷移
   - 7日間は自動ログイン状態を保持

### ログアウト方法
- ヘッダー右上の「ログアウト」ボタンをクリック

## 🔧 API認証の仕組み

### リクエストヘッダー
```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

### 認証フロー
1. `/api/auth/login` でログイン
2. JWTトークンを取得
3. 全APIリクエストにトークンを付与
4. サーバー側でトークン検証・店舗ID確認

## 🛡️ セキュリティ機能

### パスワードポリシー
- 最小6文字以上
- bcryptによるハッシュ化
- ソルトラウンド: 10

### セッション管理
- JWT有効期限: 7日間
- 無効なトークンは自動削除
- ログイン履歴の記録

### アクセス制御
- 店舗IDベースの完全分離
- APIレベルでの権限チェック
- 不正アクセスの監視・ログ記録

## 🧪 テスト用アカウント

### デモ店舗
```
店舗ID: 8fbff969-5212-4387-ae62-cc33944edef2
パスワード: kanpai123
```

### テスト店舗1
```
店舗ID: tanuki-001
パスワード: tanuki123
```

### テスト店舗2
```
店舗ID: yamada-002
パスワード: yamada123
```

## ⚠️ 注意事項

1. **JWT_SECRET は必ず変更**
   - デフォルト値のまま本番運用しない
   - 十分に複雑な文字列を使用

2. **HTTPS必須**
   - 本番環境では必ずHTTPS化
   - トークンの盗聴を防ぐため

3. **定期的なパスワード変更**
   - 3ヶ月ごとの変更を推奨
   - パスワード履歴の管理

## 🚨 トラブルシューティング

### ログインできない
1. 店舗IDが正しいか確認
2. パスワードの大文字小文字を確認
3. データベース接続を確認

### 401エラーが発生
1. トークンの有効期限を確認
2. LocalStorageのトークンを削除して再ログイン
3. サーバーログでエラー詳細を確認

### 他店舗のデータが見える
1. 即座にサーバーを停止
2. 認証ミドルウェアの設定を確認
3. セキュリティ監査を実施