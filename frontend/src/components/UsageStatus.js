// C:\Users\acmsh\kanpAI\frontend\src\components\UsageStatus.js
import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig.js';

const ProgressBar = ({ label, usage, limit, alertLevel = 'normal' }) => {
    const percentage = limit > 0 ? Math.min(100, (usage / limit) * 100) : 0;
    
    // アラートレベルに応じたスタイル
    const getProgressStyle = () => {
        switch (alertLevel) {
            case 'critical': return { backgroundColor: 'var(--color-negative)', badge: 'error' };
            case 'warning': return { backgroundColor: '#ff6b35', badge: 'warning' };
            case 'attention': return { backgroundColor: '#ffa502', badge: 'warning' };
            default: return { backgroundColor: 'var(--color-positive)', badge: 'success' };
        }
    };

    const progressStyle = getProgressStyle();

    return (
        <div className="info-card" style={{ padding: '16px', marginBottom: '16px' }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '12px'
            }}>
                <span style={{ 
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: 'var(--color-text)'
                }}>
                    {label}
                </span>
                <span className={`status-badge ${progressStyle.badge}`}>
                    {usage.toLocaleString()} / {limit === null ? '無制限' : limit.toLocaleString()}
                </span>
            </div>
            
            <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'rgba(74, 47, 34, 0.1)',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '8px'
            }}>
                <div style={{ 
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: progressStyle.backgroundColor,
                    borderRadius: '4px',
                    transition: 'width 0.5s ease'
                }}></div>
            </div>
            
            <div style={{ 
                textAlign: 'center',
                fontSize: '0.8rem',
                color: progressStyle.backgroundColor,
                fontWeight: '600'
            }}>
                {percentage.toFixed(1)}% 使用中
            </div>
        </div>
    );
};

const LineUsageAlert = ({ lineStatus, friendsCount }) => {
    if (!lineStatus || lineStatus.alertLevel === 'normal') return null;

    const getAlertConfig = () => {
        switch (lineStatus.alertLevel) {
            case 'critical':
                return {
                    icon: '🚨',
                    title: 'LINE公式アカウントからのお知らせ',
                    message: 'LINE社の月間配信制限に達したため、今月の配信ができません',
                    className: 'alert-critical',
                    buttonText: '解決方法を見る'
                };
            case 'warning':
                return {
                    icon: '⚠️',
                    title: 'LINE公式の配信上限まで残りわずかです',
                    message: `友だち${friendsCount.toLocaleString()}名への配信はあと${Math.floor(lineStatus.remaining / friendsCount)}回程度可能です`,
                    className: 'alert-warning',
                    buttonText: '今すぐ確認'
                };
            case 'attention':
                return {
                    icon: '💡',
                    title: `LINE公式の配信上限まで残り${(100 - lineStatus.usagePercentage).toFixed(0)}%です`,
                    message: 'プランのアップグレードをご検討ください',
                    className: 'alert-attention',
                    buttonText: '詳細'
                };
            default:
                return null;
        }
    };

    const alertConfig = getAlertConfig();
    if (!alertConfig) return null;

    return (
        <div className={`line-usage-alert ${alertConfig.className}`}>
            <div className="alert-header">
                <span className="alert-icon">{alertConfig.icon}</span>
                <span className="alert-title">{alertConfig.title}</span>
            </div>
            <div className="alert-message">{alertConfig.message}</div>
            <button className="alert-button">
                {alertConfig.buttonText}
            </button>
        </div>
    );
};

