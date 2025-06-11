@echo off
echo === Checking Git Tracking Status ===
echo.

cd /d "C:\Users\acmsh\kanpAI"

echo [1] Currently tracked files count:
git ls-files | find /c /v ""

echo.
echo [2] Backend files tracked:
git ls-files backend/src | find /c /v ""

echo.
echo [3] Frontend files tracked:
git ls-files frontend/src | find /c /v ""

echo.
echo [4] Untracked files in backend/src:
git status --porcelain backend/src | findstr "^??"

echo.
echo [5] Untracked files in frontend/src:
git status --porcelain frontend/src | findstr "^??"

echo.
echo [6] All untracked files:
git status --porcelain | findstr "^??"

echo.
pause
