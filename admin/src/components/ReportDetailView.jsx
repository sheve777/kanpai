import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  BookOpen,
  Users,
  Clock,
  Star,
  Target,
  Lightbulb,
  BarChart3,
  PieChart,
  Activity,
  Edit3,
  Download,
  Share2,
  RefreshCw,
  Sparkles,
  Trophy,
  Zap,
  Heart,
  Gift
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ReportDetailView = ({ reportId, onBack }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  // ローカル環境判定
  const isLocalEnv = window.location.hostname === 'localhost';

  useEffect(() => {
    fetchReportDetail();
  }, [reportId]);

  const fetchReportDetail = async () => {
    try {
      setLoading(true);
      
      // ローカル環境でのモックデータ
      if (isLocalEnv) {
        console.log('🏠 ローカル環境：モックレポート詳細データを使用');
        
        const mockReportData = {
          id: reportId,
          storeName: '居酒屋 花まる 渋谷店',
          month: '2024-11',
          generatedAt: new Date().toISOString(),
          
          // サマリーデータ
          summary: {
            chatCount: 156,
            chatGrowth: 12,
            reservationCount: 45,
            reservationGrowth: 8,
            lineDeliveries: 12,
            lineDeliveriesGrowth: 3
          },
          
          // 時間帯別利用状況
          hourlyData: [
            { hour: '10:00', chats: 2, reservations: 0 },
            { hour: '11:00', chats: 3, reservations: 1 },
            { hour: '12:00', chats: 8, reservations: 2 },
            { hour: '13:00', chats: 12, reservations: 3 },
            { hour: '14:00', chats: 12, reservations: 2 },
            { hour: '15:00', chats: 8, reservations: 1 },
            { hour: '16:00', chats: 5, reservations: 1 },
            { hour: '17:00', chats: 15, reservations: 4 },
            { hour: '18:00', chats: 22, reservations: 8 },
            { hour: '19:00', chats: 28, reservations: 12 },
            { hour: '20:00', chats: 25, reservations: 10 },
            { hour: '21:00', chats: 18, reservations: 5 }
          ],
          
          // よく聞かれた質問TOP5
          topQuestions: [
            { rank: 1, question: '営業時間について', count: 24, percentage: 30.8 },
            { rank: 2, question: '焼き鳥の種類について', count: 18, percentage: 23.1 },
            { rank: 3, question: 'アクセス・駐車場について', count: 15, percentage: 19.2 },
            { rank: 4, question: '支払い方法について', count: 12, percentage: 15.4 },
            { rank: 5, question: '予約の空き状況について', count: 10, percentage: 12.8 }
          ],
          
          // 人気メニューTOP10
          popularMenus: [
            { rank: 1, menu: '焼き鳥盛り合わせ', mentions: 32, percentage: 28.1 },
            { rank: 2, menu: '生ビール', mentions: 28, percentage: 24.6 },
            { rank: 3, menu: '唐揚げ', mentions: 22, percentage: 19.3 },
            { rank: 4, menu: 'ハイボール', mentions: 18, percentage: 15.8 },
            { rank: 5, menu: 'もつ煮込み', mentions: 15, percentage: 13.2 },
            { rank: 6, menu: '串カツ', mentions: 12, percentage: 10.5 },
            { rank: 7, menu: '刺身盛り合わせ', mentions: 10, percentage: 8.8 },
            { rank: 8, menu: 'チューハイ', mentions: 8, percentage: 7.0 },
            { rank: 9, menu: '枝豆', mentions: 6, percentage: 5.3 },
            { rank: 10, menu: 'お好み焼き', mentions: 5, percentage: 4.4 }
          ],
          
          // 予約傾向分析
          reservationTrends: {
            timeSlots: [
              { time: '17:00', count: 3 },
              { time: '17:30', count: 5 },
              { time: '18:00', count: 8 },
              { time: '18:30', count: 7 },
              { time: '19:00', count: 12 },
              { time: '19:30', count: 10 },
              { time: '20:00', count: 8 },
              { time: '20:30', count: 6 },
              { time: '21:00', count: 4 }
            ],
            dayOfWeek: [
              { day: '月', count: 4 },
              { day: '火', count: 6 },
              { day: '水', count: 5 },
              { day: '木', count: 8 },
              { day: '金', count: 15 },
              { day: '土', count: 18 },
              { day: '日', count: 7 }
            ]
          },
          
          // 成果・気づき
          insights: [
            {
              type: 'positive',
              title: 'チャット対応が順調に増加',
              description: '前月比12%増加し、お客様とのコミュニケーションが活発化しています。'
            },
            {
              type: 'positive', 
              title: '予約の取りこぼしが大幅減少',
              description: 'AIチャットボットによる24時間対応で、営業時間外の予約も確実にキャッチ。'
            },
            {
              type: 'attention',
              title: '平日14-15時の利用が意外と多い',
              description: 'ランチ営業の検討やティータイム企画が効果的かもしれません。'
            }
          ],
          
          // 来月への提案
          proposals: [
            {
              priority: 'high',
              title: 'アクセス情報の分かりやすい表示',
              description: 'Googleマップの案内を改善し、電話での道案内を減らす',
              expectedImpact: '問い合わせ15%削減'
            },
            {
              priority: 'high',
              title: '焼き鳥メニューの強化・特集企画',
              description: '特別な焼き鳥メニューの追加や、LINE配信での焼き鳥特集',
              expectedImpact: '客単価200円向上'
            },
            {
              priority: 'medium',
              title: '混雑時間帯の分散施策',
              description: '18:30以前予約で生ビール1杯サービスなど',
              expectedImpact: '予約分散20%改善'
            },
            {
              priority: 'low',
              title: '平日午後の活用検討',
              description: '午後のひととき割引の導入検討',
              expectedImpact: '月10組追加見込み'
            }
          ]
        };
        
        setReportData(mockReportData);
        setLoading(false);
        return;
      }
      
      // 本番API呼び出し
      // const response = await api.get(`/reports/${reportId}/detail`);
      // setReportData(response.data.report);
      
    } catch (error) {
      console.error('レポート詳細取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#64748b';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '-';
    }
  };

  if (loading) {
    return (
      <div className="report-detail-loading">
        <div className="loading-spinner"></div>
        <p>レポート詳細を読み込み中...</p>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="report-detail-error">
        <p>レポートデータが見つかりません</p>
        <button onClick={onBack} className="btn-secondary">戻る</button>
      </div>
    );
  }

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="report-detail-view">
      {/* 背景アニメーション要素 */}
      <div className="background-elements">
        <div className="floating-sparkle sparkle-1">✨</div>
        <div className="floating-sparkle sparkle-2">⭐</div>
        <div className="floating-sparkle sparkle-3">💫</div>
        <div className="floating-sparkle sparkle-4">🌟</div>
        <div className="floating-sparkle sparkle-5">✨</div>
        <div className="floating-sparkle sparkle-6">⭐</div>
      </div>
      
      {/* 成功メッセージバナー */}
      <div className="success-banner">
        <div className="banner-content">
          <div className="banner-icon">
            <Trophy size={24} />
          </div>
          <div className="banner-text">
            <span className="banner-title">🎉 素晴らしい成果です！</span>
            <span className="banner-subtitle">AIが分析した{reportData?.month.replace('-', '年')}月の詳細レポートをお楽しみください</span>
          </div>
          <div className="banner-sparkles">
            <Sparkles size={20} />
          </div>
        </div>
      </div>
      
      {/* ヘッダー */}
      <div className="report-header">
        <div className="header-left">
          <button 
            className="back-button"
            onClick={onBack}
            title="レポート一覧に戻る"
          >
            <ArrowLeft size={18} />
            戻る
          </button>
          <div className="header-title">
            <h1>📊 {reportData.storeName} - {reportData.month.replace('-', '年')}月レポート</h1>
            <p className="report-meta">
              <Calendar size={14} />
              生成日: {new Date(reportData.generatedAt).toLocaleDateString('ja-JP')}
            </p>
          </div>
        </div>
        
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setEditMode(!editMode)}>
            <Edit3 size={16} />
            {editMode ? '表示モード' : '編集モード'}
          </button>
          <button className="btn-secondary">
            <Share2 size={16} />
            共有
          </button>
          <button className="btn-secondary">
            <Download size={16} />
            PDF出力
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="report-content">
        {/* サマリーセクション */}
        <section className="report-section summary-section magical-summary">
          <div className="section-header">
            <div className="section-title-wrapper">
              <h2>📈 サマリー（ひと目で分かる成果）</h2>
              <div className="section-badge">AI分析完了</div>
            </div>
            <div className="section-sparkles">
              <Zap size={16} />
              <span>素晴らしい成長ぶりです！</span>
            </div>
          </div>
          
          <div className="summary-grid">
            <div className="summary-card premium-card chat-card">
              <div className="card-glow"></div>
              <div className="card-header">
                <div className="card-icon pulse-animation">
                  <MessageSquare size={28} />
                </div>
                <div className="achievement-badge">🏆</div>
              </div>
              <div className="card-content">
                <div className="metric-value glow-text">{reportData.summary.chatCount}</div>
                <div className="metric-label">チャット対応</div>
                <div className="metric-change positive celebration">
                  <TrendingUp size={16} />
                  <span>前月比 +{reportData.summary.chatGrowth}%</span>
                  <div className="growth-sparkle">✨</div>
                </div>
                <div className="progress-indicator">
                  <div className="progress-fill chat-progress"></div>
                </div>
              </div>
            </div>
            
            <div className="summary-card premium-card reservation-card">
              <div className="card-glow"></div>
              <div className="card-header">
                <div className="card-icon pulse-animation">
                  <BookOpen size={28} />
                </div>
                <div className="achievement-badge">⭐</div>
              </div>
              <div className="card-content">
                <div className="metric-value glow-text">{reportData.summary.reservationCount}</div>
                <div className="metric-label">予約受付</div>
                <div className="metric-change positive celebration">
                  <TrendingUp size={16} />
                  <span>前月比 +{reportData.summary.reservationGrowth}%</span>
                  <div className="growth-sparkle">💫</div>
                </div>
                <div className="progress-indicator">
                  <div className="progress-fill reservation-progress"></div>
                </div>
              </div>
            </div>
            
            <div className="summary-card premium-card line-card">
              <div className="card-glow"></div>
              <div className="card-header">
                <div className="card-icon pulse-animation">
                  <Activity size={28} />
                </div>
                <div className="achievement-badge">🌟</div>
              </div>
              <div className="card-content">
                <div className="metric-value glow-text">{reportData.summary.lineDeliveries}</div>
                <div className="metric-label">LINE配信</div>
                <div className="metric-change positive celebration">
                  <TrendingUp size={16} />
                  <span>前月比 +{reportData.summary.lineDeliveriesGrowth}回</span>
                  <div className="growth-sparkle">🎉</div>
                </div>
                <div className="progress-indicator">
                  <div className="progress-fill line-progress"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 成果ハイライト */}
          <div className="achievement-highlight">
            <div className="highlight-content">
              <Heart size={20} />
              <span>お客様との接点が大幅に向上しています！継続的な成長で素晴らしい結果ですね。</span>
            </div>
          </div>
        </section>

        {/* 時間帯別利用状況 */}
        <section className="report-section chart-section">
          <div className="section-header">
            <h2>🕐 時間帯別利用状況</h2>
            <p>最も活発: 19:00-20:00 ({Math.max(...reportData.hourlyData.map(d => d.chats))}件)</p>
          </div>
          
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="hour" stroke="#e2e8f0" />
                <YAxis stroke="#e2e8f0" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.95)', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }} 
                />
                <Bar dataKey="chats" fill="#8b5cf6" name="チャット数" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reservations" fill="#3b82f6" name="予約数" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* よく聞かれた質問TOP5 */}
        <section className="report-section ranking-section">
          <div className="section-header">
            <h2>❓ よく聞かれた質問TOP5</h2>
          </div>
          
          <div className="ranking-list">
            {reportData.topQuestions.map((item) => (
              <div key={item.rank} className="ranking-item">
                <div className={`rank-badge rank-${item.rank}`}>
                  {item.rank}
                </div>
                <div className="ranking-content">
                  <div className="ranking-title">{item.question}</div>
                  <div className="ranking-stats">
                    <span className="count">{item.count}件</span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="percentage">{item.percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="insight-box">
            <Lightbulb size={18} />
            <div>
              <strong>改善提案:</strong> 「アクセス情報」への質問が多いです。
              Googleマップの案内を分かりやすくすると、電話での道案内が減るかもしれません。
            </div>
          </div>
        </section>

        {/* 人気メニューTOP10 */}
        <section className="report-section ranking-section">
          <div className="section-header">
            <h2>🍽️ 人気メニューTOP10</h2>
          </div>
          
          <div className="ranking-grid">
            {reportData.popularMenus.map((item) => (
              <div key={item.rank} className="menu-ranking-item">
                <div className={`rank-badge rank-${item.rank}`}>
                  {item.rank}
                </div>
                <div className="menu-content">
                  <div className="menu-name">{item.menu}</div>
                  <div className="menu-stats">
                    <span className="mentions">{item.mentions}回言及</span>
                    <div className="menu-progress">
                      <div 
                        className="menu-progress-fill"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="insight-box">
            <Lightbulb size={18} />
            <div>
              <strong>改善提案:</strong> 「焼き鳥盛り合わせ」への関心が圧倒的！
              特別な焼き鳥メニューの追加や、LINE配信での焼き鳥特集はいかがでしょうか？
            </div>
          </div>
        </section>

        {/* 予約の傾向分析 */}
        <section className="report-section trend-section">
          <div className="section-header">
            <h2>📅 予約の傾向分析</h2>
          </div>
          
          <div className="trend-grid">
            <div className="trend-chart">
              <h3>人気の時間帯</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={reportData.reservationTrends.timeSlots}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" stroke="#e2e8f0" />
                  <YAxis stroke="#e2e8f0" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.95)', 
                      border: 'none', 
                      borderRadius: '8px' 
                    }} 
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="trend-chart">
              <h3>人気の曜日</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={reportData.reservationTrends.dayOfWeek}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" stroke="#e2e8f0" />
                  <YAxis stroke="#e2e8f0" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.95)', 
                      border: 'none', 
                      borderRadius: '8px' 
                    }} 
                  />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="insight-box">
            <Lightbulb size={18} />
            <div>
              <strong>改善提案:</strong> 金土の19:00-20:00が激戦区ですね。
              この時間帯限定の特別メニューや、空いている時間帯のハッピーアワーで分散できるかもしれません。
            </div>
          </div>
        </section>

        {/* 今月の成果・気づき */}
        <section className="report-section insights-section">
          <div className="section-header">
            <h2>🎯 今月の成果・気づき</h2>
          </div>
          
          <div className="insights-grid">
            {reportData.insights.map((insight, index) => (
              <div key={index} className={`insight-card ${insight.type}`}>
                <div className="insight-icon">
                  {insight.type === 'positive' ? '✅' : insight.type === 'attention' ? '📍' : '⚠️'}
                </div>
                <div className="insight-content">
                  <div className="insight-title">{insight.title}</div>
                  <div className="insight-description">{insight.description}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 来月への提案 */}
        <section className="report-section proposals-section">
          <div className="section-header">
            <h2>💡 来月への提案</h2>
          </div>
          
          <div className="proposals-list">
            {reportData.proposals.map((proposal, index) => (
              <div key={index} className="proposal-item">
                <div className="proposal-header">
                  <div className={`priority-badge priority-${proposal.priority}`}>
                    優先度: {getPriorityLabel(proposal.priority)}
                  </div>
                  <div className="proposal-title">{proposal.title}</div>
                </div>
                <div className="proposal-content">
                  <div className="proposal-description">{proposal.description}</div>
                  <div className="proposal-impact">
                    <Target size={14} />
                    期待効果: {proposal.expectedImpact}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReportDetailView;