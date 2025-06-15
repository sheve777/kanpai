@echo off
echo シンプルデプロイ開始...
cd C:\Users\acmsh\kanpAI
git add .
git commit -m "Update domain settings to kanpai-plus.jp"
git push
echo GitHubへのプッシュ完了！
echo.
echo VPSでpullしてください：
echo ssh ubuntu@133.125.41.193
echo cd ~/kanpai
echo git pull
echo docker-compose -f docker-compose.prod.yml restart
pause