// C:\Users\acmsh\kanpAI\frontend\src\components\StandaloneReservationPage.js
import React, { useState, useEffect } from 'react';
import ReservationForm from './ReservationForm';
import api from '../utils/axiosConfig.js';

const StandaloneReservationPage = ({ storeId }) => {
    const [storeInfo, setStoreInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStoreInfo();
        
        // CSSスタイルを動的に追加
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.id = "standalone-reservation-styles";
        styleSheet.innerText = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .line-back-link:hover {
            background-color: #009900 !important;
            transform: translateY(-2px);
        }

        .retry-button:hover {
            background-color: #0056b3 !important;
        }
        `;
        document.head.appendChild(styleSheet);
        
        // クリーンアップ関数でスタイルシートを削除
        return () => {
            const existingStyleSheet = document.getElementById("standalone-reservation-styles");
            if (existingStyleSheet) {
                document.head.removeChild(existingStyleSheet);
            }
        };
    }, [storeId]);

    const fetchStoreInfo = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/stores/${storeId}/info`);
            setStoreInfo(response.data);
        } catch (error) {
            console.error('店舗情報取得エラー:', error);
            setError('店舗情報を取得できませんでした。');
        } finally {
            setLoading(false);
        }
    };

    const handleReservationComplete = (reservationData) => {
        // 予約完了後の処理
        console.log('予約完了:', reservationData);
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingIcon}>🔄</div>
                <p>読み込み中...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.errorContainer}>
                <div style={styles.errorIcon}>❌</div>
                <h2>エラーが発生しました</h2>
                <p>{error}</p>
                <button 
                    onClick={() => window.location.reload()} 
                    style={styles.retryButton}
                >
                    再読み込み
                </button>
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            {/* ヘッダー */}
            <div style={styles.header}>
                <div style={styles.headerContent}>
                    <h1 style={styles.storeName}>
                        🏮 {storeInfo?.name || '店舗名'}
                    </h1>
                    <div style={styles.subtitle}>24時間ご予約受付</div>
                </div>
            </div>

            {/* 営業時間外の案内 */}
            <div style={styles.noticeCard}>
                <div style={styles.noticeIcon}>🕐</div>
                <div style={styles.noticeContent}>
                    <h3 style={styles.noticeTitle}>営業時間外のご予約</h3>
                    <p style={styles.noticeText}>
                        現在は営業時間外ですが、24時間いつでもご予約いただけます。
                        {storeInfo?.operating_hours && (
                            <>
                                <br />
                                <strong>営業時間: {storeInfo.operating_hours.start}〜{storeInfo.operating_hours.end}</strong>
                            </>
                        )}
                    </p>
                </div>
            </div>

            {/* 予約フォーム */}
            <div style={styles.formContainer}>
                <ReservationForm 
                    storeId={storeId}
                    onReservationComplete={handleReservationComplete}
                />
            </div>

            {/* フッター */}
            <div style={styles.footer}>
                <div style={styles.footerContent}>
                    <p style={styles.footerText}>
                        ✨ 予約確定後、確認のご連絡をお送りします
                    </p>
                    <div style={styles.lineBackButton}>
                        <a 
                            href="https://line.me/R/oaui/close" 
                            style={styles.lineBackLink}
                        >
                            📱 LINEに戻る
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

// スタイル定義
const styles = {
    pageContainer: {
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },

    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        gap: '16px',
    },

    loadingIcon: {
        fontSize: '48px',
        animation: 'spin 1s linear infinite',
    },

    errorContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        padding: '20px',
        textAlign: 'center',
        gap: '16px',
    },

    errorIcon: {
        fontSize: '48px',
    },

    retryButton: {
        padding: '12px 24px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },

    header: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '24px 16px',
        textAlign: 'center',
    },

    headerContent: {
        maxWidth: '600px',
        margin: '0 auto',
    },

    storeName: {
        fontSize: 'clamp(24px, 5vw, 32px)',
        fontWeight: 'bold',
        margin: '0 0 8px 0',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    },

    subtitle: {
        fontSize: '16px',
        opacity: 0.9,
        fontWeight: '500',
    },

    noticeCard: {
        backgroundColor: '#e3f2fd',
        margin: '16px',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #90caf9',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },

    noticeIcon: {
        fontSize: '32px',
        flexShrink: 0,
    },

    noticeContent: {
        flex: 1,
    },

    noticeTitle: {
        margin: '0 0 8px 0',
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1565c0',
    },

    noticeText: {
        margin: 0,
        fontSize: '14px',
        lineHeight: '1.6',
        color: '#1976d2',
    },

    formContainer: {
        maxWidth: '600px',
        margin: '0 auto',
        padding: '0 16px',
    },

    footer: {
        marginTop: '40px',
        padding: '24px 16px',
        backgroundColor: 'white',
        borderTop: '1px solid #e9ecef',
    },

    footerContent: {
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center',
    },

    footerText: {
        margin: '0 0 16px 0',
        fontSize: '14px',
        color: '#6c757d',
    },

    lineBackButton: {
        display: 'inline-block',
    },

    lineBackLink: {
        display: 'inline-block',
        padding: '12px 24px',
        backgroundColor: '#00b900',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '25px',
        fontSize: '16px',
        fontWeight: 'bold',
        transition: 'background-color 0.2s',
        boxShadow: '0 2px 8px rgba(0,185,0,0.3)',
    },
};

// CSSアニメーション用のスタイルを追加（コンポーネント内で動的に管理）

export default StandaloneReservationPage;