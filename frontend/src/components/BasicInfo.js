// C:\Users\acmsh\kanpAI\frontend\src\components\BasicInfo.js
import React from 'react';

const InfoRow = ({ icon, label, value }) => (
    <div className="info-row">
        <span className="info-icon">{icon}</span>
        <span className="info-label">{label}</span>
        <span className="info-value">{value}</span>
        <button className="edit-button-small">変更</button>
    </div>
);

const BasicInfo = () => {
    return (
        <div className="card basic-info-container">
            <div className="card-header">
                <div className="summary-icon">⚙️</div>
                <h2>店舗基本情報</h2>
            </div>
            <div className="info-list">
                <InfoRow icon="📞" label="電話番号" value="03-1234-5678" />
                <InfoRow icon="📍" label="住所" value="東京都新宿区１－１" />
                <InfoRow icon="💳" label="支払方法" value="現金・カード・PayPay" />
                <InfoRow icon="📝" label="店舗紹介" value="昭和レトロな雰囲気の居酒屋です..." />
            </div>
            <p className="support-note">⚠️ 営業時間・定休日の変更はサポートまでご連絡ください（Googleカレンダー連携のため）</p>
        </div>
    );
};

export default BasicInfo;
