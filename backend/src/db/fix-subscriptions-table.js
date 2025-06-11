// C:\Users\acmsh\kanpAI\backend\src\db\fix-subscriptions-table.js
import pool from '../config/db.js';

const fixSubscriptionsTable = async () => {
  const client = await pool.connect();
  try {
    console.log('--- サブスクリプションテーブル修正開始 ---');

    // 1. 既存のテーブルを削除 (存在する場合)
    await client.query('DROP TABLE IF EXISTS store_subscriptions CASCADE;');
    console.log('🚮 既存の"store_subscriptions"テーブルを削除しました。');

    // 2. 新しい、正しい定義でテーブルを再作成
    // ★★★ store_id に UNIQUE 制約を追加 ★★★
    const createQuery = `
      CREATE TABLE store_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id UUID NOT NULL UNIQUE REFERENCES stores(id) ON DELETE CASCADE,
        plan_id UUID NOT NULL REFERENCES plans(id),
        stripe_subscription_id VARCHAR(100),
        current_period_start DATE,
        current_period_end DATE,
        status VARCHAR(20) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    
    await client.query(createQuery);
    console.log('✅ 新しい"store_subscriptions"テーブルが正常に作成されました。');
    
    console.log('--- サブスクリプションテーブル修正完了 ---');
  } catch (err) {
    console.error('❌ テーブル修正中にエラーが発生しました:', err.stack);
  } finally {
    client.release();
    pool.end();
  }
};

fixSubscriptionsTable();
