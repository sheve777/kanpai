# kanpAI 管理画面 ローカルセットアップガイド

## 📋 概要

kanpAI管理画面は**完全ローカル運用**でセキュリティを最優先した設計です。
インターネットに公開せず、あなたのPCからのみアクセス可能です。

## 🔐 セキュリティ設計

### 利点
- ✅ インターネット経由の攻撃リスクなし
- ✅ センシティブな店舗情報をローカルで安全管理
- ✅ 物理的アクセス制御による最高レベルのセキュリティ
- ✅ オフライン作業も可能

### 構成
```
管理画面: localhost:3001 (ローカルのみ)
本番API: https://kanpai-plus.jp/api/admin (HTTPS通信)
認証: 管理者APIキー + JWT
```

## 🚀 起動方法

### 方法1: 自動起動スクリプト（推奨）
```batch
# プロジェクトルートで実行
start-admin.bat
```

### 方法2: 手動起動
```bash
cd admin
npm run dev
```

ブラウザで `http://localhost:3001` にアクセス

## 🔑 ログイン情報

```
ユーザー名: admin
パスワード: admin123
```

**⚠️ 本格運用時は強力なパスワードに変更してください**

## 📁 ファイル構成

```
kanpAI/
├── start-admin.bat           # 起動スクリプト
├── admin/
│   ├── .env.local           # ローカル開発設定
│   ├── .env.production      # 本番API接続設定
│   ├── vite.config.js       # Vite設定 (port: 3001)
│   └── src/
│       └── contexts/AuthContext.jsx  # API接続設定
```

## 🔧 環境切り替え

### ローカルテスト（バックエンドも localhost）
```bash
# .env.local を使用
npm run dev
```

### 本番API接続テスト
```bash
# .env.production を使用
npm run dev -- --mode production
```

## 🖥️ 2台体制での運用

### デスクトップPC（自宅）
- 日常の管理業務
- 開発作業
- 大画面で効率的な作業

### ノートPC（店舗訪問用）
- 店舗での打ち合わせ
- 実機デモ
- 初期設定サポート
- BitLocker暗号化推奨

## 🚨 本番環境からの管理画面削除

セキュリティ向上のため、以下の作業が必要です：

### 1. Nginx設定修正
```bash
# サーバーにSSH接続
ssh ubuntu@133.125.41.193

# Nginx設定編集
sudo nano /etc/nginx/sites-available/kanpai
```

`admin.kanpai-plus.jp` 関連の設定を削除

### 2. SSL証明書更新
```bash
# 管理画面ドメインを除外して再取得
sudo certbot --nginx -d kanpai-plus.jp -d www.kanpai-plus.jp
```

### 3. Docker設定修正
```bash
# docker-compose.prod.yml から管理画面サービスを削除
nano docker-compose.prod.yml
```

### 4. サービス再起動
```bash
# 設定反映
sudo nginx -t && sudo systemctl reload nginx
docker-compose -f docker-compose.prod.yml up -d
```

## ✅ 動作確認

### 1. ローカル起動確認
```bash
# 管理画面起動
start-admin.bat

# ブラウザで確認
http://localhost:3001
```

### 2. API接続確認
- ログイン画面でadmin/admin123を入力
- 正常にダッシュボードが表示されることを確認
- 本番APIとの通信が正常に動作することを確認

### 3. セキュリティ確認
- `https://admin.kanpai-plus.jp/` にアクセスできないことを確認
- 管理画面がインターネットから完全に遮断されていることを確認

## 🎯 運用開始後のタスク

1. **店舗情報の登録**
   - 管理画面から店舗基本情報を入力
   - メニュー情報の登録

2. **環境変数の設定**
   - 各店舗のAPIキー管理
   - センシティブ情報の暗号化保存

3. **バックアップ設定**
   - ローカルデータの定期バックアップ
   - 重要設定のエクスポート機能

これで安全で効率的な管理システムの運用が開始できます！