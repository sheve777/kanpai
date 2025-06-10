// C:\Users\acmsh\kanpAI\backend\src\routes\reportRoutes.js
import express from 'express';
import pool from '../config/db.js';
import OpenAI from 'openai';

const router = express.Router();
const openai = new OpenAI();

/**
 * レポート一覧を取得するAPI
 * GET /api/reports?store_id=<UUID>
 */
router.get('/', async (req, res) => {
    console.log('🔄 レポート一覧取得リクエスト受信:', req.query);
    
    const { store_id } = req.query;

    if (!store_id) {
        console.log('❌ store_idが指定されていません');
        return res.status(400).json({ error: 'store_idクエリパラメータは必須です。' });
    }

    try {
        console.log(`📋 店舗ID: ${store_id} のレポート一覧を取得中...`);
        
        const result = await pool.query(`
            SELECT 
                id, 
                report_month, 
                plan_type, 
                status, 
                generated_at, 
                delivered_at,
                created_at
            FROM reports 
            WHERE store_id = $1 
            ORDER BY report_month DESC;
        `, [store_id]);

        console.log(`✅ ${result.rows.length}件のレポートを取得しました`);
        
        if (result.rows.length === 0) {
            console.log('ℹ️ 該当するレポートがありません');
        } else {
            result.rows.forEach((report, index) => {
                console.log(`   ${index + 1}. ${report.report_month} - ${report.status} (ID: ${report.id})`);
            });
        }

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('❌ レポート一覧取得中にエラーが発生しました:', err.stack);
        res.status(500).json({ error: 'サーバー内部でエラーが発生しました。' });
    }
});

/**
 * 特定のIDのレポートを1件取得するAPI
 * GET /api/reports/:id
 */
router.get('/:id', async (req, res) => {
    console.log('🔄 個別レポート取得リクエスト受信:', req.params);
    
    const { id } = req.params;
    
    try {
        console.log(`📋 レポートID: ${id} の詳細を取得中...`);
        
        const result = await pool.query(`
            SELECT 
                r.*,
                s.name as store_name
            FROM reports r
            LEFT JOIN stores s ON r.store_id = s.id
            WHERE r.id = $1;
        `, [id]);
        
        if (result.rows.length === 0) {
            console.log(`❌ レポートID: ${id} が見つかりません`);
            return res.status(404).json({ error: 'レポートが見つかりません。' });
        }
        
        console.log(`✅ レポートID: ${id} の詳細を取得しました`);
        console.log(`   店舗: ${result.rows[0].store_name}`);
        console.log(`   対象月: ${result.rows[0].report_month}`);
        console.log(`   ステータス: ${result.rows[0].status}`);
        
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('❌ 個別レポート取得中にエラーが発生しました:', err.stack);
        res.status(500).json({ error: 'サーバー内部でエラーが発生しました。' });
    }
});

/**
 * レポート生成API
 * POST /api/reports/generate
 */
router.post('/generate', async (req, res) => {
    console.log('🔄 レポート生成リクエスト受信:', req.body);
    
    const { store_id, report_month, plan_type } = req.body;

    if (!store_id || !report_month || !plan_type) {
        return res.status(400).json({ 
            error: 'store_id、report_month、plan_typeは必須です。' 
        });
    }

    try {
        console.log(`📊 レポート生成開始: 店舗ID=${store_id}, 対象月=${report_month}, プラン=${plan_type}`);
        
        // サンプルレポート生成（実際にはOpenAI APIを使用）
        const sampleReportContent = `
# ${report_month} 月次レポート

## サマリー
今月の店舗運営状況を分析しました。

### 主要指標
- チャットボット利用回数: 45回
- 予約件数: 23件
- LINE配信回数: 3回

### 改善提案
1. メニューの説明をより詳しく
2. 営業時間の案内を明確に
3. アクセス情報の充実

今月もお疲れ様でした！
        `;

        // データベースに保存
        const insertQuery = `
            INSERT INTO reports (store_id, report_month, plan_type, report_content, status, generated_at, created_at)
            VALUES ($1, $2, $3, $4, 'completed', NOW(), NOW())
            RETURNING *;
        `;
        
        const result = await pool.query(insertQuery, [
            store_id,
            report_month,
            plan_type,
            sampleReportContent
        ]);

        console.log(`✅ レポートを生成しました: ID=${result.rows[0].id}`);
        
        res.status(201).json({
            message: 'レポートを生成しました。',
            report: result.rows[0]
        });
    } catch (err) {
        console.error('❌ レポート生成中にエラーが発生しました:', err.stack);
        res.status(500).json({ error: 'サーバー内部でエラーが発生しました。' });
    }
});

export default router;
