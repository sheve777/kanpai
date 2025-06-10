// C:\Users\acmsh\kanpAI\frontend\src\components\Summary.js
import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig.js';

const SummaryCard = ({ title, value, change, icon }) => {
    const isPositive = change >= 0;
    const changeText = isPositive ? `+${change}%` : `${change}%`;
    return (
        <div className="summary-card">
            <div className="summary-icon">{icon}</div>
            <div className="summary-content">
                <p className="summary-title">{title}</p>
                <p className="summary-value">{value}</p>
                <p className={`summary-change ${isPositive ? 'positive' : 'negative'}`}>
                    昨日比: {changeText}
                </p>
            </div>
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
        <div className="summary-container">
            <SummaryCard title="本日の予約件数" value={`${total_groups_today}件`} change={reservationChange} icon="📅" />
            <div className="todo-card">
                <h3>📢 お知らせ・TODO</h3>
                <ul>
                    <li>新しい月次レポートが届いています！</li>
                    <li>LINE配信の上限まであと3回です。</li>
                </ul>
            </div>
        </div>
    );
};
export default Summary;
