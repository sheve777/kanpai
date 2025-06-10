# 店主LINE ID設定手順

## 📱 店主のLINE IDを取得する方法

### Step 1: LINE Official Account Managerにアクセス
1. https://manager.line.biz/ にログイン
2. kanpAIのアカウントを選択

### Step 2: ユーザーIDを確認
1. **設定** → **応答設定**
2. **Webhook** セクションを確認
3. **ユーザーID** を確認またはテストメッセージを送信

### Step 3: 簡単な方法
1. 店主のスマホで kanpAI の LINE アカウントにメッセージを送信
2. サーバーログでユーザーIDを確認
3. そのIDを .env ファイルに設定

### Step 4: .envファイルに追加
```
# 店主のLINE ID (通知送信先)
OWNER_LINE_ID=Uf8b1ab123456789
```

### Step 5: テスト実行
```bash
cd C:\Users\acmsh\kanpAI\backend\src\db
node test-notification.js
```

## 🔧 トラブルシューティング

### LINE IDが分からない場合
1. LINE Bot にメッセージを送信
2. サーバーログで `userId` を確認
3. その値を `OWNER_LINE_ID` に設定

### 通知が届かない場合
1. LINE_CHANNEL_ACCESS_TOKEN が正しいか確認
2. BOTとして追加されているか確認
3. ブロックされていないか確認