// C:\Users\acmsh\kanpAI\backend\src\db\test-google-calendar.js
import { createCalendarEvent, deleteCalendarEvent, checkCalendarAvailability } from '../services/googleCalendarService.js';
import pool from '../config/db.js';

const testGoogleCalendar = async () => {
  console.log('--- Googleカレンダー連携テスト開始 ---');

  try {
    // テスト用の予約データ
    const testReservation = {
      customer_name: 'テスト太郎',
      party_size: 4,
      reservation_date: new Date('2025-06-12'), // 明後日
      reservation_time: '19:00',
      duration_minutes: 120,
      customer_phone: '090-1234-5678',
      notes: 'Googleカレンダー連携テスト'
    };

    console.log('📅 テスト予約データ:', testReservation);

    // 1. カレンダーイベント作成テスト
    console.log('\n🔄 Step 1: カレンダーイベント作成テスト');
    const eventId = await createCalendarEvent(testReservation);
    
    if (eventId) {
      console.log('✅ カレンダーイベント作成成功!');
      console.log(`   イベントID: ${eventId}`);
      
      // 2. 空き状況確認テスト
      console.log('\n🔄 Step 2: 空き状況確認テスト');
      const startTime = new Date(`${testReservation.reservation_date.toISOString().split('T')[0]}T${testReservation.reservation_time}`);
      const endTime = new Date(startTime.getTime() + testReservation.duration_minutes * 60000);
      
      const isAvailable = await checkCalendarAvailability(
        startTime.toISOString(),
        endTime.toISOString()
      );
      
      console.log(`   空き状況: ${isAvailable ? '空いている' : '予約済み'}`);
      
      // 3. カレンダーイベント削除テスト
      console.log('\n🔄 Step 3: カレンダーイベント削除テスト');
      await deleteCalendarEvent(eventId);
      console.log('✅ カレンダーイベント削除成功!');
      
      console.log('\n🎉 Googleカレンダー連携テスト完了 - 全て成功!');
    } else {
      console.log('❌ カレンダーイベント作成失敗');
      console.log('\n確認事項:');
      console.log('1. credentials.json ファイルが正しく配置されているか');
      console.log('2. Google Calendar API が有効になっているか');
      console.log('3. サービスアカウントにカレンダーの権限があるか');
      console.log('4. GOOGLE_CALENDAR_ID が正しく設定されているか');
    }
    
  } catch (error) {
    console.error('❌ Googleカレンダー連携テスト中にエラー:', error.message);
    console.log('\nエラー詳細:', error.stack);
    
    if (error.message.includes('credentials.json')) {
      console.log('\n💡 解決方法:');
      console.log('1. Google Cloud Console でサービスアカウントキーを作成');
      console.log('2. ダウンロードしたJSONファイルを credentials.json にリネーム');
      console.log('3. C:\\Users\\acmsh\\kanpAI\\backend\\src\\config\\ に配置');
    }
  }
  
  console.log('--- Googleカレンダー連携テスト終了 ---');
};

testGoogleCalendar();