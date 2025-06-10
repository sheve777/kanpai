// C:\Users\acmsh\kanpAI\backend\src\db\create-chat-tables.js
import pool from '../config/db.js';

const createChatTables = async () => {
  const client = await pool.connect();
  try {
    console.log('--- チャット履歴テーブル作成開始 ---');

    // chat_sessionsテーブルを作成するSQLクエリ
    const sessionsQueryText = `
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        line_user_id VARCHAR(50) NOT NULL,
        session_start TIMESTAMPTZ DEFAULT NOW(),
        session_end TIMESTAMPTZ,
        message_count INTEGER DEFAULT 0,
        last_activity TIMESTAMPTZ
      );
    `;
    
    await client.query(sessionsQueryText);
    console.log('✅ "chat_sessions"テーブルが正常に作成/確認されました。');

    // chat_messagesテーブルを作成するSQLクエリ
    const messagesQueryText = `
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
        message_type VARCHAR(20) NOT NULL,
        content TEXT,
        function_calls JSONB,
        openai_tokens INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    
    await client.query(messagesQueryText);
    console.log('✅ "chat_messages"テーブルが正常に作成/確認されました。');
    
    console.log('--- チャット履歴テーブル作成完了 ---');
  } catch (err) {
    console.error('❌ テーブル作成中にエラーが発生しました:', err.stack);
  } finally {
    client.release(); // 接続をプールに返却
    pool.end(); // プールを閉じる
  }
};

createChatTables();
