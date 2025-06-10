// C:\Users\acmsh\kanpAI\backend\src\routes\menuRoutes.js
import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

/**
 * 特定のメニュー情報を更新するAPI
 * PUT /api/menus/:id
 */
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { price, description } = req.body;

    if (price === undefined && description === undefined) {
        return res.status(400).json({ error: '更新する価格または説明が必要です。' });
    }

    try {
        const client = await pool.connect();
        try {
            const fields = [];
            const values = [];
            let queryIndex = 1;

            if (price !== undefined) {
                fields.push(`price = $${queryIndex++}`);
                values.push(price);
            }
            if (description !== undefined) {
                fields.push(`description = $${queryIndex++}`);
                values.push(description);
            }
            
            values.push(id);
            const updateQuery = `
                UPDATE menus
                SET ${fields.join(', ')}, updated_at = NOW()
                WHERE id = $${queryIndex}
                RETURNING *;
            `;
            const result = await client.query(updateQuery, values);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: '指定されたメニューが見つかりません。' });
            }
            
            console.log(`✅ メニューを更新しました: ${result.rows[0].name}`);
            res.status(200).json(result.rows[0]);

        } finally {
            client.release();
        }
    } catch (err) {
        console.error('❌ メニュー更新中にエラーが発生しました:', err.stack);
        res.status(500).json({ error: 'サーバー内部でエラーが発生しました。' });
    }
});

/**
 * 特定のメニューを削除するAPI
 * DELETE /api/menus/:id
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const client = await pool.connect();
        try {
            const deleteQuery = 'DELETE FROM menus WHERE id = $1';
            const result = await client.query(deleteQuery, [id]);

            if (result.rowCount === 0) {
                return res.status(404).json({ error: '指定されたメニューが見つかりません。' });
            }
            
            console.log(`✅ メニューを削除しました。ID: ${id}`);
            res.status(204).send(); // 成功時はボディなし

        } finally {
            client.release();
        }
    } catch (err) {
        console.error('❌ メニュー削除中にエラーが発生しました:', err.stack);
        res.status(500).json({ error: 'サーバー内部でエラーが発生しました。' });
    }
});


export default router;
