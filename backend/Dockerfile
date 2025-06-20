# Node.js 18 Alpine Linux ベースイメージ
FROM node:18-alpine

# 作業ディレクトリの設定
WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./

# 依存関係のインストール
RUN npm ci --only=production

# アプリケーションファイルをコピー
COPY . .

# ポート3002を公開
EXPOSE 3002

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/api/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# アプリケーションの起動
CMD ["node", "src/server.js"]