@echo off
echo === Adding ALL Source Files to Git ===
echo.

cd /d "C:\Users\acmsh\kanpAI"

echo [1] Adding backend source files...
git add backend/src/

echo.
echo [2] Adding frontend source files...
git add frontend/src/

echo.
echo [3] Adding other important files...
git add backend/package.json backend/package-lock.json
git add frontend/package.json frontend/package-lock.json
git add backend/.env.example
git add docs/

echo.
echo [4] Current status:
git status

echo.
echo Ready to commit all source files!
echo.
pause
