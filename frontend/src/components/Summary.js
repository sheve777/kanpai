// C:\Users\acmsh\kanpAI\frontend\src\components\Summary.js
import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig.js';

const SummaryCard = ({ title, value, change, icon, trend }) => {
    const isPositive = change >= 0;
    const changeText = isPositive ? `+${change}%` : `${change}%`;
    const trendClass = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
    
    return (
        <div className="info-card">
            <div className="info-icon">{icon}</div>
            <div className="info-title">{title}</div>
            <div className="stat-number">{value}</div>
            <span className={`stat-trend ${trendClass}`}>
                昨日比: {changeText}
            </span>
        </div>
    );
};

const Summary = ({ storeId }) => {
    const [summary, setSummary] = useState(null);
    useEffect(() => {
        const fetchSummary = async () => {
            if (!storeId) return;
            try {
                const response = await api.get(`/api/dashboard/summary?store_id=${storeId}`);
                setSummary(response.data);
            } catch (error) { console.error("サマリーの取得に失敗しました:", error); }
        };
        fetchSummary();
    }, [storeId]);
    if (!summary) return null;

    const { today_reservations, yesterday_reservations } = summary;
    const total_groups_today = summary.today_reservations?.length || 0;
    
    let reservationChange = 0;
    if (yesterday_reservations > 0) {
        reservationChange = Math.round(((total_groups_today - yesterday_reservations) / yesterday_reservations) * 100);
    } else if (total_groups_today > 0) {
        reservationChange = 100;
    }

    return (
        <div className="summary-container card">
            <div className="card-header">
                <div className="summary-icon">📈</div>
                <h2>今日の店舗状況</h2>
            </div>
            
            <div className="info-grid">
                <SummaryCard 
                    title="本日の予約件数" 
                    value={`${total_groups_today}`} 
                    change={reservationChange} 
                    icon="📅" 
                />
                <div className="info-card">
                    <div className="info-icon">👥</div>
                    <div className="info-title">予約人数</div>
                    <div className="stat-number">
                        {today_reservations?.reduce((total, res) => total + res.party_size, 0) || 0}
                    </div>
                    <span className="stat-trend neutral">本日合計</span>
                </div>
                <div className="info-card">
                    <div className="info-icon">💬</div>
                    <div className="info-title">チャット対応</div>
                    <div className="stat-number">12</div>
                    <span className="stat-trend positive">昨日比: +25%</span>
                </div>
            </div>

            <div className="section-divider"></div>

            <div style={{ marginTop: '20px' }}>
                <h4 style={{ 
                    margin: '0 0 16px 0', 
                    color: 'var(--color-text)', 
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    📢 お知らせ・TODO
                </h4>
                <ul className="data-list">
                    <li className="data-list-item">
                        <span className="item-label">✨ 新しい月次レポートが届いています</span>
                        <span className="status-badge info">New</span>
                    </li>
                    <li className="data-list-item">
                        <span className="item-label">⚠️ LINE配信の上限まであと3回です</span>
                        <span className="status-badge warning">注意</span>
                    </li>
                    <li className="data-list-item">
                        <span className="item-label">🎯 チャットボット使用量: 75%</span>
                        <span className="status-badge success">正常</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};
export default Summary;
