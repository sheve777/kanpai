# kanpAI プロジェクト詳細仕様書

## プロジェクト概要

### プロジェクト名
**kanpAI** - 居酒屋向けチャットボット＋販促支援サービス

### ビジョン・目指す姿
店舗にとって電気や水道のように「なくてはならないインフラ」となり、店舗の成功に寄り添う「頼れるパートナー」になること。顧客と長期的な信頼関係を築き、安定したサブスクリプション収益を基盤とした、持続可能で価値あるビジネスを構築する。

---

## ターゲット顧客と課題

### ターゲット顧客
日々奮闘する居酒屋の店主

### 解決する課題
1. **人手不足による業務負担**：問い合わせや予約の電話対応に追われ、本来の接客や調理に集中できない
2. **機会損失**：営業時間外の問い合わせや予約に対応できず、お客様を逃している
3. **販促活動への障壁**：日々の業務に追われ、新規顧客獲得やリピーター育成のための販促活動にまで手が回らない

---

## 提供ソリューション

### 1. 「第二の従業員」としてのチャットボット
賢いチャットボットが主に店舗の営業時間内に「第二の従業員」として稼働し、メニューの詳細案内やよくある質問に自動で応答。一方で、予約の自動受付システムは24時間対応するため、営業時間外でも予約の機会損失を防ぐ。

### 2. 「頼れる販促サポーター」としてのLINE配信機能
専用マイページから、画像付きのクーポンやお店からのお知らせをLINEの友だち全員に一斉配信できる。

### 3. 「経営の羅針盤」としてのレポート機能
AIが分析した月次レポートを提供し、顧客の関心事や課題を可視化。データに基づいた店舗運営の改善をサポート。

---

## 技術スタック

- **チャットボット**：OpenAI API
- **決済システム**：Stripe
- **LINE連携**：LINE API
- **予約システム**：Googleカレンダー連携
- **開発体制**：一人開発

---

## 基本設計原則

### 絶対条件
**店舗固有の情報を外部で管理する**
- チャットボット、予約システム、ダッシュボード、レポート機能、LINE配信機能など、すべての機能において店舗固有の情報はコードに埋め込まず外部管理
- 複数店舗でも簡単に使えるスケーラブルな設計

### スマホファースト
- すべての機能でスマホ操作を前提とした設計
- タップしやすいボタンサイズ、片手操作可能なレイアウト、読み込み速度優先

---

## 料金プラン・ビジネスモデル

### 初期設定費用
- **一律 30,000円（税込）**
- 内容：メニュー読み込み、Googleカレンダー連携、その他初期設定全般

### サブスクリプションプラン

#### エントリープラン
- **料金**：10,000円/月（税込）
- **内容**：
  - チャットボット利用ポイント：300pt（3,000円分のusagelimit）
  - メニュー操作：月3回まで
  - 簡易レポート（アップセル重視）

#### スタンダードプラン
- **料金**：30,000円/月（税込）
- **内容**：
  - チャットボット利用ポイント：1,000pt（10,000円分のusagelimit）
  - メニュー操作：月10回まで
  - 月次基本レポート

#### プロプラン
- **料金**：50,000円/月（税込）
- **内容**：
  - チャットボット利用ポイント：3,000pt（30,000円分のusagelimit）
  - メニュー操作：月30回まで
  - 月次詳細分析＆戦略レポート
  - メニュー変更作業：月5回無料

### オプションサービス（従量課金）

#### 追加チャットボット利用ポイント
- 少量チャージ：100ポイント / 3,000円（税込）
- 標準チャージ：200ポイント / 5,000円（税込）
- お得チャージ：500ポイント / 10,000円（税込）

#### その他
- **メニュー更新作業**：5,000円（税込）/回
- **チャットボット人格変更サービス**：5,000円（税込）
- **LINE公式アカウントプラン変更代行**：10,000円（税込）

---

## 機能詳細仕様

## 1. チャットボット機能

### 基本構造
- 店舗固有情報を外部管理（絶対条件）
- Function Callingでメニューデータ効率取得
- OpenAI API + 使用量制限管理

### 店舗情報管理
#### 店舗基本情報
- 店名、営業時間、定休日
- アクセス情報、支払い方法
- 店舗の特徴やコンセプト

#### チャットボット人格設定
- 話し方のトーン（丁寧・親しみやすい・カジュアルなど）
- 一人称、呼び方
- 店舗らしい特徴的な表現

