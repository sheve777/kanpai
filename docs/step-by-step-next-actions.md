# サーバー契約後の次のアクション - ステップバイステップ

## 🎯 現在の状況: さくらVPS契約完了
お疲れ様です！次は実際にサーバーに接続してkanpAIを稼働させましょう。

---

## 🚀 方法1: 自動セットアップ（推奨・簡単）

### **ワンコマンドで完了**

**Step 1: サーバーにSSH接続**
```bash
# さくらから届いたメールの情報で接続
ssh ubuntu@YOUR_SERVER_IP

# 初回接続の質問には「yes」で回答
# パスワードはメールに記載されたものを入力
```

**Step 2: 自動セットアップ実行**
```bash
# セットアップスクリプトダウンロード・実行
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/kanpAI/main/scripts/quick-setup.sh | bash
```

**これだけで完了！**
- ✅ システム更新・セキュリティ設定
- ✅ Docker環境構築
- ✅ kanpAIダウンロード・起動
- ✅ 初期設定ファイル自動生成

---

## 🔧 方法2: 手動セットアップ（詳細制御）

### **Step 1: SSH接続**
```bash
ssh ubuntu@YOUR_SERVER_IP
```

### **Step 2: システム更新**
```bash
sudo apt update && sudo apt upgrade -y
```

### **Step 3: Docker インストール**
```bash
# Docker公式インストールスクリプト
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker ubuntu
```

### **Step 4: kanpAI取得**
```bash
mkdir -p ~/kanpai && cd ~/kanpai
git clone https://github.com/YOUR_USERNAME/kanpAI.git
cd kanpAI
```

### **Step 5: 環境設定**
```bash
cp .env.production .env
nano .env  # 設定編集
```

### **Step 6: 起動**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📋 設定完了後の確認事項

### **1. ブラウザアクセス確認**
```
http://YOUR_SERVER_IP
```
→ kanpAIダッシュボードが表示されるはず

### **2. API動作確認**
```bash
curl http://YOUR_SERVER_IP/api/health
```
→ `{"status":"healthy",...}` が返されるはず

### **3. サービス状態確認**
```bash
cd ~/kanpai/kanpAI
docker-compose -f docker-compose.prod.yml ps
```
→ 全サービスが「Up」状態であることを確認

---

## 🌐 次のステップ選択

### **A. ドメイン取得・HTTPS化（推奨順序1）**

**なぜ先にやるべき？**
- お客様向けURL確定
- SSL証明書でセキュリティ向上
- 信頼性のあるサイトに

**手順:**
1. さくらドメインで希望ドメイン取得
2. DNS設定（AレコードでサーバーIP指定）
3. Let's Encrypt でSSL証明書取得
4. nginx設定でHTTPS有効化

**所要時間:** 1-2時間
**費用:** 年間3,000円程度

### **B. 外部サービス設定（推奨順序2）**

**設定する外部サービス:**
1. **OpenAI API** - レポート生成・AI機能
2. **LINE Developers** - LINE公式アカウント連携
3. **Stripe** - オンライン決済システム
4. **Google Calendar** - 予約管理・同期

**手順:**
1. 各サービスのアカウント作成
2. API キー・トークン取得
3. .env ファイルに実際の値設定
4. 機能テスト・動作確認

**所要時間:** 3-4時間
**費用:** 各サービスの利用料

### **C. 店舗情報・メニュー設定（推奨順序3）**

**設定内容:**
1. 店舗基本情報（名前、住所、電話番号）
2. 営業時間・定休日設定
3. メニュー情報入力
4. 予約設定カスタマイズ

**手順:**
1. 管理画面にログイン
2. 店舗情報フォーム入力
3. メニュー一覧作成
4. 予約ルール設定

**所要時間:** 2-3時間
**費用:** なし

---

## 💡 推奨スケジュール

### **今日（サーバー設定完了日）**
- [x] さくらVPS契約完了
- [ ] SSH接続・kanpAI起動確認
- [ ] ブラウザでの動作確認

### **明日～3日以内**
- [ ] ドメイン取得・DNS設定
- [ ] SSL証明書設定・HTTPS化
- [ ] 基本的な外部API設定

### **1週間以内**
- [ ] 全外部サービス連携完了
- [ ] 実店舗データ入力完了
- [ ] テスト予約・決済確認

### **2週間以内**
- [ ] 実運用開始
- [ ] 初期運用での調整・改善

---

## 🚨 現在の状況確認

**まず、以下を教えてください:**

1. **SSH接続は成功しましたか？**
   - [ ] 成功：パスワード入力してubuntu@サーバー画面が表示された
   - [ ] 失敗：接続エラーや認証失敗

2. **希望する進め方は？**
   - [ ] 自動セットアップ（簡単・推奨）
   - [ ] 手動セットアップ（詳細制御）

3. **ドメイン名の希望は？**
   - お店の名前やコンセプトに基づいたドメイン名
   - 例：yamada-restaurant.com、sushi-tanaka.com など

4. **急ぎの機能は？**
   - [ ] まずは基本的な予約システム
   - [ ] LINE公式アカウント連携優先
   - [ ] オンライン決済機能優先

---

## 📞 サポート体制

**困った時の連絡方法:**
- GitHub Issues でエラー報告
- 詳細なエラーメッセージとログ添付
- スクリーンショット付きで状況説明

**自己解決用リソース:**
- `~/kanpai/kanpAI/docs/troubleshooting-guide.md`
- `~/kanpai/kanpAI/docs/post-server-setup-guide.md`
- さくらVPSサポート：048-780-2066

---

現在の状況と次に進めたいステップを教えてください！
具体的なコマンドと手順をお伝えします。