// C:\Users\acmsh\kanpAI\backend\src\routes\lineRoutes.js (修正版)
import express from 'express';
import { Client } from '@line/bot-sdk';
import pool from '../config/db.js';
import { logUsage } from '../middlewares/usageLogger.js';
import { checkUsageLimit } from '../middlewares/usageLimit.js';
import lineUsageService from '../services/lineUsageService.js';

const router = express.Router();

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};
const client = new Client(config);

// LINE Webhook ハンドラー（修正版）
router.post('/webhook', (req, res) => {
  console.log('');
  console.log('🔄 ===== LINE Webhook受信 =====');
  console.log('📅 時刻:', new Date().toLocaleString('ja-JP'));
  console.log('📤 リクエストヘッダー:', req.headers);
  
  try {
    // req.bodyは既にJSONパーサーで処理済み
    const body = req.body;
    console.log('📨 Webhook本文:', JSON.stringify(body, null, 2));
    
    if (!body.events || body.events.length === 0) {
      console.log('⚠️ イベントが空です');
      res.status(200).send('OK - No Events');
      return;
    }
    
    // イベント処理
    body.events.forEach((event, index) => {
      console.log('');
      console.log(`📋 イベント ${index + 1}:`);
      console.log(`  タイプ: ${event.type}`);
      console.log(`  ソース: ${JSON.stringify(event.source)}`);
      
      if (event.source && event.source.userId) {
        console.log('');
        console.log('🎉 ===== ユーザーID発見! =====');
        console.log(`🆔 ユーザーID: ${event.source.userId}`);
        console.log('');
        console.log('📝 .envファイルに以下を追加してください:');
        console.log(`OWNER_LINE_ID=${event.source.userId}`);
        console.log('');
        console.log('🔄 その後、サーバーを再起動してください');
        console.log('================================');
      }
      
      if (event.type === 'message' && event.message) {
        console.log(`  メッセージタイプ: ${event.message.type}`);
        console.log(`  メッセージ内容: ${event.message.text || event.message.type}`);
      }
      
      // その他のイベントタイプも表示
      if (event.type === 'follow') {
        console.log('  👋 友だち追加されました');
      } else if (event.type === 'unfollow') {
        console.log('  👋 ブロックされました');
      }
    });
    
    console.log('');
    console.log('✅ Webhook処理完了');
    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Webhook処理エラー:', error.message);
    console.error('スタックトレース:', error.stack);
    res.status(500).send('Error: ' + error.message);
  }
  
  console.log('===== LINE Webhook終了 =====');
  console.log('');
});

// WebhookのGETテスト用
router.get('/webhook', (req, res) => {
  console.log('🧪 Webhook GET テスト');
  res.send('LINE Webhook は動作しています！時刻: ' + new Date().toLocaleString('ja-JP'));
});

/**
 * ★★★ 修正版: LINE一斉配信API（制限チェック付き） ★★★
 */
