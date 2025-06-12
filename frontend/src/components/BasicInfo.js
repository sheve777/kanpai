// C:\Users\acmsh\kanpAI\frontend\src\components\BasicInfo.js
import React, { useState } from 'react';

const InfoRow = ({ icon, label, value, editable = true }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);

    const handleSave = () => {
        // TODO: API呼び出しで保存
        console.log(`${label}を${editValue}に変更`);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditValue(value);
        setIsEditing(false);
    };

    return (
        <div className="data-list-item" style={{ 
            padding: '16px',
            marginBottom: '12px',
            flexDirection: 'column',
            alignItems: 'stretch'
        }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: isEditing ? '12px' : '0'
            }}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    flex: 1
                }}>
                    <span style={{ 
                        fontSize: '1.2rem',
                        width: '24px',
                        textAlign: 'center'
                    }}>
                        {icon}
                    </span>
                    <div style={{ flex: 1 }}>
                        <div style={{ 
                            fontSize: '0.85rem', 
                            color: 'var(--color-text)',
                            opacity: 0.7,
                            marginBottom: '2px'
                        }}>
                            {label}
                        </div>
                        {!isEditing ? (
                            <div style={{ 
                                fontSize: '1rem',
                                color: 'var(--color-text)',
                                fontWeight: '500'
                            }}>
                                {value}
                            </div>
                        ) : null}
                    </div>
                </div>
                
                {!isEditing && editable && (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="action-button"
                        style={{ 
                            padding: '6px 12px',
                            fontSize: '0.8rem',
                            minWidth: 'auto'
                        }}
                    >
                        ✏️ 変更
                    </button>
                )}
            </div>

            {isEditing && (
                <div style={{ 
                    display: 'flex', 
                    gap: '8px',
                    alignItems: 'center'
                }}>
                    <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '8px 12px',
                            border: '2px solid var(--color-border)',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            fontFamily: 'var(--font-body)',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                        autoFocus
                    />
                    <button 
                        onClick={handleSave}
                        className="action-button"
                        style={{ 
                            padding: '6px 12px',
                            fontSize: '0.8rem',
                            backgroundColor: 'var(--color-positive)',
                            borderColor: 'var(--color-positive)',
                            color: 'white',
                            minWidth: 'auto'
                        }}
                    >
                        💾
                    </button>
                    <button 
                        onClick={handleCancel}
                        className="action-button"
                        style={{ 
                            padding: '6px 12px',
                            fontSize: '0.8rem',
                            minWidth: 'auto'
                        }}
                    >
                        ❌
                    </button>
                </div>
            )}
        </div>
    );
};

const BasicInfo = () => {
    return (
        <div className="card basic-info-container">
            <div className="card-header">
                <div className="summary-icon">🏪</div>
                <h2>店舗基本情報</h2>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
                <InfoRow 
                    icon="📞" 
                    label="電話番号" 
                    value="03-1234-5678" 
                />
                <InfoRow 
                    icon="📍" 
                    label="住所" 
                    value="東京都新宿区歌舞伎町1-1-1" 
                />
                <InfoRow 
                    icon="💳" 
                    label="支払い方法" 
                    value="現金・各種カード・PayPay・LINE Pay" 
                />
                <InfoRow 
                    icon="📝" 
                    label="店舗紹介" 
                    value="昭和レトロな雰囲気が自慢の居酒屋です。新鮮な食材と心温まるおもてなしでお待ちしております。" 
                />
                <InfoRow 
                    icon="🕐" 
                    label="営業時間" 
                    value="17:00 - 24:00（ラストオーダー23:30）" 
                    editable={false}
                />
                <InfoRow 
                    icon="📅" 
                    label="定休日" 
                    value="年中無休" 
                    editable={false}
                />
            </div>

            <div style={{
                padding: '16px',
                backgroundColor: 'rgba(185, 58, 58, 0.08)',
                borderRadius: '8px',
                border: '1px solid rgba(185, 58, 58, 0.15)'
            }}>
                <h4 style={{
                    margin: '0 0 8px 0',
                    color: 'var(--color-accent)',
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    ⚠️ 重要なお知らせ
                </h4>
                <p style={{
                    margin: 0,
                    fontSize: '0.85rem',
                    color: 'var(--color-text)',
                    lineHeight: 1.5
                }}>
                    営業時間・定休日の変更はサポートまでご連絡ください。<br/>
                    Googleカレンダー連携のため、システム側での調整が必要です。
                </p>
            </div>

            <div className="section-divider"></div>

            <div className="action-button-group">
                <button className="secondary-button" style={{ flex: 1 }}>
                    📧 サポートに連絡
                </button>
                <button className="action-button" style={{ flex: 1 }}>
                    🔄 情報を更新
                </button>
            </div>
        </div>
    );
};

export default BasicInfo;