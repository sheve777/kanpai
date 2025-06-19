import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isLocalEnv, logger } from '../utils/environment';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  WifiOff,
  TrendingUp,
  ArrowRight,
  Shield,
  Terminal,
  Settings
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [apiStatus, setApiStatus] = useState({});
  const [errorTrends, setErrorTrends] = useState([]);
  const [criticalStores, setCriticalStores] = useState([]);
  const [costData, setCostData] = useState({});
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // 環境判定は utils から取得

  // レポート配信遅延チェック関数
  const checkReportDeliveryDelays = async () => {
    try {
      const today = new Date();
      const currentDay = today.getDate();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      // 毎月5日以降のみチェック
      if (currentDay < 5) {
        return [];
      }
      
      // 前月の情報を計算
      const lastMonth = new Date(currentYear, currentMonth - 1);
      const lastMonthStr = lastMonth.toISOString().slice(0, 7); // YYYY-MM形式
      const lastMonthName = `${lastMonth.getFullYear()}年${(lastMonth.getMonth() + 1).toString().padStart(2, '0')}月`;
      
      logger.log(`📅 レポート配信遅延チェック: ${lastMonthName}分のレポート`);
      
      if (isLocalEnv) {
        // ローカル環境でのモックデータ
        const delayedStores = [
          {
            id: 'demo-store-003',
            name: '串焼き専門店 炭火屋',
            reportStatus: 'generated',
            lastReportDate: null
          },
          {
            id: 'demo-store-005',
            name: '昭和レトロ居酒屋 のんべえ横丁',
            reportStatus: 'none',
            lastReportDate: null
          }
        ];
        
        return delayedStores.map((store, index) => ({
          id: `report-delay-${store.id}`,
          level: 'critical',
          type: 'report_delay',
          title: '📊 レポート配信期限超過',
          message: `${store.name}の${lastMonthName}分レポートが未配信です（期限：毎月5日）`,
          storeId: store.id,
          storeName: store.name,
          timestamp: new Date().toISOString(),
          reportMonth: lastMonthStr,
          reportStatus: store.reportStatus,
          daysLate: currentDay - 5
        }));
      }
      
      // 本番環境での実装
      const response = await api.get(`/reports/delivery-delays?month=${lastMonthStr}`);
      if (response.data.success) {
        return response.data.delayedStores.map(store => ({
          id: `report-delay-${store.id}`,
          level: 'critical',
          type: 'report_delay',
          title: '📊 レポート配信期限超過',
          message: `${store.name}の${lastMonthName}分レポートが未配信です（期限：毎月5日）`,
          storeId: store.id,
          storeName: store.name,
          timestamp: new Date().toISOString(),
          reportMonth: lastMonthStr,
          reportStatus: store.reportStatus,
          daysLate: currentDay - 5
        }));
      }
      
      return [];
    } catch (error) {
      logger.error('レポート配信遅延チェックエラー:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // リアルタイム更新（30秒間隔）
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchDashboardData();
        setLastUpdated(new Date());
      }, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // ローカル環境でのモックデータ
      if (isLocalEnv) {
        logger.log('🏠 ローカル環境：アラート中心のダッシュボードデータを使用');
        
        // レポート配信遅延チェック
        const reportDelayAlerts = await checkReportDeliveryDelays();
        
        // 緊急アラート
        const mockAlerts = [
          ...reportDelayAlerts, // レポート配信遅延アラートを最優先で表示
          {
            id: 'alert-001',
            level: 'critical',
            type: 'api_error',
            title: 'OpenAI API 接続エラー',
            message: '昭和レトロ居酒屋 のんべえ横丁でAPIエラーが継続しています',
            storeId: 'demo-store-004',
            storeName: '昭和レトロ居酒屋 のんべえ横丁',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            count: 15
          },
          {
            id: 'alert-002',
            level: 'warning',
            type: 'performance',
            title: '応答時間の遅延',
            message: '海鮮居酒屋 大漁丸でGoogle Calendar APIの応答が遅延しています',
            storeId: 'demo-store-002',
            storeName: '海鮮居酒屋 大漁丸',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            responseTime: 4.2
          },
          {
            id: 'alert-003',
            level: 'warning',
            type: 'rate_limit',
            title: 'API使用量警告',
            message: '居酒屋 花まる 渋谷店がOpenAI APIの使用量上限に近づいています',
            storeId: 'demo-store-001',
            storeName: '居酒屋 花まる 渋谷店',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            usage: 85
          }
        ];

        // システム全体の健康状態
        const mockSystemHealth = {
          overall: 'warning',
          totalStores: 5,
          healthyStores: 2,
          warningStores: 2,
          criticalStores: 1,
          uptime: 99.5,
          avgResponseTime: 1.8,
          errorRate: 3.2
        };

        // API状態
        const mockApiStatus = {
          openai: { status: 'warning', uptime: 98.5, avgResponse: 1.2 },
          line: { status: 'healthy', uptime: 99.9, avgResponse: 0.8 },
          googleCalendar: { status: 'warning', uptime: 97.2, avgResponse: 3.5 },
          database: { status: 'healthy', uptime: 99.95, avgResponse: 0.3 }
        };

        // エラートレンド（過去24時間）
        const mockErrorTrends = Array.from({ length: 24 }, (_, i) => ({
          hour: `${i}:00`,
          errors: Math.floor(Math.random() * 10) + (i > 20 ? 10 : 0),
          warnings: Math.floor(Math.random() * 15) + 5
        }));

        // 要対応店舗
        const mockCriticalStores = [
          {
            id: 'demo-store-004',
            name: '昭和レトロ居酒屋 のんべえ横丁',
            status: 'critical',
            issues: ['OpenAI API エラー', 'Google Calendar 接続失敗'],
            lastActive: new Date(Date.now() - 86400000 * 30).toISOString(),
            errorCount: 45
          },
          {
            id: 'demo-store-003',
            name: '串焼き専門店 炭火屋',
            status: 'warning',
            issues: ['LINE API 応答遅延'],
            lastActive: new Date(Date.now() - 86400000 * 10).toISOString(),
            errorCount: 12
          }
        ];

        // コストデータ
        const mockCostData = {
          current: {
            openai: 12450,
            total: 15680,
            projection: 47040 // 月末予測
          },
          usage: {
            tokens: 1245000,
            apiCalls: 15670,
            avgCostPerStore: 3136
          },
          topSpenders: [
            { name: '創作和食 風花', cost: 4560 },
            { name: '海鮮居酒屋 大漁丸', cost: 3890 },
            { name: '居酒屋 花まる 渋谷店', cost: 3230 }
          ]
        };

        // 最近のエラーログ
        const mockRecentLogs = [
          {
            id: 'log-001',
            level: 'error',
            message: 'OpenAI API connection timeout',
            store: '昭和レトロ居酒屋 のんべえ横丁',
            timestamp: new Date(Date.now() - 300000).toISOString()
          },
          {
            id: 'log-002',
            level: 'warning',
            message: 'Rate limit approaching (450/500 requests)',
            store: '居酒屋 花まる 渋谷店',
            timestamp: new Date(Date.now() - 600000).toISOString()
          }
        ];

        setAlerts(mockAlerts);
        setSystemHealth(mockSystemHealth);
        setApiStatus(mockApiStatus);
        setErrorTrends(mockErrorTrends);
        setCriticalStores(mockCriticalStores);
        setCostData(mockCostData);
        setRecentLogs(mockRecentLogs);
        setLoading(false);
        return;
      }
      
      // 本番API呼び出し
      const response = await api.get('/dashboard/alerts');
      
      if (response.data.success) {
        setAlerts(response.data.alerts);
        setSystemHealth(response.data.systemHealth);
        setApiStatus(response.data.apiStatus);
        setErrorTrends(response.data.errorTrends);
        setCriticalStores(response.data.criticalStores);
        setCostData(response.data.costData);
        setRecentLogs(response.data.recentLogs);
      }
    } catch (error) {
      logger.error('Dashboard alerts fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (level) => {
    switch (level) {
      case 'critical':
        return { icon: AlertCircle, color: 'var(--error-500)' };
      case 'warning':
        return { icon: AlertTriangle, color: 'var(--warning-500)' };
      default:
        return { icon: CheckCircle, color: 'var(--info-500)' };
    }
  };

  const getApiStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return { icon: CheckCircle, color: 'var(--success-500)' };
      case 'warning':
        return { icon: AlertTriangle, color: 'var(--warning-500)' };
      case 'critical':
        return { icon: XCircle, color: 'var(--error-500)' };
      default:
        return { icon: WifiOff, color: 'var(--text-secondary)' };
    }
  };

  const handleAlertClick = (alert) => {
    if (alert.type === 'report_delay') {
      navigate('/reports'); // レポート管理ページに遷移
    } else if (alert.storeId) {
      navigate('/stores'); // 店舗管理ページに遷移
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'logs':
        navigate('/logs');
        break;
      case 'stores':
        navigate('/stores');
        break;
      case 'system':
        navigate('/system');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>ダッシュボードを読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🚨 システム監視ダッシュボード</h1>
          <p>リアルタイムアラートとシステム状態の監視</p>
        </div>
        <div className="header-actions">
          <button 
            className={`refresh-btn ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw size={16} className={autoRefresh ? 'spin' : ''} />
            自動更新
          </button>
          <span className="last-update">
            <Clock size={14} />
            {lastUpdated.toLocaleTimeString('ja-JP')}
          </span>
        </div>
      </div>

      {/* 緊急アラートセクション */}
      <div className="alert-section">
        <div className="section-header">
          <h2>🚨 緊急アラート</h2>
          {alerts.length > 0 && (
            <span className="alert-count">{alerts.length}件の問題</span>
          )}
        </div>
        
        {alerts.length === 0 ? (
          <div className="no-alerts">
            <CheckCircle size={48} style={{ color: 'var(--success-500)' }} />
            <h3>問題は検出されていません</h3>
            <p>すべてのシステムが正常に動作しています</p>
          </div>
        ) : (
          <div className="alerts-grid">
            {alerts.map(alert => {
              const alertInfo = getAlertIcon(alert.level);
              const AlertIcon = alertInfo.icon;
              
              return (
                <div 
                  key={alert.id} 
                  className={`alert-card ${alert.level}`}
                  onClick={() => handleAlertClick(alert)}
                >
                  <div className="alert-header">
                    <AlertIcon size={20} style={{ color: alertInfo.color }} />
                    <span className="alert-time">
                      {Math.floor((Date.now() - new Date(alert.timestamp)) / 60000)}分前
                    </span>
                  </div>
                  <h3>{alert.title}</h3>
                  <p>{alert.message}</p>
                  <div className="alert-meta">
                    <span className="store-name">{alert.storeName}</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        {/* システム全体ヘルス */}
        <div className="health-card">
          <h3>📊 システム全体ヘルス</h3>
          <div className="health-overview">
            <div className="health-pie">
              <PieChart width={120} height={120}>
                <Pie
                  data={[
                    { name: 'healthy', value: systemHealth?.healthyStores || 0, color: 'var(--success-500)' },
                    { name: 'warning', value: systemHealth?.warningStores || 0, color: 'var(--warning-500)' },
                    { name: 'critical', value: systemHealth?.criticalStores || 0, color: 'var(--error-500)' }
                  ]}
                  cx={60}
                  cy={60}
                  innerRadius={25}
                  outerRadius={50}
                  dataKey="value"
                >
                  {[
                    { name: 'healthy', value: systemHealth?.healthyStores || 0, color: 'var(--success-500)' },
                    { name: 'warning', value: systemHealth?.warningStores || 0, color: 'var(--warning-500)' },
                    { name: 'critical', value: systemHealth?.criticalStores || 0, color: 'var(--error-500)' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </div>
            <div className="health-stats">
              <div className="stat">
                <span className="value">{systemHealth?.totalStores || 0}</span>
                <span className="label">総店舗</span>
              </div>
              <div className="stat critical">
                <span className="value">{systemHealth?.criticalStores || 0}</span>
                <span className="label">要対応</span>
              </div>
              <div className="stat warning">
                <span className="value">{systemHealth?.warningStores || 0}</span>
                <span className="label">確認推奨</span>
              </div>
            </div>
          </div>
          <div className="health-metrics">
            <div className="metric">
              <span>稼働率</span>
              <span className="value">{systemHealth?.uptime || 0}%</span>
            </div>
            <div className="metric">
              <span>エラー率</span>
              <span className="value">{systemHealth?.errorRate || 0}%</span>
            </div>
          </div>
        </div>

        {/* API状態 */}
        <div className="api-status-card">
          <h3>🔗 API状態監視</h3>
          <div className="api-grid">
            {Object.entries(apiStatus).map(([api, status]) => {
              const statusInfo = getApiStatusIcon(status.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div key={api} className={`api-item ${status.status}`}>
                  <div className="api-header">
                    <StatusIcon size={16} style={{ color: statusInfo.color }} />
                    <span className="api-name">
                      {api === 'openai' ? 'OpenAI' :
                       api === 'line' ? 'LINE' :
                       api === 'googleCalendar' ? 'Calendar' :
                       api === 'database' ? 'Database' : api}
                    </span>
                  </div>
                  <div className="api-metrics">
                    <div className="metric">
                      <span>稼働率</span>
                      <span>{status.uptime}%</span>
                    </div>
                    <div className="metric">
                      <span>応答</span>
                      <span>{status.avgResponse}s</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* エラートレンド */}
        <div className="trend-card">
          <h3>📈 エラートレンド (24時間)</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={errorTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="errors" 
                  stackId="1"
                  stroke="var(--error-500)" 
                  fill="var(--error-500)" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="warnings" 
                  stackId="1"
                  stroke="var(--warning-500)" 
                  fill="var(--warning-500)" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 要対応店舗 */}
        <div className="critical-stores-card">
          <h3>⚠️ 要対応店舗</h3>
          {criticalStores.length === 0 ? (
            <div className="no-critical">
              <CheckCircle size={32} style={{ color: 'var(--success-500)' }} />
              <p>要対応の店舗はありません</p>
            </div>
          ) : (
            <div className="stores-list">
              {criticalStores.map(store => (
                <div key={store.id} className={`store-item ${store.status}`}>
                  <div className="store-header">
                    <span className="store-name">{store.name}</span>
                    <span className="error-count">{store.errorCount}件</span>
                  </div>
                  <div className="store-issues">
                    {store.issues.map((issue, index) => (
                      <span key={index} className="issue-tag">{issue}</span>
                    ))}
                  </div>
                  <div className="store-meta">
                    <span>最終活動: {Math.floor((Date.now() - new Date(store.lastActive)) / 86400000)}日前</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* コスト監視 */}
        <div className="cost-card">
          <h3>💰 コスト監視</h3>
          <div className="cost-overview">
            <div className="cost-current">
              <span className="cost-label">今月の使用量</span>
              <span className="cost-value">¥{costData.current?.total?.toLocaleString() || 0}</span>
            </div>
            <div className="cost-projection">
              <span className="cost-label">月末予測</span>
              <span className="cost-value projection">¥{costData.current?.projection?.toLocaleString() || 0}</span>
            </div>
          </div>
          <div className="cost-details">
            <div className="cost-metric">
              <span>OpenAI API</span>
              <span>¥{costData.current?.openai?.toLocaleString() || 0}</span>
            </div>
            <div className="cost-metric">
              <span>API呼び出し</span>
              <span>{costData.usage?.apiCalls?.toLocaleString() || 0}回</span>
            </div>
          </div>
        </div>

        {/* 最近のログ */}
        <div className="recent-logs-card">
          <h3>📋 最近のエラーログ</h3>
          {recentLogs.length === 0 ? (
            <div className="no-logs">
              <Terminal size={32} style={{ color: 'var(--text-secondary)' }} />
              <p>最近のエラーはありません</p>
            </div>
          ) : (
            <div className="logs-list">
              {recentLogs.map(log => (
                <div key={log.id} className={`log-item ${log.level}`}>
                  <div className="log-header">
                    <span className="log-time">
                      {Math.floor((Date.now() - new Date(log.timestamp)) / 60000)}分前
                    </span>
                    <span className="log-store">{log.store}</span>
                  </div>
                  <p className="log-message">{log.message}</p>
                </div>
              ))}
            </div>
          )}
          <button 
            className="view-all-logs"
            onClick={() => handleQuickAction('logs')}
          >
            <Terminal size={14} />
            すべてのログを表示
          </button>
        </div>
      </div>

      {/* クイックアクション */}
      <div className="quick-actions">
        <h3>⚡ クイックアクション</h3>
        <div className="actions-grid">
          <button 
            className="action-btn"
            onClick={() => handleQuickAction('stores')}
          >
            <Shield size={20} />
            店舗管理
            <span>システム状態確認</span>
          </button>
          <button 
            className="action-btn"
            onClick={() => handleQuickAction('logs')}
          >
            <Terminal size={20} />
            ログ分析
            <span>詳細エラー調査</span>
          </button>
          <button 
            className="action-btn"
            onClick={() => handleQuickAction('system')}
          >
            <Settings size={20} />
            システム設定
            <span>システム管理</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;