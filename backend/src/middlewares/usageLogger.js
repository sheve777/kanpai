// C:\Users\acmsh\kanpAI\backend\src\middlewares\usageLogger.js
import pool from '../config/db.js';

/**
 * APIの使用量を記録するミドルウェア
 * @param {string} serviceType - 'line_broadcast' などのサービスタイプ
 */
export const logUsage = (serviceType) => {
  return async (req, res, next) => {
    // POSTリクエストのボディ、またはGETリクエストのクエリからstore_idを取得
    const store_id = req.body.store_id || req.query.store_id;

    if (!store_id) {
      // store_idが見つからない場合でも、エラーにはせず次の処理へ進む
      console.warn('⚠️ 使用量ログ: store_idが見つからないため、ログを記録できませんでした。');
      return next();
    }

    const client = await pool.connect();
    try {
      let columnToIncrement;
      switch (serviceType) {
        case 'line_broadcast':
          columnToIncrement = 'line_broadcasts_count';
          break;
        // 今後、他のサービスタイプを追加
        // case 'openai_chat':
        //   columnToIncrement = 'openai_tokens_used';
        //   break;
        default:
          console.warn(`⚠️ 未知のサービスタイプ: ${serviceType}`);
          return next();
      }

      // 今日の日付で、該当店舗のログが存在するか確認
      const logQuery = `
        INSERT INTO usage_logs (store_id, service_type, ${columnToIncrement})
        VALUES ($1, $2, 1)
        ON CONFLICT (store_id, log_date, service_type)
        DO UPDATE SET ${columnToIncrement} = usage_logs.${columnToIncrement} + 1;
      `;
      
      await client.query(logQuery, [store_id, serviceType]);
      console.log(`✅ 使用量ログを記録しました: 店舗ID=${store_id}, サービス=${serviceType}`);

    } catch (err) {
      console.error('❌ 使用量ログの記録中にエラーが発生しました:', err.stack);
    } finally {
      client.release();
    }
    
    // 次の処理へ進む
    next();
  };
};
