# Googleカレンダー連携セットアップガイド

## 🔧 必要な設定手順

### Step 1: Google Cloud Console での設定

1. **Google Cloud Console** にアクセス: https://console.cloud.google.com/
2. **新しいプロジェクト作成** または既存プロジェクト選択
3. **APIライブラリ** で「Google Calendar API」を有効化
4. **認証情報** → **認証情報を作成** → **サービスアカウント**
5. **サービスアカウントキー** をJSON形式でダウンロード

### Step 2: サービスアカウントキーの配置

ダウンロードしたJSONファイルを以下にリネーム・配置：
```
C:\Users\acmsh\kanpAI\backend\src\config\credentials.json
```

### Step 3: Googleカレンダーでの権限設定

1. **Googleカレンダー** を開く
2. 対象カレンダーの **設定と共有**
3. **特定のユーザーと共有** にサービスアカウントのメールアドレスを追加
4. 権限: **予定の変更権限** を付与

### Step 4: カレンダーIDの取得

1. カレンダーの **設定と共有**
2. **カレンダーID** をコピー
3. `.env`ファイルの`GOOGLE_CALENDAR_ID`を更新

## 📝 設定確認用のテストスクリプト

設定が完了したら実行してください：
```bash
cd C:\Users\acmsh\kanpAI\backend\src\db
node test-google-calendar.js
```