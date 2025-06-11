#!/bin/bash
# GitHubバックアップスクリプト
# 実行前に必ず内容を確認してください

echo "=== kanpAI GitHubバックアップ開始 ==="
echo ""

# プロジェクトディレクトリに移動
cd "C:\Users\acmsh\kanpAI"

# 現在の状態確認
echo "📊 Git状態確認..."
git status

echo ""
echo "⚠️  バックアップを続行しますか？ (y/n)"
read -r response

if [[ "$response" != "y" ]]; then
    echo "❌ バックアップをキャンセルしました"
    exit 1
fi

# 変更をステージング
echo ""
echo "📝 変更をステージング..."
git add .

# コミット
echo ""
echo "💾 コミット作成..."
git commit -m "✨ feat: レポート詳細画面のモダンデザイン改良とドキュメント更新

🎨 UI/UX改善:
- レポート詳細画面にグラデーション背景を追加
- レスポンシブフォントサイズの実装（clamp関数使用）
- カード型レイアウトによる情報整理
- インタラクティブなホバーエフェクト

✨ 新機能:
- レポートコンテンツからの統計データ自動抽出
- プラン別アップセル機能の実装
- 前月比較トレンド表示

📚 ドキュメント:
- CHANGELOG.md追加（変更履歴）
- WORK_SUMMARY.md更新（詳細な作業記録）

🐛 バグ修正:
- ReportDetailPage.jsのJSX構文エラー解決"

# GitHubにプッシュ
echo ""
echo "🚀 GitHubにプッシュ..."
git push origin main

echo ""
echo "✅ バックアップ完了！"
echo "📍 リポジトリ: https://github.com/sheve777/kanpai"