#### メニュー情報
- 料理名、カテゴリ、料金、説明文
- カテゴリ分け、おすすめ度
- アレルギー情報、辛さレベルなど重要な項目は店主に聞くように案内

### 変更権限・制限
#### 店主がリアルタイム変更可能
- 電話番号、住所、支払い方法、店舗紹介文

#### 作業代行が必要
- チャットボットの人格設定変更
- 営業時間、定休日、店名（システム影響あり）
- メニューの追加・変更（プラン制限内でも）

### メニュー操作制限
- **対象操作**：新メニュー追加、既存メニュー価格変更、既存メニュー販売停止/再開
- **制限回数**：
  - エントリープラン：月3回まで
  - スタンダードプラン：月10回まで
  - プロプラン：月30回まで
- **リセットタイミング**：毎月1日
- **超過時**：従量課金5,000円/回

### Function Calling設計
```
menu_search(
  category?: string,     // "焼き鳥", "ドリンク"等
  max_price?: number,    // 価格上限
  keyword?: string       // フリーワード検索
)
```

### 会話・履歴管理
#### 会話用履歴
- **保持範囲**：2-3回前まで
- **保持方法**：重要部分（メニュー検索結果）は生データ、文脈は要約
- **セッション終了**：無応答1時間で自動終了

#### 分析用ログ
- **保存期間**：永続保存
- **内容**：個人特定情報なし、質問カテゴリ、検索メニュー、質問種類、時間帯、会話長さ

### エラー処理・特殊対応
- **理解不能な質問**：「マスター（店主）にお聞きください」
- **API制限到達**：お客様からマスターへ従量課金依頼を誘導
- **アレルギー等重要情報**：マスター確認を案内
- **営業時間外**：チャットボット停止、予約システムのみ稼働
- **エラーログ**：保存して分析・改善に活用

### 対応時間
- **営業時間内**：フル機能稼働
- **営業時間外**：チャットボット停止（トークン消費ゼロ）、予約システムは24時間稼働

---

## 2. 予約システム機能

### 受付条件
- **受付期間**：当日予約不可（翌日以降受付）
- **時間単位**：30分刻み
- **受付時間帯**：営業時間内のみ

### 店舗設定項目（店舗ごとに設定可能）
#### 席種設定
- カウンター、テーブル、個室など自由設定
- 各席種の席数・人数制限設定
- 例：テーブル席は3人以上じゃないと予約不可など

#### 利用時間設定
- デフォルト：2時間
- 店舗ごとに調整可能

### 予約フロー
#### 必須項目
- 名前、人数、電話番号、時間
- 席種選択（複数空きがあればお客様が選択）

#### 任意項目
- 備考

#### 確定・通知
- 即座に予約確定
- お客様・店主両方に確認通知

### Googleカレンダー連携
#### 予約時の自動処理
- Googleカレンダーに自動で予定追加
- **タイトル**：「[名前] [人数]名 [席種]」
- **内容**：電話番号、備考
- **時間**：開始時刻 + 設定利用時間で自動終了設定

#### 営業時間・定休日管理
- 店主がGoogleカレンダーに予定を入れると自動的に予約不可
- 定休日：0:00-24:00の終日予定で対応
- 営業時間短縮：該当時間帯に予定を入れて対応
- 臨時休業・貸切も同様の方法で対応可能

### キャンセル対応
- お客様への案内：「お店への直接連絡をお願いします」
- 店主がGoogleカレンダーから手動削除

---

## 3. ダッシュボード機能

### 表示優先順位（スマホファースト設計）

#### 1. 予約状況
- 今日の予約一覧（時間、名前、人数、席種）
- 空き状況の視覚的なタイムライン表示
- 明日・明後日の予約概要（折りたたみ表示）

#### 2. LINE配信機能
- 画像+テキスト作成画面
- プレビュー機能：送信前に確認
- 送信確認ダイアログ
- 配信履歴：シンプルなリスト（日時、内容概要）

#### 3. 使用状況
- 残りポイント（プログレスバー表示）
- メニュー操作残回数
- 今月の使用量

#### 4. クイック操作
- メニュー操作（追加・価格変更・停止/再開）
- 基本情報変更（システム影響なし項目のみ）

#### 5. 簡易分析
- 今日のチャット件数
- 今日の予約件数

