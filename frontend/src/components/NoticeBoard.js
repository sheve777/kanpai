// C:\Users\acmsh\kanpAI\frontend\src\components\NoticeBoard.js
import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig.js';
import { useUsage } from '../contexts/UsageContext';
import { isLocalEnv, logger } from '../utils/environment';
import { mockNotices, mockApiCall } from '../utils/mockData';

const NoticeBoard = ({ storeId }) => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const { usageData, getCachedData } = useUsage();

    // 通知データの取得（実際の実装では複数のAPIから情報を集約）
    const fetchNotices = async () => {
        if (!storeId) return;
        
        try {
            setLoading(true);
            
            // UsageContextからキャッシュされたデータを取得
            const usageResponse = await getCachedData();
            const [dashboardResponse] = await Promise.allSettled([
                api.get(`/api/dashboard/summary?store_id=${storeId}`)
            ]);

            const dynamicNotices = [];

            // 使用量警告の生成
            if (usageResponse) {
                
                // チャットボット使用量警告
                if (usageResponse.usage?.chatbot_responses && usageResponse.limits?.chatbot_responses) {
                    const usage = usageResponse.usage.chatbot_responses;
                    const limit = usageResponse.limits.chatbot_responses;
                    const percentage = (usage / limit) * 100;
                    
                    if (percentage >= 80) {
                        dynamicNotices.push({
                            id: 'chatbot_usage',
                            icon: '🤖',
                            message: `チャットボット使用量: ${percentage.toFixed(0)}%`,
                            badge: percentage >= 95 ? 'error' : 'warning',
                            priority: percentage >= 95 ? 1 : 2
                        });
                    }
                }

                // LINE配信制限警告
                if (usageResponse.lineOfficialStatus?.alertLevel !== 'normal') {
                    const lineStatus = usageResponse.lineOfficialStatus;
                    let message = '';
                    let badgeType = 'info';
                    let priority = 3;

                    switch (lineStatus.alertLevel) {
                        case 'critical':
                            message = 'LINE配信制限に達しました';
                            badgeType = 'error';
                            priority = 1;
                            break;
                        case 'warning':
                            message = 'LINE配信上限まで残りわずかです';
                            badgeType = 'warning';
                            priority = 2;
                            break;
                        case 'attention':
                            message = `LINE配信上限まで残り${(100 - lineStatus.usagePercentage).toFixed(0)}%`;
                            badgeType = 'warning';
                            priority = 3;
                            break;
                    }

                    if (message) {
                        dynamicNotices.push({
                            id: 'line_usage',
                            icon: '📱',
                            message,
                            badge: badgeType,
                            priority
                        });
                    }
                }
            }

            // 静的なお知らせ（重要度の高いもののみ）
            const staticNotices = [];
            
            // 新着レポートの確認
            if (isLocalEnv()) {
                // ローカル環境ではモックデータを使用
                logger.log('🏠 通知データ：モックデータを使用');
                const mockNoticeData = await mockApiCall(mockNotices);
                staticNotices.push(...mockNoticeData.data.map(notice => ({
                    id: notice.id,
                    icon: notice.type === 'new_report' ? '📊' : 
                          notice.type === 'new_reservation' ? '📅' : 
                          notice.type === 'usage_warning' ? '⚠️' : '📢',
                    message: notice.message,
                    badge: notice.priority === 'high' ? 'error' : 
                           notice.priority === 'medium' ? 'warning' : 'info',
                    priority: notice.priority === 'high' ? 1 : 
                             notice.priority === 'medium' ? 2 : 3
                })));
            } else {
                // 本番環境では実際のAPIから新着レポートを確認
                try {
                    const reportResponse = await api.get(`/api/reports/latest?store_id=${storeId}`);
                    if (reportResponse.data.hasNewReport) {
                        staticNotices.push({
                            id: 'new_report',
                            icon: '📊',
                            message: '新しい月次レポートが届いています',
                            badge: 'info',
                            priority: 4
                        });
                    }
                } catch (err) {
                    logger.error('レポート確認エラー:', err);
                }
            }

            // 通知を優先度順にソート
            const allNotices = [...dynamicNotices, ...staticNotices]
                .sort((a, b) => a.priority - b.priority)
                .slice(0, 5); // 最大5件まで表示

            setNotices(allNotices);

        } catch (error) {
            console.error('通知データの取得に失敗しました:', error);
            // エラー時は静的な通知のみ表示
            setNotices([
                {
                    id: 'error',
                    icon: '⚠️',
                    message: '通知データの取得に失敗しました',
                    badge: 'error',
                    priority: 1
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
        
        // 5分ごとに更新
        const interval = setInterval(fetchNotices, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [storeId]);

    const getBadgeClass = (badgeType) => {
        switch (badgeType) {
            case 'error': return 'status-badge error';
            case 'warning': return 'status-badge warning';
            case 'success': return 'status-badge success';
            case 'info': 
            default: return 'status-badge info';
        }
    };

    const getBadgeText = (badgeType) => {
        switch (badgeType) {
            case 'error': return '緊急';
            case 'warning': return '注意';
            case 'success': return '正常';
            case 'info': 
            default: return 'New';
        }
    };

    if (loading) {
        return (
            <div className="card notice-board-container">
                <div className="card-header">
                    <div className="summary-icon">📢</div>
                    <h2>お知らせ・TODO</h2>
                </div>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div className="loading-spinner"></div>
                    <p style={{ marginTop: '10px', color: 'var(--color-text-secondary)' }}>
                        お知らせを確認中...
                    </p>
                </div>
            </div>
        );
    }

    // 重要な通知がない場合は何も表示しない
    if (notices.length === 0) {
        return null;
    }

    return (
        <div className="card notice-board-container">
            <div className="card-header">
                <div className="summary-icon">📢</div>
                <h2>お知らせ・TODO</h2>
                {notices.length > 0 && (
                    <span 
                        className="notification-count"
                        style={{
                            backgroundColor: 'var(--color-accent)',
                            color: 'white',
                            borderRadius: '50%',
                            padding: '4px 8px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            minWidth: '20px',
                            textAlign: 'center'
                        }}
                    >
                        {notices.length}
                    </span>
                )}
            </div>

            <ul className="data-list" style={{ margin: 0 }}>
                {notices.map((notice) => (
                    <li key={notice.id} className="data-list-item">
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            flex: 1,
                            gap: '8px'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>{notice.icon}</span>
                            <span className="item-label" style={{ flex: 1 }}>
                                {notice.message}
                            </span>
                        </div>
                        <span className={getBadgeClass(notice.badge)}>
                            {getBadgeText(notice.badge)}
                        </span>
                    </li>
                ))}
            </ul>

            {notices.length > 0 && (
                <div style={{ 
                    marginTop: '16px', 
                    textAlign: 'center',
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: '16px'
                }}>
                    <button 
                        className="secondary-button"
                        style={{ 
                            fontSize: '0.9rem',
                            padding: '8px 16px'
                        }}
                        onClick={fetchNotices}
                    >
                        🔄 更新
                    </button>
                </div>
            )}
        </div>
    );
};

export default NoticeBoard;