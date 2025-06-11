// C:\Users\acmsh\kanpAI\backend\src\db\create-reservation-tables.js
import pool from '../config/db.js';

const createReservationTables = async () => {
  const client = await pool.connect();
  try {
    console.log('--- 予約システム用テーブル作成開始 ---');

    // seat_types (席種) テーブルを作成するSQLクエリ
    const seatTypesQuery = `
      CREATE TABLE IF NOT EXISTS seat_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        name VARCHAR(50) NOT NULL,
        capacity INTEGER,
        min_people INTEGER DEFAULT 1,
        max_people INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await client.query(seatTypesQuery);
    console.log('✅ "seat_types"テーブルが正常に作成/確認されました。');

    // reservations (予約) テーブルを作成するSQLクエリ
    const reservationsQuery = `
      CREATE TABLE IF NOT EXISTS reservations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        seat_type_id UUID REFERENCES seat_types(id) ON DELETE SET NULL,
        customer_name VARCHAR(50) NOT NULL,
        customer_phone VARCHAR(20),
        party_size INTEGER NOT NULL,
        reservation_date DATE NOT NULL,
        reservation_time TIME NOT NULL,
        duration_minutes INTEGER DEFAULT 120,
        notes TEXT,
        google_event_id VARCHAR(100),
        status VARCHAR(20) DEFAULT 'confirmed',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await client.query(reservationsQuery);
    console.log('✅ "reservations"テーブルが正常に作成/確認されました。');

    console.log('--- 予約システム用テーブル作成完了 ---');
  } catch (err) {
    console.error('❌ テーブル作成中にエラーが発生しました:', err.stack);
  } finally {
    client.release();
    pool.end();
  }
};

createReservationTables();
