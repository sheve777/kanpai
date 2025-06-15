# ドメイン取得・SSL設定ガイド - kanpAI

## 📋 目次
1. [ドメイン名の決定](#1-ドメイン名の決定)
2. [ドメイン取得サービス比較](#2-ドメイン取得サービス比較)
3. [ドメイン取得手順](#3-ドメイン取得手順)
4. [DNS設定](#4-dns設定)
5. [SSL証明書設定](#5-ssl証明書設定)
6. [nginx設定更新](#6-nginx設定更新)

---

## 1. ドメイン名の決定

### 1.1 レストラン向けドメイン名のポイント

**✅ 良いドメイン名の例:**
```
restaurant-yamada.com
yamada-sushi.com
kanpai-dining.com
your-shop-name.com
```

**❌ 避けるべきドメイン名:**
```
yamada123456.com  # 数字が多い
yamada-restaurant-kanpai-system.com  # 長すぎる
yamada.info  # 信頼性が低く見える
```

### 1.2 推奨ドメイン拡張子

| 拡張子 | 料金/年 | 特徴 | 推奨度 |
|--------|---------|------|--------|
| **.com** | 1,200-1,500円 | 🥇 最も信頼性が高い | ⭐⭐⭐⭐⭐ |
| **.jp** | 3,000-4,000円 | 🥈 日本らしさアピール | ⭐⭐⭐⭐ |
| **.net** | 1,200-1,500円 | 🥉 一般的 | ⭐⭐⭐ |
| **.info** | 800-1,200円 | ⚠️ スパム印象 | ⭐⭐ |

**推奨: .com ドメイン**
- 顧客が覚えやすい
- 検索エンジンに優遇される
- 信頼性が最も高い

---

## 2. ドメイン取得サービス比較

### 2.1 国内サービス（推奨）

#### **お名前.com（GMO）**
**料金:**
- .com: 1,408円/年
- .jp: 2,840円/年

**特徴:**
- ✅ 国内最大手・安心感
- ✅ 24時間サポート
- ✅ DNS設定が簡単
- ⚠️ 更新忘れメールが頻繁

#### **ムームードメイン**
**料金:**
- .com: 1,628円/年
- .jp: 3,344円/年

**特徴:**
- ✅ GMO系列で安定
- ✅ 管理画面が分かりやすい
- ✅ レンタルサーバーとの連携が良い

#### **さくらドメイン**
**料金:**
- .com: 1,886円/年
- .jp: 3,982円/年

**特徴:**
- ✅ さくらVPSとの相性抜群
- ✅ 一元管理可能
- ✅ 同じ会社で安心

### 2.2 海外サービス

#### **Cloudflare**
**料金:**
- .com: $10/年（約1,500円）

**特徴:**
- ✅ 最安値級
- ✅ CDN・セキュリティ機能が高性能
- ⚠️ 英語のみ

### 2.3 **推奨: さくらドメイン**

**レストラン事業者に最適な理由:**
1. **一元管理** - さくらVPSと同じ会社
2. **日本語サポート** - トラブル時に安心
3. **設定の簡単さ** - VPSとの連携設定が楽
4. **信頼性** - 老舗企業の安定感

---

## 3. ドメイン取得手順

### 3.1 さくらドメイン申込み

**Step 1: さくらインターネット会員登録**
```
https://secure.sakura.ad.jp/signup/
```
※ さくらVPS申込み時に作成済みの場合はスキップ

**Step 2: ドメイン検索・申込み**
```
https://domain.sakura.ad.jp/
```

1. 希望ドメイン名を入力
2. 使用可能か確認
3. .com ドメインを選択
4. カートに追加

**Step 3: お客様情報入力**
```
重要: Whois情報公開代行を有効にする
（個人情報保護のため必須）
```

**Step 4: 支払い・確定**
- クレジットカード決済推奨
- 自動更新設定を有効にする

### 3.2 ドメイン取得完了確認

**完了メール受信:**
- ドメイン取得完了通知
- 管理パネルログイン情報
- DNS設定手順

**所要時間:**
- .com: 即時〜数時間
- .jp: 1-3日程度

---

## 4. DNS設定

### 4.1 さくらドメインでのDNS設定

**Step 1: さくらドメイン管理画面にログイン**
```
https://secure.sakura.ad.jp/
```

**Step 2: ドメイン詳細画面**
1. 取得したドメインをクリック
2. 「ゾーン編集」を選択

**Step 3: DNS レコード設定**

**必須レコード設定:**
```bash
# メインドメイン
@ (root)     A    YOUR_SERVER_IP

# www サブドメイン
www          A    YOUR_SERVER_IP

# API サブドメイン（オプション）
api          A    YOUR_SERVER_IP

# 管理画面サブドメイン（オプション）
admin        A    YOUR_SERVER_IP
```

**具体例（IPアドレス: 192.168.1.100の場合）:**
```
@ (root)     A    192.168.1.100
www          A    192.168.1.100
api          A    192.168.1.100
admin        A    192.168.1.100
```

### 4.2 DNS設定確認

**Step 1: 設定反映待ち**
- 通常: 1-6時間
- 最大: 24-48時間

**Step 2: 確認コマンド**
```bash
# ローカルマシンで確認
nslookup your-domain.com
dig your-domain.com

# 結果例
your-domain.com  IN  A  YOUR_SERVER_IP
```

**Step 3: ブラウザ確認**
```
http://your-domain.com
# → さくらVPSのIPアドレスにアクセスされることを確認
```

---

## 5. SSL証明書設定

### 5.1 Let's Encrypt証明書取得

**Step 1: Certbotインストール（server-setup.shで完了済み）**
```bash
# 既にインストール済みの確認
certbot --version
```

**Step 2: 証明書取得**
```bash
# nginx停止（重要）
sudo systemctl stop nginx

# 証明書取得
sudo certbot certonly --standalone \
    -d your-domain.com \
    -d www.your-domain.com \
    --email your-email@example.com \
    --agree-tos \
    --non-interactive

# nginx再開
sudo systemctl start nginx
```

**Step 3: 証明書確認**
```bash
# 証明書ファイル確認
sudo ls -la /etc/letsencrypt/live/your-domain.com/

# 証明書内容確認
sudo openssl x509 -in /etc/letsencrypt/live/your-domain.com/fullchain.pem -text -noout
```

### 5.2 自動更新設定

**Step 1: 更新テスト**
```bash
# ドライラン（実際の更新はしない）
sudo certbot renew --dry-run
```

**Step 2: cron設定**
```bash
# crontab編集
sudo crontab -e

# 以下を追加（毎日午前2時に更新チェック）
0 2 * * * /usr/bin/certbot renew --quiet --pre-hook "systemctl stop nginx" --post-hook "systemctl start nginx"
```

### 5.3 証明書ファイルの配置

**kanpAI用ディレクトリに証明書リンク作成:**
```bash
# SSL ディレクトリ作成
mkdir -p ~/kanpai/ssl

# 証明書ファイルのシンボリックリンク作成
sudo ln -s /etc/letsencrypt/live/your-domain.com/fullchain.pem ~/kanpai/ssl/your-domain.com.crt
sudo ln -s /etc/letsencrypt/live/your-domain.com/privkey.pem ~/kanpai/ssl/your-domain.com.key

# 権限設定
sudo chown -h ubuntu:ubuntu ~/kanpai/ssl/*
```

---

## 6. nginx設定更新

### 6.1 ドメイン名の更新

**nginx設定ファイル編集:**
```bash
cd ~/kanpai
nano nginx/nginx.conf
```

**変更箇所:**
```nginx
# 変更前
server_name your-domain.com www.your-domain.com;

# 変更後（実際のドメイン名に）
server_name restaurant-yamada.com www.restaurant-yamada.com;
```

### 6.2 SSL設定の有効化

**HTTP→HTTPS リダイレクト有効化:**
```nginx
# コメントアウト解除
server {
    listen 80;
    server_name restaurant-yamada.com www.restaurant-yamada.com;
    return 301 https://$server_name$request_uri;
}
```

**HTTPS設定有効化:**
```nginx
server {
    listen 443 ssl http2;
    server_name restaurant-yamada.com www.restaurant-yamada.com;
    
    # SSL証明書設定
    ssl_certificate /etc/nginx/ssl/restaurant-yamada.com.crt;
    ssl_certificate_key /etc/nginx/ssl/restaurant-yamada.com.key;
    
    # SSL設定
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    
    # セキュリティヘッダー
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # 以下、既存のlocation設定...
}
```

### 6.3 環境変数ファイル更新

**本番環境設定更新:**
```bash
nano .env
```

**更新内容:**
```bash
# URL設定（実際のドメインに変更）
FRONTEND_URL=https://restaurant-yamada.com
ADMIN_URL=https://admin.restaurant-yamada.com
API_BASE_URL=https://api.restaurant-yamada.com

# CORS設定
CORS_ORIGIN=https://restaurant-yamada.com
```

### 6.4 設定反映・動作確認

**Step 1: nginx設定テスト**
```bash
# 設定ファイル文法チェック
sudo nginx -t

# 問題なければreload
sudo nginx -s reload
```

**Step 2: Docker コンテナ再起動**
```bash
cd ~/kanpai
docker-compose -f docker-compose.prod.yml restart
```

**Step 3: HTTPS動作確認**
```bash
# SSL証明書確認
curl -I https://your-domain.com

# APIヘルスチェック
curl https://your-domain.com/api/health

# ブラウザ確認
# https://your-domain.com にアクセス
```

---

## 7. 完了チェックリスト

### 7.1 ドメイン・DNS確認
- [ ] ドメイン取得完了
- [ ] DNS Aレコード設定完了
- [ ] DNS反映確認（nslookup）
- [ ] HTTP接続確認

### 7.2 SSL証明書確認
- [ ] Let's Encrypt証明書取得完了
- [ ] 証明書ファイル配置完了
- [ ] 自動更新設定完了
- [ ] HTTPS接続確認

### 7.3 nginx・kanpAI確認
- [ ] nginx設定更新完了
- [ ] HTTPS設定有効化完了
- [ ] HTTP→HTTPSリダイレクト確認
- [ ] kanpAI動作確認（HTTPS）

### 7.4 セキュリティ確認
- [ ] SSL証明書有効性確認
- [ ] セキュリティヘッダー設定確認
- [ ] HSTS設定確認

---

## 🔧 トラブルシューティング

### DNS反映されない場合
```bash
# 他のDNSサーバーで確認
nslookup your-domain.com 8.8.8.8
nslookup your-domain.com 1.1.1.1

# DNS キャッシュクリア
sudo systemctl flush-dns  # Ubuntu
```

### SSL証明書取得失敗
```bash
# nginx停止確認
sudo systemctl status nginx

# ポート80使用状況確認
sudo netstat -tulpn | grep :80

# 証明書取得ログ確認
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

### nginx設定エラー
```bash
# 設定文法チェック
sudo nginx -t

# nginx エラーログ確認
sudo tail -f /var/log/nginx/error.log

# 設定ファイルバックアップから復元
sudo cp nginx.conf.backup nginx.conf
```

---

**完了後の確認URL:**
- メインサイト: `https://your-domain.com`
- APIヘルスチェック: `https://your-domain.com/api/health`
- 管理画面: `https://admin.your-domain.com`（設定した場合）

これで安全で信頼性の高いHTTPS対応のkanpAIシステムが完成です！