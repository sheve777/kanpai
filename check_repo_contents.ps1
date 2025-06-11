# Git履歴確認スクリプト

Write-Host "=== Checking Git Repository Status ===" -ForegroundColor Cyan
Write-Host ""

Set-Location "C:\Users\acmsh\kanpAI"

# 追跡されているファイルの総数
Write-Host "Total tracked files:" -ForegroundColor Yellow
$trackedFiles = git ls-files | Measure-Object -Line
Write-Host "$($trackedFiles.Lines) files" -ForegroundColor Green

# backend/srcのファイル数
Write-Host "`nBackend source files:" -ForegroundColor Yellow
$backendFiles = git ls-files backend/src | Measure-Object -Line
Write-Host "$($backendFiles.Lines) files in backend/src" -ForegroundColor Green

# frontend/srcのファイル数
Write-Host "`nFrontend source files:" -ForegroundColor Yellow
$frontendFiles = git ls-files frontend/src | Measure-Object -Line
Write-Host "$($frontendFiles.Lines) files in frontend/src" -ForegroundColor Green

# 最近のコミット履歴
Write-Host "`n=== Recent Commits ===" -ForegroundColor Cyan
git log --oneline -5

# 最初のコミットの内容
Write-Host "`n=== Initial Commit Contents ===" -ForegroundColor Cyan
git log --name-status --oneline -1 --reverse | Select-Object -First 20

Write-Host "`nRepository URL: https://github.com/sheve777/kanpai" -ForegroundColor Cyan
