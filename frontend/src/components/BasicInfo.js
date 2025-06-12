// C:\Users\acmsh\kanpAI\frontend\src\components\BasicInfo.js
import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig.js';

const InfoRow = ({ icon, label, value, field, onSave, editable = true }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setEditValue(value);
    }, [value]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(field, editValue);
            setIsEditing(false);
        } catch (error) {
            console.error('保存エラー:', error);
        } finally {
            setIsSaving(false);
        }
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
                        disabled={isSaving}
                        className="action-button"
                        style={{ 
                            padding: '6px 12px',
                            fontSize: '0.8rem',
                            backgroundColor: isSaving ? '#ccc' : 'var(--color-positive)',
                            borderColor: isSaving ? '#ccc' : 'var(--color-positive)',
                            color: 'white',
                            minWidth: 'auto',
                            cursor: isSaving ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isSaving ? '...' : '💾'}
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
    const [storeInfo, setStoreInfo] = useState({
        name: '和風ダイニング 雅',
        phone: '03-1234-5678',
        address: '東京都新宿区歌舞伎町1-1-1',
        paymentMethods: '現金・各種カード・PayPay・LINE Pay',
        concept: 'こだわりの日本酒と創作料理を楽しめる隠れ家的な和風ダイニング',
        operatingHours: 'ランチ 11:30-14:30 / ディナー 17:30-23:00 (L.O. 22:30)'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 認証されたstoreIdを取得
    const storeId = localStorage.getItem('kanpai_store_id');

    useEffect(() => {
        fetchStoreInfo();
    }, []);

    const formatOperatingHours = (hoursObj) => {
        if (typeof hoursObj === 'string') {
            return hoursObj; // 既に文字列の場合はそのまま返す
        }
        
        if (typeof hoursObj === 'object' && hoursObj !== null) {
            // オブジェクトの場合は文字列に変換
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            const dayNames = ['月', '火', '水', '木', '金', '土', '日'];
            
            const formatted = days.map((day, index) => {
                if (hoursObj[day]) {
                    return `${dayNames[index]} ${hoursObj[day].open}-${hoursObj[day].close}`;
                }
                return null;
            }).filter(Boolean).join(' / ');
            
            return formatted || 'ランチ 11:30-14:30 / ディナー 17:30-23:00 (L.O. 22:30)';
        }
        
        return 'ランチ 11:30-14:30 / ディナー 17:30-23:00 (L.O. 22:30)'; // デフォルト値
    };

    const fetchStoreInfo = async () => {
        if (!storeId) {
            console.warn('⚠️ storeIdが設定されていません');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await api.get(`/api/stores/${storeId}/info`);
            if (response.data) {
                setStoreInfo({
                    name: response.data.name || storeInfo.name,
                    phone: response.data.phone || storeInfo.phone,
                    address: response.data.address || storeInfo.address,
                    paymentMethods: storeInfo.paymentMethods, // APIから取得できない場合はデフォルト値
                    concept: response.data.concept || storeInfo.concept,
                    operatingHours: formatOperatingHours(response.data.operating_hours) || storeInfo.operatingHours
                });
            }
        } catch (error) {
            console.error('店舗情報の取得に失敗しました:', error);
            setError('店舗情報の取得に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (field, value) => {
        try {
            const updateData = {};
            
            // フィールド名のマッピング
            const fieldMapping = {
                phone: 'phone',
                address: 'address',
                concept: 'concept',
                operatingHours: 'operating_hours'
            };
            
            if (fieldMapping[field]) {
                updateData[fieldMapping[field]] = value;
            }
            
            const response = await api.put(`/api/stores/${storeId}`, updateData);
            
            if (response.data.success) {
                setStoreInfo(prev => ({ ...prev, [field]: value }));
                // 成功メッセージを表示（後でトースト通知に置き換え）
                console.log('情報を更新しました');
            }
        } catch (error) {
            console.error('更新エラー:', error);
            throw error;
        }
    };

    const handleContactSupport = () => {
        // サポート連絡の処理
        console.log('サポートに連絡');
        // TODO: モーダル表示またはメールリンク
    };

    const handleUpdateAllInfo = () => {
        // 全情報更新の処理
        console.log('情報を更新');
        // TODO: 編集モードの一括切り替え
    };

    if (loading) {
        return (
            <div className="card basic-info-container">
                <div style={{ padding: '40px', textAlign: 'center' }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: '16px', color: 'var(--color-text-secondary)' }}>読み込み中...</p>
                </div>
            </div>
        );
    }

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
                    value={storeInfo.phone}
                    field="phone"
                    onSave={handleSave}
                />
                <InfoRow 
                    icon="📍" 
                    label="住所" 
                    value={storeInfo.address}
                    field="address"
                    onSave={handleSave}
                />
                <InfoRow 
                    icon="💳" 
                    label="支払い方法" 
                    value={storeInfo.paymentMethods}
                    field="paymentMethods"
                    onSave={handleSave}
                    editable={false}
                />
                <InfoRow 
                    icon="📝" 
                    label="店舗紹介" 
                    value={storeInfo.concept}
                    field="concept"
                    onSave={handleSave}
                />
                <InfoRow 
                    icon="🕐" 
                    label="営業時間" 
                    value={storeInfo.operatingHours}
                    field="operatingHours"
                    onSave={handleSave}
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
                <button 
                    className="secondary-button" 
                    style={{ flex: 1 }}
                    onClick={handleContactSupport}
                >
                    📧 サポートに連絡
                </button>
                <button 
                    className="action-button" 
                    style={{ flex: 1 }}
                    onClick={handleUpdateAllInfo}
                >
                    🔄 情報を更新
                </button>
            </div>
        </div>
    );
};

export default BasicInfo;