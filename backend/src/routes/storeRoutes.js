// C:\Users\acmsh\kanpAI\backend\src\routes\storeRoutes.js
import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// --- 店舗関連API ---
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


export default router;
