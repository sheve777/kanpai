// C:\Users\acmsh\kanpAI\backend\src\services\menuService.js
import pool from '../config/db.js';

/**
 * データベースからメニューを検索する
 * @param {string} storeId - 店舗ID
 * @param {object} criteria - 検索条件 { category, keyword }
 * @returns {Promise<Array>} - 検索結果のメニュー配列
 */
export const searchMenus = async (storeId, criteria = {}) => {
    const { category, keyword } = criteria;
    
    let query = 'SELECT name, price, description, category FROM menus WHERE store_id = $1 AND is_available = true';
    const values = [storeId];
    let paramIndex = 2;

    if (category) {
        query += ` AND category = $${paramIndex++}`;
        values.push(category);
    }

    if (keyword) {
        query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
        values.push(`%${keyword}%`);
    }

    query += ' ORDER BY category, name LIMIT 10;'; // 最大10件まで返す

    try {
        const result = await pool.query(query, values);
        return result.rows;
    } catch (error) {
        console.error('❌ メニュー検索中にエラーが発生しました:', error);
        return []; // エラー時は空の配列を返す
    }
};
