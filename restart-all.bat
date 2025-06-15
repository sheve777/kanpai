@echo off
chcp 65001 >nul
echo 🔄 kanpAI 全サービス再起動
echo ==========================
echo.

echo 📦 すべてのコンテナを再起動中...
ssh ubuntu@133.125.41.193 "docker restart kanpai_backend kanpai_db kanpai_redis"

echo.
echo ⏳ 起動待機中（10秒）...
timeout /t 10 >nul

echo.
echo 🏥 ヘルスチェック...
curl http://133.125.41.193:5000/api/health
echo.
echo.
echo ✅ 完了！
pause
