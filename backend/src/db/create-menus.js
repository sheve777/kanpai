// C:\Users\acmsh\kanpAI\backend\src\db\create-menus.js
import pool from '../config/db.js';

const createMenusTable = async () => {
  const client = await pool.connect();
  try {
    console.log('--- メニューテーブル作成開始 ---');

    // menusテーブルを作成するSQLクエリ
    // プロジェクト仕様書に基づき定義します
    const queryText = `
      CREATE TABLE IF NOT EXISTS menus (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        price INTEGER NOT NULL,
        description TEXT,
        is_recommended BOOLEAN DEFAULT false,
        is_available BOOLEAN DEFAULT true,
        allergy_info TEXT,
        spice_level INTEGER,
        display_order INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    
    await client.query(queryText);
    console.log('✅ "menus"テーブルが正常に作成/確認されました。');
    
    console.log('--- メニューテーブル作成完了 ---');
  } catch (err) {
    console.error('❌ テーブル作成中にエラーが発生しました:', err.stack);
  } finally {
    client.release(); // 接続をプールに返却
    pool.end(); // プールを閉じる
  }
};

createMenusTable();
