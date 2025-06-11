// C:\Users\acmsh\kanpAI\backend\src\db\fix-usage-logs-table.js
import pool from '../config/db.js';

const fixUsageLogsTable = async () => {
  const client = await pool.connect();
  try {
    console.log('--- 使用量ログテーブル修正開始 ---');

    // 1. 既存のテーブルを削除 (存在する場合)
    await client.query('DROP TABLE IF EXISTS usage_logs CASCADE;');
    console.log('🚮 既存の"usage_logs"テーブルを削除しました。');

    // 2. 新しい、正しい定義でテーブルを再作成
    const createQuery = `
      CREATE TABLE usage_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        log_date DATE NOT NULL DEFAULT CURRENT_DATE,
        service_type VARCHAR(50) NOT NULL,
        openai_tokens_used INTEGER DEFAULT 0,
        menu_operations_count INTEGER DEFAULT 0,
        line_broadcasts_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (store_id, log_date, service_type)
      );
    `;
    
    await client.query(createQuery);
    console.log('✅ 新しい"usage_logs"テーブルが正常に作成されました。');
    
    console.log('--- 使用量ログテーブル修正完了 ---');
  } catch (err) {
    console.error('❌ テーブル修正中にエラーが発生しました:', err.stack);
  } finally {
    client.release();
    pool.end();
  }
};

fixUsageLogsTable();
