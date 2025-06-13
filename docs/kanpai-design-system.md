# kanpAI デザインシステム仕様書

## 1. デザインコンセプト：「昭和モダン」

`kanpAI`のダッシュボードは、単なる管理画面ではなく、店主が毎日触れる「経営のパートナー」としての体験を提供することを目指しています。そこで、**「昭和モダン」**を全体のデザインコンセプトとして採用しました。

和紙のような温かみのある背景色と、活版印刷を思わせる日本語フォントで、どこか懐かしく、信頼感のある雰囲気を醸成。一方で、レイアウトや操作性は現代のWeb標準に準拠し、直感的でストレスのない使い心地を実現します。

この「懐かしさ」と「新しさ」の融合が、店主の日々の業務に「わくわくする」瞬間を提供します。

---

## 2. カラーパレット

色の定義は、`frontend/src/App.css`の`:root`セレクタ内で、CSSカスタムプロパティ（変数）として一元管理されています。

| 役割 | 変数名 | 色 (Hex) | 説明 |
|------|--------|----------|------|
| **背景色** | `--color-background` | `#fdfaf4` | 和紙や少し黄みがかった壁紙をイメージした、温かみのある白。 |
| **文字色** | `--color-text` | `#4a2f22` | 黒に近いが、少し温かみのあるこげ茶色。 |
| **カード背景** | `--color-card` | `#ffffff` | 清潔感のある白。背景色とのコントラストを生む。 |
| **アクセントカラー** | `--color-accent` | `#b93a3a` | 昭和の看板や暖簾を思わせる、深みのある赤。見出しや重要なアイコンに使用。 |
| **プライマリーカラー** | `--color-primary` | `#3a69b9` | 昭和の琺瑯看板のような、落ち着いた青。通知や一部のアイコンに使用。 |
| **境界線** | `--color-border` | `#e0dace` | 全体に馴染む、薄いベージュ系の境界線。 |
| **ポジティブ** | `--color-positive` | `#228b22` | 予約件数の増加など、良い変化を示すためのフォレストグリーン。 |
| **ネガティブ** | `--color-negative` | `#b22222` | 予約件数の減少など、注意を促すためのファイアブリック。 |

```css
/* frontend/src/App.css */
:root {
  --color-background: #fdfaf4;
  --color-text: #4a2f22;
  --color-card: #ffffff;
  --color-accent: #b93a3a;
  --color-primary: #3a69b9;
  --color-border: #e0dace;
  --color-positive: #228b22;
  --color-negative: #b22222;
}
```

### 2.1. 追加カラー（管理者ダッシュボード用）

管理者ダッシュボード特有の要素に使用する色を追加定義します。

| 役割 | 変数名 | 色 (Hex) | 説明 |
|------|--------|----------|------|
| **暖簾紺** | `--color-noren` | `#1c3a6e` | 暖簾や藍染めを思わせる深い紺色。 |
| **提灯オレンジ** | `--color-chochin` | `#ff6b35` | 夕暮れの提灯の明かりのような温かいオレンジ。 |
| **金箔** | `--color-gold` | `#d4af37` | 高級感や特別感を演出する金色。 |
| **墨色** | `--color-sumi` | `#1c1c1c` | 筆文字に使う墨の色。 |
| **薄墨** | `--color-usuzumi` | `#666666` | 補足情報に使う薄い墨色。 |
| **畳緑** | `--color-tatami` | `#8fbc8f` | 新しい畳を思わせる優しい緑。 |

---

## 3. タイポグラフィ（フォント）

「昭和モダン」の雰囲気を決定づける、2つの日本語フォントをGoogle Fontsから読み込んで使用しています。

### 見出し用 (`--font-title`): **Yuji Syuku (ゆうじ しゅうく)**
- **特徴:** 活版印刷の滲みを再現した、力強くもどこか懐かしい書体。各カードのタイトル（`<h2>`）などに使用し、デザインの「顔」となる部分を引き締めます。

### 本文用 (`--font-body`): **Kiwi Maru (キウイ まる)**
- **特徴:** クラシックな角ゴシック体をベースにした、優しく、読みやすい丸ゴシック体。ダッシュボード全体の基本フォントとして、親しみやすさと可読性を両立させています。

### 数値用 (`--font-number`): **Kosugi (こすぎ)**
- **特徴:** 等幅フォントで数字の視認性が高い。売上や統計データの表示に最適。

