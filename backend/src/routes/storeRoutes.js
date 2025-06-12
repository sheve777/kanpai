// C:\Users\acmsh\kanpAI\backend\src\routes\storeRoutes.js
import express from 'express';
import pool from '../config/db.js';
import { authenticateToken, authorizeStoreAccess } from '../middlewares/auth.js';

const router = express.Router();

// --- 店舗関連API ---

// 店舗情報取得API（営業時間外予約ページ用）
router.get('/:storeId/info', async (req, res) => {
  const { storeId } = req.params;
  
  // デモ用店舗データ
  const demoStore = {
    id: storeId,
    name: `店舗 ${storeId}`,
    phone: '03-1234-5678',
    address: '東京都渋谷区テスト1-2-3',
    concept: 'アットホームな居酒屋です',
    operating_hours: {
      monday: { open: '17:00', close: '23:00' },
      tuesday: { open: '17:00', close: '23:00' },
      wednesday: { open: '17:00', close: '23:00' },
      thursday: { open: '17:00', close: '23:00' },
      friday: { open: '17:00', close: '24:00' },
      saturday: { open: '16:00', close: '24:00' },
      sunday: { open: '16:00', close: '22:00' }
    }
  };

  try {
    const client = await pool.connect();
    try {
      const query = 'SELECT id, name, phone, address, concept, operating_hours FROM stores WHERE id = $1;';
      const result = await client.query(query, [storeId]);
      
      if (result.rows.length === 0) {
        console.log(`📝 デモモード: 店舗 ${storeId} のデモデータを返します`);
        return res.status(200).json(demoStore);
      }
      
      const store = result.rows[0];
      console.log(`✅ 店舗情報を取得しました: ${store.name}`);
      res.status(200).json(store);
    } finally {
      client.release();
    }
  } catch (err) {
    console.log(`📝 デモモード: DB接続エラーのため店舗 ${storeId} のデモデータを返します`);
    res.status(200).json(demoStore);
  }
});

