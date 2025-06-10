// C:\Users\acmsh\kanpAI\backend\src\db\init-db.js
import pool from '../config/db.js';

const createStoresTable = async () => {
  const client = await pool.connect();
  try {
    console.log('--- データベース初期化開始 ---');

    // pgcrypto拡張機能がなければ作成 (UUIDを生成するために必要)
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    console.log('✅ pgcrypto拡張機能を確認/作成しました。');

    // storesテーブルを作成するSQLクエリ
    // プロジェクト仕様書に基づき、基本的なカラムを定義します
    const queryText = `
      CREATE TABLE IF NOT EXISTS stores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        concept TEXT,
        operating_hours JSONB,
        line_channel_id VARCHAR(50),
        line_channel_secret VARCHAR(100),
        line_channel_access_token VARCHAR(200),
        google_calendar_id VARCHAR(100),
        stripe_customer_id VARCHAR(50),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    
    await client.query(queryText);
    console.log('✅ "stores"テーブルが正常に作成/確認されました。');
    
    console.log('--- データベース初期化完了 ---');
  } catch (err) {
    console.error('❌ テーブル作成中にエラーが発生しました:', err.stack);
  } finally {
    client.release(); // 接続をプールに返却
    pool.end(); // プールを閉じる
  }
};

createStoresTable();
