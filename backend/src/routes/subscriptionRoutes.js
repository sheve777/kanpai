// C:\Users\acmsh\kanpAI\backend\src\routes\subscriptionRoutes.js
import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

/**
 * 店舗を特定のプランに加入させるAPI
 * POST /api/subscriptions
 */
router.post('/', async (req, res) => {
  const { store_id, plan_code } = req.body; // plan_idではなく、わかりやすいplan_codeで受け取る

  if (!store_id || !plan_code) {
    return res.status(400).json({ error: '店舗IDとプランコードは必須です。' });
  }

  const client = await pool.connect();
  try {
    // トランザクション開始
    await client.query('BEGIN');

    // 1. plan_codeからplan_idを取得
    const planQuery = 'SELECT id FROM plans WHERE plan_code = $1';
    const planResult = await client.query(planQuery, [plan_code]);
    if (planResult.rows.length === 0) {
      throw new Error('指定されたプランコードが見つかりません。');
    }
    const plan_id = planResult.rows[0].id;

    // 2. 既存の有効なサブスクリプションがあれば無効にする (プラン変更を考慮)
    const deactivateQuery = `
      UPDATE store_subscriptions 
      SET status = 'inactive', updated_at = NOW() 
      WHERE store_id = $1 AND status = 'active';
    `;
    await client.query(deactivateQuery, [store_id]);

    // 3. 新しいサブスクリプションを登録
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    
    const subscribeQuery = `
      INSERT INTO store_subscriptions (store_id, plan_id, status, current_period_start, current_period_end)
      VALUES ($1, $2, 'active', $3, $4)
      RETURNING *;
    `;
    const values = [store_id, plan_id, today, nextMonth];
    const result = await client.query(subscribeQuery, values);
    
    // トランザクション確定
    await client.query('COMMIT');
    
    console.log(`✅ 店舗(ID:${store_id})がプラン(${plan_code})に加入しました。`);
    res.status(201).json(result.rows[0]);

  } catch (err) {
    // エラーが発生したらロールバック
    await client.query('ROLLBACK');
    console.error('❌ 購読処理中にエラーが発生しました:', err.message);
    res.status(500).json({ error: 'サーバー内部でエラーが発生しました。', details: err.message });
  } finally {
    client.release();
  }
});

export default router;
