// C:\Users\acmsh\kanpAI\backend\src\db\check-reservation-table.js
import pool from '../config/db.js';

const checkReservationTable = async () => {
  const client = await pool.connect();
  try {
    console.log('--- 予約テーブル構造確認開始 ---');

    // 1. reservationsテーブルの構造確認
    const tableStructureQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'reservations'
      ORDER BY ordinal_position;
    `;
    const structureResult = await client.query(tableStructureQuery);
    
    console.log('📋 reservationsテーブルの構造:');
    structureResult.rows.forEach(column => {
      console.log(`  - ${column.column_name}: ${column.data_type} (nullable: ${column.is_nullable})`);
    });

    // 2. 必要なカラムの存在確認
    const requiredColumns = ['source', 'status'];
    const existingColumns = structureResult.rows.map(row => row.column_name);
    
    console.log('\n🔍 必要なカラムの確認:');
    for (const requiredCol of requiredColumns) {
      const exists = existingColumns.includes(requiredCol);
      console.log(`  - ${requiredCol}: ${exists ? '✅ 存在' : '❌ 不足'}`);
      
      if (!exists) {
        console.log(`     ${requiredCol}カラムを追加します...`);
        if (requiredCol === 'source') {
          await client.query(`ALTER TABLE reservations ADD COLUMN source VARCHAR(20) DEFAULT 'web';`);
        } else if (requiredCol === 'status') {
          await client.query(`ALTER TABLE reservations ADD COLUMN status VARCHAR(20) DEFAULT 'confirmed';`);
        }
        console.log(`     ✅ ${requiredCol}カラムを追加しました`);
      }
    }

    // 3. seat_typesテーブルの確認
    const seatTypesQuery = `
      SELECT count(*) as count 
      FROM seat_types 
      WHERE store_id = '8fbff969-5212-4387-ae62-cc33944edef2';
    `;
    const seatResult = await client.query(seatTypesQuery);
    console.log(`\n📋 席種データ: ${seatResult.rows[0].count}件`);

    console.log('--- 予約テーブル構造確認完了 ---');
  } catch (err) {
    console.error('❌ テーブル確認中にエラーが発生しました:', err.message);
  } finally {
    client.release();
  }
};

checkReservationTable();