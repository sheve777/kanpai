// C:\Users\acmsh\kanpAI\frontend\src\components\QuickStats.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QuickStats = ({ storeId }) => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 今日の日付をフォーマット
    const formatDate = (date) => {
        const days = ['日', '月', '火', '水', '木', '金', '土'];
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const dayOfWeek = days[date.getDay()];
        return `${month}/${day}(${dayOfWeek})`;
    };

    // 時間を12時間形式でフォーマット
    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        return `${hours}:${minutes}`;
    };

    // 前日比の表示
    const getChangeText = (today, yesterday) => {
        const change = today - yesterday;
        if (change > 0) return `↗️ 前日比+${change}組`;
        if (change < 0) return `↘️ 前日比${change}組`;
        return '→ 前日と同じ';
    };

    // データ取得
    const fetchSummary = async () => {
        if (!storeId) return;
        
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`/api/dashboard/summary?store_id=${storeId}`);
            setSummary(response.data);
        } catch (error) {
            console.error('予約サマリーの取得に失敗しました:', error);
            setError('予約情報の取得に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
        
        // 30秒ごとに自動更新
        const interval = setInterval(fetchSummary, 30000);
        return () => clearInterval(interval);
    }, [storeId]);

    if (loading) {
        return (
            <div className="card quick-stats-container">
                <div className="card-header">
                    <div className="summary-icon">📅</div>
                    <h2>今日の予約 - 読み込み中...</h2>
                </div>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div className="loading-spinner"></div>
                    <p style={{ marginTop: '10px', color: 'var(--color-text-secondary)' }}>
                        予約データを取得中...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card quick-stats-container">
                <div className="card-header">
                    <div className="summary-icon">📅</div>
                    <h2>今日の予約</h2>
                </div>
                <div style={{ 
                    textAlign: 'center', 
                    padding: '20px',
                    backgroundColor: 'rgba(185, 58, 58, 0.08)',
                    borderRadius: '8px',
                    margin: '16px'
                }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>⚠️</div>
                    <p style={{ color: 'var(--color-text)', marginBottom: '15px' }}>{error}</p>
                    <button className="action-button" onClick={fetchSummary}>
                        再読み込み
                    </button>
                </div>
            </div>
        );
    }

    if (!summary) return null;

    const today = new Date();
    const todayFormatted = formatDate(today);
    const changeText = getChangeText(summary.total_groups_today, summary.yesterday_reservations);

    return (
        <div className="card quick-stats-container">
            <div className="card-header">
                <div className="summary-icon">📅</div>
                <h2>今日の予約 {todayFormatted}</h2>
            </div>

            {/* 予約リスト */}
            <div className="reservations-list" style={{ marginBottom: '20px' }}>
                {summary.today_reservations.length === 0 ? (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '30px 20px',
                        backgroundColor: 'rgba(74, 47, 34, 0.05)',
                        borderRadius: '8px',
                        color: 'var(--color-text-secondary)'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📝</div>
                        <p>今日はまだ予約がありません</p>
                        <p style={{ fontSize: '0.9rem' }}>新しい予約をお待ちしています！</p>
                    </div>
                ) : (
                    summary.today_reservations.map((reservation, index) => (
                        <div 
                            key={reservation.id || index}
                            className="reservation-item"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 16px',
                                marginBottom: '8px',
                                backgroundColor: 'var(--color-background)',
                                borderRadius: '8px',
                                border: '1px solid var(--color-border)',
                                gap: '12px'
                            }}
                        >
                            <span style={{ 
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                color: 'var(--color-accent)',
                                minWidth: '50px'
                            }}>
                                🕐 {formatTime(reservation.reservation_time)}
                            </span>
                            <span style={{ 
                                fontWeight: '600',
                                color: 'var(--color-text)',
                                minWidth: '80px'
                            }}>
                                {reservation.customer_name}様
                            </span>
                            <span style={{ 
                                color: 'var(--color-text)',
                                minWidth: '40px'
                            }}>
                                {reservation.party_size}名
                            </span>
                            {reservation.seat_type_name && (
                                <span style={{ 
                                    fontSize: '0.85rem',
                                    color: 'var(--color-text-secondary)',
                                    backgroundColor: 'rgba(74, 47, 34, 0.1)',
                                    padding: '2px 8px',
                                    borderRadius: '12px'
                                }}>
                                    {reservation.seat_type_name}
                                </span>
                            )}
                            {/* アラート表示 */}
                            {reservation.alerts && reservation.alerts.length > 0 && (
                                <div style={{ marginLeft: 'auto' }}>
                                    {reservation.alerts.map((alert, alertIndex) => (
                                        <span 
                                            key={alertIndex}
                                            style={{ 
                                                fontSize: '0.8rem',
                                                color: alert.type === 'large_party' ? 'var(--color-accent)' : 'var(--color-positive)',
                                                backgroundColor: alert.type === 'large_party' ? 'rgba(185, 58, 58, 0.1)' : 'rgba(34, 139, 34, 0.1)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                marginLeft: '4px'
                                            }}
                                            title={alert.message}
                                        >
                                            {alert.type === 'large_party' ? '👥' : '📝'}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* サマリー */}
            {summary.today_reservations.length > 0 && (
                <div 
                    className="reservation-summary"
                    style={{
                        padding: '16px',
                        backgroundColor: 'rgba(185, 58, 58, 0.08)',
                        borderRadius: '8px',
                        marginBottom: '20px'
                    }}
                >
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                    }}>
                        <span style={{ 
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: 'var(--color-text)'
                        }}>
                            📊 本日予約: {summary.total_groups_today}組 {summary.total_guests_today}名
                        </span>
                    </div>
                    <div style={{ 
                        fontSize: '0.9rem',
                        color: 'var(--color-text-secondary)'
                    }}>
                        {changeText}
                    </div>
                </div>
            )}

            {/* アクションボタン */}
            <div className="quick-actions" style={{ 
                display: 'flex', 
                gap: '12px',
                marginTop: '16px'
            }}>
                <button 
                    className="secondary-button" 
                    style={{ flex: 1 }}
                    onClick={() => {
                        // TODO: 明日の予約ページへの遷移
                        console.log('明日の予約ページへ');
                    }}
                >
                    📅 明日の予約
                </button>
                <button 
                    className="action-button" 
                    style={{ flex: 1 }}
                    onClick={() => {
                        // TODO: 予約管理ページへの遷移
                        console.log('予約管理ページへ');
                    }}
                >
                    📋 予約管理
                </button>
            </div>
        </div>
    );
};

export default QuickStats;