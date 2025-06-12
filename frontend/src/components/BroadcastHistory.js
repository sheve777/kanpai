// C:\Users\acmsh\kanpAI\frontend\src\components\BroadcastHistory.js
import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig.js';

const BroadcastHistory = ({ storeId }) => {
    const [history, setHistory] = useState([]);
    useEffect(() => {
        const fetchHistory = async () => {
            if (!storeId) return;
            try {
                const response = await api.get(`/api/line/history?store_id=${storeId}`);
                setHistory(response.data);
            } catch (error) { console.error("配信履歴の取得に失敗しました:", error); }
        };
        fetchHistory();
    }, [storeId]);

    return (
        <div className="card broadcast-history-container">
            <div className="card-header">
                <div className="summary-icon">📝</div>
                <h2>最近の配信履歴</h2>
            </div>
            <ul className="history-list">
                {history.map(item => (
                    <li key={item.id}>
                        <span className="history-date">{new Date(item.sent_at).toLocaleDateString()}</span>
                        <p className="history-text">{item.message_text}</p>
                        {item.image_url && <span className="history-image-tag">画像あり</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
};
export default BroadcastHistory;
