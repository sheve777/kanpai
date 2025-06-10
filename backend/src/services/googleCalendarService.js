// C:\Users\acmsh\kanpAI\backend\src\services\googleCalendarService.js
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// 環境変数を確実に読み込み
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KEYFILE_PATH = path.join(__dirname, '../config/credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// 認証設定
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILE_PATH,
  scopes: SCOPES,
});

/**
 * Googleカレンダーに予定を作成する
 */
export const createCalendarEvent = async (reservation) => {
  try {
    console.log('📅 カレンダーイベント作成開始');
    console.log(`🔧 使用カレンダーID: ${process.env.GOOGLE_CALENDAR_ID}`);
    console.log('📋 受信した予約データ:', JSON.stringify(reservation, null, 2));
    
    // 認証クライアントを取得
    const authClient = await auth.getClient();
    const calendar = google.calendar({ version: 'v3', auth: authClient });
    
    // 日時の処理を改善（問題の原因を修正）
    let reservationDate;
    
    // reservation_dateの型を確認して適切に処理
    if (reservation.reservation_date instanceof Date) {
      reservationDate = reservation.reservation_date;
    } else if (typeof reservation.reservation_date === 'string') {
      reservationDate = new Date(reservation.reservation_date);
    } else {
      // PostgreSQLからのDateオブジェクトの場合
      reservationDate = new Date(reservation.reservation_date);
    }
    
    console.log(`📅 予約日（元データ）: ${reservation.reservation_date}`);
    console.log(`📅 予約日（変換後）: ${reservationDate}`);
    console.log(`⏰ 予約時間: ${reservation.reservation_time}`);
    
    // 日付文字列を作成（YYYY-MM-DD形式）
    const dateString = reservationDate.toISOString().split('T')[0];
    console.log(`📅 日付文字列: ${dateString}`);
    
    // 時刻文字列を正規化（HH:MM形式）
    let timeString = reservation.reservation_time;
    if (timeString.length === 5) {
      timeString = timeString + ':00'; // HH:MM -> HH:MM:SS
    }
    console.log(`⏰ 時刻文字列: ${timeString}`);
    
    // 開始時刻と終了時刻を作成
    const startDateTime = `${dateString}T${timeString}+09:00`;
    console.log(`🕐 開始時刻（ISO）: ${startDateTime}`);
    
    // 開始時刻のDateオブジェクトを作成してバリデーション
    const startTime = new Date(startDateTime);
    if (isNaN(startTime.getTime())) {
      throw new Error(`無効な開始時刻: ${startDateTime}`);
    }
    
    // 終了時刻を計算
    const endTime = new Date(startTime.getTime() + (reservation.duration_minutes * 60000));
    const endDateTime = endTime.toISOString();
    
    console.log(`🕐 開始時刻: ${startTime.toISOString()}`);
    console.log(`🕕 終了時刻: ${endTime.toISOString()}`);
    
    const event = {
      summary: `${reservation.customer_name}様 ${reservation.party_size}名`,
      description: `電話番号: ${reservation.customer_phone || '未登録'}\n備考: ${reservation.notes || 'なし'}`,
      start: { 
        dateTime: startTime.toISOString(), 
        timeZone: 'Asia/Tokyo' 
      },
      end: { 
        dateTime: endTime.toISOString(), 
        timeZone: 'Asia/Tokyo' 
      },
    };

    console.log('📋 作成するイベント:', JSON.stringify(event, null, 2));

    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      resource: event,
    });
    
    console.log(`✅ Googleカレンダーに予定を作成しました: ${response.data.summary}`);
    console.log(`🆔 イベントID: ${response.data.id}`);
    console.log(`🔗 イベントURL: ${response.data.htmlLink}`);
    
    return response.data.id;
  } catch (error) {
    console.error('❌ Googleカレンダーへの予定作成中にエラーが発生しました:');
    console.error('エラーメッセージ:', error.message);
    console.error('エラーコード:', error.code);
    console.error('エラー詳細:', error.errors);
    console.error('スタックトレース:', error.stack);
    
    if (error.message.includes('calendarId')) {
      console.error('💡 カレンダーIDの問題の可能性があります');
      console.error(`設定されているカレンダーID: ${process.env.GOOGLE_CALENDAR_ID}`);
    } else if (error.message.includes('Invalid time')) {
      console.error('💡 日時形式の問題の可能性があります');
      console.error(`予約日: ${reservation.reservation_date}`);
      console.error(`予約時間: ${reservation.reservation_time}`);
    }
    
    return null;
  }
};

/**
 * Googleカレンダーの予定を削除する
 * @param {string} eventId - 削除するイベントのID
 */
export const deleteCalendarEvent = async (eventId) => {
  if (!eventId) {
    console.log('カレンダーイベントIDが存在しないため、削除処理をスキップしました。');
    return;
  }
  
  try {
    console.log(`🗑️ カレンダーイベント削除開始: ${eventId}`);
    
    const authClient = await auth.getClient();
    const calendar = google.calendar({ version: 'v3', auth: authClient });
    
    await calendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId: eventId,
    });
    
    console.log(`✅ Googleカレンダーの予定を削除しました: ${eventId}`);
  } catch (error) {
    // 予定が既に存在しない場合(410 Gone)はエラーとして扱わない
    if (error.code === 410) {
      console.log(`カレンダー上の予定(ID: ${eventId})は既に削除されています。`);
    } else {
      console.error('❌ Googleカレンダーの予定削除中にエラーが発生しました:', error.message);
    }
  }
};

/**
 * Googleカレンダーの空き状況をチェックする
 * @param {string} startTime - チェック開始時間
 * @param {string} endTime - チェック終了時間
 * @returns {boolean} - true: 空いている, false: 予定がある
 */
export const checkCalendarAvailability = async (startTime, endTime) => {
  try {
    console.log(`🔍 空き状況確認: ${startTime} - ${endTime}`);
    
    const authClient = await auth.getClient();
    const calendar = google.calendar({ version: 'v3', auth: authClient });
    
    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin: startTime,
      timeMax: endTime,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items;
    console.log(`📅 指定時間帯の予定件数: ${events.length}`);
    
    if (events.length > 0) {
      console.log('予定一覧:');
      events.forEach(event => {
        console.log(`  - ${event.summary} (${event.start.dateTime})`);
      });
    }
    
    // 予定がある場合は false（利用不可）, ない場合は true（利用可能）
    return events.length === 0;
  } catch (error) {
    console.error('❌ Googleカレンダーの空き状況確認中にエラーが発生しました:', error.message);
    // エラーの場合は安全側に倒して利用可能とする
    return true;
  }
};