### LINE配信機能詳細
- **配信対象**：友だち全員への一斉配信
- **コンテンツ**：画像+テキスト
- **制限**：LINEで有効なら特になし
- **操作フロー**：作成→プレビュー→送信確認→配信
- **配信タイミング**：即時送信
- **履歴**：簡易的な配信履歴閲覧可能

### 基本情報変更の区分
#### リアルタイム変更可能（システム影響なし）
- 電話番号、住所・アクセス情報
- 支払い方法の案内、店舗紹介文

#### 代行が必要（システム影響あり）
- 営業時間、定休日（予約システム影響）
- 店名（各システム全体に影響）
- チャットボット人格設定（プロンプト影響）

---

## 4. 月次レポート機能

### 生成・配信フロー
1. **毎月1日**：先月分データをAI自動分析・生成
2. **内容確認・修正**：開発者が内容確認、修正指示をAIに送信
3. **AI修正**：指示に基づいてAI修正
4. **最終確認・配信**：各店舗に配信
5. **通知**：トップページお知らせ欄に「◯月のレポートが完成しました」表示

### プラン別レポート内容

#### エントリープラン：簡易レポート（アップセル重視）
- よく聞かれた質問TOP3（「TOP5を見るにはスタンダードプラン」表示）
- 人気メニューTOP5（「TOP10を見るにはスタンダードプラン」表示）
- 基本数値のみ（チャット件数、予約件数）
- シンプルなグラフ1-2個
- 改善提案1個（「より詳細な提案はスタンダードプラン」）

#### スタンダードプラン：月次基本レポート
- **サマリー**：ひと目で分かる数値ダッシュボード
- **利用状況分析**：チャット・予約の時間帯別グラフ
- **人気コンテンツ**：よく聞かれた質問TOP5、人気メニューTOP10
- **トレンド分析**：前月比較、季節要因
- **改善ポイント**：具体的な提案2-3個

#### プロプラン：月次詳細分析＆戦略レポート
- スタンダードの全内容に加えて
- **詳細データ**：よく聞かれた質問TOP15、人気メニューTOP20
- **詳細戦略分析**：競合比較、業界トレンド
- **カスタム提案**：店舗特性に合わせた戦略5-7個
- **データドリルダウン**：より詳細な分析
- **グラフ・チャート**：詳細セット

### デザイン・UX
- カラフルなグラフ・チャート重視
- インフォグラフィック風デザイン
- スマホでも見やすいレスポンシブ対応
- リッチで継続したくなるデザイン

### 修正方式
- AI修正で効率化（手打ち修正はしない）
- 修正パターン例：
  - 「この分析結果の解釈を変更して」
  - 「改善提案をもっと具体的に」
  - 「この店舗の特徴を考慮した内容に」

---

## アップセル戦略

### 基本姿勢
- 自然で価値提供重視
- ユーザーに不快感を与えない
- 押し売り感を避ける

### 自然なアップセル施策

#### 価値を実感してもらうパターン
- 制限達成時：「おかげさまでよく使っていただいてます！」→ さりげなくプラン案内
- 好調な月：「今月は予約が◯%増加ですね」→ 「さらに詳しい分析はスタンダードで」
- レポート閲覧時：情報の続きを自然に見せる（押し売り感なし）

#### 困った時にそっと提案
- ポイント不足：「追加購入もできますが、プランアップの方がお得かも」
- 機能要望：「その機能、実は上位プランにあります」

#### 使用制限による自然なアップセル
- エントリー：チャット300pt、メニュー操作3回 → 「今月の制限に達しました。スタンダードプランで継続できます」
- ポイント不足時：「残り50pt。追加購入 or プラン変更で20%お得」

### 避けたいパターン
- ポップアップの乱発
- 毎回のログイン時案内
- 強引な限定感煽り
- 頻繁な営業メッセージ

---

## MVP開発優先順位

### Phase 1: コア機能
1. **チャットボット**（メニュー案内・FAQ）
2. **予約受付** → Googleカレンダー連携
3. **店主向けダッシュボード**（予約一覧・使用量確認）

### Phase 2: 拡張機能
4. **LINE配信機能**
5. **月次レポート機能**
6. **アップセル機能**

---

## 協力店舗との検証計画

### 検証方法
- 特定の機能ができたタイミングで実際に使ってもらう
- 定期的にfeedbackを収集
- 実際の運用での課題を洗い出し

### 成功指標（想定）
- チャットボットの応答精度
- 予約件数の増加
- 店主の業務時間削減
- 顧客満足度

---

## リスク管理

