import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Clock,
  Zap,
  DollarSign,
  BarChart3,
  LineChart,
  Target,
  Settings,
  Bell,
  RefreshCw,
  Filter,
  Eye,
  Download
} from 'lucide-react';
import { 
  LineChart as ReLineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Brush
} from 'recharts';

const ApiUsagePrediction = ({ isWidget = false }) => {
  const { api } = useAuth();
  const [loading, setLoading] = useState(true);
  const [predictionData, setPredictionData] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [selectedStore, setSelectedStore] = useState('all');
  const [alertThresholds, setAlertThresholds] = useState({
    warning: 80,
    critical: 95
  });

  // ローカル環境判定
  const isLocalEnv = window.location.hostname === 'localhost';

  useEffect(() => {
    fetchPredictionData();
  }, [selectedTimeframe, selectedStore]);

  const fetchPredictionData = async () => {
    try {
      setLoading(true);
      
      // ローカル環境でのモックデータ
      if (isLocalEnv) {
        console.log('🔮 API使用量予測データ生成:', { selectedTimeframe, selectedStore });
        const mockData = generateMockPredictionData();
        setPredictionData(mockData);
        setLoading(false);
        return;
      }
      
      // 本番API呼び出し
      const response = await api.get('/analytics/api-prediction', {
        params: {
          timeframe: selectedTimeframe,
          store: selectedStore
        }
      });
      
      if (response.data.success) {
        setPredictionData(response.data.data);
      }
    } catch (error) {
      console.error('API使用量予測データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockPredictionData = () => {
    // 過去データ + 予測データを生成
    const totalDays = selectedTimeframe === 'week' ? 14 : 
                     selectedTimeframe === 'month' ? 60 : 120;
    const pastDays = Math.floor(totalDays * 0.6);
    
    const data = [];
    let baseUsage = 1000;
    let trend = 1.02; // 2%の日次成長
    
    // 過去データ
    for (let i = -pastDays; i <= 0; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const dailyVariation = 0.8 + Math.random() * 0.4;
      const weekendEffect = date.getDay() === 0 || date.getDay() === 6 ? 0.7 : 1.0;
      const usage = Math.round(baseUsage * Math.pow(trend, i) * dailyVariation * weekendEffect);
      
      data.push({
        date: date.toISOString().split('T')[0],
        dateLabel: date.toLocaleDateString('ja-JP'),
        actual: usage,
        predicted: null,
        isPrediction: false,
        cumulative: usage * (pastDays + i + 1),
        limit: getMonthlyLimit()
      });
    }
    
    // 予測データ
    const futureDays = totalDays - pastDays;
    for (let i = 1; i <= futureDays; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const seasonalEffect = 1 + 0.1 * Math.sin(i / 7 * Math.PI); // 週次変動
      const weekendEffect = date.getDay() === 0 || date.getDay() === 6 ? 0.7 : 1.0;
      const confidence = Math.max(0.7, 1 - i / futureDays * 0.3); // 予測の信頼度
      
      const predicted = Math.round(baseUsage * Math.pow(trend, i) * seasonalEffect * weekendEffect);
      const variance = predicted * (1 - confidence) * 0.2;
      
      data.push({
        date: date.toISOString().split('T')[0],
        dateLabel: date.toLocaleDateString('ja-JP'),
        actual: null,
        predicted: predicted,
        upperBound: predicted + variance,
        lowerBound: predicted - variance,
        confidence: confidence,
        isPrediction: true,
        cumulative: data[data.length - 1].cumulative + predicted,
        limit: getMonthlyLimit()
      });
    }

    // 月次制限の計算
    const currentUsage = data.filter(d => !d.isPrediction).reduce((sum, d) => sum + d.actual, 0);
    const predictedUsage = data.filter(d => d.isPrediction).reduce((sum, d) => sum + d.predicted, 0);
    const totalPredicted = currentUsage + predictedUsage;
    const monthlyLimit = getMonthlyLimit();
    
    // 店舗別データ
    const storeBreakdown = [
      { name: '居酒屋 花まる', current: 25000, predicted: 32000, limit: 35000, efficiency: 0.91 },
      { name: '海鮮居酒屋 大漁丸', current: 18000, predicted: 22000, limit: 25000, efficiency: 0.88 },
      { name: '創作和食 風花', current: 15000, predicted: 19000, limit: 20000, efficiency: 0.95 },
      { name: '串焼き専門店 炭火屋', current: 12000, predicted: 14000, limit: 15000, efficiency: 0.93 },
      { name: 'のんべえ横丁', current: 8000, predicted: 9000, limit: 10000, efficiency: 0.90 }
    ];

    // リスク分析
    const risks = generateRiskAnalysis(totalPredicted, monthlyLimit, storeBreakdown);
    
    // 最適化提案
    const optimizations = generateOptimizations(storeBreakdown, totalPredicted, monthlyLimit);

    return {
      timeSeries: data,
      summary: {
        currentUsage,
        predictedTotal: totalPredicted,
        monthlyLimit,
        utilizationRate: (totalPredicted / monthlyLimit * 100),
        daysRemaining: futureDays,
        averageDailyUsage: currentUsage / pastDays,
        predictedDailyUsage: predictedUsage / futureDays
      },
      storeBreakdown,
      risks,
      optimizations,
      alerts: generateAlerts(totalPredicted, monthlyLimit, alertThresholds)
    };
  };

  const getMonthlyLimit = () => {
    // プランに応じた月次制限（モック）
    switch (selectedStore) {
      case 'all': return 100000;
      default: return 20000;
    }
  };

  const generateRiskAnalysis = (predicted, limit, stores) => {
    const risks = [];
    
    const utilizationRate = predicted / limit * 100;
    
    if (utilizationRate > 100) {
      risks.push({
        level: 'critical',
        title: '制限超過予測',
        description: `月次制限を${(utilizationRate - 100).toFixed(1)}%超過する可能性があります`,
        impact: 'サービス停止リスク'
      });
    } else if (utilizationRate > 90) {
      risks.push({
        level: 'high',
        title: '制限接近',
        description: `月次制限の${utilizationRate.toFixed(1)}%に達する予測です`,
        impact: '追加コスト発生の可能性'
      });
    }

    const inefficientStores = stores.filter(store => store.efficiency < 0.85);
    if (inefficientStores.length > 0) {
      risks.push({
        level: 'medium',
        title: '非効率な店舗',
        description: `${inefficientStores.length}店舗で効率性の改善が必要です`,
        impact: 'コスト最適化の機会'
      });
    }

    return risks;
  };

  const generateOptimizations = (stores, predicted, limit) => {
    const optimizations = [];
    
    const utilizationRate = predicted / limit * 100;
    
    if (utilizationRate > 85) {
      optimizations.push({
        title: 'キャッシュ戦略の見直し',
        description: 'API応答のキャッシュ時間を延長することで、重複リクエストを削減',
        expectedSaving: '15-25%',
        effort: 'low'
      });
      
      optimizations.push({
        title: 'バッチ処理の導入',
        description: '複数のリクエストをまとめて処理することで効率性を向上',
        expectedSaving: '20-30%',
        effort: 'medium'
      });
    }

    const highUsageStores = stores.filter(store => store.predicted / store.limit > 0.8);
    if (highUsageStores.length > 0) {
      optimizations.push({
        title: '高使用量店舗の最適化',
        description: `${highUsageStores.map(s => s.name).join(', ')}の使用パターンを分析し最適化`,
        expectedSaving: '10-20%',
        effort: 'high'
      });
    }

    optimizations.push({
      title: 'リアルタイム監視の強化',
      description: '使用量の急増を早期検知し、自動的に制御する仕組みの構築',
      expectedSaving: '5-15%',
      effort: 'medium'
    });

    return optimizations;
  };

  const generateAlerts = (predicted, limit, thresholds) => {
    const alerts = [];
    const utilizationRate = predicted / limit * 100;
    
    if (utilizationRate > thresholds.critical) {
      alerts.push({
        level: 'critical',
        message: `月次制限の${utilizationRate.toFixed(1)}%に達する予測です`,
        action: '緊急対応が必要'
      });
    } else if (utilizationRate > thresholds.warning) {
      alerts.push({
        level: 'warning',
        message: `月次制限の${utilizationRate.toFixed(1)}%に達する予測です`,
        action: '使用量の監視を強化してください'
      });
    }

    return alerts;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="text-red-600" size={20} />;
      case 'high': return <TrendingUp className="text-orange-600" size={20} />;
      case 'medium': return <Clock className="text-yellow-600" size={20} />;
      case 'low': return <CheckCircle className="text-green-600" size={20} />;
      default: return <Activity size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="api-prediction-loading">
        <div className="loading-spinner"></div>
        <p>予測データを計算中...</p>
      </div>
    );
  }

  if (isWidget && predictionData) {
    // ウィジェット表示（ダッシュボード用）
    return (
      <div className="api-prediction-widget">
        <div className="widget-header">
          <h3>🔮 API使用量予測</h3>
          <button 
            className="btn-sm"
            onClick={() => window.location.href = '/analytics/api-prediction'}
          >
            詳細表示
          </button>
        </div>
        
        <div className="prediction-summary">
          <div className="usage-progress">
            <div className="progress-info">
              <span>今月の予測使用量</span>
              <span className="usage-percentage">
                {predictionData.summary.utilizationRate.toFixed(1)}%
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${Math.min(predictionData.summary.utilizationRate, 100)}%`,
                  backgroundColor: predictionData.summary.utilizationRate > 90 ? '#ef4444' : 
                                  predictionData.summary.utilizationRate > 80 ? '#f59e0b' : '#10b981'
                }}
              />
            </div>
            <div className="progress-labels">
              <span>{formatNumber(predictionData.summary.predictedTotal)}</span>
              <span>{formatNumber(predictionData.summary.monthlyLimit)}</span>
            </div>
          </div>
          
          {predictionData.alerts.length > 0 && (
            <div className="widget-alerts">
              {predictionData.alerts.slice(0, 1).map((alert, index) => (
                <div key={index} className={`alert ${alert.level}`}>
                  <AlertTriangle size={14} />
                  <span>{alert.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // フルページ表示
  return (
    <div className="api-usage-prediction">
      <div className="page-header">
        <h1>API使用量予測</h1>
        <div className="header-actions">
          <button className="btn-secondary">
            <Download size={18} />
            レポート出力
          </button>
          <button className="btn-secondary" onClick={fetchPredictionData}>
            <RefreshCw size={18} />
            更新
          </button>
        </div>
      </div>

      {/* コントロール */}
      <div className="prediction-controls">
        <div className="control-group">
          <label>予測期間</label>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="control-select"
          >
            <option value="week">2週間</option>
            <option value="month">2ヶ月</option>
            <option value="quarter">3ヶ月</option>
          </select>
        </div>
        
        <div className="control-group">
          <label>対象店舗</label>
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="control-select"
          >
            <option value="all">全店舗</option>
            <option value="store1">居酒屋 花まる</option>
            <option value="store2">海鮮居酒屋 大漁丸</option>
            <option value="store3">創作和食 風花</option>
          </select>
        </div>
      </div>

      {predictionData && (
        <>
          {/* サマリー */}
          <div className="prediction-summary-section">
            <div className="summary-cards">
              <div className="summary-card">
                <div className="card-header">
                  <Activity size={20} />
                  <span>現在の使用量</span>
                </div>
                <div className="card-value">
                  {formatNumber(predictionData.summary.currentUsage)}
                </div>
                <div className="card-detail">
                  日平均: {formatNumber(predictionData.summary.averageDailyUsage)}
                </div>
              </div>
              
              <div className="summary-card">
                <div className="card-header">
                  <TrendingUp size={20} />
                  <span>月末予測</span>
                </div>
                <div className="card-value">
                  {formatNumber(predictionData.summary.predictedTotal)}
                </div>
                <div className="card-detail">
                  制限の {predictionData.summary.utilizationRate.toFixed(1)}%
                </div>
              </div>
              
              <div className="summary-card">
                <div className="card-header">
                  <Target size={20} />
                  <span>月次制限</span>
                </div>
                <div className="card-value">
                  {formatNumber(predictionData.summary.monthlyLimit)}
                </div>
                <div className="card-detail">
                  残り {predictionData.summary.daysRemaining}日
                </div>
              </div>
              
              <div className="summary-card">
                <div className="card-header">
                  <DollarSign size={20} />
                  <span>予想コスト</span>
                </div>
                <div className="card-value">
                  ¥{Math.round(predictionData.summary.predictedTotal * 0.02).toLocaleString()}
                </div>
                <div className="card-detail">
                  ¥0.02/リクエスト
                </div>
              </div>
            </div>
          </div>

          {/* アラート */}
          {predictionData.alerts.length > 0 && (
            <div className="alerts-section">
              <h2>アラート</h2>
              <div className="alerts-list">
                {predictionData.alerts.map((alert, index) => (
                  <div key={index} className={`alert-card ${alert.level}`}>
                    <AlertTriangle size={20} />
                    <div className="alert-content">
                      <div className="alert-message">{alert.message}</div>
                      <div className="alert-action">{alert.action}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 予測チャート */}
          <div className="prediction-chart-section">
            <h2>使用量推移と予測</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={predictionData.timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="dateLabel"
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tickFormatter={formatNumber}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      formatNumber(value),
                      name === 'actual' ? '実績' : name === 'predicted' ? '予測' : '制限'
                    ]}
                  />
                  <Legend />
                  
                  {/* 実績エリア */}
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    name="実績"
                    connectNulls={false}
                  />
                  
                  {/* 予測エリア */}
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.2}
                    name="予測"
                    strokeDasharray="5 5"
                    connectNulls={false}
                  />
                  
                  {/* 制限線 */}
                  <ReferenceLine 
                    y={predictionData.summary.monthlyLimit} 
                    stroke="#ef4444" 
                    strokeDasharray="3 3"
                    label="月次制限"
                  />
                  
                  <Brush dataKey="dateLabel" height={30} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 店舗別分析 */}
          <div className="store-breakdown-section">
            <h2>店舗別使用量分析</h2>
            <div className="store-breakdown-list">
              {predictionData.storeBreakdown.map((store, index) => (
                <div key={index} className="store-breakdown-item">
                  <div className="store-info">
                    <h4>{store.name}</h4>
                    <div className="store-metrics">
                      <span>現在: {formatNumber(store.current)}</span>
                      <span>予測: {formatNumber(store.predicted)}</span>
                      <span>効率: {(store.efficiency * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="store-progress">
                    <div className="progress-bars">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill current"
                          style={{ width: `${(store.current / store.limit) * 100}%` }}
                        />
                        <div 
                          className="progress-fill predicted"
                          style={{ 
                            width: `${(store.predicted / store.limit) * 100}%`,
                            opacity: 0.5
                          }}
                        />
                      </div>
                    </div>
                    <div className="progress-label">
                      {((store.predicted / store.limit) * 100).toFixed(1)}% / 制限
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* リスク分析 */}
          <div className="risk-analysis-section">
            <h2>リスク分析</h2>
            <div className="risks-list">
              {predictionData.risks.map((risk, index) => (
                <div key={index} className={`risk-card ${risk.level}`}>
                  <div className="risk-icon">
                    {getRiskIcon(risk.level)}
                  </div>
                  <div className="risk-content">
                    <h4>{risk.title}</h4>
                    <p>{risk.description}</p>
                    <div className="risk-impact">影響: {risk.impact}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 最適化提案 */}
          <div className="optimizations-section">
            <h2>最適化提案</h2>
            <div className="optimizations-list">
              {predictionData.optimizations.map((optimization, index) => (
                <div key={index} className="optimization-card">
                  <div className="optimization-header">
                    <h4>{optimization.title}</h4>
                    <div className="optimization-effort">
                      <span className={`effort-badge ${optimization.effort}`}>
                        {optimization.effort === 'low' ? '簡単' : 
                         optimization.effort === 'medium' ? '普通' : '困難'}
                      </span>
                    </div>
                  </div>
                  <p>{optimization.description}</p>
                  <div className="optimization-saving">
                    期待削減: {optimization.expectedSaving}
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

export default ApiUsagePrediction;