import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Filter,
  Download,
  FileText
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RevenueManagement = () => {
  const { api } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [revenueData, setRevenueData] = useState(null);

  // ローカル環境判定
  const isLocalEnv = window.location.hostname === 'localhost';

  useEffect(() => {
    fetchRevenueData();
  }, [selectedPeriod, selectedYear]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      
      // ローカル環境でのモックデータ
      if (isLocalEnv) {
        console.log('🏠 ローカル環境：モック収益データを使用');
        const mockData = generateMockRevenueData();
        setRevenueData(mockData);
        setLoading(false);
        return;
      }
      
      // 本番API呼び出し
      const response = await api.get(`/revenue/stats?period=${selectedPeriod}&year=${selectedYear}`);
      if (response.data.success) {
        setRevenueData(response.data.data);
      }
    } catch (error) {
      console.error('収益データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockRevenueData = () => {
    // 月次データ生成
    const monthlyRevenue = [];
    const currentMonth = new Date().getMonth();
    
    for (let i = 0; i < 12; i++) {
      if (i <= currentMonth) {
        monthlyRevenue.push({
          month: `${i + 1}月`,
          revenue: Math.floor(Math.random() * 500000) + 800000,
          mrr: Math.floor(Math.random() * 100000) + 150000,
          arpu: Math.floor(Math.random() * 5000) + 8000,
          stores: Math.floor(Math.random() * 5) + 10
        });
      }
    }

    // プラン別収益
    const planRevenue = [
      { name: 'エントリー', value: 324000, stores: 8, color: '#4ade80' },
      { name: 'スタンダード', value: 892000, stores: 10, color: '#3b82f6' },
      { name: 'プロ', value: 546000, stores: 3, color: '#a855f7' }
    ];

    // 店舗別収益ランキング
    const storeRanking = [
      { name: '居酒屋 花まる 渋谷店', revenue: 156000, growth: 12.5 },
      { name: '海鮮居酒屋 大漁丸', revenue: 134000, growth: 8.3 },
      { name: '創作和食 風花', revenue: 128000, growth: -3.2 },
      { name: '串焼き専門店 炭火屋', revenue: 98000, growth: 15.7 },
      { name: '昭和レトロ居酒屋 のんべえ横丁', revenue: 45000, growth: -10.5 }
    ];

    // KPIサマリー
    const kpiSummary = {
      totalRevenue: monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0),
      totalMRR: 234000,
      activeStores: 21,
      avgARPU: 11143,
      growthRate: 8.5,
      churnRate: 2.1
    };

    return {
      monthlyRevenue,
      planRevenue,
      storeRanking,
      kpiSummary
    };
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value) => {
    const prefix = value > 0 ? '+' : '';
    return `${prefix}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="revenue-management-loading">
        <div className="loading-spinner"></div>
        <p>収益データを読み込み中...</p>
      </div>
    );
  }

  const { monthlyRevenue, planRevenue, storeRanking, kpiSummary } = revenueData;

  return (
    <div className="revenue-management">
      <div className="page-header">
        <h1>収益管理ダッシュボード</h1>
        <div className="header-actions">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="period-selector"
          >
            <option value="month">月次</option>
            <option value="quarter">四半期</option>
            <option value="year">年次</option>
          </select>
          
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="year-selector"
          >
            <option value={2024}>2024年</option>
            <option value={2023}>2023年</option>
          </select>
          
          <button className="btn-secondary">
            <Download size={18} />
            エクスポート
          </button>
        </div>
      </div>

      {/* KPIカード */}
      <div className="kpi-cards">
        <div className="kpi-card">
          <div className="kpi-header">
            <DollarSign size={24} />
            <span className="kpi-label">総収益</span>
          </div>
          <div className="kpi-value">{formatCurrency(kpiSummary.totalRevenue)}</div>
          <div className="kpi-change positive">
            <ArrowUp size={16} />
            {formatPercentage(kpiSummary.growthRate)}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <TrendingUp size={24} />
            <span className="kpi-label">MRR</span>
          </div>
          <div className="kpi-value">{formatCurrency(kpiSummary.totalMRR)}</div>
          <div className="kpi-change positive">
            <ArrowUp size={16} />
            {formatPercentage(5.2)}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <Users size={24} />
            <span className="kpi-label">アクティブ店舗</span>
          </div>
          <div className="kpi-value">{kpiSummary.activeStores}店舗</div>
          <div className="kpi-change positive">
            <ArrowUp size={16} />
            +2店舗
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <CreditCard size={24} />
            <span className="kpi-label">ARPU</span>
          </div>
          <div className="kpi-value">{formatCurrency(kpiSummary.avgARPU)}</div>
          <div className="kpi-change negative">
            <ArrowDown size={16} />
            {formatPercentage(-1.8)}
          </div>
        </div>
      </div>

      {/* 収益推移グラフ */}
      <div className="chart-container">
        <div className="chart-header">
          <h2>月次収益推移</h2>
          <div className="chart-legend">
            <span className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#3b82f6' }}></span>
              総収益
            </span>
            <span className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>
              MRR
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="mrr" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 詳細データテーブル */}
      <div className="revenue-tables-section">
        <div className="tables-row">
          {/* プラン別収益テーブル */}
          <div className="table-container half">
            <div className="table-header">
              <h2>📊 プラン別収益詳細</h2>
            </div>
            <table className="revenue-table">
              <thead>
                <tr>
                  <th>プラン</th>
                  <th>店舗数</th>
                  <th>収益</th>
                  <th>平均単価</th>
                  <th>構成比</th>
                </tr>
              </thead>
              <tbody>
                {planRevenue.map((plan) => {
                  const totalRevenue = planRevenue.reduce((sum, p) => sum + p.value, 0);
                  const percentage = ((plan.value / totalRevenue) * 100).toFixed(1);
                  const avgPrice = Math.round(plan.value / plan.stores);
                  
                  return (
                    <tr key={plan.name}>
                      <td className="plan-name-cell">
                        <div className="plan-indicator">
                          <div className="plan-color" style={{ backgroundColor: plan.color }}></div>
                          <span>{plan.name}</span>
                        </div>
                      </td>
                      <td className="numeric-cell">{plan.stores}店舗</td>
                      <td className="revenue-cell">{formatCurrency(plan.value)}</td>
                      <td className="numeric-cell">{formatCurrency(avgPrice)}</td>
                      <td className="percentage-cell">
                        <div className="percentage-bar">
                          <div 
                            className="percentage-fill"
                            style={{ 
                              width: `${percentage}%`, 
                              backgroundColor: plan.color 
                            }}
                          />
                          <span className="percentage-text">{percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 店舗別収益テーブル */}
          <div className="table-container half">
            <div className="table-header">
              <h2>🏆 店舗別収益ランキング</h2>
            </div>
            <table className="revenue-table">
              <thead>
                <tr>
                  <th>順位</th>
                  <th>店舗名</th>
                  <th>収益</th>
                  <th>成長率</th>
                  <th>パフォーマンス</th>
                </tr>
              </thead>
              <tbody>
                {storeRanking.map((store, index) => (
                  <tr key={store.name}>
                    <td className="rank-cell">
                      <div className={`rank-badge rank-${index + 1}`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="store-name-cell">
                      <div className="store-name-content">
                        <span className="store-name">{store.name}</span>
                      </div>
                    </td>
                    <td className="revenue-cell">{formatCurrency(store.revenue)}</td>
                    <td className="growth-cell">
                      <div className={`growth-indicator ${store.growth > 0 ? 'positive' : 'negative'}`}>
                        {store.growth > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                        <span>{formatPercentage(Math.abs(store.growth))}</span>
                      </div>
                    </td>
                    <td className="performance-cell">
                      <div className="performance-bar">
                        <div 
                          className="performance-fill"
                          style={{ 
                            width: `${(store.revenue / storeRanking[0].revenue) * 100}%`,
                            backgroundColor: store.growth > 10 ? '#10b981' : 
                                           store.growth > 0 ? '#f59e0b' : '#ef4444'
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 月次データテーブル */}
      <div className="monthly-data-section">
        <div className="table-header">
          <h2>📅 月次収益データ</h2>
          <div className="table-actions">
            <button className="btn-sm">
              <Download size={14} />
              CSV出力
            </button>
          </div>
        </div>
        <div className="monthly-table-container">
          <table className="monthly-revenue-table">
            <thead>
              <tr>
                <th>月</th>
                <th>総収益</th>
                <th>MRR</th>
                <th>ARPU</th>
                <th>店舗数</th>
                <th>前月比</th>
                <th>トレンド</th>
              </tr>
            </thead>
            <tbody>
              {monthlyRevenue.map((month, index) => {
                const prevMonth = monthlyRevenue[index - 1];
                const growth = prevMonth ? 
                  ((month.revenue - prevMonth.revenue) / prevMonth.revenue * 100) : 0;
                
                return (
                  <tr key={month.month}>
                    <td className="month-cell">
                      <strong>{month.month}</strong>
                    </td>
                    <td className="revenue-cell">
                      <span className="main-value">{formatCurrency(month.revenue)}</span>
                    </td>
                    <td className="mrr-cell">
                      <span className="mrr-value">{formatCurrency(month.mrr)}</span>
                    </td>
                    <td className="arpu-cell">
                      <span className="arpu-value">{formatCurrency(month.arpu)}</span>
                    </td>
                    <td className="stores-cell">
                      <span className="stores-count">{month.stores}店舗</span>
                    </td>
                    <td className="growth-cell">
                      {prevMonth && (
                        <div className={`growth-indicator ${growth > 0 ? 'positive' : 'negative'}`}>
                          {growth > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          <span>{formatPercentage(Math.abs(growth))}</span>
                        </div>
                      )}
                    </td>
                    <td className="trend-cell">
                      <div className="mini-chart">
                        {/* 簡易トレンドインジケーター */}
                        <div className={`trend-indicator ${growth > 5 ? 'strong-up' : growth > 0 ? 'up' : growth > -5 ? 'down' : 'strong-down'}`}>
                          {growth > 5 ? '📈' : growth > 0 ? '↗️' : growth > -5 ? '↘️' : '📉'}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="summary-row">
                <td><strong>合計</strong></td>
                <td className="revenue-cell">
                  <strong>{formatCurrency(monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0))}</strong>
                </td>
                <td className="mrr-cell">
                  <strong>{formatCurrency(monthlyRevenue.reduce((sum, m) => sum + m.mrr, 0))}</strong>
                </td>
                <td className="arpu-cell">
                  <strong>{formatCurrency(Math.round(monthlyRevenue.reduce((sum, m) => sum + m.arpu, 0) / monthlyRevenue.length))}</strong>
                </td>
                <td className="stores-cell">
                  <strong>{Math.max(...monthlyRevenue.map(m => m.stores))}店舗</strong>
                </td>
                <td colSpan="2" className="summary-note">
                  <small>年間平均成長率: {formatPercentage(kpiSummary.growthRate)}</small>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 予測・分析セクション */}
      <div className="analysis-section">
        <h2>収益分析と予測</h2>
        <div className="analysis-cards">
          <div className="analysis-card">
            <h3>成長率分析</h3>
            <div className="metric-row">
              <span>前月比成長率</span>
              <span className="value positive">{formatPercentage(kpiSummary.growthRate)}</span>
            </div>
            <div className="metric-row">
              <span>四半期成長率</span>
              <span className="value positive">{formatPercentage(15.3)}</span>
            </div>
            <div className="metric-row">
              <span>年間成長率</span>
              <span className="value positive">{formatPercentage(42.7)}</span>
            </div>
          </div>

          <div className="analysis-card">
            <h3>顧客維持率</h3>
            <div className="metric-row">
              <span>継続率</span>
              <span className="value">{(100 - kpiSummary.churnRate).toFixed(1)}%</span>
            </div>
            <div className="metric-row">
              <span>チャーン率</span>
              <span className="value negative">{kpiSummary.churnRate}%</span>
            </div>
            <div className="metric-row">
              <span>LTV/CAC</span>
              <span className="value positive">3.2x</span>
            </div>
          </div>

          <div className="analysis-card">
            <h3>来月の予測</h3>
            <div className="metric-row">
              <span>予測MRR</span>
              <span className="value">{formatCurrency(kpiSummary.totalMRR * 1.085)}</span>
            </div>
            <div className="metric-row">
              <span>新規獲得目標</span>
              <span className="value">3店舗</span>
            </div>
            <div className="metric-row">
              <span>予測総収益</span>
              <span className="value">{formatCurrency(1234000)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="action-buttons">
        <button className="btn-primary">
          <FileText size={18} />
          月次収益レポート生成
        </button>
        <button className="btn-secondary">
          <BarChart3 size={18} />
          詳細分析画面へ
        </button>
      </div>
    </div>
  );
};

export default RevenueManagement;