router.post('/broadcast', checkUsageLimit('line_broadcast'), logUsage('line_broadcast'), async (req, res) => {
  const { store_id, message_text, image_url, force_send = false } = req.body;

  if (!store_id || !message_text) {
    return res.status(400).json({ error: '店舗IDとメッセージ内容は必須です。' });
  }

  const dbClient = await pool.connect();
  try {
    // ★★★ NEW: 配信前に制限チェック ★★★
    const usageStatus = await lineUsageService.getUsageStatus(store_id);
    const { friendsCount } = usageStatus;
    
    const limitCheck = await lineUsageService.checkBeforeBroadcast(store_id, friendsCount);
    
    // 制限チェックの結果をログ出力
    console.log('📊 LINE配信制限チェック結果:');
    console.log(`  配信先: ${friendsCount}名`);
    console.log(`  現在使用量: ${limitCheck.currentUsage}/${limitCheck.lineOfficialPlan.limit} (${limitCheck.usagePercentage.toFixed(1)}%)`);
    console.log(`  配信後使用量: ${limitCheck.afterSendUsage}/${limitCheck.lineOfficialPlan.limit} (${limitCheck.afterSendPercentage.toFixed(1)}%)`);
    console.log(`  配信可能: ${limitCheck.canSend ? 'はい' : 'いいえ'}`);
    
    // 制限に引っかかる場合の処理
    if (!limitCheck.canSend && !force_send) {
      console.log('⚠️ LINE公式アカウントの月間配信制限に到達するため、配信を停止しました。');
      
      return res.status(429).json({
        error: 'LINE公式アカウントの月間配信制限に到達します',
        details: 'LINE社が設定している月間配信制限を超過する配信は送信できません。',
        limitInfo: limitCheck,
        solutions: [
          { type: 'upgrade', message: 'LINE公式アカウントのプランをアップグレード' },
          { type: 'wait', message: '来月1日の制限リセットまで待つ' },
          { type: 'force', message: '制限を無視して強制送信（非推奨）' }
        ]
      });
    }

    // ★★★ 制限チェックをパスした場合の配信処理 ★★★
    const messages = [{ type: 'text', text: message_text }];
    if (image_url) {
      messages.unshift({
        type: 'image',
        originalContentUrl: image_url,
        previewImageUrl: image_url,
      });
    }

    await client.broadcast(messages);
    console.log(`✅ LINEの一斉配信リクエストを送信しました。`);

    // 配信履歴をDBに保存（受信者数も記録）
    const logQuery = `
      INSERT INTO line_broadcasts (store_id, message_text, image_url, delivery_status, recipient_count)
      VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `;
    const broadcastLog = await dbClient.query(logQuery, [
      store_id, 
      message_text, 
      image_url, 
      'sent',
      friendsCount
    ]);
    
    console.log(`✅ 配信履歴をデータベースに保存しました。配信先: ${friendsCount}名`);

    // 配信後の使用量情報を返す
    const updatedUsageStatus = await lineUsageService.getUsageStatus(store_id);
    
    res.status(200).json({ 
      success: true, 
      message: '一斉配信リクエストを送信しました。',
      broadcastInfo: {
        recipientCount: friendsCount,
        messagesSent: friendsCount,
        broadcastId: broadcastLog.rows[0].id
      },
      usageInfo: updatedUsageStatus.lineOfficialPlan
    });

  } catch (err) {
    console.error('❌ LINE一斉配信中にエラーが発生しました:', err.message);
    
    // エラーログもDBに保存
    await dbClient.query(
      'INSERT INTO line_broadcasts (store_id, message_text, image_url, delivery_status) VALUES ($1, $2, $3, $4);',
      [store_id, message_text, image_url, 'failed']
    );
    
    res.status(500).json({ 
      success: false, 
      error: '一斉配信に失敗しました。',
      details: err.message 
    });
  } finally {
    dbClient.release();
  }
});

/**
 * ★★★ NEW: LINE使用状況確認API ★★★
 */
router.get('/usage-status', async (req, res) => {
  const { store_id } = req.query;
  
  if (!store_id) {
    return res.status(400).json({ error: 'store_idクエリパラメータは必須です。' });
  }
  
  try {
    const usageStatus = await lineUsageService.getUsageStatus(store_id);
    
    console.log(`📊 LINE使用状況取得: 店舗ID ${store_id}`);
    console.log(`📈 使用率: ${usageStatus.lineOfficialPlan.usagePercentage.toFixed(1)}%`);
    
    res.status(200).json(usageStatus);
    
  } catch (err) {
    console.error('❌ LINE使用状況取得中にエラーが発生しました:', err.stack);
    res.status(500).json({ error: 'サーバー内部でエラーが発生しました。' });
  }
});

router.get('/history', async (req, res) => {
    const { store_id } = req.query;
    if (!store_id) return res.status(400).json({ error: 'store_idは必須です。' });
    try {
        const result = await pool.query(
            'SELECT * FROM line_broadcasts WHERE store_id = $1 ORDER BY sent_at DESC LIMIT 10',
            [store_id]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: '履歴の取得に失敗しました。' });
    }
});

export default router;
