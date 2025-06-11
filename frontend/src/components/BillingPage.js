// C:\Users\acmsh\kanpAI\frontend\src\components\BillingPage.js
import React, { useState } from 'react';
import api from '../utils/axiosConfig.js';

const BillingPage = ({ storeId }) => {
    const [loading, setLoading] = useState(null);
    const [error, setError] = useState(null);

    const plans = {
        entry: 'price_1RVYiQRwa3DcK8z7tSohNy1J',
        standard: 'price_1RVYisRwa3DcK8z7pEQH8mhX',
        pro: 'price_1RVYjLRwa3DcK8z7FLysgkYc',
    };

    const planDetails = {
        entry: {
            name: 'エントリープラン',
            price: 10000,
            description: 'AIチャットボットの基本機能をお試しください',
            features: [
                'AIチャットボット対応',
                '基本的な予約管理',
                '簡単なレポート機能',
                'LINE連携',
                'メール サポート'
            ],
            icon: '🌱',
            popular: false,
            gradient: 'linear-gradient(135deg, #74b9ff, #0984e3)'
        },
        standard: {
            name: 'スタンダードプラン',
            price: 30000,
            description: '本格的な店舗運営サポートでビジネスを成長させましょう',
            features: [
                '全エントリー機能',
                '詳細分析レポート',
                'LINE一斉配信',
                '営業時間管理',
                '優先サポート',
                'Google Calendar連携'
            ],
            icon: '🚀',
            popular: true,
            gradient: 'linear-gradient(135deg, #a29bfe, #6c5ce7)'
        },
        pro: {
            name: 'プロプラン',
            price: 50000,
            description: '最高レベルの機能で競合に差をつけましょう',
            features: [
                '全スタンダード機能',
                '高度な分析・予測',
                '競合比較分析',
                '収益最適化提案',
                '専属コンサルタント',
                'カスタム機能開発'
            ],
            icon: '👑',
            popular: false,
            gradient: 'linear-gradient(135deg, #fd79a8, #e84393)'
        }
    };

    const handleCheckout = async (planCode, priceId) => {
        setLoading(planCode);
        setError(null);
        try {
            const response = await api.post('/api/stripe/create-checkout-session', { 
                priceId, 
                storeId, 
                planCode 
            });
            const stripe = window.Stripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
            await stripe.redirectToCheckout({ sessionId: response.data.id });
        } catch (err) {
            setError("決済ページの準備に失敗しました。しばらく時間をおいて再度お試しください。");
            setLoading(null);
        }
    };

    const PlanCard = ({ planKey, plan, isPopular }) => (
        <div className={`info-card plan-card ${isPopular ? 'popular-plan' : ''}`} 
             style={{ 
                 position: 'relative',
                 textAlign: 'center',
                 padding: '32px 24px',
                 background: isPopular ? 
                     'linear-gradient(135deg, rgba(166, 155, 254, 0.1), rgba(108, 92, 231, 0.1))' : 
                     'var(--color-card)',
                 border: isPopular ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                 transform: isPopular ? 'scale(1.05)' : 'scale(1)',
                 zIndex: isPopular ? 10 : 1
             }}>
            
            {isPopular && (
                <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: plan.gradient,
                    color: 'white',
                    padding: '6px 20px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)'
                }}>
                    ⭐ おすすめ
                </div>
            )}

            <div style={{
                fontSize: '3rem',
                marginBottom: '16px',
                background: plan.gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
            }}>
                {plan.icon}
            </div>

            <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '1.4rem',
                fontWeight: '700',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-title)'
            }}>
                {plan.name}
            </h3>

            <div style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'center',
                gap: '4px',
                marginBottom: '12px'
            }}>
                <span className="stat-number" style={{ fontSize: '2.5rem' }}>
                    ¥{plan.price.toLocaleString()}
                </span>
                <span style={{ 
                    color: 'var(--color-text)', 
                    opacity: 0.7,
                    fontSize: '1rem'
                }}>
                    / 月
                </span>
            </div>

            <p style={{
                margin: '0 0 24px 0',
                fontSize: '0.9rem',
                color: 'var(--color-text)',
                opacity: 0.8,
                lineHeight: 1.4,
                minHeight: '40px'
            }}>
                {plan.description}
            </p>

            <ul className="data-list" style={{ 
                textAlign: 'left', 
                marginBottom: '32px',
                padding: 0
            }}>
                {plan.features.map((feature, index) => (
                    <li key={index} className="data-list-item" style={{
                        padding: '8px 12px',
                        marginBottom: '4px',
                        fontSize: '0.85rem',
                        backgroundColor: 'rgba(253, 250, 244, 0.3)',
                        borderLeft: '3px solid var(--color-accent)'
                    }}>
                        <span className="item-label">✓ {feature}</span>
                    </li>
                ))}
            </ul>

            <button
                onClick={() => handleCheckout(planKey, plans[planKey])}
                disabled={loading}
                className="secondary-button"
                style={{
                    width: '100%',
                    padding: '16px 24px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    background: loading === planKey ? '#ccc' : plan.gradient,
                    border: 'none',
                    color: 'white',
                    boxShadow: loading === planKey ? 'none' : '0 4px 16px rgba(185, 58, 58, 0.3)',
                    cursor: loading === planKey ? 'not-allowed' : 'pointer',
                    transform: loading === planKey ? 'none' : 'translateY(0)',
                    transition: 'all 0.3s ease'
                }}
            >
                {loading === planKey ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        <div className="loading-spinner"></div>
                        処理中...
                    </span>
                ) : (
                    `🚀 ${plan.name}を開始`
                )}
            </button>
        </div>
    );

    return (
        <div className="card billing-container">
            <div className="card-header">
                <div className="summary-icon">💳</div>
                <h2>プラン選択・変更</h2>
            </div>

            <div style={{
                textAlign: 'center',
                marginBottom: '32px',
                padding: '24px',
                background: 'linear-gradient(135deg, rgba(185, 58, 58, 0.1), rgba(58, 105, 185, 0.1))',
                borderRadius: '12px',
                border: '1px solid var(--color-border)'
            }}>
                <h3 style={{
                    margin: '0 0 12px 0',
                    color: 'var(--color-text)',
                    fontSize: '1.3rem',
                    fontFamily: 'var(--font-title)'
                }}>
                    💡 あなたの店舗に最適なプランを選択してください
                </h3>
                <p style={{
                    margin: 0,
                    color: 'var(--color-text)',
                    opacity: 0.8,
                    fontSize: '1rem',
                    lineHeight: 1.5
                }}>
                    いつでもプランの変更が可能です。まずは小さく始めて、成長に合わせてアップグレードしましょう！
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
            }}>
                {Object.entries(planDetails).map(([planKey, plan]) => (
                    <PlanCard 
                        key={planKey} 
                        planKey={planKey} 
                        plan={plan}
                        isPopular={plan.popular}
                    />
                ))}
            </div>

            {error && (
                <div style={{
                    padding: '16px',
                    backgroundColor: 'rgba(178, 34, 34, 0.1)',
                    border: '1px solid var(--color-negative)',
                    borderRadius: '8px',
                    color: 'var(--color-negative)',
                    textAlign: 'center',
                    marginBottom: '16px'
                }}>
                    <strong>⚠️ エラー:</strong> {error}
                </div>
            )}

            <div className="section-divider"></div>

            <div style={{
                textAlign: 'center',
                padding: '24px',
                backgroundColor: 'rgba(253, 250, 244, 0.5)',
                borderRadius: '12px'
            }}>
                <h4 style={{
                    margin: '0 0 12px 0',
                    color: 'var(--color-text)',
                    fontSize: '1.1rem'
                }}>
                    🔒 安全・安心の決済システム
                </h4>
                <p style={{
                    margin: 0,
                    fontSize: '0.9rem',
                    color: 'var(--color-text)',
                    opacity: 0.8,
                    lineHeight: 1.4
                }}>
                    Stripe社の世界最高レベルのセキュリティで、クレジットカード情報は暗号化され安全に処理されます。<br/>
                    💳 Visa・Mastercard・JCB・American Express対応
                </p>
            </div>
        </div>
    );
};

export default BillingPage;