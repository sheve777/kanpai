// C:\Users\acmsh\kanpAI\backend\src\services\lineUsageService.js
import axios from 'axios';
import pool from '../config/db.js';

/**
 * LINE公式アカウントの使用状況を取得するサービス
 */
class LineUsageService {
    constructor() {
        this.accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    }

    /**
     * LINE公式アカウントの配信制限情報を取得
     * 注意: LINE Messaging APIでは配信制限の詳細を直接取得できないため、
     * 現状は配信履歴から推定計算する
     */
    async getUsageStatus(storeId) {
        const client = await pool.connect();
        try {
            // 1. 今月の配信履歴から使用量を計算
            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
            
            const query = `
                SELECT 
                    COUNT(*) as broadcast_count,
                    SUM(recipient_count) as total_recipients
                FROM line_broadcasts 
                WHERE store_id = $1 
                AND DATE_TRUNC('month', sent_at) = DATE_TRUNC('month', CURRENT_DATE)
                AND delivery_status = 'sent';
            `;
            
            const result = await client.query(query, [storeId]);
            const usage = result.rows[0];
            
            // 2. 友だち数を取得（実際のAPIから取得する場合）
            let friendsCount = 1250; // デフォルト値（実際にはLINE APIから取得）
            
            try {
                // LINE公式アカウントの友だち数取得は制限があるため、
                // 現状はDBに保存された値を使用
                const friendsQuery = `
                    SELECT line_friends_count 
                    FROM stores 
                    WHERE id = $1;
                `;
                const friendsResult = await client.query(friendsQuery, [storeId]);
                if (friendsResult.rows[0]?.line_friends_count) {
                    friendsCount = friendsResult.rows[0].line_friends_count;
                }
            } catch (error) {
                console.warn('友だち数の取得に失敗、デフォルト値を使用:', error.message);
            }
            
            // 3. プラン情報を取得
            const planInfo = await this.getCurrentPlan(storeId);
            
            // 4. 使用量を計算
            const totalMessagesSent = parseInt(usage.total_recipients || 0);
            const broadcastCount = parseInt(usage.broadcast_count || 0);
            
            // 5. LINE公式アカウントのプラン別制限
            const linePlans = {
                'free': { limit: 500, name: 'フリープラン' },
                'light': { limit: 15000, name: 'ライトプラン' },
                'standard': { limit: 45000, name: 'スタンダードプラン' }
            };
            
            // 現在のLINEプランを推定（実際にはAPIで取得）
            let currentLinePlan = 'light'; // デフォルト
            if (totalMessagesSent < 500) currentLinePlan = 'free';
            else if (totalMessagesSent < 15000) currentLinePlan = 'light';
            else currentLinePlan = 'standard';
            
            const lineLimit = linePlans[currentLinePlan].limit;
            const usagePercentage = (totalMessagesSent / lineLimit) * 100;
            
            // 6. アラートレベルを決定
            let alertLevel = 'normal';
            if (usagePercentage >= 100) alertLevel = 'critical';
            else if (usagePercentage >= 95) alertLevel = 'warning';
            else if (usagePercentage >= 80) alertLevel = 'attention';
            
            return {
                currentPlan: planInfo,
                lineOfficialPlan: {
                    name: linePlans[currentLinePlan].name,
                    limit: lineLimit,
                    used: totalMessagesSent,
                    remaining: Math.max(0, lineLimit - totalMessagesSent),
                    usagePercentage: Math.min(100, usagePercentage),
                    alertLevel
                },
                friendsCount,
                thisMonthStats: {
                    broadcastCount,
                    totalMessagesSent,
                    canSendToAllFriends: (lineLimit - totalMessagesSent) >= friendsCount
                }
            };
            
        } finally {
            client.release();
        }
    }
    
    /**
     * 店舗の現在のkanpAIプランを取得
     */
    async getCurrentPlan(storeId) {
        const client = await pool.connect();
        try {
            const query = `
                SELECT p.plan_name, p.line_broadcasts_limit
                FROM plans p
                JOIN store_subscriptions ss ON p.id = ss.plan_id
                WHERE ss.store_id = $1 AND ss.status = 'active';
            `;
            const result = await client.query(query, [storeId]);
            
            if (result.rows.length === 0) {
                return { plan_name: 'エントリープラン', line_broadcasts_limit: null };
            }
            
            return result.rows[0];
        } finally {
            client.release();
        }
    }
    
    /**
     * 配信前の制限チェック
     */
    async checkBeforeBroadcast(storeId, recipientCount) {
        const usageStatus = await this.getUsageStatus(storeId);
        const { lineOfficialPlan, friendsCount } = usageStatus;
        
        const afterSendUsage = lineOfficialPlan.used + recipientCount;
        const afterSendPercentage = (afterSendUsage / lineOfficialPlan.limit) * 100;
        
        return {
            canSend: afterSendUsage <= lineOfficialPlan.limit,
            willExceed: afterSendUsage > lineOfficialPlan.limit,
            currentUsage: lineOfficialPlan.used,
            afterSendUsage,
            remaining: lineOfficialPlan.remaining,
            afterSendRemaining: Math.max(0, lineOfficialPlan.limit - afterSendUsage),
            usagePercentage: lineOfficialPlan.usagePercentage,
            afterSendPercentage: Math.min(100, afterSendPercentage),
            recipientCount,
            friendsCount,
            lineOfficialPlan
        };
    }
}

export default new LineUsageService();
