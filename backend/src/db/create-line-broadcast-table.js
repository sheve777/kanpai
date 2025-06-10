// C:\Users\acmsh\kanpAI\backend\src\db\create-line-broadcast-table.js
import pool from '../config/db.js';

const createLineBroadcastsTable = async () => {
  const client = await pool.connect();
  try {
    console.log('--- LINE配信履歴テーブル作成開始 ---');

    const queryText = `
      CREATE TABLE IF NOT EXISTS line_broadcasts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        message_text TEXT,
        image_url VARCHAR(500),
        recipient_count INTEGER,
        delivery_status VARCHAR(20) NOT NULL,
        line_message_id VARCHAR(100),
        sent_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    
    await client.query(queryText);
    console.log('✅ "line_broadcasts"テーブルが正常に作成/確認されました。');
    
    console.log('--- LINE配信履歴テーブル作成完了 ---');
  } catch (err) {
    console.error('❌ テーブル作成中にエラーが発生しました:', err.stack);
  } finally {
    client.release();
    pool.end();
  }
};

createLineBroadcastsTable();
