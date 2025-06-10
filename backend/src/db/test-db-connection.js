// C:\Users\acmsh\kanpAI\backend\src\db\test-db-connection.js
import pool from '../config/db.js';

const testConnection = async () => {
  console.log('--- データベース接続テスト開始 ---');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQLデータベースへの接続に成功しました！');
    
    // 基本的なクエリテスト
    const res = await client.query('SELECT NOW()');
    console.log(`🕒 DBサーバーの現在時刻: ${res.rows[0].now}`);
    
    // 店舗テーブルの存在確認
    const storeCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'stores'
      );
    `);
    console.log(`📋 storesテーブル存在: ${storeCheck.rows[0].exists}`);
    
    client.release();
    console.log('--- データベース接続テスト完了 ---');
  } catch (err) {
    console.error('❌ データベース接続エラー:', err.message);
    console.error('---');
    console.error('トラブルシューティング:');
    console.error('1. PostgreSQLサーバーが起動しているか確認');
    console.error('2. パスワード設定を確認');
    console.error('3. データベース名"kanpai"が存在するか確認');
    console.error('---');
  } finally {
    await pool.end();
  }
};

testConnection();