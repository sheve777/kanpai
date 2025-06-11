// C:\Users\acmsh\kanpAI\backend\src\db\update-chat-messages-table.js
import pool from '../config/db.js';

const updateChatMessagesTable = async () => {
  const client = await pool.connect();
  try {
    console.log('--- chat_messagesテーブルの更新開始 ---');

    // analytics_meta カラムを追加 (存在しない場合のみ)
    const queryText = `
      ALTER TABLE chat_messages
      ADD COLUMN IF NOT EXISTS analytics_meta JSONB;
    `;
    
    await client.query(queryText);
    console.log('✅ "chat_messages"テーブルに"analytics_meta"カラムが正常に追加/確認されました。');
    
    console.log('--- テーブル更新完了 ---');
  } catch (err) {
    console.error('❌ テーブル更新中にエラーが発生しました:', err.stack);
  } finally {
    client.release();
    pool.end();
  }
};

updateChatMessagesTable();