const LineUsageDetails = ({ lineStatus, friendsCount, monthlyStats }) => {
    if (!lineStatus) return null;

    return (
        <div className="line-usage-details">
            <div className="usage-header">
                <h4>📱 LINE公式アカウントの使用状況</h4>
                <span className="plan-badge">{lineStatus.name}</span>
            </div>
            
            <ProgressBar 
                label="月間配信数"
                usage={lineStatus.used}
                limit={lineStatus.limit}
                alertLevel={lineStatus.alertLevel}
            />
            
            <div className="info-grid">
                <div className="info-card">
                    <div className="info-icon">👥</div>
                    <div className="info-title">友だち数</div>
                    <div className="stat-number">{friendsCount.toLocaleString()}</div>
                    <span className="stat-trend neutral">名</span>
                </div>
                <div className="info-card">
                    <div className="info-icon">📤</div>
                    <div className="info-title">今月の配信回数</div>
                    <div className="stat-number">{monthlyStats?.broadcastCount || 0}</div>
                    <span className="stat-trend neutral">回</span>
                </div>
                <div className="info-card">
                    <div className="info-icon">📋</div>
                    <div className="info-title">残り配信可能数</div>
                    <div className="stat-number">{lineStatus.remaining.toLocaleString()}</div>
                    <span className="stat-trend neutral">通</span>
                </div>
                <div className="info-card">
                    <div className="info-icon">🎯</div>
                    <div className="info-title">全員配信可能回数</div>
                    <div className="stat-number">
                        {monthlyStats?.canSendToAllFriends ? 
                            Math.floor(lineStatus.remaining / friendsCount) : 
                            0
                        }
                    </div>
                    <span className={`stat-trend ${monthlyStats?.canSendToAllFriends ? 'neutral' : 'negative'}`}>
                        {monthlyStats?.canSendToAllFriends ? '回' : '制限超過'}
                    </span>
                </div>
            </div>

            {lineStatus.alertLevel !== 'normal' && (
                <div style={{
                    marginTop: '20px',
                    padding: '16px',
                    backgroundColor: 'rgba(185, 58, 58, 0.08)',
                    borderRadius: '8px',
                    border: '1px solid rgba(185, 58, 58, 0.15)'
                }}>
                    <h5 style={{
                        margin: '0 0 12px 0',
                        color: 'var(--color-accent)',
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        💡 解決方法
                    </h5>
                    <ul className="data-list" style={{ padding: 0 }}>
                        <li className="data-list-item" style={{ marginBottom: '8px' }}>
                            <div style={{ flex: 1 }}>
                                <span className="item-label">LINE公式プランをアップグレード</span>
                                <div style={{ 
                                    fontSize: '0.8rem', 
                                    color: 'var(--color-text)', 
                                    opacity: 0.7,
                                    marginTop: '2px'
                                }}>
                                    kanpAI代行サービス: 10,000円（税込）
                                </div>
                            </div>
                            <button className="secondary-button" style={{ 
                                padding: '6px 12px',
                                fontSize: '0.8rem'
                            }}>
                                📞 依頼する
                            </button>
                        </li>
                        <li className="data-list-item">
                            <div style={{ flex: 1 }}>
                                <span className="item-label">来月1日の制限リセットまで待つ</span>
                                <div style={{ 
                                    fontSize: '0.8rem', 
                                    color: 'var(--color-text)', 
                                    opacity: 0.7,
                                    marginTop: '2px'
                                }}>
                                    毎月1日に自動的にリセットされます
                                </div>
                            </div>
                            <span className="status-badge info">
                                無料
                            </span>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

const UsageStatus = ({ storeId }) => {
    const [status, setStatus] = useState(null);
    const [showLineDetails, setShowLineDetails] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            if (!storeId) return;
            
            setLoading(true);
            try {
                const response = await api.get(`/api/usage/status?store_id=${storeId}`);
                setStatus(response.data);
                
                // LINE制限が警告レベル以上の場合は詳細を自動表示
                if (response.data.lineOfficialStatus?.alertLevel !== 'normal') {
                    setShowLineDetails(true);
                }
                
            } catch (error) { 
                console.error("プラン・利用状況の取得に失敗しました:", error); 
            } finally {
                setLoading(false);
            }
        };
        
        fetchStatus();
        
        // 定期的に更新（5分ごと）
        const interval = setInterval(fetchStatus, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [storeId]);

    if (loading) {
        return (
            <div className="card usage-status-container">
                <div className="card-header">
                    <div className="summary-icon">⚡</div>
                    <h2>使用状況を読み込み中...</h2>
                </div>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="loading-text">
                        <div className="loading-spinner"></div>
                        <span>プラン情報を取得中...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!status) return null;

    return (
        <div className="card usage-status-container">
            <div className="card-header">
                <div className="summary-icon">⚡</div>
                <h2>現在のプラン: {status.plan_name}</h2>
            </div>
            
            {/* LINE配信制限アラート */}
            <LineUsageAlert 
                lineStatus={status.lineOfficialStatus}
                friendsCount={status.friendsCount}
            />
            
            <div style={{ marginBottom: '24px' }}>
                {/* kanpAI プランの使用状況 */}
                <div style={{ marginBottom: '32px' }}>
                    <h4 style={{ 
                        margin: '0 0 16px 0',
                        color: 'var(--color-text)',
                        fontSize: '1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        🤖 kanpAI プラン使用状況
                    </h4>
                    <ProgressBar 
                        label="今月のLINE配信" 
                        usage={status.usage?.line_broadcasts || 0} 
                        limit={status.limits?.line_broadcasts || 100} 
                    />
                    <ProgressBar 
                        label="メニュー操作" 
                        usage={status.usage?.menu_operations || 0} 
                        limit={status.limits?.menu_operations || 50} 
                    />
                    <ProgressBar 
                        label="チャットボット応答" 
                        usage={status.usage?.chatbot_responses || 0} 
                        limit={status.limits?.chatbot_responses || 1000} 
                    />
                </div>

                <div className="section-divider"></div>

                {/* LINE公式アカウント使用状況 */}
                <div>
                    <div 
                        className="action-button" 
                        onClick={() => setShowLineDetails(!showLineDetails)}
                        style={{ 
                            width: '100%',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px'
                        }}
                    >
                        <span>📱 LINE公式アカウント詳細</span>
                        <span style={{ fontSize: '0.8rem' }}>
                            {showLineDetails ? '▼ 閉じる' : '▶ 表示'}
                        </span>
                    </div>
                    
                    {showLineDetails && (
                        <LineUsageDetails 
                            lineStatus={status.lineOfficialStatus}
                            friendsCount={status.friendsCount}
                            monthlyStats={status.monthlyStats}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default UsageStatus;
