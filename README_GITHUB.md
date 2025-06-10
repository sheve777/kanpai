# kanpAI - 居酒屋向けチャットボット＋販促支援サービス

> 🍺 居酒屋店主の「第二の従業員」となるLINEチャットボット + 予約システム + 販促支援

## 🎯 プロジェクト概要

**kanpAI**は、日々奮闘する居酒屋店主のための総合支援サービスです。LINEチャットボットによる自動応答、24時間予約受付、LINE配信による販促支援、AI分析レポートまで、店舗運営に必要な機能を一つのサービスで提供します。

### ✨ 主な機能

- 🤖 **LINEチャットボット** - メニュー案内、FAQ自動応答（OpenAI API活用）
- 📅 **24時間予約システム** - Googleカレンダー連携、営業時間外も予約受付
- 📢 **LINE配信機能** - 画像付きクーポン・お知らせの一斉配信
- 📊 **AI分析レポート** - 月次データ分析、改善提案
- 💰 **使用量管理** - プラン別制限、従量課金システム
- 📱 **店主向けダッシュボード** - スマホ最適化された管理画面

## 🏗️ 技術スタック

### バックエンド
- **Node.js + Express** - APIサーバー
- **PostgreSQL** - データベース
- **OpenAI API** - チャットボット
- **LINE Messaging API** - LINE連携
- **Google Calendar API** - 予約管理
- **Stripe** - 決済処理

### フロントエンド
- **React** - ダッシュボードUI
- **レスポンシブデザイン** - スマホファースト

## 🚀 開発状況

- ✅ **MVP Core** - チャットボット、予約システム基盤
- ✅ **実用機能** - ダッシュボード、使用量管理
- ✅ **差別化機能** - LINE配信、AI レポート
- 🔄 **収益化機能** - 決済システム、プラン管理
- 🚧 **運用準備** - 本番デプロイ、監視設定

## 📂 プロジェクト構造

```
kanpAI/
├── backend/           # Node.js APIサーバー
│   ├── src/
│   │   ├── routes/    # APIルート（11個）
│   │   ├── services/  # ビジネスロジック
│   │   ├── db/        # データベース操作
│   │   └── config/    # 設定ファイル
│   └── public/        # 静的ファイル
├── frontend/          # React ダッシュボード
│   ├── src/
│   │   └── components/ # UIコンポーネント（17個）
│   └── public/
├── docs/              # 技術仕様書
└── README.md          # プロジェクト仕様書（詳細版）
```

## ⚙️ セットアップ方法

### 必要な環境
- Node.js 18+
- PostgreSQL 14+
- LINE公式アカウント
- OpenAI APIキー
- Google Calendar API
- Stripe アカウント

### 1. リポジトリクローン
```bash
git clone https://github.com/sheve777/kanpai.git
cd kanpai
```

### 2. バックエンドセットアップ
```bash
cd backend
npm install

# 環境変数設定
cp .env.example .env
# .envファイルを編集してAPIキーを設定

# データベース初期化
npm run db:init
npm run db:create-menus
npm run db:create-chat-tables
npm run db:create-reservation-tables
npm run db:create-billing-tables
npm run db:seed-plans

# サーバー起動
npm start
```

### 3. フロントエンドセットアップ
```bash
cd frontend
npm install

# 環境変数設定
cp .env.example .env
# API_BASE_URLを設定

# 開発サーバー起動
npm start
```

## 🔧 主要API仕様

### チャットボット
- `POST /api/chat/webhook/:store_id` - LINE Webhook受信
- `POST /api/menus/search` - Function Calling用メニュー検索

### 予約システム
- `POST /api/reservations` - 予約作成
- `GET /api/reservations/business-status` - 営業状況確認

### ダッシュボード
- `GET /api/dashboard/:store_id` - ダッシュボードデータ
- `GET /api/usage/:store_id` - 使用量情報

### LINE配信
- `POST /api/line/broadcast` - 一斉配信
- `GET /api/line/broadcasts/:store_id` - 配信履歴

## 💼 ビジネスモデル

### 料金プラン
- **エントリー**: 10,000円/月 - 基本機能
- **スタンダード**: 30,000円/月 - 詳細レポート
- **プロ**: 50,000円/月 - 戦略分析

### 初期設定費用
- **一律**: 30,000円 - 完全サポート

## 📊 設計原則

1. **店舗固有情報の外部管理** - スケーラブルな多店舗対応
2. **スマホファースト** - 店主の利用シーンを重視
3. **自然なアップセル** - 価値提供重視の収益化
4. **実用性重視** - 「第二の従業員」として機能

## 🎯 今後の展開

### 短期目標
- 協力店舗での本格運用テスト
- AWS本番環境デプロイ
- 初期顧客獲得

### 中長期目標
- 100店舗、1000店舗への展開
- 他業種飲食店への横展開
- 注文・会計連携機能拡張

## 📄 ライセンス

このプロジェクトはプライベートリポジトリです。

## 👤 開発者

一人開発によるプロジェクトです。

---

*居酒屋にとって電気や水道のように「なくてはならないインフラ」を目指して。*
