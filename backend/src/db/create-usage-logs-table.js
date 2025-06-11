// C:\Users\acmsh\kanpAI\backend\src\db\create-usage-logs-table.js
import pool from '../config/db.js';

const createUsageLogsTable = async () => {
  const client = await pool.connect();
  try {
    console.log('--- 使用量ログテーブル作成開始 ---');

    const queryText = `
      CREATE TABLE IF NOT EXISTS usage_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        log_date DATE NOT NULL DEFAULT CURRENT_DATE,
        service_type VARCHAR(50) NOT NULL,
        openai_tokens_used INTEGER DEFAULT 0,
        menu_operations_count INTEGER DEFAULT 0,
        line_broadcasts_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    
    await client.query(queryText);
    console.log('✅ "usage_logs"テーブルが正常に作成/確認されました。');
    
    console.log('--- 使用量ログテーブル作成完了 ---');
  } catch (err) {
    console.error('❌ テーブル作成中にエラーが発生しました:', err.stack);
  } finally {
    client.release();
    pool.end();
  }
};

createUsageLogsTable();
