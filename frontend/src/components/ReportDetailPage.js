import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig.js';
import LazyReportCharts from './LazyReportCharts.js';

const ReportDetailPage = ({ reportId, onBack }) => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            if (!reportId) {
                setError('レポートIDが指定されていません');
                setLoading(false);
                return;
            }

            console.log('🔄 レポート詳細を取得中...', { reportId });
            
            try {
                setLoading(true);
                setError(null);
                
                const response = await api.get(`/api/reports/${reportId}`);
                
                console.log('✅ レポート詳細取得成功:', response.data);
                setReport(response.data);
            } catch (error) {
                console.error('❌ 個別レポートの取得に失敗しました:', error);
                console.error('   エラー詳細:', error.response?.data);
                setError(error.response?.data?.error || 'レポートの取得に失敗しました');
            } finally {
                setLoading(false);
            }
        };
        
        fetchReport();
    }, [reportId]);

    const formatReportMonth = (monthString) => {
        try {
            const date = new Date(monthString);
            return `${date.getMonth() + 1}月`;
        } catch (error) {
            return monthString;
        }
    };

    // レポートコンテンツから統計データを抽出
    const parseStatistics = (content) => {
        const stats = {
            chatCount: { value: 0, change: '', trend: 'neutral' },
            reservationCount: { value: 0, change: '', trend: 'neutral' },
            linebroadcasts: { value: 0, change: '', trend: 'neutral' }
        };

        if (!content || typeof content !== 'string') {
            return stats;
        }

        const lines = content.split('\n');
        lines.forEach(line => {
            if (line.includes('チャット対応:') || line.includes('チャット件数:')) {
                const match = line.match(/(\d+)件.*?([+\-]\d+%)/);
                if (match) {
                    stats.chatCount.value = parseInt(match[1]);
                    stats.chatCount.change = match[2];
                    stats.chatCount.trend = match[2].includes('+') ? 'up' : 'down';
                }
            }
            if (line.includes('予約受付:') || line.includes('予約件数:')) {
                const match = line.match(/(\d+)件.*?([+\-]\d+%)/);
                if (match) {
                    stats.reservationCount.value = parseInt(match[1]);
                    stats.reservationCount.change = match[2];
                    stats.reservationCount.trend = match[2].includes('+') ? 'up' : 'down';
                }
            }
            if (line.includes('LINE配信:')) {
                const match = line.match(/(\d+)回.*?([+\-]\d+回)/);
                if (match) {
                    stats.linebroadcasts.value = parseInt(match[1]);
                    stats.linebroadcasts.change = match[2];
                    stats.linebroadcasts.trend = match[2].includes('+') ? 'up' : 'down';
                }
            }
        });

        return stats;
    };

    // 質問ランキングを抽出
    const parseQuestions = (content) => {
        const questions = [];
        
        if (!content || typeof content !== 'string') {
            return questions;
        }
        
        const lines = content.split('\n');
        let inQuestionSection = false;

        lines.forEach(line => {
            if (line.includes('よく聞かれた質問') || line.includes('質問TOP')) {
                inQuestionSection = true;
                return;
            }
            if (inQuestionSection && (line.includes('##') || line.includes('メニュー'))) {
                inQuestionSection = false;
                return;
            }
            if (inQuestionSection) {
                const match = line.match(/^(\d+)\.\s*(.+?)\s*\((\d+)件\)/);
                if (match) {
                    questions.push({
                        rank: parseInt(match[1]),
                        question: match[2],
                        count: parseInt(match[3]),
                        icon: getQuestionIcon(match[2])
                    });
                }
            }
        });

        return questions.slice(0, 5);
    };

    // メニューランキングを抽出
    const parseMenus = (content) => {
        const menus = [];
        
        if (!content || typeof content !== 'string') {
            return menus;
        }
        
        const lines = content.split('\n');
        let inMenuSection = false;

        lines.forEach(line => {
            if (line.includes('人気メニュー') || line.includes('メニューTOP')) {
                inMenuSection = true;
                return;
            }
            if (inMenuSection && (line.includes('##') || line.includes('成果'))) {
                inMenuSection = false;
                return;
            }
            if (inMenuSection) {
                const match = line.match(/^(\d+)\.\s*(.+?)\s*\((\d+)回/);
                if (match) {
                    menus.push({
                        rank: parseInt(match[1]),
                        menu: match[2],
                        count: parseInt(match[3]),
                        icon: getMenuIcon(match[2]),
                        isPopular: parseInt(match[3]) > 25
                    });
                }
            }
        });

        return menus.slice(0, 5);
    };

    const getQuestionIcon = (question) => {
        if (question.includes('営業時間')) return '🕐';
        if (question.includes('焼き鳥') || question.includes('メニュー')) return '🍗';
        if (question.includes('アクセス') || question.includes('駐車場')) return '🗺️';
        if (question.includes('支払い') || question.includes('料金')) return '💳';
        if (question.includes('予約')) return '📅';
        return '❓';
    };

    const getMenuIcon = (menu) => {
        if (menu.includes('焼き鳥') || menu.includes('唐揚げ')) return '🍗';
        if (menu.includes('ビール')) return '🍺';
        if (menu.includes('ハイボール') || menu.includes('酒')) return '🥃';
        if (menu.includes('もつ') || menu.includes('煮込み')) return '🍲';
        if (menu.includes('サラダ')) return '🥗';
        return '🍽️';
    };

    const getRankIcon = (rank) => {
        switch(rank) {
            case 1: return '🏆';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `${rank}位`;
        }
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '40px',
                    textAlign: 'center',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                    <p style={{ fontSize: '18px', color: '#666' }}>レポートを読み込んでいます...</p>
                </div>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '40px',
                    textAlign: 'center',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    maxWidth: '500px',
                    position: 'relative'
                }}>
                    <button
                        onClick={onBack}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            left: '20px',
                            background: 'rgba(102,126,234,0.1)',
                            border: '2px solid rgba(102,126,234,0.3)',
                            color: '#667eea',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600'
                        }}
                    >
                        ← 戻る
                    </button>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>😰</div>
                    <h2 style={{ color: '#333', marginBottom: '16px' }}>エラーが発生しました</h2>
                    <p style={{ color: '#666', marginBottom: '24px' }}>{error || 'レポートが見つかりません'}</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                            border: 'none',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: '600'
                        }}
                    >
                        再読み込み
                    </button>
                </div>
            </div>
        );
    }

    const stats = parseStatistics(report?.report_content || '');
    const questions = parseQuestions(report?.report_content || '');
    const menus = parseMenus(report?.report_content || '');

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px 0'
        }}>
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '0 20px'
            }}>
                {/* ナビゲーション */}
                <div style={{
                    marginBottom: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    <button
                        onClick={onBack}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: '2px solid rgba(255,255,255,0.3)',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '25px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: '600',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(255,255,255,0.3)';
                            e.target.style.transform = 'translateX(-5px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(255,255,255,0.2)';
                            e.target.style.transform = 'translateX(0)';
                        }}
                    >
                        ← ダッシュボードに戻る
                    </button>
                    <div style={{
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: '14px',
                        fontWeight: '500',
                        textAlign: 'right'
                    }}>
                        {report.plan_type}プラン | 生成日: {new Date(report.generated_at).toLocaleDateString('ja-JP')}
                    </div>
                </div>

                {/* メインカード */}
                <div style={{
                    background: 'white',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(20px)'
                }}>
                    {/* ヘッダー */}
                    <div style={{
                        background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)',
                        color: 'white',
                        padding: '40px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                        <h1 style={{
                            fontSize: 'clamp(24px, 5vw, 32px)',
                            fontWeight: '700',
                            margin: '0 0 8px 0'
                        }}>
                            🗓️ {formatReportMonth(report.report_month)}の店舗分析レポート
                        </h1>
                        <p style={{
                            fontSize: '18px',
                            opacity: 0.9,
                            margin: 0
                        }}>
                            {report.store_name}
                        </p>
                    </div>

                    {/* サマリーセクション */}
                    <div style={{ padding: 'clamp(20px, 5vw, 40px)' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '20px',
                            padding: 'clamp(20px, 4vw, 30px)',
                            marginBottom: '40px'
                        }}>
                            <h2 style={{
                                color: 'white',
                                fontSize: 'clamp(20px, 4vw, 24px)',
                                fontWeight: '700',
                                margin: '0 0 24px 0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                📈 サマリー（ひと目で分かる成果）
                            </h2>
                            
                            <div style={{
                                background: 'rgba(255,255,255,0.15)',
                                borderRadius: '16px',
                                padding: '24px'
                            }}>
                                <h3 style={{
                                    color: 'white',
                                    fontSize: '18px',
                                    marginBottom: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    📞 お客様とのやりとり
                                </h3>
                                
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '16px'
                                }}>
                                    {[
                                        { 
                                            label: 'チャット対応', 
                                            value: `${stats.chatCount.value}件`, 
                                            change: `${stats.chatCount.change} ↗️`, 
                                            icon: '💬' 
                                        },
                                        { 
                                            label: '予約受付', 
                                            value: `${stats.reservationCount.value}件`, 
                                            change: `${stats.reservationCount.change} ↗️`, 
                                            icon: '📝' 
                                        },
                                        { 
                                            label: 'LINE配信', 
                                            value: `${stats.linebroadcasts.value}回`, 
                                            change: stats.linebroadcasts.change, 
                                            icon: '📱' 
                                        }
                                    ].map((stat, index) => (
                                        <div key={index} style={{
                                            background: 'rgba(255,255,255,0.2)',
                                            borderRadius: '12px',
                                            padding: '20px',
                                            textAlign: 'center',
                                            backdropFilter: 'blur(10px)'
                                        }}>
                                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>
                                                {stat.icon}
                                            </div>
                                            <div style={{
                                                color: 'white',
                                                fontSize: 'clamp(20px, 4vw, 24px)',
                                                fontWeight: '700',
                                                marginBottom: '4px'
                                            }}>
                                                {stat.value}
                                            </div>
                                            <div style={{
                                                color: 'rgba(255,255,255,0.9)',
                                                fontSize: '14px',
                                                marginBottom: '8px'
                                            }}>
                                                {stat.label}
                                            </div>
                                            <div style={{
                                                background: 'rgba(76, 175, 80, 0.3)',
                                                color: '#4CAF50',
                                                padding: '4px 8px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '600'
                                            }}>
                                                ✨ {stat.change}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* プロプランアップセル */}
                        <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '20px',
                            padding: '40px',
                            textAlign: 'center',
                            color: 'white',
                            marginBottom: '40px'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚀</div>
                            <h2 style={{
                                fontSize: 'clamp(24px, 4vw, 28px)',
                                fontWeight: '700',
                                margin: '0 0 16px 0'
                            }}>
                                プロプランでさらに詳しく分析！
                            </h2>
                            <p style={{
                                fontSize: '18px',
                                opacity: 0.9,
                                margin: '0 0 32px 0'
                            }}>
                                💎 より深い洞察と具体的な収益改善シミュレーションを提供
                            </p>
                            
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                gap: '16px',
                                marginBottom: '32px'
                            }}>
                                {[
                                    '✨ よく聞かれる質問TOP15（詳細分析付き）',
                                    '🏆 人気メニューTOP20 + 時間帯別分析',
                                    '📊 競合・業界比較分析（同エリア比較）',
                                    '🎯 詳細戦略提案（短期・中期・長期）',
                                    '💰 収益改善シミュレーション（ROI計算付き）',
                                    '🔬 カスタム分析（店舗特性に合わせた深掘り）'
                                ].map((feature, index) => (
                                    <div key={index} style={{
                                        background: 'rgba(255,255,255,0.15)',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        backdropFilter: 'blur(10px)',
                                        transition: 'transform 0.3s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-5px)';
                                        e.target.style.background = 'rgba(255,255,255,0.25)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.background = 'rgba(255,255,255,0.15)';
                                    }}
                                    >
                                        {feature}
                                    </div>
                                ))}
                            </div>
                            
                            <button style={{
                                background: 'linear-gradient(45deg, #ff6b6b, #ffa726)',
                                border: 'none',
                                color: 'white',
                                padding: '16px 32px',
                                borderRadius: '25px',
                                fontSize: '18px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-3px)';
                                e.target.style.boxShadow = '0 12px 30px rgba(0,0,0,0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
                            }}
                            >
                                🚀 プロプランにアップグレード
                            </button>
                        </div>

                        {/* チャート分析セクション */}
                        <LazyReportCharts reportData={report} reportMonth={report.report_month} />

                        {/* フッター */}
                        <div style={{
                            textAlign: 'center',
                            padding: '30px 20px',
                            background: 'rgba(102,126,234,0.05)',
                            borderRadius: '16px'
                        }}>
                            <div style={{
                                fontSize: '32px',
                                marginBottom: '16px'
                            }}>
                                🤖
                            </div>
                            <div style={{
                                fontSize: '16px',
                                color: '#666',
                                lineHeight: '1.6'
                            }}>
                                このレポートは <strong>kanpAI システム</strong> により自動生成されました<br/>
                                <span style={{ fontSize: '14px', opacity: 0.8 }}>
                                    レポートID: {report.id} | 
                                    生成時間: {new Date(report.generated_at).toLocaleString('ja-JP')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportDetailPage;