#!/bin/bash
# kanpAI Database Backup Cron Setup Script

# このスクリプトは本番サーバーでcronジョブを設定するために使用します
# 使用方法: chmod +x setup-backup-cron.sh && ./setup-backup-cron.sh

# 現在のディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🔧 kanpAI データベースバックアップのcronジョブを設定します..."
echo "📁 プロジェクトディレクトリ: $PROJECT_DIR"

# Node.jsのパスを確認
NODE_PATH=$(which node)
if [ -z "$NODE_PATH" ]; then
    echo "❌ Node.jsが見つかりません。Node.jsをインストールしてください。"
    exit 1
fi

echo "📍 Node.js パス: $NODE_PATH"

# 現在のcrontabをバックアップ
crontab -l > /tmp/crontab.backup 2>/dev/null || true

# 新しいcrontabエントリを作成
CRON_ENTRY="0 2 * * * cd $PROJECT_DIR && $NODE_PATH scripts/backup-database.js backup >> logs/backup.log 2>&1"

# 既存のkanpAIバックアップエントリをチェック
if crontab -l 2>/dev/null | grep -q "kanpai.*backup-database.js"; then
    echo "⚠️ 既存のkanpAIバックアップcronジョブが見つかりました。"
    echo "既存のエントリを削除して新しいものを追加しますか？ (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        # 既存のkanpAIエントリを削除
        crontab -l 2>/dev/null | grep -v "kanpai.*backup-database.js" | crontab -
        echo "🗑️ 既存のエントリを削除しました。"
    else
        echo "❌ セットアップをキャンセルしました。"
        exit 0
    fi
fi

# 新しいcronエントリを追加
(crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -

echo "✅ cronジョブが正常に設定されました！"
echo ""
echo "📋 設定内容:"
echo "   スケジュール: 毎日午前2時"
echo "   実行コマンド: $CRON_ENTRY"
echo ""
echo "📄 ログファイル: $PROJECT_DIR/logs/backup.log"
echo ""
echo "🔍 現在のcrontabを確認:"
crontab -l | grep backup-database || echo "   (エントリが見つかりません)"

echo ""
echo "⚙️ 追加設定:"
echo "1. ログディレクトリが存在することを確認:"
mkdir -p "$PROJECT_DIR/logs"
echo "   ✅ $PROJECT_DIR/logs"

echo ""
echo "2. バックアップディレクトリを作成:"
mkdir -p "$PROJECT_DIR/backups"
echo "   ✅ $PROJECT_DIR/backups"

echo ""
echo "3. 環境変数の確認:"
ENV_FILE="$PROJECT_DIR/.env"
if [ -f "$ENV_FILE" ]; then
    echo "   ✅ .env ファイルが存在します"
    
    # 必要な環境変数をチェック
    if grep -q "DATABASE_URL" "$ENV_FILE"; then
        echo "   ✅ DATABASE_URL が設定されています"
    else
        echo "   ⚠️ DATABASE_URL が設定されていません"
    fi
else
    echo "   ⚠️ .env ファイルが見つかりません"
fi

echo ""
echo "🧪 バックアップをテストしますか？ (y/N)"
read -r test_response
if [[ "$test_response" =~ ^[Yy]$ ]]; then
    echo "🔄 テストバックアップを実行中..."
    cd "$PROJECT_DIR"
    $NODE_PATH scripts/backup-database.js backup
    
    if [ $? -eq 0 ]; then
        echo "✅ テストバックアップが成功しました！"
    else
        echo "❌ テストバックアップが失敗しました。設定を確認してください。"
    fi
fi

echo ""
echo "🎉 セットアップが完了しました！"
echo ""
echo "📝 管理コマンド:"
echo "   バックアップ作成:     node scripts/backup-database.js backup"
echo "   バックアップ一覧:     node scripts/backup-database.js list"
echo "   バックアップ復元:     node scripts/backup-database.js restore <file>"
echo "   cronジョブ確認:      crontab -l"
echo "   ログ確認:           tail -f logs/backup.log"