// C:\Users\acmsh\kanpAI\backend\src\routes\dashboardRoutes.js
import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.get('/summary', async (req, res) => {
    const { store_id } = req.query;
    if (!store_id) {
        return res.status(400).json({ error: 'store_idクエリパラメータは必須です。' });
    }

    const client = await pool.connect();
    try {
        const today = new Date().toISOString().slice(0, 10);

        const todayReservationsQuery = `
            SELECT 
                r.id, r.reservation_time, r.customer_name, r.party_size, r.notes, 
                r.status, st.name as seat_type_name
            FROM reservations r
            LEFT JOIN seat_types st ON r.seat_type_id = st.id
            WHERE r.store_id = $1 AND r.reservation_date = $2 AND r.status != 'cancelled'
            ORDER BY r.reservation_time;
        `;
        const todayRes = await client.query(todayReservationsQuery, [store_id, today]);
        
        console.log(`📅 今日の予約取得: ${todayRes.rows.length}件 (キャンセル除く)`);
        
        // ★★★ 予約データにアラート情報を追加するロジック ★★★
        const reservationsWithAlerts = todayRes.rows.map(res => {
            const alerts = [];
            if (res.party_size >= 10) {
                alerts.push({ type: 'large_party', message: `${res.party_size}名の団体様です。` });
            }
            if (res.notes && res.notes.trim() !== '') {
                alerts.push({ type: 'has_notes', message: `特記事項: ${res.notes}` });
            }
            return { ...res, alerts };
        });

        const totalGuestsToday = reservationsWithAlerts.reduce((sum, row) => sum + row.party_size, 0);

        // 昨日の予約件数も取得（増減比較用）
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().slice(0, 10);
        
        const yesterdayQuery = `
            SELECT COUNT(*) as count
            FROM reservations 
            WHERE store_id = $1 AND reservation_date = $2 AND status != 'cancelled'
        `;
        const yesterdayRes = await client.query(yesterdayQuery, [store_id, yesterdayString]);
        const yesterdayCount = parseInt(yesterdayRes.rows[0].count);

        const summary = {
            today_reservations: reservationsWithAlerts,
            yesterday_reservations: yesterdayCount,
            total_groups_today: reservationsWithAlerts.length,
            total_guests_today: totalGuestsToday,
            seat_availability: [], // 将来的に実装
        };

        console.log(`✅ サマリー取得完了: 今日${summary.total_groups_today}件、昨日${yesterdayCount}件`);
        res.status(200).json(summary);

    } catch (err) {
        console.error('❌ サマリー情報取得中にエラーが発生しました:', err.stack);
        res.status(500).json({ error: 'サーバー内部でエラーが発生しました。' });
    } finally {
        client.release();
    }
});

export default router;
