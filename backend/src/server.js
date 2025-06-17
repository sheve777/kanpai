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
import supportRoutes from './routes/supportRoutes.js';
import authRoutes from './routes/authRoutes.js';
import demoRoutes from './routes/demoRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { testDbConnection } from './config/db.js';
import logger from './utils/logger.js';
import globalErrorHandler, { notFound } from './middlewares/errorHandler.js';
import { generalLimiter, authLimiter, apiLimiter } from './middlewares/rateLimiter.js';
import { startReportScheduler } from './services/reportScheduler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const startServer = async () => {
  // データベース接続テスト（本番運用では必須）
  if (process.env.NODE_ENV === 'production' || process.env.FORCE_DB_CHECK === 'true') {
    await testDbConnection();
  } else {
    logger.warn('⚠️ DB接続チェックをスキップしています（開発環境）');
  }
  const app = express();
  const port = process.env.PORT || 3002;
  
  // CORS設定（本番環境対応）
  const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.CORS_ORIGIN || process.env.FRONTEND_URL
      : true, // 開発環境では全オリジンを許可
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  };
  app.use(cors(corsOptions));
  
  // レート制限を追加
  app.use(generalLimiter);
  
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

  // 3. 認証ルート（認証不要）
  console.log('🔐 認証ルートを登録中...');
  app.use('/api/auth', authLimiter, authRoutes); // 認証に厳しいレート制限を適用
  console.log('✅ 認証ルート登録完了: /api/auth');

  // 3.1. 管理者ルート（管理者専用）
  console.log('👑 管理者ルートを登録中...');
  app.use('/api/admin', authLimiter, adminRoutes); // 管理者に厳しいレート制限を適用
  console.log('✅ 管理者ルート登録完了: /api/admin');

  // 3.5. デモルート（DB接続なしのモックデータ）
  console.log('📝 デモルートを登録中...');
  app.use('/api', apiLimiter, demoRoutes); // APIエンドポイントにレート制限を適用
  console.log('✅ デモルート登録完了: /api/*');

  // 4. 最後に、JSONを扱う残りのすべてのAPIルートを定義します。
  app.use('/api/stores', storeRoutes);
  app.use('/api/reservations', reservationRoutes);
  app.use('/api/line', lineRoutes);
  app.use('/api/subscriptions', subscriptionRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/usage', usageRoutes);
  app.use('/api/menus', menuRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/support', supportRoutes);
  
  // ヘルスチェックエンドポイント（認証不要）
  app.use('/api/health', healthRoutes);

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

  // グローバルエラーハンドラーを追加
  app.use(notFound); // 404ハンドラー
  app.use(globalErrorHandler); // グローバルエラーハンドラー

  // 未キャッチ例外の処理
  process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
    process.exit(1);
  });

  // サーバー開始
  const server = app.listen(port, () => { 
    logger.info(`サーバーがポート${port}で起動しました。 http://localhost:${port}`);
    logger.info(`📁 静的ファイルを配信中: ${publicPath}`);
    
    // 月次レポート自動生成スケジューラーを開始
    startReportScheduler();
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      logger.info('Process terminated!');
    });
  });

  return server;
};
startServer();