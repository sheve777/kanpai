// C:\Users\acmsh\kanpAI\backend\src\services\notificationService.js (最終修正版)
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .envファイルのパスを明示的に指定
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });

// LINE Messaging API設定
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const LINE_PUSH_API_URL = 'https://api.line.me/v2/bot/message/push';
const LINE_BROADCAST_API_URL = 'https://api.line.me/v2/bot/message/broadcast';

// 店主のLINE ID
const OWNER_LINE_ID = process.env.OWNER_LINE_ID;

/**
 * LINE通知を送信 (Push Message)
 */
export const sendLineNotification = async (message, lineId = OWNER_LINE_ID) => {
  try {
    console.log('📱 LINE通知送信開始 (Push Message)');
    console.log(`📨 送信先: ${lineId}`);
    console.log(`🔑 アクセストークン: ${LINE_CHANNEL_ACCESS_TOKEN ? 'あり' : 'なし'}`);

    if (!lineId) {
      throw new Error('OWNER_LINE_IDが設定されていません');
    }

    if (!LINE_CHANNEL_ACCESS_TOKEN) {
      throw new Error('LINE_CHANNEL_ACCESS_TOKENが設定されていません');
    }

    const payload = {
      to: lineId,
      messages: [
        {
          type: 'text',
          text: message
        }
      ]
    };

    const response = await axios.post(LINE_PUSH_API_URL, payload, {
      headers: {
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
        // X-Line-Retry-Key を削除（エラーの原因）
      }
    });

    console.log('✅ LINE通知送信成功');
    console.log('📊 レスポンス:', response.status, response.statusText);
    return { success: true, response: response.data };
  } catch (error) {
    console.error('❌ LINE通知送信エラー:', error.message);
    if (error.response) {
      console.error('📋 API応答コード:', error.response.status);
      console.error('📋 API応答データ:', error.response.data);
    }
    return { success: false, error: error.message, details: error.response?.data };
  }
};

/**
 * Broadcast通知を送信 (推奨方法)
 */
export const sendLineBroadcast = async (message) => {
  try {
    console.log('📢 LINE Broadcast通知送信開始');

    const payload = {
      messages: [
        {
          type: 'text',
          text: message
        }
      ]
    };

    const response = await axios.post(LINE_BROADCAST_API_URL, payload, {
      headers: {
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ LINE Broadcast送信成功');
    return { success: true, response: response.data };
  } catch (error) {
    console.error('❌ LINE Broadcast送信エラー:', error.message);
    if (error.response) {
      console.error('API応答:', error.response.data);
    }
    return { success: false, error: error.message };
  }
};

/**
 * 店主通知を送信（メイン関数）
 * Broadcastを優先使用（より安定）
 */
export const sendOwnerNotification = async (message) => {
  console.log('🔔 店主通知送信開始');
  
  // Broadcastを最初に試行（最も安定）
  const broadcastResult = await sendLineBroadcast(message);
  
  if (broadcastResult.success) {
    console.log('✅ Broadcast通知送信成功');
    return broadcastResult;
  }
  
  // Broadcastが失敗した場合のみPush Messageを試行
  console.log('🔄 Broadcastに失敗、Push Messageで再試行');
  const pushResult = await sendLineNotification(message);
  
  return pushResult;
};

/**
 * テスト通知を送信
 */
export const sendTestNotification = async () => {
  const testMessage = `🧪 kanpAI 通知システムテスト

通知機能が正常に動作しています！
時刻: ${new Date().toLocaleString('ja-JP')}

このメッセージが届いていれば設定完了です✅`;

  return await sendOwnerNotification(testMessage);
};

/**
 * 新規予約通知を送信
 */
export const sendNewReservationNotification = async (reservation, seatType, storeSettings) => {
  try {
    console.log('🔔 新規予約通知作成開始');

    // 予約日時の整形
    const reservationDate = new Date(reservation.reservation_date);
    const dateStr = reservationDate.toLocaleDateString('ja-JP', { 
      month: 'long', 
      day: 'numeric', 
      weekday: 'short' 
    });
    
    const timeStr = reservation.reservation_time.substring(0, 5);
    const endTime = new Date(`2000-01-01T${reservation.reservation_time}`);
    endTime.setMinutes(endTime.getMinutes() + reservation.duration_minutes);
    const endTimeStr = endTime.toTimeString().substring(0, 5);

    // 通知メッセージ作成
    const message = `🎉 新しいご予約が入りました！

【予約詳細】
👤 ${reservation.customer_name}様 ${reservation.party_size}名
📅 ${dateStr} ${timeStr}-${endTimeStr}
🪑 ${seatType.name}
📞 ${reservation.customer_phone || '未登録'}
${reservation.notes ? `📝 ${reservation.notes}` : ''}

店舗: ${storeSettings.store_name}
ダッシュボード: http://localhost:3000`;

    console.log('📝 作成された通知メッセージ:', message);

    return await sendOwnerNotification(message);
  } catch (error) {
    console.error('❌ 新規予約通知作成エラー:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * 予約キャンセル通知を送信
 */
export const sendCancelReservationNotification = async (reservation, seatType, storeSettings) => {
  try {
    console.log('🔔 予約キャンセル通知作成開始');

    // 予約日時の整形
    const reservationDate = new Date(reservation.reservation_date);
    const dateStr = reservationDate.toLocaleDateString('ja-JP', { 
      month: 'long', 
      day: 'numeric', 
      weekday: 'short' 
    });
    
    const timeStr = reservation.reservation_time.substring(0, 5);
    const endTime = new Date(`2000-01-01T${reservation.reservation_time}`);
    endTime.setMinutes(endTime.getMinutes() + reservation.duration_minutes);
    const endTimeStr = endTime.toTimeString().substring(0, 5);

    // 通知メッセージ作成
    const message = `❌ 予約がキャンセルされました

【キャンセル内容】
👤 ${reservation.customer_name}様 ${reservation.party_size}名
📅 ${dateStr} ${timeStr}-${endTimeStr}
🪑 ${seatType.name}
📞 ${reservation.customer_phone || '未登録'}

店舗: ${storeSettings.store_name}
📅 カレンダーからも削除済みです`;

    console.log('📝 作成されたキャンセル通知:', message);

    return await sendOwnerNotification(message);
  } catch (error) {
    console.error('❌ キャンセル通知作成エラー:', error.message);
    return { success: false, error: error.message };
  }
};