// C:\Users\acmsh\kanpAI\backend\src\db\seed-plans.js
import pool from '../config/db.js';

// 登録するプランのデータ
const plans = [
  {
    plan_code: 'entry',
    plan_name: 'エントリープラン',
    monthly_price: 10000,
    monthly_token_limit: 300,
    menu_operations_limit: 3,
    has_basic_report: true,
  },
  {
    plan_code: 'standard',
    plan_name: 'スタンダードプラン',
    monthly_price: 30000,
    monthly_token_limit: 1000,
    menu_operations_limit: 10,
    has_basic_report: true,
  },
  {
    plan_code: 'pro',
    plan_name: 'プロプラン',
    monthly_price: 50000,
    monthly_token_limit: 3000,
    menu_operations_limit: 30,
    has_detailed_report: true,
  },
];

const seedPlans = async () => {
  const client = await pool.connect();
  try {
    console.log('--- 料金プランの初期データ投入開始 ---');

    for (const plan of plans) {
      // 同じplan_codeが既に存在するかチェック
      const checkRes = await client.query('SELECT id FROM plans WHERE plan_code = $1', [plan.plan_code]);
      
      if (checkRes.rows.length > 0) {
        // 存在する場合はスキップ
        console.log(`🟡 スキップ: プラン "${plan.plan_name}" は既に存在します。`);
      } else {
        // 存在しない場合は挿入
        const insertQuery = `
          INSERT INTO plans (plan_code, plan_name, monthly_price, monthly_token_limit, menu_operations_limit, has_basic_report, has_detailed_report)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        const values = [
          plan.plan_code,
          plan.plan_name,
          plan.monthly_price,
          plan.monthly_token_limit,
          plan.menu_operations_limit,
          plan.has_basic_report || false,
          plan.has_detailed_report || false,
        ];
        await client.query(insertQuery, values);
        console.log(`✅ 成功: プラン "${plan.plan_name}" をデータベースに登録しました。`);
      }
    }
    
    console.log('--- 料金プランの初期データ投入完了 ---');
  } catch (err) {
    console.error('❌ データ投入中にエラーが発生しました:', err.stack);
  } finally {
    client.release();
    pool.end();
  }
};

seedPlans();
