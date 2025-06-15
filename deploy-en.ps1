# kanpAI Deploy Script (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "kanpAI Deploy Tool (PowerShell)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Settings
$VPS_USER = "ubuntu"
$VPS_IP = "133.125.41.193"
$LOCAL_PATH = "C:\Users\acmsh\kanpAI"

# Change directory
Set-Location $LOCAL_PATH
Write-Host "[INFO] Current directory: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Git operations
Write-Host "[1/4] Checking local changes..." -ForegroundColor Yellow
git add .
git status --short

Write-Host ""
$commit_msg = Read-Host "Enter commit message (press Enter to skip)"
if ($commit_msg -ne "") {
    git commit -m $commit_msg
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    git push
}

Write-Host ""
Write-Host "[2/4] Connecting to VPS and deploying..." -ForegroundColor Yellow
Write-Host "========================================"

# VPS operations - PowerShell compatible
$ssh_command = "cd ~/kanpai && git pull && docker-compose -f docker-compose.prod.yml restart && echo 'Restart complete!'"
ssh "${VPS_USER}@${VPS_IP}" $ssh_command

Write-Host ""
Write-Host "Deploy complete!" -ForegroundColor Green
Write-Host "========================================"
Write-Host "URL: https://kanpai-plus.jp" -ForegroundColor Cyan
Write-Host "========================================"
Write-Host ""
Write-Host "Press Enter to exit..."
Read-Host