// C:\Users\acmsh\kanpAI\frontend\src\components\ReportDetailPage.js
import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig.js';

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
            return date.toLocaleDateString('ja-JP', { month: 'long' });
        } catch (error) {
            return monthString;
        }
    };

    const parseReportContent = (content) => {
        const sections = [];
        const lines = content.split('\n').filter(line => line.trim());
        
        let currentSection = null;
        
        lines.forEach(line => {
            if (line.startsWith('# ')) {
                if (currentSection) sections.push(currentSection);
                currentSection = {
                    type: 'title',
                    content: line.substring(2).trim()
                };
            } else if (line.startsWith('## ')) {
                if (currentSection) sections.push(currentSection);
                currentSection = {
                    type: 'section',
                    title: line.substring(3).trim(),
                    items: []
                };
            } else if (line.startsWith('### ')) {
                if (currentSection && currentSection.type === 'section') {
                    currentSection.items.push({
                        type: 'subsection',
                        title: line.substring(4).trim(),
                        content: []
                    });
                }
            } else if (line.startsWith('- ') || /^\d+\./.test(line)) {
                if (currentSection && currentSection.type === 'section') {
                    const lastItem = currentSection.items[currentSection.items.length - 1];
                    if (lastItem && lastItem.type === 'subsection') {
                        lastItem.content.push(line.replace(/^[-\d.]\s*/, ''));
                    } else {
                        currentSection.items.push({
                            type: 'list-item',
                            content: line.replace(/^[-\d.]\s*/, '')
                        });
                    }
                }
            } else if (line.trim()) {
                if (currentSection && currentSection.type === 'section') {
                    currentSection.items.push({
                        type: 'text',
                        content: line.trim()
                    });
                }
            }
        });
        
        if (currentSection) sections.push(currentSection);
        return sections;
    };

    if (loading) {
        return (
            <div className="report-loading-container">
                <div className="report-loading-card">
                    <div className="report-loading-icon">📊</div>
                    <p>レポートを読み込んでいます...</p>
                </div>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="report-error-container">
                <button onClick={onBack} className="report-back-button-error">
                    ← ダッシュボードに戻る
                </button>
                <div className="report-error-card">
                    <div className="report-error-icon">😰</div>
                    <h2>エラーが発生しました</h2>
                    <p>{error || 'レポートが見つかりません'}</p>
                    <button onClick={() => window.location.reload()} className="report-reload-button">
                        再読み込み
                    </button>
                </div>
            </div>
        );
    }

    const sections = parseReportContent(report.report_content);

    return (
        <div className="modern-report-container">
            {/* ナビゲーション */}
            <div className="report-navigation">
                <button onClick={onBack} className="report-back-button">
                    ← ダッシュボードに戻る
                </button>
                <div className="report-meta-info">
                    {report.plan_type}プラン | 生成日: {new Date(report.generated_at).toLocaleDateString('ja-JP')}
                </div>
            </div>

            {/* メインコンテンツ */}
            <div className="report-main-content">
                {/* ヘッダー */}
                <div className="report-header">
                    <div className="report-header-icon">📊</div>
                    <h1>{formatReportMonth(report.report_month)}の店舗分析レポート</h1>
                    <p>{report.store_name}</p>
                </div>

                {/* レポート本文 */}
                <div className="report-body">
                    {sections.map((section, index) => {
                        if (section.type === 'title') {
                            return null; // タイトルは既にヘッダーで表示
                        }
                        
                        if (section.type === 'section') {
                            return (
                                <div key={index} className="report-section">
                                    <h2 className="report-section-title">
                                        <span className="report-section-emoji">
                                            {section.title.includes('サマリー') && '📈'}
                                            {section.title.includes('時間帯') && '🕐'}
                                            {section.title.includes('質問') && '❓'}
                                            {section.title.includes('メニュー') && '🍽️'}
                                            {section.title.includes('提案') && '💡'}
                                            {section.title.includes('予約') && '📅'}
                                        </span>
                                        {section.title}
                                    </h2>
                                    
                                    <div className="report-section-content">
                                        {section.items.map((item, itemIndex) => {
                                            if (item.type === 'subsection') {
                                                return (
                                                    <div key={itemIndex} className="report-subsection">
                                                        <h3>📞 {item.title}</h3>
                                                        <div className="report-stats-grid">
                                                            {item.content.map((content, contentIndex) => (
                                                                <div key={contentIndex} className="report-stat-card">
                                                                    <div className="report-stat-icon">
                                                                        {content.includes('156') ? '💬' : 
                                                                         content.includes('45') ? '📝' : 
                                                                         content.includes('12') ? '📱' : '📊'}
                                                                    </div>
                                                                    <div className="report-stat-content">{content}</div>
                                                                    {content.includes('↗️') && (
                                                                        <div className="report-stat-trend">✨ 前月比UP!</div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            
                                            if (item.type === 'list-item') {
                                                const match = item.content.match(/^(\d+)\.\s*(.+)/);
                                                if (match) {
                                                    const rank = match[1];
                                                    const content = match[2];
                                                    const isTopRank = parseInt(rank) <= 3;
                                                    
                                                    return (
                                                        <div 
                                                            key={itemIndex} 
                                                            className={`report-ranking-item ${isTopRank ? 'top-rank' : ''}`}
                                                        >
                                                            <div className="report-rank-badge">
                                                                {rank === '1' ? '🏆' : 
                                                                 rank === '2' ? '🥈' : 
                                                                 rank === '3' ? '🥉' : 
                                                                 `${rank}位`}
                                                            </div>
                                                            <div className="report-rank-content">
                                                                <div className="report-rank-title">
                                                                    {content.split(' ')[0]}
                                                                </div>
                                                                <div className="report-rank-detail">
                                                                    {content.split(' ').slice(1).join(' ')}
                                                                </div>
                                                            </div>
                                                            {content.includes('🔥') && (
                                                                <div className="report-rank-badge-popular">大人気！</div>
                                                            )}
                                                        </div>
                                                    );
                                                } else {
                                                    return (
                                                        <div key={itemIndex} className="report-list-item">
                                                            <div className="report-list-bullet">•</div>
                                                            <div>{item.content}</div>
                                                        </div>
                                                    );
                                                }
                                            }
                                            
                                            if (item.type === 'text') {
                                                if (item.content.includes('提案') || item.content.includes('効果')) {
                                                    return (
                                                        <div key={itemIndex} className="report-suggestion-card">
                                                            <div className="report-suggestion-bg-icon">💡</div>
                                                            <div className="report-suggestion-icon">💡</div>
                                                            <div className="report-suggestion-content">
                                                                {item.content}
                                                            </div>
                                                        </div>
                                                    );
                                                } else {
                                                    return (
                                                        <div key={itemIndex} className="report-text-content">
                                                            {item.content}
                                                        </div>
                                                    );
                                                }
                                            }
                                            
                                            return null;
                                        })}
                                    </div>
                                </div>
                            );
                        }
                        
                        return null;
                    })}
                    
                    {/* フッター */}
                    <div className="report-footer">
                        <div className="report-footer-icon">🚀</div>
                        <h3>プロプランでさらに詳しく分析！</h3>
                        <p>💎 より深い洞察と具体的な収益改善シミュレーションを提供</p>
                        <div className="report-features-grid">
                            {[
                                '✨ よく聞かれる質問TOP15（詳細分析付き）',
                                '🏆 人気メニューTOP20 + 時間帯別分析',
                                '📊 競合・業界比較分析（同エリア比較）',
                                '🎯 詳細戦略提案（短期・中期・長期）',
                                '💰 収益改善シミュレーション（ROI計算付き）',
                                '🔬 カスタム分析（店舗特性に合わせた深掘り）'
                            ].map((feature, index) => (
                                <div key={index} className="report-feature-item">
                                    {feature}
                                </div>
                            ))}
                        </div>
                        <div className="report-footer-meta">
                            このレポートは kanpAI システムにより自動生成されました<br/>
                            レポートID: {report.id}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportDetailPage;
