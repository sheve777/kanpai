// C:\Users\acmsh\kanpAI\backend\src\middlewares\usageLimit.js
import pool from '../config/db.js';

/**
 * APIの利用上限をチェックするミドルウェア
 * @param {string} serviceType - 'line_broadcast' などのサービスタイプ
 */
export const checkUsageLimit = (serviceType) => {
  return async (req, res, next) => {
    const store_id = req.body.store_id || req.query.store_id;

    if (!store_id) {
      return res.status(400).json({ error: '店舗IDが必要です。' });
    }

    const client = await pool.connect();
    try {
      // 1. 店舗の現在のプランと上限値を取得
      const planQuery = `
        SELECT p.menu_operations_limit, p.line_broadcasts_limit, p.monthly_token_limit
        FROM plans p
        JOIN store_subscriptions ss ON p.id = ss.plan_id
        WHERE ss.store_id = $1 AND ss.status = 'active';
      `;
      const planResult = await client.query(planQuery, [store_id]);

      if (planResult.rows.length === 0) {
        // 有効なプランに加入していない
        return res.status(403).json({ error: 'この機能を利用するには、有効なプランへの加入が必要です。' });
      }
      const limits = planResult.rows[0];

      // 2. 今月の利用量を取得
      const usageQuery = `
        SELECT SUM(line_broadcasts_count) as total_broadcasts
        FROM usage_logs
        WHERE store_id = $1 AND date_trunc('month', log_date) = date_trunc('month', current_date);
      `;
      const usageResult = await client.query(usageQuery, [store_id]);
      const usage = usageResult.rows[0];

      // 3. 上限チェック
      switch (serviceType) {
        case 'line_broadcast':
          const currentBroadcasts = parseInt(usage.total_broadcasts || 0, 10);
          if (limits.line_broadcasts_limit !== null && currentBroadcasts >= limits.line_broadcasts_limit) {
            console.log(`🚫 上限超過: 店舗ID=${store_id}, サービス=${serviceType}`);
            return res.status(403).json({ error: '今月のLINE配信の上限回数に達しました。' });
          }
          break;
        // 今後他のサービスも追加
      }
      
      console.log(`✅ 利用上限チェッククリア: 店舗ID=${store_id}, サービス=${serviceType}`);
      next(); // 上限に達していなければ次の処理へ

    } catch (err) {
      console.error('❌ 利用上限チェック中にエラーが発生しました:', err.stack);
      res.status(500).json({ error: 'サーバー内部でエラーが発生しました。' });
    } finally {
      client.release();
    }
  };
};
