// C:\Users\acmsh\kanpAI\frontend\src\components\MenuWidget.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig.js';
import { useUsage } from '../contexts/UsageContext';

const MenuWidget = ({ storeId }) => {
    const navigate = useNavigate();
    const [menuStats, setMenuStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { getCachedData } = useUsage();

    useEffect(() => {
        fetchMenuStats();
    }, [storeId]);

    const fetchMenuStats = async () => {
        if (!storeId) return;
        
        try {
            setLoading(true);
            // メニュー統計と使用量を取得
            const [menuResponse, usageData] = await Promise.allSettled([
                api.get(`/api/stores/${storeId}/menus`),
                getCachedData()
            ]);

            let stats = {
                totalMenus: 0,
                operationsUsed: 0,
                operationsLimit: 0,
                recentOperations: []
            };

            if (menuResponse.status === 'fulfilled') {
                stats.totalMenus = menuResponse.value.data.length;
            }

            if (usageData.status === 'fulfilled' && usageData.value) {
                stats.operationsUsed = usageData.value.usage?.menu_operations || 0;
                stats.operationsLimit = usageData.value.limits?.menu_operations || 0;
            }

            // TODO: 最近の操作履歴を取得するAPIを実装
            stats.recentOperations = [
                { date: '6/10', action: '生ビール価格変更', detail: '500円→550円' },
                { date: '6/8', action: 'チーズタッカルビ追加', detail: '' }
            ];

            setMenuStats(stats);
        } catch (error) {
            console.error('メニュー統計の取得に失敗しました:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleActionClick = (action) => {
        console.log(`メニュー管理へ遷移: ${action}`);
        navigate(`/menu-management?action=${action}`);
    };

    const getUsageColor = () => {
        if (menuStats.operationsLimit === 0) return 'var(--color-text-secondary)';
        const percentage = (menuStats.operationsUsed / menuStats.operationsLimit) * 100;
        if (percentage >= 80) return 'var(--color-negative)';
        if (percentage >= 60) return 'var(--color-accent)';
        return 'var(--color-positive)';
    };

    if (loading) {
        return (
            <div className="card menu-widget-container">
                <div className="card-header">
                    <div className="summary-icon">🍽️</div>
                    <h2>メニュー管理</h2>
                </div>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div className="loading-spinner"></div>
                    <p style={{ marginTop: '10px', color: 'var(--color-text-secondary)' }}>
                        メニュー情報を取得中...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="card menu-widget-container">
            <div className="card-header">
                <div className="summary-icon">🍽️</div>
                <h2>メニュー管理</h2>
            </div>

            {/* 統計情報 */}
            <div className="menu-stats" style={{
                padding: '16px',
                backgroundColor: 'rgba(185, 58, 58, 0.08)',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'center'
            }}>
                <div style={{ 
                    fontSize: '1.1rem',
                    marginBottom: '8px',
                    color: 'var(--color-text)'
                }}>
                    📊 登録メニュー: {menuStats.totalMenus}品
                </div>
                <div style={{ 
                    fontSize: '0.9rem',
                    color: getUsageColor(),
                    fontWeight: '600'
                }}>
                    今月の操作: {menuStats.operationsUsed}/{menuStats.operationsLimit === 0 ? '無制限' : menuStats.operationsLimit}回
                </div>
            </div>

            {/* アクションボタングリッド */}
            <div className="menu-actions-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                marginBottom: '20px'
            }}>
                <button 
                    className="menu-action-button"
                    onClick={() => handleActionClick('add')}
                    style={{
                        padding: '16px 12px',
                        backgroundColor: 'var(--color-card)',
                        border: '2px solid var(--color-border)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        fontFamily: 'var(--font-body)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.borderColor = 'var(--color-positive)';
                        e.target.style.backgroundColor = 'rgba(34, 139, 34, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.borderColor = 'var(--color-border)';
                        e.target.style.backgroundColor = 'var(--color-card)';
                    }}
                >
                    <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>➕</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>メニュー追加</div>
                </button>

                <button 
                    className="menu-action-button"
                    onClick={() => handleActionClick('edit')}
                    style={{
                        padding: '16px 12px',
                        backgroundColor: 'var(--color-card)',
                        border: '2px solid var(--color-border)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        fontFamily: 'var(--font-body)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.borderColor = 'var(--color-primary)';
                        e.target.style.backgroundColor = 'rgba(58, 105, 185, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.borderColor = 'var(--color-border)';
                        e.target.style.backgroundColor = 'var(--color-card)';
                    }}
                >
                    <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>📝</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>メニュー編集</div>
                </button>

                <button 
                    className="menu-action-button"
                    onClick={() => handleActionClick('price')}
                    style={{
                        padding: '16px 12px',
                        backgroundColor: 'var(--color-card)',
                        border: '2px solid var(--color-border)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        fontFamily: 'var(--font-body)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.borderColor = 'var(--color-accent)';
                        e.target.style.backgroundColor = 'rgba(185, 58, 58, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.borderColor = 'var(--color-border)';
                        e.target.style.backgroundColor = 'var(--color-card)';
                    }}
                >
                    <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>💰</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>価格変更</div>
                </button>

                <button 
                    className="menu-action-button"
                    onClick={() => handleActionClick('delete')}
                    style={{
                        padding: '16px 12px',
                        backgroundColor: 'var(--color-card)',
                        border: '2px solid var(--color-border)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        fontFamily: 'var(--font-body)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.borderColor = 'var(--color-negative)';
                        e.target.style.backgroundColor = 'rgba(178, 34, 34, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.borderColor = 'var(--color-border)';
                        e.target.style.backgroundColor = 'var(--color-card)';
                    }}
                >
                    <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🗑️</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>メニュー削除</div>
                </button>
            </div>

            {/* 最近の操作履歴 */}
            {menuStats.recentOperations.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ 
                        margin: '0 0 12px 0',
                        color: 'var(--color-text)',
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        📝 最近の操作
                    </h4>
                    <ul className="data-list" style={{ margin: 0 }}>
                        {menuStats.recentOperations.map((operation, index) => (
                            <li key={index} className="data-list-item">
                                <div style={{ flex: 1 }}>
                                    <span className="item-label">
                                        {operation.date} {operation.action}
                                    </span>
                                    {operation.detail && (
                                        <div style={{ 
                                            fontSize: '0.8rem', 
                                            color: 'var(--color-text-secondary)',
                                            marginTop: '2px'
                                        }}>
                                            {operation.detail}
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* メニュー管理画面へのリンク */}
            <div style={{ 
                borderTop: '1px solid var(--color-border)',
                paddingTop: '16px'
            }}>
                <button 
                    className="action-button"
                    style={{ width: '100%' }}
                    onClick={() => handleActionClick('list')}
                >
                    📋 メニュー管理画面へ
                </button>
            </div>
        </div>
    );
};

export default MenuWidget;