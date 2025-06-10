// C:\Users\acmsh\kanpAI\backend\src\server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
// (他のimport文は省略)
import chatRoutes from './routes/chatRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import lineRoutes from './routes/lineRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import stripeRoutes from './routes/stripeRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import usageRoutes from './routes/usageRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { testDbConnection } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const startServer = async () => {
  await testDbConnection();
  const app = express();
  const port = process.env.PORT || 3001;
  
  // CORS設定
  app.use(cors());
  
  // 静的ファイル配信設定（修正版）
  const publicPath = path.join(__dirname, '..', 'public');
  console.log(`📁 静的ファイルパス: ${publicPath}`);
  app.use(express.static(publicPath));
  
  // ★★★ ここが最重要修正点 ★★★
  // 1. 先に、特別なリクエスト(rawボディ)を受け取る可能性があるルートを定義します。
  //    (これらのルートファイル内部で、個別に express.raw() を使っています)
  app.use('/api/stripe', stripeRoutes);
  app.use('/api/chat', chatRoutes);

  // 2. 次に、一般的なJSONリクエストを受け取るための門番(パーサー)を配置します。
  app.use(express.json());

  // 3. 最後に、JSONを扱う残りのすべてのAPIルートを定義します。
  app.use('/api/stores', storeRoutes);
  app.use('/api/reservations', reservationRoutes);
  app.use('/api/line', lineRoutes);
  app.use('/api/subscriptions', subscriptionRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/usage', usageRoutes);
  app.use('/api/menus', menuRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/upload', uploadRoutes);

  // ルートエンドポイント
  app.get('/', (req, res) => { 
    res.send(`
      <h1>🚀 kanpAI Backend Server</h1>
      <p>サーバーが正常に起動しています！</p>
      <ul>
        <li><a href="/reservation-test.html">予約テストページ</a></li>
        <li><a href="/api/reservations/business-status?store_id=8fbff969-5212-4387-ae62-cc33944edef2">API テスト</a></li>
      </ul>
    `); 
  });

  // 404ハンドラー（デバッグ用）
  app.use((req, res) => {
    console.log(`❌ 404 Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ 
      error: 'ページが見つかりません',
      url: req.url,
      method: req.method,
      static_path: publicPath
    });
  });

  app.listen(port, () => { 
    console.log(`サーバーがポート${port}で起動しました。 http://localhost:${port}`);
    console.log(`📁 静的ファイルを配信中: ${publicPath}`);
  });
};
startServer();