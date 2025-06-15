@echo off
chcp 65001 >nul
echo 🚀 kanpAI クイックデプロイ
echo ========================
echo.

:: VPSで最新コードを取得して再起動
ssh ubuntu@133.125.41.193 "cd ~/kanpai && git pull && docker restart kanpai_backend && echo 'デプロイ完了！'"

echo.
echo 📌 確認URL: http://133.125.41.193:5000/api/health
start http://133.125.41.193:5000/api/health
pause
