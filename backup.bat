@echo off
REM kanpAI GitHubバックアップスクリプト (Windows用)

echo === kanpAI GitHubバックアップ開始 ===
echo.

REM プロジェクトディレクトリに移動
cd /d "C:\Users\acmsh\kanpAI"

REM 現在の状態確認
echo 📊 Git状態確認...
git status
echo.

echo ⚠️  バックアップを続行しますか？ (続行する場合はEnterキーを押してください)
pause

REM 変更をステージング
echo.
echo 📝 変更をステージング...
git add .

REM コミット
echo.
echo 💾 コミット作成...
git commit -m "✨ feat: レポート詳細画面のモダンデザイン改良とドキュメント更新"

REM GitHubにプッシュ
echo.
echo 🚀 GitHubにプッシュ...
git push origin main

echo.
echo ✅ バックアップ完了！
echo 📍 リポジトリ: https://github.com/sheve777/kanpai
pause
