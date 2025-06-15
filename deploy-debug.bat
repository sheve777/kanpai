@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 kanpAI デプロイツール (デバッグ版)
echo ========================================
echo.

:: デバッグ: 現在のディレクトリを表示
echo [DEBUG] 現在のディレクトリ: %CD%
echo.

:: 設定
set VPS_USER=ubuntu
set VPS_IP=133.125.41.193
set LOCAL_PATH=C:\Users\acmsh\kanpAI

:: ディレクトリ移動
echo [DEBUG] %LOCAL_PATH% に移動中...
cd /d %LOCAL_PATH%
if %ERRORLEVEL% neq 0 (
    echo [ERROR] ディレクトリ移動に失敗しました
    pause
    exit /b 1
)
echo [DEBUG] 移動成功: %CD%
echo.

:: Git確認
echo [DEBUG] Gitコマンドの確認...
where git >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Gitが見つかりません。Gitをインストールしてください。
    pause
    exit /b 1
)
echo [DEBUG] Git OK
echo.

:: SSH確認
echo [DEBUG] SSHコマンドの確認...
where ssh >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] SSHが見つかりません。
    pause
    exit /b 1
)
echo [DEBUG] SSH OK
echo.

:: Git操作
echo 📝 [1/4] ローカルの変更を確認中...
git add .
git status --short

echo.
set /p COMMIT_MSG="💬 コミットメッセージを入力（Enterでスキップ）: "
if "%COMMIT_MSG%"=="" (
    echo ⏭️  変更なし、またはコミットをスキップします
) else (
    git commit -m "%COMMIT_MSG%"
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] コミットに失敗しました
        pause
        exit /b 1
    )
    echo 📤 GitHubにプッシュ中...
    git push
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] プッシュに失敗しました
        pause
        exit /b 1
    )
)

echo.
echo 🔄 [2/4] VPSに接続してデプロイ開始...
echo [DEBUG] 実行するコマンド: ssh %VPS_USER%@%VPS_IP% "cd ~/kanpai && git pull && docker-compose -f docker-compose.prod.yml restart"
echo ========================================

:: VPSでの操作
ssh %VPS_USER%@%VPS_IP% "cd ~/kanpai && git pull && docker-compose -f docker-compose.prod.yml restart && echo '✅ 再起動完了！'"
if %ERRORLEVEL% neq 0 (
    echo [ERROR] SSH接続またはVPS上のコマンド実行に失敗しました
    echo.
    echo 考えられる原因:
    echo 1. SSHキーが設定されていない
    echo 2. VPSのIPアドレスが間違っている
    echo 3. VPS上のディレクトリ構造が異なる
    pause
    exit /b 1
)

echo.
echo 🎊 デプロイ完了！
echo ========================================
echo 📌 確認URL: https://kanpai-plus.jp
echo ========================================
echo.
pause