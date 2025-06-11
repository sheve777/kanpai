// C:\Users\acmsh\kanpAI\backend\src\middlewares\usageLimit.js
import pool from '../config/db.js';

/**
 * APIの利用上限をチェックするミドルウェア
 * @param {string} serviceType - 'line_broadcast', 'chatbot' などのサービスタイプ
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
        SELECT 
          SUM(line_broadcasts_count) as total_broadcasts,
          SUM(openai_tokens_used) as total_tokens,
          SUM(openai_cost_yen) as total_cost
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
        
        case 'chatbot':
          const currentTokens = parseInt(usage.total_tokens || 0, 10);
          if (limits.monthly_token_limit !== null && currentTokens >= limits.monthly_token_limit) {
            console.log(`🚫 チャットボット上限超過: 店舗ID=${store_id}, 使用トークン=${currentTokens}/${limits.monthly_token_limit}`);
            
            // 「充電切れ」表現で応答
            const batteryResponse = await generateBatteryDepletedResponse(store_id);
            return res.status(429).json({ 
              error: 'usage_limit_exceeded',
              errorType: 'CHATBOT_BATTERY_DEPLETED',
              message: batteryResponse 
            });
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

/**
 * チャットボット使用量の確認（制限前のアラート）
 */
export const checkChatbotUsage = async (storeId) => {
  const client = await pool.connect();
  try {
    // プラン情報とトークン使用量を取得
    const query = `
      SELECT 
        p.monthly_token_limit,
        COALESCE(SUM(ul.openai_tokens_used), 0) as current_usage
      FROM plans p
      JOIN store_subscriptions ss ON p.id = ss.plan_id
      LEFT JOIN usage_logs ul ON ul.store_id = ss.store_id 
        AND date_trunc('month', ul.log_date) = date_trunc('month', current_date)
      WHERE ss.store_id = $1 AND ss.status = 'active'
      GROUP BY p.monthly_token_limit;
    `;
    
    const result = await client.query(query, [storeId]);
    
    if (result.rows.length === 0) {
      return { isLimited: false, usagePercent: 0, limit: 0, current: 0 };
    }
    
    const { monthly_token_limit, current_usage } = result.rows[0];
    const usagePercent = monthly_token_limit > 0 ? (current_usage / monthly_token_limit) * 100 : 0;
    
    return {
      isLimited: current_usage >= monthly_token_limit,
      usagePercent: Math.round(usagePercent),
      limit: monthly_token_limit,
      current: parseInt(current_usage)
    };
  } catch (error) {
    console.error('チャットボット使用量チェックエラー:', error);
    return { isLimited: false, usagePercent: 0, limit: 0, current: 0 };
  } finally {
    client.release();
  }
};

/**
 * 店舗の人格設定に応じた「充電切れ」応答を生成
 */
const generateBatteryDepletedResponse = async (storeId) => {
  const client = await pool.connect();
  try {
    const query = 'SELECT name, bot_personality FROM stores WHERE id = $1';
    const result = await client.query(query, [storeId]);
    
    if (result.rows.length === 0) {
      return getDefaultBatteryResponse('neutral');
    }
    
    const store = result.rows[0];
    const personality = store.bot_personality?.tone || 'neutral';
    const storeName = store.name;
    
    return getDefaultBatteryResponse(personality, storeName);
  } catch (error) {
    console.error('充電切れ応答生成エラー:', error);
    return getDefaultBatteryResponse('neutral');
  } finally {
    client.release();
  }
};

/**
 * 人格別の「充電切れ」応答テンプレート
 */
const getDefaultBatteryResponse = (personality, storeName = 'お店') => {
  const responses = {
    friendly: [
      `あー！ごめんなさい！😅\n今月はもうチャットボットの充電が切れちゃいました💦\n\nマスターに「充電お願いします！」って言ってもらえますか？🔋\n\n📞 ${storeName}まで直接お電話いただければ、いつでも対応いたします♪`
    ],
    polite: [
      `申し訳ございません。\n今月のチャットボット利用上限に達してしまいました。\n\nマスターに「追加利用をお願いします」とお伝えください。\n\n📞 お急ぎの場合は${storeName}まで直接お電話いただけますでしょうか。`
    ],
    casual: [
      `おっと〜！チャットボットのエネルギー切れだ⚡\n\nマスターに「パワーアップして〜」って頼んでくれる？\n\n📞 急ぎなら${storeName}に直接電話してね！`
    ],
    neutral: [
      `今月のチャットボット利用制限に達しました。\n\nお店に「チャットボットの追加利用」をお問い合わせください。\n\n📞 ${storeName}まで直接お電話いただければ対応いたします。`
    ]
  };
  
  const responseList = responses[personality] || responses.neutral;
  return responseList[Math.floor(Math.random() * responseList.length)];
};
