// C:\Users\acmsh\kanpAI\frontend\src\components\MenuManagementPage.js
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MenuList from './MenuList';

const MenuManagementPage = ({ storeId }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [activeAction, setActiveAction] = useState('list');

    useEffect(() => {
        const action = searchParams.get('action');
        if (action && ['add', 'edit', 'price', 'delete', 'list'].includes(action)) {
            setActiveAction(action);
        }
    }, [searchParams]);

    const handleBackToDashboard = () => {
        navigate('/');
    };

    const getPageTitle = () => {
        switch (activeAction) {
            case 'add': return '🍽️ メニュー追加';
            case 'edit': return '📝 メニュー編集'; 
            case 'price': return '💰 価格変更';
            case 'delete': return '🗑️ メニュー削除';
            default: return '📋 メニュー管理';
        }
    };

    const getActionMessage = () => {
        switch (activeAction) {
            case 'add': return '新しいメニューを追加します';
            case 'edit': return 'メニュー情報を編集します'; 
            case 'price': return 'メニューの価格を変更します';
            case 'delete': return '不要なメニューを削除します';
            default: return 'メニューの一覧表示・管理を行います';
        }
    };

    return (
        <div className="App-container">
            {/* ヘッダー */}
            <div style={{
                padding: '20px 0',
                borderBottom: '1px solid var(--color-border)',
                marginBottom: '20px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '12px'
                }}>
                    <button
                        onClick={handleBackToDashboard}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'var(--color-border)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontFamily: 'var(--font-body)',
                            color: 'var(--color-text)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'var(--color-accent)';
                            e.target.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'var(--color-border)';
                            e.target.style.color = 'var(--color-text)';
                        }}
                    >
                        ← ダッシュボードに戻る
                    </button>
                    
                    <h1 style={{
                        margin: 0,
                        fontSize: '1.8rem',
                        color: 'var(--color-text)',
                        fontFamily: 'var(--font-title)'
                    }}>
                        {getPageTitle()}
                    </h1>
                </div>
                
                <p style={{
                    margin: 0,
                    color: 'var(--color-text-secondary)',
                    fontSize: '1rem'
                }}>
                    {getActionMessage()}
                </p>
            </div>

            {/* アクションタブ */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '20px',
                flexWrap: 'wrap'
            }}>
                {[
                    { key: 'list', label: '📋 一覧', color: 'var(--color-primary)' },
                    { key: 'add', label: '➕ 追加', color: 'var(--color-positive)' },
                    { key: 'edit', label: '📝 編集', color: 'var(--color-primary)' },
                    { key: 'price', label: '💰 価格', color: 'var(--color-accent)' },
                    { key: 'delete', label: '🗑️ 削除', color: 'var(--color-negative)' }
                ].map(action => (
                    <button
                        key={action.key}
                        onClick={() => {
                            setActiveAction(action.key);
                            navigate(`/menu-management?action=${action.key}`);
                        }}
                        style={{
                            padding: '10px 16px',
                            backgroundColor: activeAction === action.key ? action.color : 'var(--color-card)',
                            color: activeAction === action.key ? 'white' : 'var(--color-text)',
                            border: `2px solid ${activeAction === action.key ? action.color : 'var(--color-border)'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontFamily: 'var(--font-body)',
                            fontWeight: '600',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (activeAction !== action.key) {
                                e.target.style.borderColor = action.color;
                                e.target.style.backgroundColor = `${action.color}10`;
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (activeAction !== action.key) {
                                e.target.style.borderColor = 'var(--color-border)';
                                e.target.style.backgroundColor = 'var(--color-card)';
                            }
                        }}
                    >
                        {action.label}
                    </button>
                ))}
            </div>

            {/* アクション別メッセージ */}
            {activeAction !== 'list' && (
                <div style={{
                    padding: '16px',
                    backgroundColor: 'rgba(58, 105, 185, 0.08)',
                    borderRadius: '8px',
                    border: '1px solid rgba(58, 105, 185, 0.15)',
                    marginBottom: '20px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'var(--color-primary)',
                        fontWeight: '600'
                    }}>
                        ℹ️ {activeAction === 'add' && 'メニュー追加モード'}
                        {activeAction === 'edit' && 'メニュー編集モード'}
                        {activeAction === 'price' && '価格変更モード'}
                        {activeAction === 'delete' && 'メニュー削除モード'}
                    </div>
                    <p style={{ 
                        margin: '8px 0 0 0', 
                        fontSize: '0.9rem',
                        color: 'var(--color-text-secondary)'
                    }}>
                        {activeAction === 'add' && '下のフォームから新しいメニューを追加してください。'}
                        {activeAction === 'edit' && '編集したいメニューの「編集」ボタンをクリックしてください。'}
                        {activeAction === 'price' && '価格を変更したいメニューの「編集」ボタンをクリックしてください。'}
                        {activeAction === 'delete' && '削除したいメニューの「削除」ボタンをクリックしてください。'}
                    </p>
                </div>
            )}

            {/* メニューリストコンポーネント */}
            <MenuList storeId={storeId} initialAction={activeAction} />
        </div>
    );
};

export default MenuManagementPage;