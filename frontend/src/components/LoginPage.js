// C:\Users\acmsh\kanpAI\frontend\src\components\LoginPage.js
import React, { useState } from 'react';
import api from '../utils/axiosConfig.js';

const LoginPage = ({ onLogin }) => {
    const [storeId, setStoreId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 基本的な入力検証
            if (!storeId.trim()) {
                throw new Error('店舗IDを入力してください');
            }
            if (!password.trim()) {
                throw new Error('パスワードを入力してください');
            }

            // ログイン試行（本番環境ではログを削除すること）

            // JWT認証APIを呼び出し
            const response = await api.post('/api/auth/login', { storeId, password });

            console.log('📡 レスポンス受信:', response.status);
            console.log('📦 レスポンスデータ:', response.data);

            if (!response.data.success) {
                throw new Error(response.data.error || 'ログインに失敗しました');
            }

            const data = response.data;

            // 認証成功
            localStorage.setItem('kanpai_store_id', data.store.id);
            localStorage.setItem('kanpai_auth_token', data.token);
            localStorage.setItem('kanpai_store_name', data.store.name);
            
            console.log('✅ LocalStorage保存完了');
            
            // 親コンポーネントに認証成功を通知
            console.log('🔄 親コンポーネントに通知中...');
            onLogin(data.store.id);
        } catch (err) {
            console.error('❌ ログインエラー:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: 'var(--font-body)'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '40px',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                textAlign: 'center'
            }}>
                {/* ロゴ・タイトル */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{
                        fontSize: '3rem',
                        marginBottom: '12px'
                    }}>
                        🍻
                    </div>
                    <h1 style={{
                        margin: '0 0 8px 0',
                        fontSize: '1.8rem',
                        color: 'var(--color-text)',
                        fontFamily: 'var(--font-title)'
                    }}>
                        kanpAI
                    </h1>
                    <p style={{
                        margin: 0,
                        color: 'var(--color-text)',
                        opacity: 0.7,
                        fontSize: '1rem'
                    }}>
                        店舗管理ダッシュボード
                    </p>
                </div>

                {/* ログインフォーム */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: 'var(--color-text)'
                        }}>
                            店舗ID
                        </label>
                        <input
                            type="text"
                            value={storeId}
                            onChange={(e) => setStoreId(e.target.value)}
                            placeholder="例: tanuki-001"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '2px solid var(--color-border)',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontFamily: 'var(--font-body)',
                                outline: 'none',
                                transition: 'border-color 0.3s',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                        />
                    </div>

                    <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: 'var(--color-text)'
                        }}>
                            パスワード
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="パスワードを入力"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '2px solid var(--color-border)',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontFamily: 'var(--font-body)',
                                outline: 'none',
                                transition: 'border-color 0.3s',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                        />
                    </div>

                    {/* エラーメッセージ */}
                    {error && (
                        <div style={{
                            marginBottom: '20px',
                            padding: '12px 16px',
                            backgroundColor: '#ffebee',
                            border: '1px solid #ffcdd2',
                            borderRadius: '6px',
                            color: '#c62828',
                            fontSize: '0.9rem'
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {/* ログインボタン */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: loading ? '#ccc' : 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            fontFamily: 'var(--font-body)',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s',
                            marginBottom: '16px'
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(58, 105, 185, 0.3)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        {loading ? '認証中...' : 'ログイン'}
                    </button>
                </form>

                {/* デモ用ヘルプ */}
                <div style={{
                    padding: '16px',
                    backgroundColor: 'rgba(58, 105, 185, 0.08)',
                    borderRadius: '8px',
                    border: '1px solid rgba(58, 105, 185, 0.15)',
                    marginTop: '20px'
                }}>
                    <div style={{
                        fontSize: '0.85rem',
                        color: 'var(--color-text)',
                        opacity: 0.8,
                        lineHeight: 1.5
                    }}>
                        <strong>デモ用ログイン情報:</strong><br />
                        店舗ID: 任意の文字列<br />
                        パスワード: <code>kanpai123</code> または <code>demo</code>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;