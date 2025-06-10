// C:\Users\acmsh\kanpAI\backend\src\db\create-billing-tables.js
import pool from '../config/db.js';

const createBillingTables = async () => {
  const client = await pool.connect();
  try {
    console.log('--- 課金・プラン管理テーブル作成開始 ---');

    // plans (料金プラン) テーブルを作成するSQLクエリ
    const plansQuery = `
      CREATE TABLE IF NOT EXISTS plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        plan_code VARCHAR(20) UNIQUE NOT NULL,
        plan_name VARCHAR(50) NOT NULL,
        monthly_price INTEGER NOT NULL,
        monthly_token_limit INTEGER,
        menu_operations_limit INTEGER,
        line_broadcasts_limit INTEGER,
        has_basic_report BOOLEAN DEFAULT false,
        has_detailed_report BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await client.query(plansQuery);
    console.log('✅ "plans"テーブルが正常に作成/確認されました。');

    // store_subscriptions (店舗の契約情報) テーブルを作成するSQLクエリ
    const subscriptionsQuery = `
      CREATE TABLE IF NOT EXISTS store_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        plan_id UUID NOT NULL REFERENCES plans(id),
        stripe_subscription_id VARCHAR(100),
        current_period_start DATE,
        current_period_end DATE,
        status VARCHAR(20) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await client.query(subscriptionsQuery);
    console.log('✅ "store_subscriptions"テーブルが正常に作成/確認されました。');

    console.log('--- 課金・プラン管理テーブル作成完了 ---');
  } catch (err) {
    console.error('❌ テーブル作成中にエラーが発生しました:', err.stack);
  } finally {
    client.release();
    pool.end();
  }
};

createBillingTables();
