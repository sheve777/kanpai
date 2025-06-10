// データベースのレポート状況確認スクリプト
import pool from '../config/db.js';

const checkReportsStatus = async () => {
  const client = await pool.connect();
  try {
    console.log('--- レポート状況確認開始 ---');

    // 1. reportsテーブルの構造確認
    console.log('1. reportsテーブルの構造確認...');
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'reports' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 reportsテーブルの構造:');
    tableInfo.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'NULL可' : 'NOT NULL'})`);
    });

    // 2. 現在のレポート数を確認
    console.log('\n2. 現在のレポート数確認...');
    const countResult = await client.query('SELECT COUNT(*) as total FROM reports');
    console.log(`📊 総レポート数: ${countResult.rows[0].total}`);

    // 3. テスト店舗のレポート確認
    const testStoreId = '8fbff969-5212-4387-ae62-cc33944edef2';
    console.log(`\n3. テスト店舗(${testStoreId})のレポート確認...`);
    
    const storeReports = await client.query(`
      SELECT id, report_month, plan_type, status, generated_at, delivered_at 
      FROM reports 
      WHERE store_id = $1 
      ORDER BY report_month DESC;
    `, [testStoreId]);

    if (storeReports.rows.length === 0) {
      console.log('⚠️ テスト店舗のレポートが見つかりません。');
    } else {
      console.log(`✅ テスト店舗のレポート数: ${storeReports.rows.length}`);
      storeReports.rows.forEach(report => {
        console.log(`   - ${report.report_month} (${report.plan_type}) - ${report.status}`);
      });
    }

    // 4. 全店舗のレポート一覧（最新5件）
    console.log('\n4. 全店舗の最新レポート5件...');
    const allReports = await client.query(`
      SELECT r.*, s.name as store_name 
      FROM reports r
      LEFT JOIN stores s ON r.store_id = s.id
      ORDER BY r.generated_at DESC 
      LIMIT 5;
    `);

    if (allReports.rows.length === 0) {
      console.log('⚠️ レポートがありません。サンプルレポートを作成しますか？');
    } else {
      console.log('📋 最新レポート:');
      allReports.rows.forEach(report => {
        console.log(`   - ${report.store_name || '不明'}: ${report.report_month} (${report.status})`);
      });
    }

    console.log('\n--- レポート状況確認完了 ---');
  } catch (err) {
    console.error('❌ 確認中にエラーが発生しました:', err.stack);
  } finally {
    client.release();
    pool.end();
  }
};

checkReportsStatus();
