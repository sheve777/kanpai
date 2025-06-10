// C:\Users\acmsh\kanpAI\backend\src\db\setup-test-reservation-data.js
import pool from '../config/db.js';

const setupTestReservationData = async () => {
  const client = await pool.connect();
  try {
    console.log('--- テスト用予約データセットアップ開始 ---');

    // 1. テスト店舗の営業時間を設定
    const updateStoreQuery = `
      UPDATE stores 
      SET 
        operating_hours = '{"start": "17:00", "end": "24:00"}',
        default_reservation_duration = 120,
        name = '居酒屋かんぱい（テスト店舗）'
      WHERE id = '8fbff969-5212-4387-ae62-cc33944edef2';
    `;
    await client.query(updateStoreQuery);
    console.log('✅ テスト店舗の営業時間を設定しました');

    // 2. 既存の席種を削除（テスト用に再作成）
    await client.query('DELETE FROM seat_types WHERE store_id = $1', 
      ['8fbff969-5212-4387-ae62-cc33944edef2']);
    console.log('🗑️ 既存の席種データを削除しました');

    // 3. テスト用席種を作成
    const seatTypes = [
      {
        name: 'カウンター席',
        capacity: 5,
        min_people: 1,
        max_people: 2
      },
      {
        name: 'テーブル席',
        capacity: 3,
        min_people: 3,
        max_people: 6
      },
      {
        name: '個室',
        capacity: 1,
        min_people: 4,
        max_people: 10
      }
    ];

    for (const seat of seatTypes) {
      const insertSeatQuery = `
        INSERT INTO seat_types (store_id, name, capacity, min_people, max_people)
        VALUES ($1, $2, $3, $4, $5);
      `;
      await client.query(insertSeatQuery, [
        '8fbff969-5212-4387-ae62-cc33944edef2',
        seat.name,
        seat.capacity,
        seat.min_people,
        seat.max_people
      ]);
      console.log(`✅ 席種「${seat.name}」を作成しました`);
    }

    // 4. 現在の席種を確認
    const checkQuery = `
      SELECT id, name, min_people, max_people, capacity
      FROM seat_types 
      WHERE store_id = '8fbff969-5212-4387-ae62-cc33944edef2'
      ORDER BY name;
    `;
    const result = await client.query(checkQuery);
    
    console.log('📋 作成された席種:');
    result.rows.forEach(row => {
      console.log(`  - ${row.name}: ${row.min_people}〜${row.max_people}名 (${row.capacity}席)`);
    });

    console.log('--- テスト用予約データセットアップ完了 ---');
  } catch (err) {
    console.error('❌ セットアップ中にエラーが発生しました:', err.stack);
  } finally {
    client.release();
  }
};

setupTestReservationData();