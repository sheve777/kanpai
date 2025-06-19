/**
 * 統一されたエラーメッセージコンポーネント
 */
import React from 'react';

const ErrorMessage = ({ 
    error, 
    onDismiss, 
    type = 'error',
    className = '',
    showIcon = true 
}) => {
    if (!error) return null;

    const getTypeConfig = () => {
        switch (type) {
            case 'warning':
                return {
                    backgroundColor: '#fff8e1',
                    borderColor: '#ffcc02',
                    color: '#f57c00',
                    icon: '⚠️'
                };
            case 'info':
                return {
                    backgroundColor: '#e3f2fd',
                    borderColor: '#90caf9',
                    color: '#1976d2',
                    icon: 'ℹ️'
                };
            case 'success':
                return {
                    backgroundColor: '#e8f5e8',
                    borderColor: '#4caf50',
                    color: '#2e7d32',
                    icon: '✅'
                };
            case 'error':
            default:
                return {
                    backgroundColor: '#ffebee',
                    borderColor: '#ffcdd2',
                    color: '#c62828',
                    icon: '❌'
                };
        }
    };

    const config = getTypeConfig();

    const styles = {
        padding: '12px 16px',
        marginBottom: '16px',
        backgroundColor: config.backgroundColor,
        border: `1px solid ${config.borderColor}`,
        borderRadius: '8px',
        color: config.color,
        fontSize: '0.9rem',
        fontFamily: 'var(--font-body)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        animation: 'slideIn 0.3s ease-out'
    };

    const buttonStyles = {
        marginLeft: 'auto',
        background: 'none',
        border: 'none',
        color: config.color,
        cursor: 'pointer',
        fontSize: '1.2rem',
        lineHeight: 1,
        padding: '0',
        opacity: 0.7,
        transition: 'opacity 0.2s'
    };

    return (
        <div className={`error-message ${className}`} style={styles}>
            {showIcon && (
                <span style={{ flexShrink: 0 }}>
                    {config.icon}
                </span>
            )}
            <span style={{ flex: 1, lineHeight: 1.4 }}>
                {error}
            </span>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    style={buttonStyles}
                    onMouseEnter={(e) => e.target.style.opacity = '1'}
                    onMouseLeave={(e) => e.target.style.opacity = '0.7'}
                    title="エラーを閉じる"
                >
                    ×
                </button>
            )}
            
            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default ErrorMessage;