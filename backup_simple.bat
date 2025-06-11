@echo off
chcp 65001 > nul
echo === kanpAI GitHub Backup ===
echo.

cd /d "C:\Users\acmsh\kanpAI"

echo Checking Git status...
git status
echo.

echo Press any key to continue with backup (or close window to cancel)
pause > nul

echo.
echo Staging changes...
git add .

echo.
echo Creating commit...
git commit -m "feat: Modern design improvements for report detail page and documentation updates"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo Backup completed!
echo Repository: https://github.com/sheve777/kanpai
pause
