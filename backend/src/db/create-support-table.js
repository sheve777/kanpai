// C:\Users\acmsh\kanpAI\backend\src\db\create-support-table.js
import pool from '../config/db.js';

const createSupportTable = async () => {
  try {
    const client = await pool.connect();
    
    try {
      // support_requestsテーブルの作成
      await client.query(`
        CREATE TABLE IF NOT EXISTS support_requests (
          id SERIAL PRIMARY KEY,
          store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
          subject VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          contact_type VARCHAR(50) DEFAULT 'general',
          status VARCHAR(50) DEFAULT 'pending',
          response TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          responded_at TIMESTAMP
        );
      `);
      
      console.log('✅ support_requestsテーブルが作成されました');
      
      // インデックスの作成
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_support_requests_store_id 
        ON support_requests(store_id);
      `);
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_support_requests_status 
        ON support_requests(status);
      `);
      
      console.log('✅ support_requestsテーブルのインデックスが作成されました');
      
    } finally {
      client.release();
    }
    
  } catch (err) {
    console.error('❌ support_requestsテーブル作成中にエラーが発生しました:', err.stack);
  }
};

createSupportTable();