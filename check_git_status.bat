@echo off
echo === Git Commit History ===
echo.

cd /d "C:\Users\acmsh\kanpAI"

echo Recent commits:
git log --oneline -10

echo.
echo === Files in last commit ===
git show --name-only --pretty=format:"Commit: %%h - %%s" HEAD

echo.
echo === All tracked files ===
git ls-files | find /c /v ""
echo files are being tracked

echo.
echo === Untracked files ===
git status --porcelain | findstr "^??"

pause
