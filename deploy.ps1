# kanpAI デプロイスクリプト (PowerShell版)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 kanpAI デプロイツール (PowerShell版)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 設定
$VPS_USER = "ubuntu"
$VPS_IP = "133.125.41.193"
$LOCAL_PATH = "C:\Users\acmsh\kanpAI"

# ディレクトリ移動
Set-Location $LOCAL_PATH
Write-Host "[INFO] 現在のディレクトリ: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Git操作
Write-Host "📝 [1/4] ローカルの変更を確認中..." -ForegroundColor Yellow
git add .
git status --short

Write-Host ""
$commit_msg = Read-Host "💬 コミットメッセージを入力（Enterでスキップ）"
if ($commit_msg -ne "") {
    git commit -m $commit_msg
    Write-Host "📤 GitHubにプッシュ中..." -ForegroundColor Yellow
    git push
}

Write-Host ""
Write-Host "🔄 [2/4] VPSに接続してデプロイ開始..." -ForegroundColor Yellow
Write-Host "========================================"

# VPSでの操作
ssh ${VPS_USER}@${VPS_IP} "cd ~/kanpai && git pull && docker-compose -f docker-compose.prod.yml restart && echo '✅ 再起動完了！'"

Write-Host ""
Write-Host "🎊 デプロイ完了！" -ForegroundColor Green
Write-Host "========================================"
Write-Host "📌 確認URL: https://kanpai-plus.jp" -ForegroundColor Cyan
Write-Host "========================================"
Write-Host ""
Write-Host "Enterキーを押して終了..."
Read-Host