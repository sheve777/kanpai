# kanpAI Admin Dashboard

kanpAI 管理者ダッシュボード - 居酒屋向け LINE チャットボット・予約管理システムの管理画面

## 🚀 特徴

- **🏪 店舗管理**: 複数店舗の包括的な管理とセットアップウィザード
- **📊 レポート管理**: AI自動生成・配信機能付きの月次レポートシステム
- **🚨 リアルタイム監視**: システム状態とエラーのリアルタイム監視
- **💰 売上管理**: 詳細な売上分析と予測機能
- **📡 配信管理**: LINE ブロードキャストメッセージとリッチメニュー管理
- **⚙️ システム設定**: セキュリティとメンテナンス機能

## 🛠️ 技術スタック

- **Frontend**: React 19 + Vite
- **UI Components**: Lucide React Icons
- **Charts**: Recharts
- **Routing**: React Router v6
- **State Management**: React Context API
- **Styling**: CSS Variables + Custom CSS
- **Development**: ESLint + Vite HMR

## 📦 インストール・セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境設定

```bash
# 環境設定ファイルをコピー
cp .env.example .env

# 必要に応じて .env ファイルを編集
```

### 3. 開発サーバー起動

```bash
npm run dev
```

開発サーバーは `http://localhost:3003` で起動します。

## 🔧 主要コマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# ビルドプレビュー
npm run preview

# ESLint チェック
npm run lint
```

## 🏗️ プロジェクト構造

```
admin/
├── src/
│   ├── components/          # React コンポーネント
│   │   ├── Dashboard.jsx    # メインダッシュボード
│   │   ├── StoreManagement.jsx     # 店舗管理
│   │   ├── ReportManagement.jsx    # レポート管理
│   │   ├── NotificationSystem.jsx  # 通知システム
│   │   └── ...
│   ├── contexts/           # React Context
│   │   └── AuthContext.js  # 認証コンテキスト
│   ├── utils/              # ユーティリティ
│   │   └── environment.js  # 環境設定ユーティリティ
│   ├── App.jsx            # メインアプリケーション
│   ├── App.css            # グローバルスタイル
│   └── main.jsx           # エントリーポイント
├── public/                # 静的ファイル
├── .env.example           # 環境設定テンプレート
└── package.json
```

## ⚙️ 環境設定

### 開発環境

- **デモモード**: `REACT_APP_DEMO_MODE=true`
- **ローカルAPI**: `REACT_APP_LOCAL_API_URL=http://localhost:3002`
- **自動リフレッシュ**: 30秒間隔

### 本番環境

- **プロダクションAPI**: `REACT_APP_API_URL=https://your-api-domain.com/api`
- **セキュリティ**: 認証必須、ログ制限

## 🎨 デザインシステム

### カラーパレット

```css
/* Primary Colors */
--primary-500: #64748b;
--success-500: #10b981;
--warning-500: #f59e0b;
--error-500: #ef4444;
--info-500: #3b82f6;
```

### 主要コンポーネント

- **Status Indicators**: 店舗・システム状態の色分け表示
- **Alert System**: リアルタイム通知とアラート
- **Data Tables**: ソート・フィルター機能付きテーブル
- **Modal Dialogs**: 確認・編集ダイアログ

## 🔒 認証・セキュリティ

- **ローカル環境**: 認証スキップ（開発用）
- **本番環境**: JWT認証必須
- **ルート保護**: 認証済みユーザーのみアクセス可能
- **環境分離**: 設定の環境別管理

## 📊 主要機能

### 1. ダッシュボード
- リアルタイムシステム監視
- 緊急アラート表示
- API状態監視
- エラートレンド分析

### 2. 店舗管理
- 5ステップセットアップウィザード
- システム状態監視
- 詳細設定管理

### 3. レポート管理
- AI自動生成（毎月1日）
- 配信管理（確認ダイアログ付き）
- 配信期限アラート（毎月5日）
- データ期間・完整性表示

### 4. 通知システム
- リアルタイム通知
- 確認ダイアログ
- 自動消去機能

## 🚨 トラブルシューティング

### よくある問題

1. **環境変数が読み込まれない**
   - `.env` ファイルが存在することを確認
   - `REACT_APP_` プレフィックスを確認

2. **API接続エラー**
   - バックエンドサーバーが起動していることを確認
   - CORS設定を確認

3. **認証エラー**
   - JWT トークンの有効性を確認
   - ローカル環境の場合はデモモードを確認

## 🔄 デプロイ

### 本番環境デプロイ

```bash
# プロダクションビルド
npm run build

# dist/ フォルダを Webサーバーにデプロイ
```

### 環境変数設定

本番環境では以下の環境変数を設定してください：

- `REACT_APP_ENV=production`
- `REACT_APP_API_URL=https://your-api-domain.com/api`
- `REACT_APP_DEMO_MODE=false`

## 📄 ライセンス

このプロジェクトは kanpAI の一部として開発されています。

## 🤝 コントリビューション

1. 機能追加前に Issue を作成
2. 開発ブランチで作業
3. テスト実行
4. Pull Request を作成

---

**kanpAI Admin Dashboard** - 効率的な店舗管理を実現