### 技術的リスク
- **最大のリスク**：一人開発での統合部分の技術的難易度
- **対策**：各機能は単体では問題ないため、統合部分に注力

### 運用リスク
- OpenAI APIのコスト変動・利用制限 → プラン別使用量制限で対応
- 居酒屋店主の新ツール導入ハードル → 既存LINE公式アカウント活用、初期設定全て請け負い

### 事業リスク
- サポート対応の増大 → 初期は店舗数少なく一人対応、将来的にサポート担当雇用予定

---

## 今後の展開

### 短期目標
- 協力店舗での検証完了
- MVP機能の安定稼働
- 初期顧客獲得

### 中長期目標
- 100店舗、1000店舗への展開
- 居酒屋以外の飲食店への展開可能性
- 注文機能、会計連携などの機能拡張

---

## 技術設計詳細

### システム全体構成

#### フロントエンド層
- **お客様向け**：LINEチャットボット（LINE Messaging API経由）
- **店主向け**：Webダッシュボード（React、スマホ最適化）

#### バックエンド層
- **メインアプリケーション**：Node.js/Express
- **データベース**：PostgreSQL（リレーショナルDB）
- **ファイルストレージ**：AWS S3（LINE配信用画像など）
- **キューシステム**：Redis（API呼び出し管理、使用量制限）

#### 外部API連携層
- **OpenAI API**：チャットボット機能
- **LINE Messaging API**：チャット受信・配信
- **Google Calendar API**：予約管理
- **Stripe API**：決済処理

### アプリケーション構造
```
kanpAI Backend
├── API Gateway (認証・ルーティング)
├── Chat Service (チャットボット処理)
├── Reservation Service (予約管理)
├── Menu Service (メニュー管理)
├── Report Service (レポート生成)
├── LINE Service (LINE配信)
├── Billing Service (使用量・課金管理)
└── Store Service (店舗情報管理)
```

### データベース設計

#### 主要テーブル構造