router.post('/', async (req, res) => {
  const { name, phone, address, concept } = req.body;
  if (!name) return res.status(400).json({ error: '店舗名は必須です。' });
  try {
    const client = await pool.connect();
    try {
      const query = 'INSERT INTO stores (name, phone, address, concept) VALUES ($1, $2, $3, $4) RETURNING *;';
      const result = await client.query(query, [name, phone, address, concept]);
      console.log(`✅ 新しい店舗が登録されました: ${result.rows[0].name}`);
      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ 店舗登録中にエラーが発生しました:', err.stack);
    res.status(500).json({ error: 'サーバー内部でエラーが発生しました。' });
  }
});

// 店舗情報更新API（認証必須）
router.put('/:storeId', authenticateToken, authorizeStoreAccess, async (req, res) => {
  const { storeId } = req.params;
  const { name, phone, address, concept, operating_hours } = req.body;
  
  // 更新するフィールドを動的に構築
  const updateFields = [];
  const values = [];
  let paramCount = 1;
  
  if (name !== undefined) {
    updateFields.push(`name = $${paramCount}`);
    values.push(name);
    paramCount++;
  }
  if (phone !== undefined) {
    updateFields.push(`phone = $${paramCount}`);
    values.push(phone);
    paramCount++;
  }
  if (address !== undefined) {
    updateFields.push(`address = $${paramCount}`);
    values.push(address);
    paramCount++;
  }
  if (concept !== undefined) {
    updateFields.push(`concept = $${paramCount}`);
    values.push(concept);
    paramCount++;
  }
  if (operating_hours !== undefined) {
    updateFields.push(`operating_hours = $${paramCount}`);
    values.push(operating_hours);
    paramCount++;
  }
  
  if (updateFields.length === 0) {
    return res.status(400).json({ error: '更新するフィールドが指定されていません。' });
  }
  
  values.push(storeId);
  
  try {
    const client = await pool.connect();
    try {
      const query = `
        UPDATE stores 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING id, name, phone, address, concept, operating_hours;
      `;
      const result = await client.query(query, values);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: '店舗が見つかりません。' });
      }
      
      console.log(`✅ 店舗情報を更新しました: ${result.rows[0].name}`);
      res.status(200).json({ success: true, store: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ 店舗情報更新中にエラーが発生しました:', err.stack);
    res.status(500).json({ error: 'サーバー内部でエラーが発生しました。' });
  }
});


// --- メニュー関連API ---
router.post('/:storeId/menus', async (req, res) => {
  const { storeId } = req.params;
  const { name, category, price, description } = req.body;
  if (!name || !category || price === undefined) return res.status(400).json({ error: 'メニュー名、カテゴリ、価格は必須です。' });
  try {
    const client = await pool.connect();
    try {
      const query = 'INSERT INTO menus (store_id, name, category, price, description) VALUES ($1, $2, $3, $4, $5) RETURNING *;';
      const result = await client.query(query, [storeId, name, category, price, description || null]);
      console.log(`✅ 新しいメニューが登録されました: ${result.rows[0].name}`);
      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ メニュー登録中にエラーが発生しました:', err.stack);
    if (err.code === '23503') return res.status(404).json({ error: `指定された店舗IDが見つかりません: ${storeId}` });
    res.status(500).json({ error: 'サーバー内部でエラーが発生しました。' });
  }
});

router.get('/:storeId/menus', async (req, res) => {
  const { storeId } = req.params;
  try {
    const client = await pool.connect();
    try {
      const query = 'SELECT * FROM menus WHERE store_id = $1 ORDER BY category, name;';
      const result = await client.query(query, [storeId]);
      console.log(`✅ 店舗ID: ${storeId} のメニューを${result.rows.length}件取得しました。`);
      res.status(200).json(result.rows);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ メニュー取得中にエラーが発生しました:', err.stack);
    res.status(500).json({ error: 'サーバー内部でエラーが発生しました。' });
  }
});


// --- 座席関連API ---

/**
 * 特定の店舗に新しい座席種別を登録するAPIエンドポイント
 * POST /api/stores/:storeId/seats
 */
router.post('/:storeId/seats', async (req, res) => {
  const { storeId } = req.params;
  const { name, capacity, min_people, max_people } = req.body;

  if (!name || capacity === undefined) {
    return res.status(400).json({ error: '座席名と収容人数は必須です。' });
  }

  try {
    const client = await pool.connect();
    try {
      const newSeatQuery = `
        INSERT INTO seat_types (store_id, name, capacity, min_people, max_people)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const values = [storeId, name, capacity, min_people || 1, max_people || capacity];
      const result = await client.query(newSeatQuery, values);
      const newSeat = result.rows[0];
      
      console.log(`✅ 新しい座席が登録されました: ${newSeat.name}`);
      res.status(201).json(newSeat);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ 座席登録中にエラーが発生しました:', err.stack);
    if (err.code === '23503') {
        return res.status(404).json({ error: `指定された店舗IDが見つかりません: ${storeId}` });
    }
    res.status(500).json({ error: 'サーバー内部でエラーが発生しました。' });
  }
});


// 店舗のメニュー取得API（デモ用）
router.get('/:storeId/menus', async (req, res) => {
  const { storeId } = req.params;
  
  // デモ用メニューデータ
  const demoMenus = [
    {
      id: 1,
      name: '生ビール',
      category: 'ドリンク',
      price: 500,
      description: 'キンキンに冷えたビールです'
    },
    {
      id: 2,
      name: '唐揚げ',
      category: '揚げ物',
      price: 650,
      description: 'ジューシーな鶏の唐揚げ'
    },
    {
      id: 3,
      name: '刺身盛り合わせ',
      category: '刺身',
      price: 1200,
      description: '新鮮な魚の刺身'
    }
  ];

  try {
    const client = await pool.connect();
    try {
      const query = 'SELECT * FROM menus WHERE store_id = $1 ORDER BY created_at DESC;';
      const result = await client.query(query, [storeId]);
      
      if (result.rows.length === 0) {
        console.log(`📝 デモモード: 店舗 ${storeId} のデモメニューを返します`);
        return res.status(200).json(demoMenus);
      }
      
      console.log(`✅ メニュー情報を取得しました: ${result.rows.length}件`);
      res.status(200).json(result.rows);
    } finally {
      client.release();
    }
  } catch (err) {
    console.log(`📝 デモモード: DB接続エラーのため店舗 ${storeId} のデモメニューを返します`);
    res.status(200).json(demoMenus);
  }
});

export default router;
