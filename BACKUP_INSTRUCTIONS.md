# kanpAI GitHubバックアップ手順

## 1. プロジェクトディレクトリに移動
```bash
cd C:\Users\acmsh\kanpAI
```

## 2. Gitリポジトリ初期化
```bash
git init
```

## 3. リモートリポジトリ追加
```bash
git remote add origin https://github.com/sheve777/kanpai.git
```

## 4. 全ファイルをステージング
```bash
git add .
```

## 5. 初回コミット
```bash
git commit -m "🚀 Initial commit: kanpAI MVP完成版

✨ 実装完了機能:
- LINEチャットボット (OpenAI API + Function Calling)
- 24時間予約システム (Googleカレンダー連携)
- 店主向けダッシュボード (React + スマホ対応)
- LINE配信機能 (画像+テキスト一斉配信)
- 使用量管理・課金システム (Stripe連携)
- AI月次レポート機能
- メニュー管理機能

🏗️ 技術スタック:
- Backend: Node.js + Express + PostgreSQL
- Frontend: React
- APIs: OpenAI, LINE Messaging, Google Calendar, Stripe

📊 開発状況: MVP完成(85-90%)、本格運用テスト準備完了"
```

## 6. GitHubにプッシュ
```bash
git branch -M main
git push -u origin main
```

## ⚠️ 重要な注意事項

### 絶対に実行前に確認すること:
1. `.env` ファイルがGitHubにアップロードされないこと
2. APIキーや個人情報が含まれていないこと
3. `.gitignore` ファイルが正しく設定されていること

### アップロードされるファイル:
- ✅ ソースコード (backend/src/, frontend/src/)
- ✅ 設定ファイル (package.json, .env.example)
- ✅ ドキュメント (docs/, README.md)

### アップロードされないファイル:
- ❌ .env (APIキー含む)
- ❌ node_modules/ (依存関係)
- ❌ ビルドファイル
- ❌ ログファイル