```css
/* frontend/src/App.css */
@import url('https://fonts.googleapis.com/css2?family=Kiwi+Maru:wght@400;500&family=Yuji+Syuku&family=Kosugi&display=swap');

:root {
  --font-title: 'Yuji Syuku', serif;
  --font-body: 'Kiwi Maru', sans-serif;
  --font-number: 'Kosugi', monospace;
}
```

---

## 4. レイアウトシステム

### 4.1. モバイルファースト

本ダッシュボードは、店主が最も利用するであろう**スマートフォンでの体験を最優先**に設計されています。

- まず、すべての要素が縦一列に並ぶ、シンプルなレイアウトを基準とします。
- その後、CSSのメディアクエリ (`@media (min-width: ...)`) を使い、画面幅が一定以上（PCなど）の場合にのみ、多段カラムレイアウトに切り替わるように設定しています。

### 4.2. ブレークポイント

```css
/* スマートフォン（基準） */
/* 0px - 767px */

/* タブレット */
@media (min-width: 768px) { /* ... */ }

/* デスクトップ */
@media (min-width: 1024px) { /* ... */ }

/* 大画面 */
@media (min-width: 1440px) { /* ... */ }
```

### 4.3. CSSグリッドレイアウト

PC表示時の柔軟なレイアウトを実現するため、`main`要素に`display: grid`を適用し、12カラムのグリッドシステムを構築しています。

```css
/* frontend/src/App.css */

/* スマホでの表示（基準） */
main {
  display: grid;
  grid-template-columns: 1fr; /* 常に1カラム */
  gap: 20px;
  padding: 16px;
}

/* PCなどの大画面用の設定 (1024px以上) */
@media (min-width: 1024px) {
  main {
    grid-template-columns: repeat(12, 1fr); /* 12カラムに分割 */
    gap: 25px;
    padding: 30px;
  }
  /* 例: LINE配信は6カラム分の幅を取る */
  .line-broadcast-container { grid-column: 1 / 7; }
  /* 例: メニュー管理は残り6カラム分の幅を取る */
  .menu-list-container { grid-column: 7 / -1; }
}
```

---

## 5. UIコンポーネントライブラリ

### 5.1. カード (`.card`)

全ての機能モジュールを格納する基本コンテナです。

```css
.card {
  background-color: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  padding: 20px;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}
```

### 5.2. カードヘッダー (`.card-header`)

各カードのタイトル部分です。アイコンと見出しで構成されます。

```css
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.summary-icon {
  font-size: 1.8rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-header h2 {
  font-family: var(--font-title);
  color: var(--color-accent);
  font-size: 1.4rem;
  margin: 0;
}
```

### 5.3. ボタン

```css
/* 基本ボタン */
button {
  font-family: var(--font-body);
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

/* プライマリーボタン */
.primary-button {
  background-color: var(--color-primary);
  color: white;
}

/* セカンダリーボタン */
.secondary-button {
  background-color: #8c7664;
  color: white;
}

/* 保存ボタン */
.save-button {
  background-color: var(--color-positive);
  color: white;
}

/* 削除・キャンセルボタン */
.delete-button,
.cancel-button {
  background-color: var(--color-negative);
  color: white;
}

/* ホバー効果 */
button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 判子風ボタン（特別なアクション用） */
.hanko-button {
  background-color: var(--color-accent);
  color: white;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-family: var(--font-title);
  font-weight: bold;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}
```

### 5.4. テーブル (`.management-table`)

メニューや予約の一覧表示に使われます。

```css
.management-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background-color: white;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.management-table th {
  background-color: var(--color-background);
  font-family: var(--font-title);
  font-size: 0.9rem;
  color: var(--color-accent);
  padding: 12px;
  text-align: left;
  border-bottom: 2px solid var(--color-border);
}

.management-table td {
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
  font-family: var(--font-body);
}

.management-table tbody tr:hover {
  background-color: rgba(253, 250, 244, 0.5);
}

/* 数値データ用のセル */
.table-number {
  font-family: var(--font-number);
  text-align: right;
}
```

### 5.5. フォーム要素

```css
/* 入力フィールド */
input[type="text"],
input[type="email"],
input[type="password"],
textarea,
select {
  width: 100%;
  padding: 10px 15px;
  border: 2px solid var(--color-border);
  border-radius: 6px;
  font-family: var(--font-body);
  font-size: 1rem;
  background-color: white;
  transition: border-color 0.2s ease;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(58, 105, 185, 0.1);
}

/* ラベル */
label {
  display: block;
  margin-bottom: 6px;
  font-family: var(--font-body);
  font-weight: 500;
  color: var(--color-text);
}

/* エラーメッセージ */
.error-message {
  color: var(--color-negative);
  font-size: 0.875rem;
  margin-top: 4px;
}
```

