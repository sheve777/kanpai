// C:\Users\acmsh\kanpAI\backend\src\db\test-notification.js
import { sendTestNotification, sendNewReservationNotification, sendCancelReservationNotification } from '../services/notificationService.js';

const testNotificationSystem = async () => {
  console.log('🧪 通知システムテスト開始');

  try {
    // 1. 基本的なテスト通知
    console.log('\n1️⃣ テスト通知送信');
    const testResult = await sendTestNotification();
    
    if (testResult.success) {
      console.log('✅ テスト通知送信成功');
    } else {
      console.log('❌ テスト通知送信失敗:', testResult.error);
      console.log('\n💡 確認事項:');
      console.log('1. LINE_CHANNEL_ACCESS_TOKEN が正しく設定されているか');
      console.log('2. OWNER_LINE_ID が正しく設定されているか');
      console.log('3. LINE Bot が友だち追加されているか');
      return;
    }

    // 2. 新規予約通知のテスト
    console.log('\n2️⃣ 新規予約通知テスト');
    const testReservation = {
      customer_name: 'テスト太郎',
      party_size: 2,
      reservation_date: new Date('2025-06-12'),
      reservation_time: '19:00:00',
      duration_minutes: 120,
      customer_phone: '090-1234-5678',
      notes: '誕生日のお祝いです'
    };

    const testSeatType = {
      name: 'テーブル席'
    };

    const testStoreSettings = {
      store_name: '居酒屋かんぱい（テスト店舗）'
    };

    const newReservationResult = await sendNewReservationNotification(
      testReservation, 
      testSeatType, 
      testStoreSettings
    );

    if (newReservationResult.success) {
      console.log('✅ 新規予約通知送信成功');
    } else {
      console.log('❌ 新規予約通知送信失敗:', newReservationResult.error);
    }

    // 3. キャンセル通知のテスト
    console.log('\n3️⃣ キャンセル通知テスト');
    const cancelResult = await sendCancelReservationNotification(
      testReservation, 
      testSeatType, 
      testStoreSettings
    );

    if (cancelResult.success) {
      console.log('✅ キャンセル通知送信成功');
    } else {
      console.log('❌ キャンセル通知送信失敗:', cancelResult.error);
    }

    console.log('\n🎉 通知システムテスト完了');
    console.log('\n📱 LINEアプリで通知が届いているか確認してください');

  } catch (error) {
    console.error('\n❌ テスト中にエラーが発生しました:', error.message);
    console.error('スタックトレース:', error.stack);
  }
};

testNotificationSystem();