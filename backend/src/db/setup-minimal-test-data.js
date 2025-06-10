// C:\Users\acmsh\kanpAI\backend\src\db\setup-minimal-test-data.js
import pool from '../config/db.js';

const setupMinimalTestData = async () => {
  const client = await pool.connect();
  try {
    console.log('--- 最小限テストデータセットアップ開始 ---');

    // 1. seat_types テーブルが存在するか確認・作成
    const createSeatTypesQuery = `
      CREATE TABLE IF NOT EXISTS seat_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id UUID NOT NULL,
        name VARCHAR(50) NOT NULL,
        capacity INTEGER DEFAULT 1,
        min_people INTEGER DEFAULT 1,
        max_people INTEGER DEFAULT 10,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await client.query(createSeatTypesQuery);
    console.log('✅ seat_types テーブルを確認/作成しました');

    // 2. 既存の席種を削除
    await client.query('DELETE FROM seat_types WHERE store_id = $1', 
      ['8fbff969-5212-4387-ae62-cc33944edef2']);
    console.log('🗑️ 既存の席種データを削除しました');

    // 3. シンプルな席種を作成
    const seatTypes = [
      { name: 'カウンター席', min_people: 1, max_people: 2, display_order: 1 },
      { name: 'テーブル席', min_people: 3, max_people: 6, display_order: 2 },
      { name: '個室', min_people: 4, max_people: 10, display_order: 3 }
    ];

    for (const seat of seatTypes) {
      const insertQuery = `
        INSERT INTO seat_types (store_id, name, min_people, max_people, display_order)
        VALUES ($1, $2, $3, $4, $5);
      `;
      await client.query(insertQuery, [
        '8fbff969-5212-4387-ae62-cc33944edef2',
        seat.name,
        seat.min_people,
        seat.max_people,
        seat.display_order
      ]);
      console.log(`✅ 席種「${seat.name}」を作成しました`);
    }

    // 4. 作成された席種を確認
    const checkQuery = `
      SELECT id, name, min_people, max_people
      FROM seat_types 
      WHERE store_id = '8fbff969-5212-4387-ae62-cc33944edef2'
      ORDER BY display_order;
    `;
    const result = await client.query(checkQuery);
    
    console.log('📋 作成された席種:');
    result.rows.forEach(row => {
      console.log(`  - ${row.name}: ${row.min_people}〜${row.max_people}名`);
    });

    console.log('--- 最小限テストデータセットアップ完了 ---');
  } catch (err) {
    console.error('❌ セットアップ中にエラーが発生しました:', err.message);
  } finally {
    client.release();
  }
};

setupMinimalTestData();