---

## 6. 特殊効果とアニメーション

### 6.1. 和紙テクスチャ

```css
.washi-texture {
  position: relative;
}

.washi-texture::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.03) 10px,
      rgba(255, 255, 255, 0.03) 20px
    );
  pointer-events: none;
}
```

### 6.2. 提灯効果

```css
.chochin-glow {
  background: radial-gradient(
    ellipse at center,
    rgba(255, 107, 53, 0.3) 0%,
    transparent 70%
  );
  animation: chochin-pulse 3s ease-in-out infinite;
}

@keyframes chochin-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
```

### 6.3. 暖簾効果

```css
.noren-header {
  position: relative;
  background-color: var(--color-noren);
  color: white;
  padding: 20px;
  overflow: hidden;
}

.noren-header::after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 0;
  right: 0;
  height: 20px;
  background: repeating-linear-gradient(
    90deg,
    var(--color-noren) 0px,
    var(--color-noren) 30px,
    transparent 30px,
    transparent 40px
  );
}
```

---

## 7. アイコンシステム

### 7.1. 絵文字アイコン

kanpAIでは、親しみやすさとアクセシビリティのバランスを考慮し、基本的に絵文字をアイコンとして使用します。

| 機能 | アイコン | 説明 |
|------|----------|------|
| ダッシュボード | 📊 | グラフ・統計 |
| 店舗管理 | 🏪 | お店 |
| 予約 | 📅 | カレンダー |
| メニュー | 🍶 | 日本酒（居酒屋らしさ） |
| LINE配信 | 📢 | メガホン・告知 |
| レポート | 📈 | 上昇グラフ |
| 設定 | ⚙️ | 歯車 |
| アラート | 🔔 | ベル |
| 成功 | ✅ | チェックマーク |
| エラー | ❌ | バツ印 |
| 警告 | ⚠️ | 警告マーク |
| 情報 | ℹ️ | インフォメーション |

### 7.2. カスタムアイコン（SVG）

特殊な用途には、SVGアイコンを使用します。

```css
.custom-icon {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

/* 提灯アイコン */
.icon-chochin {
  background-image: url('data:image/svg+xml;utf8,<svg>...</svg>');
}
```

---

## 8. レスポンシブデザイン戦略

### 8.1. コンテンツの優先順位

モバイル表示時は、以下の優先順位で表示します：

1. **緊急アラート**（もしあれば）
2. **本日の予約状況**
3. **クイックアクション**（LINE配信など）
4. **統計サマリー**
5. **その他の機能**

### 8.2. タッチ操作の最適化

```css
/* タッチターゲットの最小サイズ */
button,
a,
.clickable {
  min-height: 44px;
  min-width: 44px;
}

/* スワイプ可能な要素 */
.swipeable {
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
}
```

---

## 9. アクセシビリティ

### 9.1. カラーコントラスト

すべての文字色と背景色の組み合わせは、WCAG 2.1のAAレベル（4.5:1以上）を満たしています。

### 9.2. フォーカス表示

```css
:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}
```

### 9.3. スクリーンリーダー対応

```html
<!-- 装飾的な要素にはaria-hidden -->
<span class="decorative-icon" aria-hidden="true">🏮</span>

<!-- 重要な情報には適切なラベル -->
<button aria-label="新規予約を追加">
  <span aria-hidden="true">➕</span>
  追加
</button>
```

---

## 10. 実装ガイドライン

### 10.1. CSS設計原則

1. **BEM命名規則**の採用
   ```css
   .card {}
   .card__header {}
   .card__body {}
   .card--featured {}
   ```

2. **CSS変数の活用**
   - 色、フォント、スペーシングは必ず変数を使用
   - ハードコーディングは避ける

3. **モバイルファースト**
   - 基本スタイルはモバイル用
   - メディアクエリで拡張

### 10.2. パフォーマンス最適化

1. **フォントの最適化**
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   ```

2. **アニメーションの制限**
   ```css
   @media (prefers-reduced-motion: reduce) {
     * {
       animation-duration: 0.01ms !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```

---

## 11. 今後の拡張

### 11.1. ダークモード対応（将来）

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #1a1a1a;
    --color-text: #e0e0e0;
    /* ... */
  }
}
```

### 11.2. テーマカスタマイズ

将来的に、店舗ごとにテーマカラーを選べる機能を追加予定。

---

この仕様書は、kanpAIのビジュアルアイデンティティと一貫したユーザー体験を維持するための基準となります。開発時は常にこの仕様書を参照し、統一感のあるインターフェースを構築してください。