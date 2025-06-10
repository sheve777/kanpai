// 予約システム改善のためのデータベース修正スクリプト
import pool from '../config/db.js';

const updateReservationSystem = async () => {
  const client = await pool.connect();
  try {
    console.log('--- 予約システム改善のためのDB修正開始 ---');

    // 1. reservations テーブルに新しいカラムを追加
    console.log('1. reservations テーブルの拡張...');
    
    const alterQueries = [
      // source カラム (予約元: 'web', 'chatbot', 'phone')
      `ALTER TABLE reservations ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'web';`,
      
      // status カラム (予約状態: 'confirmed', 'cancelled', 'pending')  
      `ALTER TABLE reservations ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'confirmed';`,
      
      // updated_at カラム
      `ALTER TABLE reservations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();`
    ];

    for (const query of alterQueries) {
      try {
        await client.query(query);
        console.log('✅ カラム追加成功:', query.split(' ')[5]);
      } catch (err) {
        if (err.code === '42701') { // column already exists
          console.log('⚠️ カラムは既に存在します:', query.split(' ')[5]);
        } else {
          throw err;
        }
      }
    }

    // 2. stores テーブルに営業時間情報を追加
    console.log('2. stores テーブルに営業時間情報を追加...');
    
    try {
      await client.query(`
        ALTER TABLE stores 
        ADD COLUMN IF NOT EXISTS operating_hours JSONB DEFAULT '{"start": "17:00", "end": "24:00"}';
      `);
      console.log('✅ operating_hours カラムを追加しました');
    } catch (err) {
      if (err.code === '42701') {
        console.log('⚠️ operating_hours カラムは既に存在します');
      } else {
        throw err;
      }
    }

    // 3. テスト店舗の営業時間を設定
    console.log('3. テスト店舗の営業時間を設定...');
    const testStoreId = '8fbff969-5212-4387-ae62-cc33944edef2';
    
    await client.query(`
      UPDATE stores 
      SET operating_hours = $1
      WHERE id = $2;
    `, [
      JSON.stringify({
        start: "17:00",
        end: "24:00"
      }),
      testStoreId
    ]);
    console.log('✅ テスト店舗の営業時間を設定しました (17:00-24:00)');

    // 4. seat_types テーブルに display_order カラムを追加
    console.log('4. seat_types テーブルに表示順序カラムを追加...');
    
    try {
      await client.query(`
        ALTER TABLE seat_types 
        ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
      `);
      console.log('✅ display_order カラムを追加しました');
    } catch (err) {
      if (err.code === '42701') {
        console.log('⚠️ display_order カラムは既に存在します');
      } else {
        throw err;
      }
    }

    // 5. テスト用の席種データを確認・作成
    console.log('5. テスト用席種データの確認・作成...');
    
    const seatTypesCheck = await client.query(`
      SELECT COUNT(*) as count FROM seat_types WHERE store_id = $1;
    `, [testStoreId]);
    
    if (parseInt(seatTypesCheck.rows[0].count) === 0) {
      console.log('⚠️ 席種データがありません。テスト用データを作成します...');
      
      const seatTypesData = [
        {
          name: 'カウンター席',
          capacity: 8,
          min_people: 1,
          max_people: 2,
          display_order: 1
        },
        {
          name: 'テーブル席',
          capacity: 12,
          min_people: 2,
          max_people: 6,
          display_order: 2
        },
        {
          name: '個室',
          capacity: 8,
          min_people: 4,
          max_people: 8,
          display_order: 3
        }
      ];

      for (const seatType of seatTypesData) {
        await client.query(`
          INSERT INTO seat_types (store_id, name, capacity, min_people, max_people, display_order)
          VALUES ($1, $2, $3, $4, $5, $6);
        `, [
          testStoreId,
          seatType.name,
          seatType.capacity,
          seatType.min_people,
          seatType.max_people,
          seatType.display_order
        ]);
        console.log(`✅ 席種を作成: ${seatType.name}`);
      }
    } else {
      console.log(`✅ 既に${seatTypesCheck.rows[0].count}個の席種が存在します`);
    }

    // 6. サンプル予約データを作成（テスト用）
    console.log('6. サンプル予約データの作成...');
    
    const existingReservations = await client.query(`
      SELECT COUNT(*) as count FROM reservations WHERE store_id = $1;
    `, [testStoreId]);
    
    if (parseInt(existingReservations.rows[0].count) < 3) {
      console.log('📅 テスト用予約データを作成します...');
      
      // 席種IDを取得
      const seatTypesResult = await client.query(`
        SELECT id, name FROM seat_types WHERE store_id = $1 ORDER BY display_order;
      `, [testStoreId]);
      
      if (seatTypesResult.rows.length > 0) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const sampleReservations = [
          {
            customer_name: '田中太郎',
            customer_phone: '090-1234-5678',
            party_size: 4,
            reservation_date: tomorrow.toISOString().split('T')[0],
            reservation_time: '19:00:00',
            seat_type_id: seatTypesResult.rows[1]?.id || seatTypesResult.rows[0].id, // テーブル席
            notes: '誕生日のお祝いです',
            source: 'web',
            status: 'confirmed'
          },
          {
            customer_name: '佐藤花子',
            customer_phone: '080-9876-5432',
            party_size: 2,
            reservation_date: tomorrow.toISOString().split('T')[0],
            reservation_time: '20:30:00',
            seat_type_id: seatTypesResult.rows[0].id, // カウンター席
            notes: '',
            source: 'chatbot',
            status: 'confirmed'
          }
        ];

        for (const reservation of sampleReservations) {
          await client.query(`
            INSERT INTO reservations (
              store_id, seat_type_id, customer_name, customer_phone, 
              party_size, reservation_date, reservation_time, notes,
              duration_minutes, source, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 120, $9, $10);
          `, [
            testStoreId,
            reservation.seat_type_id,
            reservation.customer_name,
            reservation.customer_phone,
            reservation.party_size,
            reservation.reservation_date,
            reservation.reservation_time,
            reservation.notes,
            reservation.source,
            reservation.status
          ]);
          console.log(`✅ サンプル予約を作成: ${reservation.customer_name}様`);
        }
      }
    } else {
      console.log(`✅ 既に${existingReservations.rows[0].count}個の予約が存在します`);
    }

    // 7. 現在の状態を確認
    console.log('7. 修正後の状態確認...');
    
    const finalCheck = await client.query(`
      SELECT 
        s.name as store_name,
        s.operating_hours,
        COUNT(st.id) as seat_types_count,
        COUNT(r.id) as reservations_count
      FROM stores s
      LEFT JOIN seat_types st ON s.id = st.store_id
      LEFT JOIN reservations r ON s.id = r.store_id AND r.status != 'cancelled'
      WHERE s.id = $1
      GROUP BY s.id, s.name, s.operating_hours;
    `, [testStoreId]);

    if (finalCheck.rows.length > 0) {
      const status = finalCheck.rows[0];
      console.log('📊 最終状態:');
      console.log(`   店舗名: ${status.store_name}`);
      console.log(`   営業時間: ${JSON.stringify(status.operating_hours)}`);
      console.log(`   席種数: ${status.seat_types_count}`);
      console.log(`   予約数: ${status.reservations_count}`);
    }

    console.log('--- 予約システム改善のためのDB修正完了 ---');
  } catch (err) {
    console.error('❌ 修正中にエラーが発生しました:', err.stack);
  } finally {
    client.release();
    pool.end();
  }
};

updateReservationSystem();
