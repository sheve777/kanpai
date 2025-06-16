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
  FileText,
  Store
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
      { name: 'エントリー', value: 324000, stores: 8, color: 'var(--success-500)' },
      { name: 'スタンダード', value: 892000, stores: 10, color: 'var(--info-500)' },
      { name: 'プロ', value: 546000, stores: 3, color: 'var(--chart-purple)' }
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

      {/* 収益サマリー（横一列） */}
      <div className="revenue-summary-bar">
        <div className="summary-container">
          <div className="summary-title">💰 本月の収益サマリー</div>
          <div className="summary-stats">
            <div className="summary-stat-item">
              <DollarSign size={18} style={{ color: 'var(--success-500)' }} />
              <div className="stat-content">
                <span className="stat-value">{formatCurrency(kpiSummary.totalRevenue)}</span>
                <span className="stat-label">総収益</span>
              </div>
              <div className="stat-trend positive">
                <ArrowUp size={12} />
                <span>{formatPercentage(kpiSummary.growthRate)}</span>
              </div>
            </div>
            
            <div className="summary-stat-item">
              <TrendingUp size={18} style={{ color: 'var(--info-500)' }} />
              <div className="stat-content">
                <span className="stat-value">{formatCurrency(kpiSummary.totalMRR)}</span>
                <span className="stat-label">MRR</span>
              </div>
              <div className="stat-trend positive">
                <ArrowUp size={12} />
                <span>{formatPercentage(5.2)}</span>
              </div>
            </div>
            
            <div className="summary-stat-item">
              <Users size={18} style={{ color: 'var(--warning-500)' }} />
              <div className="stat-content">
                <span className="stat-value">{kpiSummary.activeStores}</span>
                <span className="stat-label">アクティブ店舗</span>
              </div>
              <div className="stat-trend positive">
                <ArrowUp size={12} />
                <span>+2店舗</span>
              </div>
            </div>
            
            <div className="summary-stat-item">
              <CreditCard size={18} style={{ color: 'var(--chart-purple)' }} />
              <div className="stat-content">
                <span className="stat-value">{formatCurrency(kpiSummary.avgARPU)}</span>
                <span className="stat-label">ARPU</span>
              </div>
              <div className="stat-trend negative">
                <ArrowDown size={12} />
                <span>{formatPercentage(-1.8)}</span>
              </div>
            </div>
          </div>
          <div className="summary-actions">
            <span className="update-info">
              <Calendar size={14} />
              {selectedYear}年{selectedPeriod === 'month' ? '月次' : selectedPeriod === 'quarter' ? '四半期' : '年次'}データ
            </span>
          </div>
        </div>
      </div>

      {/* 月次収益データテーブル */}
      <div className="monthly-revenue-section">
        <h2>📈 月次収益データ</h2>
        <div className="table-container">
          <table className="revenue-table">
            <thead>
              <tr>
                <th>月</th>
                <th>総収益</th>
                <th>MRR</th>
                <th>ARPU</th>
                <th>店舗数</th>
                <th>前月比</th>
                <th>成長率</th>
              </tr>
            </thead>
            <tbody>
              {monthlyRevenue.map((month, index) => {
                const prevMonth = monthlyRevenue[index - 1];
                const growth = prevMonth ? 
                  ((month.revenue - prevMonth.revenue) / prevMonth.revenue * 100) : 0;
                
                return (
                  <tr key={month.month}>
                    <td>
                      <span className="month-badge">{month.month}</span>
                    </td>
                    <td>
                      <span className="revenue-value">{formatCurrency(month.revenue)}</span>
                    </td>
                    <td>
                      <span className="mrr-value">{formatCurrency(month.mrr)}</span>
                    </td>
                    <td>
                      <span className="arpu-value">{formatCurrency(month.arpu)}</span>
                    </td>
                    <td>
                      <span className="store-count">{month.stores}店舗</span>
                    </td>
                    <td>
                      {prevMonth && (
                        <div className={`growth-indicator ${growth > 0 ? 'positive' : 'negative'}`}>
                          {growth > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                          <span>{formatPercentage(Math.abs(growth))}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className={`trend-indicator ${growth > 5 ? 'strong-up' : growth > 0 ? 'up' : growth > -5 ? 'down' : 'strong-down'}`}>
                        {growth > 5 ? '📈' : growth > 0 ? '↗️' : growth > -5 ? '↘️' : '📉'}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* プラン別収益テーブル */}
      <div className="plan-revenue-section">
        <h2>📊 プラン別収益詳細</h2>
        <div className="table-container">
          <table className="revenue-table">
            <thead>
              <tr>
                <th>プラン</th>
                <th>店舗数</th>
                <th>収益</th>
                <th>平均単価</th>
                <th>構成比</th>
                <th>アクション</th>
              </tr>
            </thead>
            <tbody>
              {planRevenue.map((plan) => {
                const totalRevenue = planRevenue.reduce((sum, p) => sum + p.value, 0);
                const percentage = ((plan.value / totalRevenue) * 100).toFixed(1);
                const avgPrice = Math.round(plan.value / plan.stores);
                
                return (
                  <tr key={plan.name}>
                    <td>
                      <div className="plan-name-cell">
                        <div className="plan-color" style={{ backgroundColor: plan.color }}></div>
                        <span>{plan.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="store-count">{plan.stores}店舗</span>
                    </td>
                    <td>
                      <span className="revenue-value">{formatCurrency(plan.value)}</span>
                    </td>
                    <td>
                      <span className="price-value">{formatCurrency(avgPrice)}</span>
                    </td>
                    <td>
                      <div className="percentage-display">
                        <span className="percentage-value">{percentage}%</span>
                        <div className="percentage-bar">
                          <div 
                            className="percentage-fill"
                            style={{ 
                              width: `${percentage}%`, 
                              backgroundColor: plan.color 
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <button className="btn-sm primary">詳細</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 店舗別収益ランキングテーブル */}
      <div className="store-ranking-section">
        <h2>🏆 店舗別収益ランキング</h2>
        <div className="table-container">
          <table className="revenue-table">
            <thead>
              <tr>
                <th>順位</th>
                <th>店舗名</th>
                <th>収益</th>
                <th>成長率</th>
                <th>パフォーマンス</th>
                <th>アクション</th>
              </tr>
            </thead>
            <tbody>
              {storeRanking.map((store, index) => (
                <tr key={store.name}>
                  <td>
                    <div className={`rank-badge rank-${index + 1}`}>
                      {index + 1}
                    </div>
                  </td>
                  <td>
                    <div className="store-name-cell">
                      <Store size={16} />
                      <span>{store.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="revenue-value">{formatCurrency(store.revenue)}</span>
                  </td>
                  <td>
                    <div className={`growth-indicator ${store.growth > 0 ? 'positive' : 'negative'}`}>
                      {store.growth > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                      <span>{formatPercentage(Math.abs(store.growth))}</span>
                    </div>
                  </td>
                  <td>
                    <div className="performance-bar">
                      <div 
                        className="performance-fill"
                        style={{ 
                          width: `${(store.revenue / storeRanking[0].revenue) * 100}%`,
                          backgroundColor: store.growth > 10 ? 'var(--success-500)' : 
                                         store.growth > 0 ? 'var(--warning-500)' : 'var(--error-500)'
                        }}
                      />
                      <span className="performance-text">{Math.round((store.revenue / storeRanking[0].revenue) * 100)}%</span>
                    </div>
                  </td>
                  <td>
                    <button className="btn-sm secondary">詳細</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default RevenueManagement;