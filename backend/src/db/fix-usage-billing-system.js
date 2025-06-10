// 従量課金システムの修正スクリプト
import pool from '../config/db.js';

const fixUsageBillingSystem = async () => {
  const client = await pool.connect();
  try {
    console.log('--- 従量課金システムの修正開始 ---');

    // 1. plansテーブルにline_broadcasts_limitカラムを追加
    console.log('1. plansテーブルにline_broadcasts_limitカラムを追加中...');
    try {
      await client.query(`
        ALTER TABLE plans 
        ADD COLUMN IF NOT EXISTS line_broadcasts_limit INTEGER;
      `);
      console.log('✅ line_broadcasts_limitカラムを追加しました。');
    } catch (err) {
      console.log('⚠️ line_broadcasts_limitカラムは既に存在するか、追加できませんでした:', err.message);
    }

    // 2. usage_logsテーブルにUNIQUE制約を追加
    console.log('2. usage_logsテーブルにUNIQUE制約を追加中...');
    try {
      await client.query(`
        ALTER TABLE usage_logs 
        ADD CONSTRAINT unique_store_date_service 
        UNIQUE (store_id, log_date, service_type);
      `);
      console.log('✅ UNIQUE制約を追加しました。');
    } catch (err) {
      console.log('⚠️ UNIQUE制約は既に存在するか、追加できませんでした:', err.message);
    }

    // 3. プランデータにline_broadcasts_limitを更新
    console.log('3. プランデータのline_broadcasts_limit値を更新中...');
    
    const planUpdates = [
      { plan_code: 'entry', line_broadcasts_limit: 5 },
      { plan_code: 'standard', line_broadcasts_limit: 15 },
      { plan_code: 'pro', line_broadcasts_limit: null } // 無制限
    ];

    for (const update of planUpdates) {
      await client.query(`
        UPDATE plans 
        SET line_broadcasts_limit = $1 
        WHERE plan_code = $2;
      `, [update.line_broadcasts_limit, update.plan_code]);
      
      console.log(`✅ ${update.plan_code}プランのLINE配信制限を${update.line_broadcasts_limit || '無制限'}に設定しました。`);
    }

    // 4. テスト店舗がプランに加入しているか確認
    console.log('4. テスト店舗のプラン加入状況を確認中...');
    const testStoreId = '8fbff969-5212-4387-ae62-cc33944edef2';
    
    const subCheck = await client.query(`
      SELECT ss.*, p.plan_name 
      FROM store_subscriptions ss
      JOIN plans p ON ss.plan_id = p.id
      WHERE ss.store_id = $1 AND ss.status = 'active';
    `, [testStoreId]);

    if (subCheck.rows.length === 0) {
      console.log('⚠️ テスト店舗がプランに加入していません。エントリープランに加入させます...');
      
      // エントリープランのIDを取得
      const planResult = await client.query('SELECT id FROM plans WHERE plan_code = $1', ['entry']);
      if (planResult.rows.length > 0) {
        const planId = planResult.rows[0].id;
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
        
        await client.query(`
          INSERT INTO store_subscriptions (store_id, plan_id, status, current_period_start, current_period_end)
          VALUES ($1, $2, 'active', $3, $4);
        `, [testStoreId, planId, today, nextMonth]);
        
        console.log('✅ テスト店舗をエントリープランに加入させました。');
      }
    } else {
      console.log(`✅ テスト店舗は既に${subCheck.rows[0].plan_name}に加入しています。`);
    }

    // 5. 現在の状態を確認
    console.log('5. 修正後の状態確認...');
    
    const statusQuery = `
      SELECT 
        p.plan_name,
        p.menu_operations_limit,
        p.line_broadcasts_limit,
        p.monthly_token_limit,
        COALESCE(SUM(ul.line_broadcasts_count), 0) as current_broadcasts,
        COALESCE(SUM(ul.menu_operations_count), 0) as current_menu_ops
      FROM plans p
      JOIN store_subscriptions ss ON p.id = ss.plan_id
      LEFT JOIN usage_logs ul ON ss.store_id = ul.store_id 
        AND date_trunc('month', ul.log_date) = date_trunc('month', current_date)
      WHERE ss.store_id = $1 AND ss.status = 'active'
      GROUP BY p.plan_name, p.menu_operations_limit, p.line_broadcasts_limit, p.monthly_token_limit;
    `;
    
    const statusResult = await client.query(statusQuery, [testStoreId]);
    if (statusResult.rows.length > 0) {
      const status = statusResult.rows[0];
      console.log('📊 現在の状況:');
      console.log(`   プラン: ${status.plan_name}`);
      console.log(`   LINE配信: ${status.current_broadcasts}/${status.line_broadcasts_limit || '無制限'}`);
      console.log(`   メニュー操作: ${status.current_menu_ops}/${status.menu_operations_limit}`);
      console.log(`   トークン制限: ${status.monthly_token_limit}pt/月`);
    }

    console.log('--- 従量課金システムの修正完了 ---');
  } catch (err) {
    console.error('❌ 修正中にエラーが発生しました:', err.stack);
  } finally {
    client.release();
    pool.end();
  }
};

fixUsageBillingSystem();
