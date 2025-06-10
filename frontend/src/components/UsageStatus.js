// C:\Users\acmsh\kanpAI\frontend\src\components\UsageStatus.js
import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig.js';

const ProgressBar = ({ label, usage, limit, alertLevel = 'normal' }) => {
    const percentage = limit > 0 ? Math.min(100, (usage / limit) * 100) : 0;
    
    // アラートレベルに応じたスタイル
    const getProgressStyle = () => {
        switch (alertLevel) {
            case 'critical': return { backgroundColor: '#ff4757', color: 'white' };
            case 'warning': return { backgroundColor: '#ff6b35', color: 'white' };
            case 'attention': return { backgroundColor: '#ffa502', color: 'white' };
            default: return { backgroundColor: '#2ed573', color: 'white' };
        }
    };

    const progressStyle = getProgressStyle();

    return (
        <div className="progress-bar-container">
            <div className="progress-label">
                <span>{label}</span>
                <span>{usage} / {limit === null ? '無制限' : limit.toLocaleString()}</span>
            </div>
            <div className="progress-bar">
                <div 
                    className="progress-bar-fill" 
                    style={{ 
                        width: `${percentage}%`,
                        backgroundColor: progressStyle.backgroundColor
                    }}
                ></div>
            </div>
            <div className="progress-percentage" style={{ color: progressStyle.backgroundColor }}>
                {percentage.toFixed(1)}%
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
            
            <div className="usage-stats">
                <div className="stat-item">
                    <span className="stat-label">友だち数</span>
                    <span className="stat-value">{friendsCount.toLocaleString()}名</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">今月の配信回数</span>
                    <span className="stat-value">{monthlyStats?.broadcastCount || 0}回</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">残り配信可能数</span>
                    <span className="stat-value">{lineStatus.remaining.toLocaleString()}通</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">全員配信可能回数</span>
                    <span className="stat-value">
                        {monthlyStats?.canSendToAllFriends ? 
                            `あと${Math.floor(lineStatus.remaining / friendsCount)}回` : 
                            '制限超過'
                        }
                    </span>
                </div>
            </div>

            {lineStatus.alertLevel !== 'normal' && (
                <div className="usage-recommendations">
                    <h5>💡 解決方法</h5>
                    <ul>
                        <li>
                            <strong>LINE公式プランをアップグレード</strong>
                            <br />
                            <small>kanpAI代行サービス: 10,000円（税込）</small>
                        </li>
                        <li>
                            <strong>来月1日の制限リセットまで待つ</strong>
                            <br />
                            <small>毎月1日に自動的にリセットされます</small>
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
                    <div className="summary-icon">📊</div>
                    <h2>使用状況を読み込み中...</h2>
                </div>
            </div>
        );
    }

    if (!status) return null;

    return (
        <div className="card usage-status-container">
            <div className="card-header">
                <div className="summary-icon">📊</div>
                <h2>現在のプラン: {status.plan_name}</h2>
            </div>
            
            {/* LINE配信制限アラート */}
            <LineUsageAlert 
                lineStatus={status.lineOfficialStatus}
                friendsCount={status.friendsCount}
            />
            
            <div className="usage-details">
                {/* kanpAI プランの使用状況 */}
                <div className="kanpai-usage">
                    <h4>🤖 kanpAI プラン使用状況</h4>
                    <ProgressBar 
                        label="今月のLINE配信" 
                        usage={status.usage.line_broadcasts} 
                        limit={status.limits.line_broadcasts} 
                    />
                    <ProgressBar 
                        label="メニュー操作" 
                        usage={status.usage.menu_operations} 
                        limit={status.limits.menu_operations} 
                    />
                </div>

                {/* LINE公式アカウント使用状況 */}
                <div className="line-official-section">
                    <div className="section-header" onClick={() => setShowLineDetails(!showLineDetails)}>
                        <h4>📱 LINE公式アカウント</h4>
                        <span className="toggle-icon">{showLineDetails ? '▼' : '▶'}</span>
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
