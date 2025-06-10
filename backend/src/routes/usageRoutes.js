// C:\Users\acmsh\kanpAI\backend\src\routes\usageRoutes.js
import express from 'express';
import pool from '../config/db.js';
import lineUsageService from '../services/lineUsageService.js';

const router = express.Router();

/**
 * 現在のプランと使用状況を取得するAPI
 * GET /api/usage/status?store_id=<UUID>
 */
router.get('/status', async (req, res) => {
    const { store_id } = req.query;

    if (!store_id) {
        return res.status(400).json({ error: 'store_idクエリパラメータは必須です。' });
    }

    const client = await pool.connect();
    try {
        // 1. 店舗の現在のプランと上限値を取得
        const planQuery = `
            SELECT p.plan_name, p.menu_operations_limit, p.line_broadcasts_limit
            FROM plans p
            JOIN store_subscriptions ss ON p.id = ss.plan_id
            WHERE ss.store_id = $1 AND ss.status = 'active';
        `;
        const planResult = await client.query(planQuery, [store_id]);

        if (planResult.rows.length === 0) {
            return res.status(404).json({ error: '有効なプランが見つかりません。' });
        }
        const planInfo = planResult.rows[0];

        // 2. 今月の利用量を取得
        const usageQuery = `
            SELECT 
                SUM(line_broadcasts_count) as total_broadcasts,
                SUM(menu_operations_count) as total_menu_ops
            FROM usage_logs
            WHERE store_id = $1 AND date_trunc('month', log_date) = date_trunc('month', current_date);
        `;
        const usageResult = await client.query(usageQuery, [store_id]);
        const usageInfo = {
            line_broadcasts: parseInt(usageResult.rows[0].total_broadcasts || 0, 10),
            menu_operations: parseInt(usageResult.rows[0].total_menu_ops || 0, 10),
        };

        // 3. ★★★ NEW: LINE公式アカウントの制限情報を取得 ★★★
        const lineUsageStatus = await lineUsageService.getUsageStatus(store_id);
        
        const responseData = {
            plan_name: planInfo.plan_name,
            limits: {
                line_broadcasts: planInfo.line_broadcasts_limit,
                menu_operations: planInfo.menu_operations_limit,
            },
            usage: usageInfo,
            // ★★★ NEW: LINE公式アカウントの詳細情報 ★★★
            lineOfficialStatus: lineUsageStatus.lineOfficialPlan,
            friendsCount: lineUsageStatus.friendsCount,
            monthlyStats: lineUsageStatus.thisMonthStats
        };
        
        console.log(`✅ 店舗ID: ${store_id} のプラン・利用状況を取得しました。`);
        console.log(`📊 LINE使用状況: ${lineUsageStatus.lineOfficialPlan.usagePercentage.toFixed(1)}% (${lineUsageStatus.lineOfficialPlan.alertLevel})`);
        
        res.status(200).json(responseData);

    } catch (err) {
        console.error('❌ プラン・利用状況の取得中にエラーが発生しました:', err.stack);
        res.status(500).json({ error: 'サーバー内部でエラーが発生しました。' });
    } finally {
        client.release();
    }
});

/**
 * ★★★ NEW: LINE配信前の制限チェックAPI ★★★
 * POST /api/usage/check-line-limit
 */
router.post('/check-line-limit', async (req, res) => {
    const { store_id, recipient_count } = req.body;

    if (!store_id || !recipient_count) {
        return res.status(400).json({ 
            error: 'store_idとrecipient_countは必須です。' 
        });
    }

    try {
        const checkResult = await lineUsageService.checkBeforeBroadcast(store_id, recipient_count);
        
        console.log(`🔍 配信前チェック: 店舗ID ${store_id}, 配信先 ${recipient_count}名`);
        console.log(`📊 配信可能: ${checkResult.canSend ? 'はい' : 'いいえ'}`);
        
        res.status(200).json(checkResult);

    } catch (err) {
        console.error('❌ LINE配信制限チェック中にエラーが発生しました:', err.stack);
        res.status(500).json({ error: 'サーバー内部でエラーが発生しました。' });
    }
});

export default router;
