// C:\Users\acmsh\kanpAI\backend\src\db\update-reservation-system-source.js
import pool from '../config/db.js';

const updateReservationSystem = async () => {
  const client = await pool.connect();
  try {
    console.log('--- 予約システムのアップデート開始 ---');

    // 1. reservationsテーブルにsourceカラムを追加
    const addSourceColumnQuery = `
      ALTER TABLE reservations 
      ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'web';
    `;
    await client.query(addSourceColumnQuery);
    console.log('✅ reservationsテーブルにsourceカラムを追加しました');

    // 2. seat_typesテーブルにdisplay_orderカラムを追加
    const addDisplayOrderQuery = `
      ALTER TABLE seat_types 
      ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
    `;
    await client.query(addDisplayOrderQuery);
    console.log('✅ seat_typesテーブルにdisplay_orderカラムを追加しました');

    // 3. 既存のseat_typesのdisplay_orderを設定
    const updateDisplayOrderQuery = `
      UPDATE seat_types 
      SET display_order = CASE 
        WHEN name LIKE '%カウンター%' THEN 1
        WHEN name LIKE '%テーブル%' THEN 2
        WHEN name LIKE '%個室%' THEN 3
        ELSE 4
      END
      WHERE display_order = 0;
    `;
    await client.query(updateDisplayOrderQuery);
    console.log('✅ display_orderを設定しました');

    console.log('--- 予約システムのアップデート完了 ---');
  } catch (err) {
    console.error('❌ アップデート中にエラーが発生しました:', err.stack);
  } finally {
    client.release();
  }
};

updateReservationSystem();