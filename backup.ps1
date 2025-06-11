# kanpAI GitHub Backup Script

Write-Host "=== kanpAI GitHub Backup ===" -ForegroundColor Cyan
Write-Host ""

# Change to project directory
Set-Location "C:\Users\acmsh\kanpAI"

# Check git status
Write-Host "Checking Git status..." -ForegroundColor Yellow
git status
Write-Host ""

# Confirm
$confirm = Read-Host "Continue with backup? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "Backup cancelled." -ForegroundColor Red
    exit
}

# Stage changes
Write-Host ""
Write-Host "Staging changes..." -ForegroundColor Yellow
git add .

# Commit
Write-Host ""
Write-Host "Creating commit..." -ForegroundColor Yellow
git commit -m "feat: Modern design improvements for report detail page and documentation updates"

# Push to GitHub
Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "Backup completed!" -ForegroundColor Green
Write-Host "Repository: https://github.com/sheve777/kanpai" -ForegroundColor Cyan
