// C:\Users\acmsh\kanpAI\frontend\src\components\PasswordChangeModal.js
import React, { useState } from 'react';
import api from '../utils/axiosConfig.js';
import { logger } from '../utils/environment.js';

const PasswordChangeModal = ({ onClose, onSuccess }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // 入力検証
        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('すべての項目を入力してください');
            return;
        }

        if (newPassword.length < 8) {
            setError('新しいパスワードは8文字以上にしてください');
            return;
        }

        if (newPassword === currentPassword) {
            setError('新しいパスワードは現在のパスワードと異なる必要があります');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('新しいパスワードが一致しません');
            return;
        }

        // パスワード強度チェック
        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasNumbers = /\d/.test(newPassword);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
            setError('パスワードは大文字、小文字、数字を含む必要があります');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/api/auth/change-password', {
                currentPassword,
                newPassword
            });

            if (response.data.success) {
                logger.log('✅ パスワード変更成功');
                onSuccess();
            } else {
                throw new Error(response.data.error || 'パスワード変更に失敗しました');
            }
        } catch (err) {
            logger.error('❌ パスワード変更エラー:', err);
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '40px',
                width: '100%',
                maxWidth: '450px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}>
                <h2 style={{
                    margin: '0 0 8px 0',
                    fontSize: '1.5rem',
                    color: 'var(--color-text)',
                    fontFamily: 'var(--font-title)'
                }}>
                    🔐 パスワードの変更が必要です
                </h2>
                <p style={{
                    margin: '0 0 24px 0',
                    color: 'var(--color-text)',
                    opacity: 0.7,
                    fontSize: '0.9rem'
                }}>
                    セキュリティのため、初回ログイン時は新しいパスワードを設定してください。
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: 'var(--color-text)'
                        }}>
                            現在のパスワード
                        </label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="現在のパスワードを入力"
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
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: 'var(--color-text)'
                        }}>
                            新しいパスワード
                        </label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="8文字以上、大文字・小文字・数字を含む"
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
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: 'var(--color-text)'
                        }}>
                            新しいパスワード（確認）
                        </label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="もう一度新しいパスワードを入力"
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
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '0.9rem',
                            color: 'var(--color-text)',
                            cursor: 'pointer'
                        }}>
                            <input
                                type="checkbox"
                                checked={showPassword}
                                onChange={(e) => setShowPassword(e.target.checked)}
                                style={{ marginRight: '8px' }}
                            />
                            パスワードを表示
                        </label>
                    </div>

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

                    <div style={{ 
                        marginTop: '16px',
                        padding: '16px',
                        backgroundColor: 'rgba(58, 105, 185, 0.08)',
                        borderRadius: '8px',
                        border: '1px solid rgba(58, 105, 185, 0.15)',
                        fontSize: '0.85rem',
                        color: 'var(--color-text)',
                        lineHeight: 1.6
                    }}>
                        <strong>パスワード要件:</strong>
                        <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                            <li>8文字以上</li>
                            <li>大文字（A-Z）を含む</li>
                            <li>小文字（a-z）を含む</li>
                            <li>数字（0-9）を含む</li>
                            <li>推奨: 特殊文字（!@#$%など）を含む</li>
                        </ul>
                    </div>

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
                            marginTop: '24px'
                        }}
                    >
                        {loading ? '変更中...' : 'パスワードを変更'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PasswordChangeModal;