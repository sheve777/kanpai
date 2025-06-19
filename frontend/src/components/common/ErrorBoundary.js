/**
 * React Error Boundary - アプリケーション全体のエラーをキャッチ
 */
import React from 'react';
import { logger } from '../../utils/environment';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false, 
            error: null,
            errorInfo: null 
        };
    }

    static getDerivedStateFromError(error) {
        // エラーが発生したときにstateを更新
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // エラーの詳細をログに記録
        logger.error('🚨 Error Boundary でエラーをキャッチしました:', {
            error,
            errorInfo,
            componentStack: errorInfo.componentStack,
            errorBoundary: this.constructor.name
        });

        this.setState({
            error,
            errorInfo
        });

        // 本番環境では外部のエラー監視サービスに送信することも可能
        // 例: Sentry.captureException(error, { contexts: { react: errorInfo } });
    }

    handleReload = () => {
        window.location.reload();
    };

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            const { fallback: FallbackComponent } = this.props;
            
            // カスタムフォールバックコンポーネントがある場合は使用
            if (FallbackComponent) {
                return (
                    <FallbackComponent 
                        error={this.state.error}
                        errorInfo={this.state.errorInfo}
                        onReset={this.handleReset}
                        onReload={this.handleReload}
                    />
                );
            }

            // デフォルトのエラー画面
            return (
                <div style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    maxWidth: '600px',
                    margin: '0 auto',
                    fontFamily: 'var(--font-body, -apple-system, BlinkMacSystemFont, sans-serif)'
                }}>
                    <div style={{
                        backgroundColor: '#ffebee',
                        border: '1px solid #ffcdd2',
                        borderRadius: '12px',
                        padding: '32px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚨</div>
                        
                        <h2 style={{
                            color: '#c62828',
                            marginBottom: '16px',
                            fontSize: '1.5rem'
                        }}>
                            申し訳ございません
                        </h2>
                        
                        <p style={{
                            color: '#666',
                            marginBottom: '24px',
                            lineHeight: 1.6
                        }}>
                            システムエラーが発生しました。<br />
                            ページを再読み込みするか、しばらく時間をおいてからお試しください。
                        </p>
                        
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <button
                                onClick={this.handleReset}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#1976d2',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#1565c0'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#1976d2'}
                            >
                                再試行
                            </button>
                            
                            <button
                                onClick={this.handleReload}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#757575',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#616161'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#757575'}
                            >
                                ページ再読み込み
                            </button>
                        </div>

                        {/* 開発環境では詳細なエラー情報を表示 */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details style={{
                                marginTop: '24px',
                                textAlign: 'left',
                                backgroundColor: '#f5f5f5',
                                padding: '16px',
                                borderRadius: '6px',
                                fontSize: '0.8rem'
                            }}>
                                <summary style={{ 
                                    cursor: 'pointer', 
                                    fontWeight: '600',
                                    marginBottom: '8px'
                                }}>
                                    開発者向け詳細情報
                                </summary>
                                <pre style={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    margin: 0,
                                    color: '#d32f2f'
                                }}>
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;