**stores（店舗マスタ）**
```sql
stores {
  id: UUID (Primary Key)
  name: VARCHAR(100)
  phone: VARCHAR(20)
  address: TEXT
  payment_methods: TEXT
  concept: TEXT
  operating_hours: JSONB
  line_channel_id: VARCHAR(50)
  line_channel_secret: VARCHAR(100)
  line_channel_access_token: VARCHAR(200)
  google_calendar_id: VARCHAR(100)
  google_access_token: TEXT
  google_refresh_token: TEXT
  bot_personality: JSONB
  bot_tone: VARCHAR(20)
  bot_first_person: VARCHAR(10)
  default_reservation_duration: INTEGER
  current_plan: VARCHAR(20)
  billing_email: VARCHAR(100)
  stripe_customer_id: VARCHAR(50)
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

**seat_types（席種マスタ）**
```sql
seat_types {
  id: UUID (Primary Key)
  store_id: UUID (Foreign Key → stores.id)
  name: VARCHAR(50)
  capacity: INTEGER
  min_people: INTEGER
  max_people: INTEGER
  created_at: TIMESTAMP
}
```

**menus（メニューマスタ）**
```sql
menus {
  id: UUID (Primary Key)
  store_id: UUID (Foreign Key → stores.id)
  name: VARCHAR(100)
  category: VARCHAR(50)
  price: INTEGER
  description: TEXT
  is_recommended: BOOLEAN
  is_available: BOOLEAN
  allergy_info: TEXT
  spice_level: INTEGER
  display_order: INTEGER
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

**reservations（予約データ）**
```sql
reservations {
  id: UUID (Primary Key)
  store_id: UUID (Foreign Key → stores.id)
  seat_type_id: UUID (Foreign Key → seat_types.id)
  customer_name: VARCHAR(50)
  customer_phone: VARCHAR(20)
  party_size: INTEGER
  reservation_date: DATE
  reservation_time: TIME
  duration_minutes: INTEGER
  notes: TEXT
  google_event_id: VARCHAR(100)
  status: VARCHAR(20)
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

**chat_sessions（チャット履歴）**
```sql
chat_sessions {
  id: UUID (Primary Key)
  store_id: UUID (Foreign Key → stores.id)
  line_user_id: VARCHAR(50)
  session_start: TIMESTAMP
  session_end: TIMESTAMP
  message_count: INTEGER
  last_activity: TIMESTAMP
}
```

**chat_messages（チャットメッセージ）**
```sql
chat_messages {
  id: UUID (Primary Key)
  session_id: UUID (Foreign Key → chat_sessions.id)
  message_type: VARCHAR(20)
  content: TEXT
  function_calls: JSONB
  openai_tokens: INTEGER
  created_at: TIMESTAMP
}
```

**usage_logs（使用量ログ）**
```sql
usage_logs {
  id: UUID (Primary Key)
  store_id: UUID (Foreign Key → stores.id)
  log_date: DATE
  service_type: VARCHAR(20)
  openai_tokens_used: INTEGER
  openai_cost_yen: INTEGER
  chat_sessions_count: INTEGER
  menu_operations_count: INTEGER
  line_broadcasts_count: INTEGER
  created_at: TIMESTAMP
}
```

**plans（プランマスタ）**
```sql
plans {
  id: UUID (Primary Key)
  plan_code: VARCHAR(20)
  plan_name: VARCHAR(50)
  monthly_price: INTEGER
  monthly_token_limit: INTEGER
  menu_operations_limit: INTEGER
  line_broadcasts_limit: INTEGER
  has_basic_report: BOOLEAN
  has_detailed_report: BOOLEAN
  is_active: BOOLEAN
  created_at: TIMESTAMP
}
```

**reports（レポートデータ）**
```sql
reports {
  id: UUID (Primary Key)
  store_id: UUID (Foreign Key → stores.id)
  report_month: DATE
  plan_type: VARCHAR(20)
  analytics_data: JSONB
  report_content: TEXT
  status: VARCHAR(20)
  generated_at: TIMESTAMP
  delivered_at: TIMESTAMP
  created_at: TIMESTAMP
}
```

**line_broadcasts（LINE配信履歴）**
```sql
line_broadcasts {
  id: UUID (Primary Key)
  store_id: UUID (Foreign Key → stores.id)
  message_text: TEXT
  image_url: VARCHAR(500)
  recipient_count: INTEGER
  delivery_status: VARCHAR(20)
  line_message_id: VARCHAR(100)
  sent_at: TIMESTAMP
  created_at: TIMESTAMP
}
```

**store_subscriptions（店舗サブスクリプション）**
```sql
store_subscriptions {
  id: UUID (Primary Key)
  store_id: UUID (Foreign Key → stores.id)
  plan_id: UUID (Foreign Key → plans.id)
  stripe_subscription_id: VARCHAR(100)
  current_period_start: DATE
  current_period_end: DATE
  status: VARCHAR(20)
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

### API設計

#### 認証・共通仕様
- **店主向けAPI**: JWT Bearer Token
- **LINE Webhook**: LINE署名検証
- **外部API**: 各サービスのAPI Key/OAuth

#### 主要APIエンドポイント

**チャットボット関連**
```
POST /webhooks/line/:store_id - LINE Webhook受信
POST /api/chat/process - チャット処理
POST /api/menus/search - Function Calling用メニュー検索
```

**予約システム**
```
POST /api/reservations - 予約作成
GET /api/reservations?store_id=uuid&date=2025-06-07 - 予約一覧取得
```

**ダッシュボード**
```
GET /api/dashboard/:store_id - ダッシュボードデータ取得
GET /api/usage/:store_id?month=2025-06 - 使用量詳細取得
```

**LINE配信**
```
POST /api/line/broadcast - 配信作成・送信
GET /api/line/broadcasts/:store_id - 配信履歴取得
```

**メニュー管理**
```
GET /api/menus/:store_id - メニュー一覧取得
POST /api/menus/operation - メニュー操作（制限管理込み）
```

**レポート**
```
GET /api/reports/:store_id/:month - 月次レポート取得
GET /api/reports/:store_id - レポート一覧
```

### エラーハンドリング・セキュリティ設計

#### エラー処理方針
- **OpenAI API障害**: 「マスターにお聞きください」で誘導
- **API制限到達**: お客様からマスターへ従量課金依頼誘導
- **重要情報（アレルギー等）**: マスター確認案内
- **営業時間外**: チャットボット停止、予約システムのみ稼働

#### セキュリティ対策
- **認証**: JWT認証 + 店舗アクセス権限チェック
- **データ保護**: 個人情報マスキング、重要データ暗号化
- **レート制限**: Redis使用、API別制限設定
- **入力値検証**: express-validator使用、XSS対策
- **監査ログ**: セキュリティイベント記録・アラート

### インフラ・デプロイ設計

#### AWS構成
- **Compute**: ECS Fargate（API + Worker）
- **Database**: RDS PostgreSQL（Multi-AZ + Read replica）
- **Cache**: ElastiCache Redis（Cluster mode）
- **Storage**: S3（画像・レポート・バックアップ）
- **Network**: VPC、ALB、WAF
- **Monitoring**: CloudWatch、X-Ray

#### CI/CD
- **GitHub Actions**: 自動テスト・ビルド・デプロイ
- **Docker**: コンテナ化、ECRレジストリ
- **環境分離**: development/staging/production

### 監視・運用設計

#### 監視指標
- **ビジネス指標**: チャット応答率、予約成功率、解約率
- **技術指標**: API応答時間、エラー率、使用量
- **アラート**: Slack通知、PagerDuty連携、SMS通知（緊急時）

#### データ保護・バックアップ
- **個人情報保存期間**: 
  - チャット履歴：分析用は匿名化して永続、個人情報は3ヶ月で削除
  - 予約情報：予約日から1年後に自動削除
  - LINE ID：友だち登録解除で即座削除
- **バックアップ**: 日次PostgreSQLダンプ、S3自動保存
- **災害復旧**: RTO 1時間、RPO 15分

---

## 開発計画

### 開発優先順位・推奨順序

#### 🎯 フェーズ1: 最小限の動くもの（MVP Core）
1. **基盤構築**
   - 開発環境セットアップ（GitHub + Docker Compose）
   - Node.js + Express + PostgreSQL
   - 基本API構造、エラーハンドリング・ログ機能
   - 最小限のテーブル構築（stores, menus, chat_sessions）

2. **チャットボット基本機能**
   - LINE Webhook受信
   - OpenAI API統合（シンプル版）
   - メニュー検索Function Calling
   - 基本的な会話応答

**👍 ここで協力店舗初回テスト**

#### 🎯 フェーズ2: 実用的なシステム
3. **予約システム**
   - Googleカレンダー連携
   - 予約受付・確定機能
   - 席種・時間管理
   - 予約確認通知

4. **店主向けダッシュボード（基本版）**
   - 認証・ログイン
   - 予約状況表示
   - 使用量表示
   - メニュー基本管理

**👍 ここで協力店舗本格運用テスト**

#### 🎯 フェーズ3: 差別化機能
5. **使用量制限・課金システム**
   - プラン管理
   - 使用量計測・制限
   - Stripe決済統合
   - 従量課金処理

6. **LINE配信機能**
   - 画像+テキスト配信
   - プレビュー・送信確認
   - 配信履歴

#### 🎯 フェーズ4: 収益化機能
7. **レポート機能（目玉機能）**
   - データ分析基盤
   - プラン別レポート生成
   - AI修正機能
   - 配信・通知システム

8. **アップセル機能**
   - 自然なプラン案内
   - 制限到達時の誘導
   - プラン比較・変更機能

#### 🎯 フェーズ5: 運用・最適化
9. **監視・セキュリティ強化**
   - 本格的な監視設定
   - セキュリティ監査
   - パフォーマンス最適化
   - エラー処理強化

10. **本格デプロイ・運用**
    - AWS本番環境
    - CI/CD完全自動化
    - バックアップ・災害復旧
    - サポート体制整備

### 開発方針
- **完璧主義を避け、動くものを早く作る**
- **協力店舗のフィードバックを最優先**
- **店舗固有情報の外部管理を最初から徹底**
- **スマホ対応を各段階で確認**
- **外部API統合は早めに検証**

---

## 運用・サポート方針

### サポート体制
- **対応時間**: 営業時間内対応
- **障害対応**: 翌朝対応（24時間対応なし）
- **初期段階**: 協力店舗（身内経営）での検証中心
- **段階的拡大**: 地元居酒屋から徐々に展開

### 法的準備
- **利用規約・プライバシーポリシー**: テンプレート使用
- **特定商取引法表記**: サブスクリプション対応
- **データ保護**: 個人情報保護法準拠

### 事業展開
- **初期検証**: 協力店舗でのお客様反応確認
- **正式リリース**: 検証結果を踏まえて判断
- **ターゲット**: 低価格帯での差別化戦略
- **展開エリア**: 地元から段階的拡大

---

*このプロジェクト仕様書は、kanpAIの開発・運用の基盤となる重要な設計文書です。技術設計から運用方針まで、プロジェクト成功に必要な全ての要素を包含しています。*