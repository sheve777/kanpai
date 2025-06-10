// C:\Users\acmsh\kanpAI\backend\src\db\test-google-calendar-fixed.js
import { createCalendarEvent, deleteCalendarEvent, checkCalendarAvailability } from '../services/googleCalendarService.js';
import dotenv from 'dotenv';

// 環境変数を明示的に読み込み
dotenv.config();

const testGoogleCalendar = async () => {
  console.log('--- Googleカレンダー連携テスト開始（修正版） ---');
  
  // 環境変数の確認
  console.log('🔧 環境変数確認:');
  console.log(`  GOOGLE_CALENDAR_ID: ${process.env.GOOGLE_CALENDAR_ID ? '設定済み' : '未設定'}`);
  console.log(`  カレンダーID: ${process.env.GOOGLE_CALENDAR_ID}`);

  try {
    // テスト用の予約データ（より詳細）
    const testReservation = {
      customer_name: 'テスト太郎',
      party_size: 4,
      reservation_date: '2025-06-12', // 文字列形式
      reservation_time: '19:00',
      duration_minutes: 120,
      customer_phone: '090-1234-5678',
      notes: 'Googleカレンダー連携テスト（修正版）'
    };

    console.log('\n📅 テスト予約データ:');
    console.log(JSON.stringify(testReservation, null, 2));

    // 1. カレンダーイベント作成テスト
    console.log('\n🔄 Step 1: カレンダーイベント作成テスト');
    const eventId = await createCalendarEvent(testReservation);
    
    if (eventId) {
      console.log('\n✅ カレンダーイベント作成成功!');
      console.log(`   イベントID: ${eventId}`);
      
      // 少し待機（カレンダー反映のため）
      console.log('\n⏳ 3秒待機中...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 2. 空き状況確認テスト
      console.log('\n🔄 Step 2: 空き状況確認テスト');
      const startTime = `2025-06-12T19:00:00+09:00`;
      const endTime = `2025-06-12T21:00:00+09:00`;
      
      const isAvailable = await checkCalendarAvailability(startTime, endTime);
      console.log(`   空き状況: ${isAvailable ? '✅ 空いている' : '❌ 予約済み'}`);
      
      // 3. カレンダーイベント削除テスト
      console.log('\n🔄 Step 3: カレンダーイベント削除テスト');
      await deleteCalendarEvent(eventId);
      console.log('✅ カレンダーイベント削除完了');
      
      // 4. 削除後の空き状況確認
      console.log('\n🔄 Step 4: 削除後の空き状況確認');
      const isAvailableAfter = await checkCalendarAvailability(startTime, endTime);
      console.log(`   削除後の空き状況: ${isAvailableAfter ? '✅ 空いている' : '❌ まだ予約済み'}`);
      
      console.log('\n🎉 Googleカレンダー連携テスト完了 - 全て成功!');
    } else {
      console.log('\n❌ カレンダーイベント作成失敗');
      console.log('\n📋 確認事項:');
      console.log('1. カレンダーの共有設定は正しいですか？');
      console.log('   - サービスアカウント kanpai@kanpai-462215.iam.gserviceaccount.com に権限があるか');
      console.log('   - 「予定の変更」権限が付与されているか');
      console.log('2. カレンダーIDは正しいですか？');
      console.log(`   - 現在設定: ${process.env.GOOGLE_CALENDAR_ID}`);
      console.log('3. Google Calendar APIは有効になっていますか？');
    }
    
  } catch (error) {
    console.error('\n❌ テスト中に予期しないエラーが発生しました:');
    console.error('エラーメッセージ:', error.message);
    console.error('スタックトレース:', error.stack);
    
    // より詳細なトラブルシューティング
    if (error.message.includes('credentials')) {
      console.log('\n💡 認証情報の問題:');
      console.log('- credentials.json ファイルが正しく配置されているか確認');
      console.log('- ファイルの権限設定を確認');
    } else if (error.message.includes('calendar')) {
      console.log('\n💡 カレンダー設定の問題:');
      console.log('- カレンダーの共有設定を確認');
      console.log('- カレンダーIDが正しいか確認');
    } else if (error.message.includes('API')) {
      console.log('\n💡 API設定の問題:');
      console.log('- Google Calendar API が有効になっているか確認');
      console.log('- プロジェクトの設定を確認');
    }
  }
  
  console.log('\n--- Googleカレンダー連携テスト終了 ---');
};

testGoogleCalendar();