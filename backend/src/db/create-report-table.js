// C:\Users\acmsh\kanpAI\backend\src\db\create-report-table.js
import pool from '../config/db.js';

const createReportTable = async () => {
  const client = await pool.connect();
  try {
    console.log('--- 月次レポート用テーブル作成開始 ---');

    // reportsテーブルを作成するSQLクエリ
    // プロジェクト仕様書に基づき定義します
    const queryText = `
      CREATE TABLE IF NOT EXISTS reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        report_month DATE NOT NULL,
        plan_type VARCHAR(20),
        analytics_data JSONB,
        report_content TEXT,
        status VARCHAR(20) DEFAULT 'generating',
        generated_at TIMESTAMPTZ,
        delivered_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (store_id, report_month)
      );
    `;
    
    await client.query(queryText);
    console.log('✅ "reports"テーブルが正常に作成/確認されました。');
    
    console.log('--- 月次レポート用テーブル作成完了 ---');
  } catch (err) {
    console.error('❌ テーブル作成中にエラーが発生しました:', err.stack);
  } finally {
    client.release();
    pool.end();
  }
};

createReportTable();
