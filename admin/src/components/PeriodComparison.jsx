import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  LineChart,
  PieChart,
  ArrowUp,
  ArrowDown,
  Minus,
  Filter,
  Download,
  RefreshCw,
  Clock,
  Users,
  DollarSign,
  Activity,
  Zap,
  Target,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { 
  LineChart as ReLineChart, 
  Line, 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts';

const PeriodComparison = ({ isWidget = false }) => {
  const { api } = useAuth();
  const [loading, setLoading] = useState(true);
  const [comparisonData, setComparisonData] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [selectedPeriods, setSelectedPeriods] = useState({
    current: 'this_month',
    previous: 'last_month'
  });
  const [viewType, setViewType] = useState('chart');

  // ローカル環境判定
  const isLocalEnv = window.location.hostname === 'localhost';

  useEffect(() => {
    fetchComparisonData();
  }, [selectedMetric, selectedPeriods]);

  const fetchComparisonData = async () => {
    try {
      setLoading(true);
      
      // ローカル環境でのモックデータ
      if (isLocalEnv) {
        console.log('🔍 期間比較データ生成:', { selectedMetric, selectedPeriods });
        const mockData = generateMockComparisonData();
        setComparisonData(mockData);
        setLoading(false);
        return;
      }
      
      // 本番API呼び出し
      const response = await api.get('/analytics/comparison', {
        params: {
          metric: selectedMetric,
          current_period: selectedPeriods.current,
          previous_period: selectedPeriods.previous
        }
      });
      
      if (response.data.success) {
        setComparisonData(response.data.data);
      }
    } catch (error) {
      console.error('期間比較データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockComparisonData = () => {
    const currentPeriodLabel = getPeriodLabel(selectedPeriods.current);
    const previousPeriodLabel = getPeriodLabel(selectedPeriods.previous);
    
    // 日別データを生成
    const dailyData = [];
    const daysInPeriod = selectedPeriods.current.includes('month') ? 30 : 
                        selectedPeriods.current.includes('week') ? 7 : 365;
    
    for (let i = 0; i < daysInPeriod; i++) {
      const baseValue = getMetricBaseValue(selectedMetric);
      const currentValue = baseValue * (0.8 + Math.random() * 0.4);
      const previousValue = baseValue * (0.7 + Math.random() * 0.4);
      
      dailyData.push({
        day: i + 1,
        date: new Date(Date.now() - (daysInPeriod - i) * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP'),
        current: Math.round(currentValue),
        previous: Math.round(previousValue),
        growth: ((currentValue - previousValue) / previousValue * 100)
      });
    }

    // サマリー統計
    const currentTotal = dailyData.reduce((sum, d) => sum + d.current, 0);
    const previousTotal = dailyData.reduce((sum, d) => sum + d.previous, 0);
    const growthPercentage = ((currentTotal - previousTotal) / previousTotal * 100);
    
    // 店舗別比較データ
    const storeComparison = [
      { name: '居酒屋 花まる', current: 156000, previous: 139000, growth: 12.2 },
      { name: '海鮮居酒屋 大漁丸', current: 134000, previous: 142000, growth: -5.6 },
      { name: '創作和食 風花', current: 128000, previous: 118000, growth: 8.5 },
      { name: '串焼き専門店 炭火屋', current: 98000, previous: 85000, growth: 15.3 },
      { name: '昭和レトロ居酒屋 のんべえ横丁', current: 45000, previous: 52000, growth: -13.5 }
    ];

    // 重要な指標
    const keyMetrics = [
      {
        name: '平均日次売上',
        current: Math.round(currentTotal / daysInPeriod),
        previous: Math.round(previousTotal / daysInPeriod),
        format: 'currency'
      },
      {
        name: '最高日次売上',
        current: Math.max(...dailyData.map(d => d.current)),
        previous: Math.max(...dailyData.map(d => d.previous)),
        format: 'currency'
      },
      {
        name: '成長日数',
        current: dailyData.filter(d => d.growth > 0).length,
        previous: Math.floor(daysInPeriod * 0.6),
        format: 'number',
        suffix: '日'
      }
    ];

    return {
      summary: {
        current: {
          label: currentPeriodLabel,
          value: currentTotal,
          change: growthPercentage
        },
        previous: {
          label: previousPeriodLabel,
          value: previousTotal
        },
        growth: growthPercentage
      },
      dailyData,
      storeComparison,
      keyMetrics,
      insights: generateInsights(growthPercentage, storeComparison)
    };
  };

  const getMetricBaseValue = (metric) => {
    switch (metric) {
      case 'revenue': return 50000;
      case 'api_calls': return 1000;
      case 'reservations': return 25;
      case 'users': return 150;
      default: return 100;
    }
  };

  const getPeriodLabel = (period) => {
    switch (period) {
      case 'this_month': return '今月';
      case 'last_month': return '先月';
      case 'this_week': return '今週';
      case 'last_week': return '先週';
      case 'this_year': return '今年';
      case 'last_year': return '昨年';
      case 'this_quarter': return '今四半期';
      case 'last_quarter': return '前四半期';
      default: return period;
    }
  };

  const generateInsights = (growthPercentage, storeComparison) => {
    const insights = [];
    
    if (growthPercentage > 10) {
      insights.push({
        type: 'positive',
        title: '優秀な成長',
        message: `${growthPercentage.toFixed(1)}%の成長を達成しています。この調子を維持しましょう。`
      });
    } else if (growthPercentage < -5) {
      insights.push({
        type: 'negative',
        title: '改善が必要',
        message: `${Math.abs(growthPercentage).toFixed(1)}%の減少が見られます。原因分析が必要です。`
      });
    }

    const topGrowthStore = storeComparison.reduce((max, store) => 
      store.growth > max.growth ? store : max
    );
    
    if (topGrowthStore.growth > 10) {
      insights.push({
        type: 'positive',
        title: '成長店舗',
        message: `${topGrowthStore.name}が${topGrowthStore.growth.toFixed(1)}%の成長を記録しています。`
      });
    }

    const poorPerformers = storeComparison.filter(store => store.growth < -10);
    if (poorPerformers.length > 0) {
      insights.push({
        type: 'warning',
        title: '要注意店舗',
        message: `${poorPerformers.length}店舗で大幅な減少が見られます。`
      });
    }

    return insights;
  };

  const formatValue = (value, format, suffix = '') => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('ja-JP', {
          style: 'currency',
          currency: 'JPY',
          minimumFractionDigits: 0
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
        return value.toLocaleString('ja-JP') + suffix;
      default:
        return value.toString();
    }
  };

  const getGrowthIcon = (growth) => {
    if (growth > 5) return <ArrowUp className="text-green-500" size={16} />;
    if (growth < -5) return <ArrowDown className="text-red-500" size={16} />;
    return <Minus className="text-gray-500" size={16} />;
  };

  const getGrowthColor = (growth) => {
    if (growth > 5) return 'text-green-500';
    if (growth < -5) return 'text-red-500';
    return 'text-gray-500';
  };

  const metrics = [
    { id: 'revenue', label: '売上', icon: DollarSign, unit: '円' },
    { id: 'api_calls', label: 'API呼び出し', icon: Activity, unit: '回' },
    { id: 'reservations', label: '予約数', icon: Calendar, unit: '件' },
    { id: 'users', label: 'ユーザー数', icon: Users, unit: '人' }
  ];

  const periods = [
    { id: 'this_month', label: '今月' },
    { id: 'last_month', label: '先月' },
    { id: 'this_week', label: '今週' },
    { id: 'last_week', label: '先週' },
    { id: 'this_quarter', label: '今四半期' },
    { id: 'last_quarter', label: '前四半期' },
    { id: 'this_year', label: '今年' },
    { id: 'last_year', label: '昨年' }
  ];

  if (loading) {
    return (
      <div className="period-comparison-loading">
        <div className="loading-spinner"></div>
        <p>比較データを読み込み中...</p>
      </div>
    );
  }

  if (isWidget) {
    // ウィジェット表示（ダッシュボード用）
    return (
      <div className="period-comparison-widget">
        <div className="widget-header">
          <h3>📊 期間比較</h3>
          <button 
            className="btn-sm"
            onClick={() => window.location.href = '/analytics'}
          >
            詳細表示
          </button>
        </div>
        
        {comparisonData && (
          <div className="comparison-summary">
            <div className="summary-item">
              <div className="summary-label">{comparisonData.summary.current.label}</div>
              <div className="summary-value">
                {formatValue(comparisonData.summary.current.value, 'currency')}
              </div>
            </div>
            
            <div className="summary-comparison">
              <div className={`growth-indicator ${getGrowthColor(comparisonData.summary.growth)}`}>
                {getGrowthIcon(comparisonData.summary.growth)}
                <span>{formatValue(comparisonData.summary.growth, 'percentage')}</span>
              </div>
              <div className="comparison-label">
                vs {comparisonData.summary.previous.label}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // フルページ表示
  return (
    <div className="period-comparison">
      <div className="page-header">
        <h1>期間比較分析</h1>
        <div className="header-actions">
          <button className="btn-secondary">
            <Download size={18} />
            エクスポート
          </button>
          <button className="btn-secondary" onClick={fetchComparisonData}>
            <RefreshCw size={18} />
            更新
          </button>
        </div>
      </div>

      {/* 設定パネル */}
      <div className="comparison-controls">
        <div className="control-section">
          <h3>指標選択</h3>
          <div className="metric-selector">
            {metrics.map(metric => {
              const Icon = metric.icon;
              return (
                <button
                  key={metric.id}
                  className={`metric-btn ${selectedMetric === metric.id ? 'active' : ''}`}
                  onClick={() => setSelectedMetric(metric.id)}
                >
                  <Icon size={16} />
                  {metric.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="control-section">
          <h3>期間選択</h3>
          <div className="period-selectors">
            <div className="period-group">
              <label>比較元</label>
              <select
                value={selectedPeriods.current}
                onChange={(e) => setSelectedPeriods(prev => ({ ...prev, current: e.target.value }))}
                className="period-select"
              >
                {periods.map(period => (
                  <option key={period.id} value={period.id}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="period-group">
              <label>比較先</label>
              <select
                value={selectedPeriods.previous}
                onChange={(e) => setSelectedPeriods(prev => ({ ...prev, previous: e.target.value }))}
                className="period-select"
              >
                {periods.map(period => (
                  <option key={period.id} value={period.id}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="control-section">
          <h3>表示形式</h3>
          <div className="view-selector">
            <button
              className={`view-btn ${viewType === 'chart' ? 'active' : ''}`}
              onClick={() => setViewType('chart')}
            >
              <LineChart size={16} />
              チャート
            </button>
            <button
              className={`view-btn ${viewType === 'table' ? 'active' : ''}`}
              onClick={() => setViewType('table')}
            >
              <BarChart3 size={16} />
              テーブル
            </button>
          </div>
        </div>
      </div>

      {comparisonData && (
        <>
          {/* サマリー */}
          <div className="comparison-summary-section">
            <h2>比較サマリー</h2>
            <div className="summary-cards">
              <div className="summary-card current">
                <h3>{comparisonData.summary.current.label}</h3>
                <div className="summary-value">
                  {formatValue(comparisonData.summary.current.value, 'currency')}
                </div>
                <div className="summary-period">
                  {metrics.find(m => m.id === selectedMetric)?.label}
                </div>
              </div>
              
              <div className="summary-card comparison">
                <div className={`growth-indicator large ${getGrowthColor(comparisonData.summary.growth)}`}>
                  {getGrowthIcon(comparisonData.summary.growth)}
                  <span>{formatValue(Math.abs(comparisonData.summary.growth), 'percentage')}</span>
                  <small>
                    {comparisonData.summary.growth > 0 ? '増加' : comparisonData.summary.growth < 0 ? '減少' : '変化なし'}
                  </small>
                </div>
              </div>
              
              <div className="summary-card previous">
                <h3>{comparisonData.summary.previous.label}</h3>
                <div className="summary-value">
                  {formatValue(comparisonData.summary.previous.value, 'currency')}
                </div>
                <div className="summary-period">
                  {metrics.find(m => m.id === selectedMetric)?.label}
                </div>
              </div>
            </div>
          </div>

          {/* 主要指標 */}
          <div className="key-metrics-section">
            <h2>主要指標</h2>
            <div className="metrics-grid">
              {comparisonData.keyMetrics.map((metric, index) => {
                const growth = ((metric.current - metric.previous) / metric.previous * 100);
                return (
                  <div key={index} className="metric-card">
                    <h4>{metric.name}</h4>
                    <div className="metric-values">
                      <div className="metric-current">
                        {formatValue(metric.current, metric.format, metric.suffix)}
                      </div>
                      <div className={`metric-growth ${getGrowthColor(growth)}`}>
                        {getGrowthIcon(growth)}
                        {formatValue(Math.abs(growth), 'percentage')}
                      </div>
                    </div>
                    <div className="metric-previous">
                      前期: {formatValue(metric.previous, metric.format, metric.suffix)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* チャート表示 */}
          {viewType === 'chart' && (
            <div className="comparison-chart-section">
              <h2>推移比較</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={comparisonData.dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="day" 
                      tickFormatter={(value) => `${value}日`}
                    />
                    <YAxis 
                      tickFormatter={(value) => 
                        selectedMetric === 'revenue' ? `¥${(value / 1000).toFixed(0)}k` : value.toLocaleString()
                      }
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        formatValue(value, selectedMetric === 'revenue' ? 'currency' : 'number'),
                        name === 'current' ? comparisonData.summary.current.label : comparisonData.summary.previous.label
                      ]}
                      labelFormatter={(value) => `${value}日目`}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="previous"
                      stackId="1"
                      stroke="#94a3b8"
                      fill="#f1f5f9"
                      name={comparisonData.summary.previous.label}
                    />
                    <Line
                      type="monotone"
                      dataKey="current"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      name={comparisonData.summary.current.label}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* 店舗別比較 */}
          <div className="store-comparison-section">
            <h2>店舗別比較</h2>
            <div className="store-comparison-list">
              {comparisonData.storeComparison.map((store, index) => (
                <div key={index} className="store-comparison-item">
                  <div className="store-info">
                    <h4>{store.name}</h4>
                    <div className="store-values">
                      <span className="current-value">
                        {formatValue(store.current, 'currency')}
                      </span>
                      <div className={`growth-change ${getGrowthColor(store.growth)}`}>
                        {getGrowthIcon(store.growth)}
                        {formatValue(Math.abs(store.growth), 'percentage')}
                      </div>
                    </div>
                  </div>
                  <div className="store-chart">
                    <div 
                      className="progress-bar current"
                      style={{ 
                        width: `${(store.current / Math.max(...comparisonData.storeComparison.map(s => s.current))) * 100}%` 
                      }}
                    />
                    <div 
                      className="progress-bar previous"
                      style={{ 
                        width: `${(store.previous / Math.max(...comparisonData.storeComparison.map(s => s.current))) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* インサイト */}
          <div className="insights-section">
            <h2>分析インサイト</h2>
            <div className="insights-list">
              {comparisonData.insights.map((insight, index) => (
                <div key={index} className={`insight-card ${insight.type}`}>
                  <div className="insight-icon">
                    {insight.type === 'positive' && <TrendingUp size={20} />}
                    {insight.type === 'negative' && <TrendingDown size={20} />}
                    {insight.type === 'warning' && <AlertTriangle size={20} />}
                  </div>
                  <div className="insight-content">
                    <h4>{insight.title}</h4>
                    <p>{insight.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PeriodComparison;