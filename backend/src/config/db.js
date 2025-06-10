// C:\Users\acmsh\kanpAI\backend\src\config\db.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL 17対応の接続設定
const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'kanpai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'sheve777',
  // PostgreSQL 17の新しい認証方式に対応
  ssl: false,
  // 接続プールの設定
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * データベースへの接続をテストする関数
 */
export const testDbConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQLデータベースへの接続に成功しました！');
    // 現在の時刻を取得して接続を確認
    const res = await client.query('SELECT NOW()');
    console.log(`🕒 DBサーバーの現在時刻: ${res.rows[0].now}`);
    client.release(); // 接続をプールに返却
  } catch (err) {
    console.error('❌ PostgreSQLデータベースへの接続に失敗しました。');
    console.error('エラー詳細:', err.message);
    console.error('---');
    console.error('確認してください:');
    console.error('1. PostgreSQLサーバーは起動していますか？');
    console.error('2. 接続情報は正しいですか？');
    console.error(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.error(`   Port: ${process.env.DB_PORT || 5432}`);
    console.error(`   Database: ${process.env.DB_NAME || 'kanpai'}`);
    console.error(`   User: ${process.env.DB_USER || 'postgres'}`);
    console.error('---');
    // 接続に失敗した場合、アプリケーションを終了させる
    process.exit(1);
  }
};

// 他のファイルからDB操作ができるようにpoolをエクスポート
export default pool;