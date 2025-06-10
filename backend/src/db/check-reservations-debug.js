// C:\Users\acmsh\kanpAI\backend\src\db\check-reservations-debug.js
import pool from '../config/db.js';
import dotenv from 'dotenv';

// 環境変数を明示的に読み込み
dotenv.config();

const checkReservations = async () => {
    console.log('🔄 デバッグスクリプト開始...');
    console.log('📡 データベース接続情報:');
    console.log(`  Host: ${process.env.DB_HOST}`);
    console.log(`  Port: ${process.env.DB_PORT}`);
    console.log(`  Database: ${process.env.DB_NAME}`);
    console.log(`  User: ${process.env.DB_USER}`);
    
    let client;
    try {
        console.log('🔗 データベース接続試行中...');
        client = await pool.connect();
        console.log('✅ データベース接続成功');
        
        console.log('🔍 予約データの状況確認を開始します...');
        
        const storeId = '8fbff969-5212-4387-ae62-cc33944edef2';
        const today = new Date().toISOString().slice(0, 10);
        
        console.log(`📅 対象店舗ID: ${storeId}`);
        console.log(`📅 今日の日付: ${today}`);
        
        // 1. テーブル存在確認
        console.log('\n🔧 テーブル存在確認:');
        const tablesQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('stores', 'reservations', 'seat_types')
            ORDER BY table_name;
        `;
        const tablesResult = await client.query(tablesQuery);
        console.log('📋 存在するテーブル:', tablesResult.rows.map(row => row.table_name));
        
        // 2. 店舗情報確認
        console.log('\n🏪 店舗情報確認:');
        const storeQuery = `SELECT id, name FROM stores WHERE id = $1`;
        const storeResult = await client.query(storeQuery, [storeId]);
        if (storeResult.rows.length === 0) {
            console.log('❌ 指定された店舗が見つかりません');
            return;
        } else {
            console.log('✅ 店舗情報:', storeResult.rows[0]);
        }
        
        // 3. 全予約データを確認
        console.log('\n📋 全予約データ:');
        const allReservationsQuery = `
            SELECT 
                r.id, r.customer_name, r.party_size, r.reservation_date, 
                r.reservation_time, r.status, r.source, r.created_at,
                st.name as seat_type_name
            FROM reservations r
            LEFT JOIN seat_types st ON r.seat_type_id = st.id
            WHERE r.store_id = $1
            ORDER BY r.reservation_date DESC, r.reservation_time
            LIMIT 10;
        `;
        const allReservations = await client.query(allReservationsQuery, [storeId]);
        
        if (allReservations.rows.length === 0) {
            console.log('❌ 予約データが見つかりません');
        } else {
            console.log(`📊 最新の予約データ: ${allReservations.rows.length}件`);
            allReservations.rows.forEach((res, index) => {
                console.log(`  ${index + 1}. ${res.customer_name}様 ${res.party_size}名 - ${res.reservation_date} ${res.reservation_time} [${res.status}] (${res.source})`);
            });
        }
        
        // 4. 今日の予約データを確認
        console.log(`\n📅 今日(${today})の予約:`);
        const todayQuery = `
            SELECT 
                r.id, r.customer_name, r.party_size, r.reservation_time, 
                r.status, r.source, st.name as seat_type_name
            FROM reservations r
            LEFT JOIN seat_types st ON r.seat_type_id = st.id
            WHERE r.store_id = $1 AND r.reservation_date = $2
            ORDER BY r.reservation_time;
        `;
        const todayReservations = await client.query(todayQuery, [storeId, today]);
        
        if (todayReservations.rows.length === 0) {
            console.log('📋 今日の予約はありません');
        } else {
            console.log(`📊 今日の予約: ${todayReservations.rows.length}件`);
            todayReservations.rows.forEach((res, index) => {
                console.log(`  ${index + 1}. ${res.customer_name}様 ${res.party_size}名 - ${res.reservation_time} [${res.status}]`);
            });
        }
        
        // 5. 今日の有効な予約（キャンセル除く）
        console.log(`\n✅ 今日の有効な予約（キャンセル除く）:`);
        const validTodayQuery = `
            SELECT 
                r.id, r.customer_name, r.party_size, r.reservation_time, 
                r.status, r.source, st.name as seat_type_name
            FROM reservations r
            LEFT JOIN seat_types st ON r.seat_type_id = st.id
            WHERE r.store_id = $1 AND r.reservation_date = $2 AND r.status != 'cancelled'
            ORDER BY r.reservation_time;
        `;
        const validReservations = await client.query(validTodayQuery, [storeId, today]);
        
        if (validReservations.rows.length === 0) {
            console.log('📋 今日の有効な予約はありません');
            console.log('💡 テスト用予約データを作成しますか？');
        } else {
            console.log(`📊 今日の有効な予約: ${validReservations.rows.length}件`);
            validReservations.rows.forEach((res, index) => {
                console.log(`  ${index + 1}. ${res.customer_name}様 ${res.party_size}名 - ${res.reservation_time} [${res.status}]`);
            });
        }
        
        // 6. 席種情報も確認
        console.log('\n🪑 席種情報:');
        const seatTypesQuery = `
            SELECT id, name, capacity, min_people, max_people
            FROM seat_types 
            WHERE store_id = $1
            ORDER BY name;
        `;
        const seatTypes = await client.query(seatTypesQuery, [storeId]);
        
        if (seatTypes.rows.length === 0) {
            console.log('❌ 席種データが見つかりません');
        } else {
            console.log(`📊 席種数: ${seatTypes.rows.length}種類`);
            seatTypes.rows.forEach((seat, index) => {
                console.log(`  ${index + 1}. ${seat.name} (${seat.min_people}-${seat.max_people}名、定員${seat.capacity})`);
            });
        }
        
        console.log('\n✅ 予約データ確認完了');
        
    } catch (error) {
        console.error('❌ 確認中にエラーが発生しました:', error.message);
        console.error('📝 詳細エラー:', error.stack);
        throw error;
    } finally {
        if (client) {
            client.release();
            console.log('🔐 データベース接続をクローズしました');
        }
    }
};

// スクリプトとして実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
    checkReservations()
        .then(() => {
            console.log('🎉 スクリプト実行完了');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 スクリプト実行失敗:', error.message);
            process.exit(1);
        });
}

export { checkReservations };
