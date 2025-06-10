// C:\Users\acmsh\kanpAI\backend\src\db\simple-calendar-test.js
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KEYFILE_PATH = path.join(__dirname, '../config/credentials.json');

const simpleCalendarTest = async () => {
  console.log('🧪 シンプルなカレンダー接続テスト');
  
  try {
    // 基本的な認証テスト
    console.log('\n1️⃣ 認証テスト');
    const auth = new google.auth.GoogleAuth({
      keyFile: KEYFILE_PATH,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });
    
    const authClient = await auth.getClient();
    console.log('✅ 認証成功');
    
    // カレンダーAPIクライアント作成
    console.log('\n2️⃣ カレンダーAPI接続テスト');
    const calendar = google.calendar({ version: 'v3', auth: authClient });
    console.log('✅ カレンダーAPI準備完了');
    
    // カレンダー情報取得テスト
    console.log('\n3️⃣ カレンダー情報取得テスト');
    console.log(`使用予定のカレンダーID: ${process.env.GOOGLE_CALENDAR_ID}`);
    
    const calendarInfo = await calendar.calendars.get({
      calendarId: process.env.GOOGLE_CALENDAR_ID
    });
    
    console.log('✅ カレンダー情報取得成功:');
    console.log(`  カレンダー名: ${calendarInfo.data.summary}`);
    console.log(`  アクセス権限: ${calendarInfo.data.accessRole}`);
    
    // 既存の予定一覧取得テスト
    console.log('\n4️⃣ 既存予定取得テスト');
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const events = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin: now.toISOString(),
      timeMax: tomorrow.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    console.log(`✅ 予定取得成功: ${events.data.items.length}件の予定`);
    if (events.data.items.length > 0) {
      events.data.items.forEach((event, index) => {
        console.log(`  ${index + 1}. ${event.summary} (${event.start.dateTime || event.start.date})`);
      });
    }
    
    // シンプルな予定作成テスト
    console.log('\n5️⃣ テスト予定作成');
    const testEvent = {
      summary: 'kanpAI 接続テスト',
      description: 'カレンダー連携テスト用の予定です',
      start: {
        dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1時間後
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2時間後
        timeZone: 'Asia/Tokyo',
      },
    };
    
    const createdEvent = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      resource: testEvent,
    });
    
    console.log('✅ テスト予定作成成功!');
    console.log(`  イベントID: ${createdEvent.data.id}`);
    console.log(`  予定: ${createdEvent.data.summary}`);
    console.log(`  開始: ${createdEvent.data.start.dateTime}`);
    
    // 作成した予定を削除
    console.log('\n6️⃣ テスト予定削除');
    await calendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId: createdEvent.data.id,
    });
    console.log('✅ テスト予定削除成功');
    
    console.log('\n🎉 全てのテストが成功しました！');
    console.log('Googleカレンダー連携は正常に動作しています。');
    
  } catch (error) {
    console.error('\n❌ テスト中にエラーが発生しました:');
    console.error('エラーメッセージ:', error.message);
    
    if (error.code === 403) {
      console.error('\n💡 権限エラーの可能性:');
      console.error('1. カレンダーの共有設定を確認してください');
      console.error('2. サービスアカウントに「予定の変更権限」を付与してください');
      console.error(`3. 対象サービスアカウント: kanpai@kanpai-462215.iam.gserviceaccount.com`);
    } else if (error.code === 404) {
      console.error('\n💡 カレンダーIDエラーの可能性:');
      console.error('1. カレンダーIDが正しいか確認してください');
      console.error(`2. 現在の設定: ${process.env.GOOGLE_CALENDAR_ID}`);
    } else {
      console.error('エラー詳細:', error.stack);
    }
  }
};

simpleCalendarTest();