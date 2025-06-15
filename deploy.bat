@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 kanpAI 一発デプロイツール
echo ========================================
echo.

:: 設定（ここを自分の環境に合わせて変更）
set VPS_USER=ubuntu
set VPS_IP=133.125.41.193
set LOCAL_PATH=C:\Users\acmsh\kanpAI

:: 1. ローカルの変更をコミット＆プッシュ
echo 📝 [1/4] ローカルの変更を確認中...
cd /d %LOCAL_PATH%
git add .
git status --short

echo.
set /p COMMIT_MSG="💬 コミットメッセージを入力（Enterでスキップ）: "
if "%COMMIT_MSG%"=="" (
    echo ⏭️  変更なし、またはコミットをスキップします
) else (
    git commit -m "%COMMIT_MSG%"
    echo 📤 GitHubにプッシュ中...
    git push
)

echo.
echo 🔄 [2/4] VPSに接続してデプロイ開始...
echo ========================================

:: 2. VPSでgit pullして再起動
ssh %VPS_USER%@%VPS_IP% "cd ~/kanpai && git pull && docker restart kanpai_backend && echo '✅ バックエンド再起動完了！'"

echo.
echo 🏥 [3/4] ヘルスチェック中...
timeout /t 5 >nul
curl -s http://%VPS_IP%:5000/api/health
echo.
echo.

echo 🎊 [4/4] デプロイ完了！
echo ========================================
echo 📌 API URL: http://%VPS_IP%:5000
echo 📌 Health: http://%VPS_IP%:5000/api/health
echo ========================================
echo.
pause
