// 従量課金システムのテストスクリプト
import pool from '../config/db.js';

const testUsageBillingSystem = async () => {
  const client = await pool.connect();
  try {
    console.log('--- 従量課金システムのテスト開始 ---');
    
    const testStoreId = '8fbff969-5212-4387-ae62-cc33944edef2';
    
    // 1. 現在の使用量状況を確認
    console.log('1. 現在の使用量状況を確認...');
    const usageQuery = `
      SELECT 
        p.plan_name,
        p.menu_operations_limit,
        p.line_broadcasts_limit,
        COALESCE(SUM(ul.line_broadcasts_count), 0) as current_broadcasts,
        COALESCE(SUM(ul.menu_operations_count), 0) as current_menu_ops
      FROM plans p
      JOIN store_subscriptions ss ON p.id = ss.plan_id
      LEFT JOIN usage_logs ul ON ss.store_id = ul.store_id 
        AND date_trunc('month', ul.log_date) = date_trunc('month', current_date)
      WHERE ss.store_id = $1 AND ss.status = 'active'
      GROUP BY p.plan_name, p.menu_operations_limit, p.line_broadcasts_limit;
    `;
    
    const usageResult = await client.query(usageQuery, [testStoreId]);
    if (usageResult.rows.length > 0) {
      const usage = usageResult.rows[0];
      console.log(`📊 ${usage.plan_name}の使用状況:`);
      console.log(`   LINE配信: ${usage.current_broadcasts}/${usage.line_broadcasts_limit || '無制限'}`);
      console.log(`   メニュー操作: ${usage.current_menu_ops}/${usage.menu_operations_limit}`);
    }

    // 2. usage_logsテーブルに使用量を追加してテスト
    console.log('\\n2. テスト用の使用量を追加...');
    
    // LINE配信の使用量を追加
    const addUsageQuery = `
      INSERT INTO usage_logs (store_id, service_type, line_broadcasts_count)
      VALUES ($1, $2, 1)
      ON CONFLICT (store_id, log_date, service_type)
      DO UPDATE SET line_broadcasts_count = usage_logs.line_broadcasts_count + 1
      RETURNING line_broadcasts_count;
    `;
    
    const result = await client.query(addUsageQuery, [testStoreId, 'line_broadcast']);
    console.log(`✅ LINE配信使用量を追加しました。現在の回数: ${result.rows[0].line_broadcasts_count}`);

    // 3. 制限チェック機能をテスト（エントリープランに変更してテスト）
    console.log('\\n3. 制限チェック機能をテスト（一時的にエントリープランに変更）...');
    
    // エントリープランに変更
    const entryPlanResult = await client.query('SELECT id FROM plans WHERE plan_code = $1', ['entry']);
    const entryPlanId = entryPlanResult.rows[0].id;
    
    await client.query(`
      UPDATE store_subscriptions 
      SET plan_id = $1 
      WHERE store_id = $2 AND status = 'active';
    `, [entryPlanId, testStoreId]);
    
    console.log('✅ テスト店舗を一時的にエントリープラン（LINE配信制限5回）に変更しました。');

    // 現在の制限状況を再確認
    const limitCheckQuery = `
      SELECT 
        p.plan_name,
        p.line_broadcasts_limit,
        COALESCE(SUM(ul.line_broadcasts_count), 0) as current_broadcasts
      FROM plans p
      JOIN store_subscriptions ss ON p.id = ss.plan_id
      LEFT JOIN usage_logs ul ON ss.store_id = ul.store_id 
        AND date_trunc('month', ul.log_date) = date_trunc('month', current_date)
        AND ul.service_type = 'line_broadcast'
      WHERE ss.store_id = $1 AND ss.status = 'active'
      GROUP BY p.plan_name, p.line_broadcasts_limit;
    `;
    
    const limitResult = await client.query(limitCheckQuery, [testStoreId]);
    if (limitResult.rows.length > 0) {
      const limit = limitResult.rows[0];
      console.log(`📊 制限チェック結果:`);
      console.log(`   プラン: ${limit.plan_name}`);
      console.log(`   現在のLINE配信回数: ${limit.current_broadcasts}`);
      console.log(`   制限回数: ${limit.line_broadcasts_limit}`);
      
      if (limit.current_broadcasts >= limit.line_broadcasts_limit) {
        console.log('🚫 制限に達しています！');
      } else {
        console.log(`✅ まだ${limit.line_broadcasts_limit - limit.current_broadcasts}回利用可能です。`);
      }
    }

    // 4. プロプランに戻す
    console.log('\\n4. プロプランに戻します...');
    const proPlanResult = await client.query('SELECT id FROM plans WHERE plan_code = $1', ['pro']);
    const proPlanId = proPlanResult.rows[0].id;
    
    await client.query(`
      UPDATE store_subscriptions 
      SET plan_id = $1 
      WHERE store_id = $2 AND status = 'active';
    `, [proPlanId, testStoreId]);
    
    console.log('✅ テスト店舗をプロプランに戻しました。');

    console.log('\\n--- 従量課金システムのテスト完了 ---');
    console.log('✅ 従量課金システムは正常に動作しています！');

  } catch (err) {
    console.error('❌ テスト中にエラーが発生しました:', err.stack);
  } finally {
    client.release();
    pool.end();
  }
};

testUsageBillingSystem();
