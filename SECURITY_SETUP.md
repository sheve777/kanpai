# セキュリティ設定ガイド

## 🔒 機密情報の設定

このプロジェクトを使用する前に、以下の機密情報ファイルを正しく設定する必要があります。

### 必要な設定ファイル

#### 1. Backend Environment Variables
```bash
# backend/.env ファイルを作成
cp backend/.env.example backend/.env
```

以下の情報を設定してください：
- `OPENAI_API_KEY` - OpenAI APIキー
- `LINE_CHANNEL_ACCESS_TOKEN` - LINE公式アカウントアクセストークン
- `LINE_CHANNEL_SECRET` - LINE公式アカウントシークレット
- `DATABASE_URL` - PostgreSQLデータベース接続情報
- `STRIPE_API_KEY` - Stripe APIキー
- `GOOGLE_CALENDAR_ID` - Google Calendar ID

#### 2. Google Cloud Credentials
```bash
# backend/src/config/credentials.json ファイルを作成
cp backend/src/config/credentials.json.example backend/src/config/credentials.json
```

Google Cloud Console から Service Account Key をダウンロードして配置してください。

#### 3. Frontend Environment Variables
```bash
# frontend/.env ファイルを作成
cp frontend/.env.example frontend/.env
```

以下の情報を設定してください：
- `REACT_APP_STRIPE_PUBLIC_KEY` - Stripe公開キー
- `REACT_APP_API_BASE_URL` - バックエンドAPIのURL

### ⚠️ 重要な注意事項

1. **絶対にコミットしてはいけないファイル:**
   - `backend/.env`
   - `backend/src/config/credentials.json`
   - `frontend/.env`

2. **これらのファイルには機密情報が含まれています:**
   - APIキー
   - データベースパスワード
   - Google Cloud プライベートキー

3. **ファイルは `.gitignore` で除外されています**が、手動でコミットしないよう注意してください。

### 🔧 トラブルシューティング

#### Gitに機密情報をコミットしてしまった場合：
```bash
# ファイルをトラッキングから除外
git rm --cached path/to/secret/file

# .gitignore に追加
echo "path/to/secret/file" >> .gitignore

# コミットして修正
git add .gitignore
git commit -m "Remove secret file from tracking"
```

### 📚 参考リンク

- [LINE Developers Console](https://developers.line.biz/console/)
- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Stripe Dashboard](https://dashboard.stripe.com/)
