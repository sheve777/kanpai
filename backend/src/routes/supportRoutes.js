// C:\Users\acmsh\kanpAI\backend\src\routes\supportRoutes.js
import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// サポート連絡API
router.post('/contact', async (req, res) => {
  const { storeId, subject, message, contactType = 'general' } = req.body;
  
  if (!storeId || !subject || !message) {
    return res.status(400).json({ error: 'storeId、件名、メッセージは必須です。' });
  }
  
  try {
    const client = await pool.connect();
    try {
      // 店舗情報を取得
      const storeQuery = 'SELECT name, phone FROM stores WHERE id = $1';
      const storeResult = await client.query(storeQuery, [storeId]);
      
      if (storeResult.rows.length === 0) {
        return res.status(404).json({ error: '店舗が見つかりません。' });
      }
      
      const store = storeResult.rows[0];
      
      // サポートリクエストを記録
      const insertQuery = `
        INSERT INTO support_requests (store_id, subject, message, contact_type, status, created_at)
        VALUES ($1, $2, $3, $4, 'pending', CURRENT_TIMESTAMP)
        RETURNING id, created_at;
      `;
      const result = await client.query(insertQuery, [storeId, subject, message, contactType]);
      
      console.log(`✅ サポートリクエストを受け付けました: ${store.name} - ${subject}`);
      
      // TODO: 実際の実装では、ここでメール送信やSlack通知を行う
      // await sendSupportEmail({ store, subject, message });
      // await notifySlack({ store, subject, message });
      
      res.status(200).json({
        success: true,
        requestId: result.rows[0].id,
        message: 'サポートリクエストを受け付けました。24時間以内にご連絡いたします。'
      });
      
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ サポートリクエスト処理中にエラーが発生しました:', err.stack);
    res.status(500).json({ error: 'サーバー内部でエラーが発生しました。' });
  }
});

// プラン一覧取得API
router.get('/plans', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          plan_code,
          plan_name,
          monthly_price,
          line_broadcasts_limit,
          menu_operations_limit,
          chatbot_responses_limit,
          features
        FROM subscription_plans
        ORDER BY monthly_price ASC;
      `;
      const result = await client.query(query);
      
      console.log(`✅ プラン一覧を取得しました: ${result.rows.length}件`);
      res.status(200).json(result.rows);
      
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ プラン一覧取得中にエラーが発生しました:', err.stack);
    res.status(500).json({ error: 'サーバー内部でエラーが発生しました。' });
  }
});

export default router;