import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  TrendingUp,
  Activity,
  FileText,
  Terminal,
  Zap,
  Database,
  Code,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink
} from 'lucide-react';

const LogAnalysis = () => {
  const { api } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [stores, setStores] = useState([]);
  const [expandedLog, setExpandedLog] = useState(null);
  const [logStats, setLogStats] = useState({
    total: 0,
    error: 0,
    warning: 0,
    info: 0
  });

  // ローカル環境判定
  const isLocalEnv = window.location.hostname === 'localhost';

  useEffect(() => {
    fetchStores();
    fetchLogs();
  }, [selectedStore, selectedLevel, selectedType, dateRange]);

  const fetchStores = async () => {
    try {
      if (isLocalEnv) {
        const mockStores = [
          { id: 'demo-store-001', name: '居酒屋 花まる 渋谷店' },
          { id: 'demo-store-002', name: '海鮮居酒屋 大漁丸' },
          { id: 'demo-store-003', name: '串焼き専門店 炭火屋' },
          { id: 'demo-store-004', name: '昭和レトロ居酒屋 のんべえ横丁' },
          { id: 'demo-store-005', name: '創作和食 風花' }
        ];
        setStores(mockStores);
        return;
      }

      const response = await api.get('/stores');
      if (response.data.success) {
        setStores(response.data.stores);
      }
    } catch (error) {
      console.error('店舗取得エラー:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);

      if (isLocalEnv) {
        console.log('🏠 ローカル環境：モックログデータを使用');
        
        const mockLogs = [
          {
            id: 'log-001',
            timestamp: new Date().toISOString(),
            level: 'error',
            type: 'api',
            storeId: 'demo-store-004',
            storeName: '昭和レトロ居酒屋 のんべえ横丁',
            message: 'OpenAI API connection failed',
            details: {
              error: 'ECONNREFUSED',
              endpoint: '/v1/chat/completions',
              apiKey: 'sk-...****',
              retries: 3,
              duration: 5234
            },
            stackTrace: 'Error: connect ECONNREFUSED\n    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1141:16)'
          },
          {
            id: 'log-002',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            level: 'warning',
            type: 'performance',
            storeId: 'demo-store-002',
            storeName: '海鮮居酒屋 大漁丸',
            message: 'Slow API response detected',
            details: {
              endpoint: 'Google Calendar API',
              responseTime: 4.2,
              threshold: 3.0,
              eventType: 'availability_check'
            }
          },
          {
            id: 'log-003',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            level: 'error',
            type: 'auth',
            storeId: 'demo-store-003',
            storeName: '串焼き専門店 炭火屋',
            message: 'LINE API authentication failed',
            details: {
              error: 'Invalid channel access token',
              tokenPrefix: 'Bearer ****...',
              lastSuccess: new Date(Date.now() - 86400000).toISOString()
            }
          },
          {
            id: 'log-004',
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            level: 'info',
            type: 'system',
            storeId: 'demo-store-001',
            storeName: '居酒屋 花まる 渋谷店',
            message: 'System restarted successfully',
            details: {
              trigger: 'manual',
              duration: 1234,
              servicesRestarted: ['api', 'webhook', 'scheduler']
            }
          },
          {
            id: 'log-005',
            timestamp: new Date(Date.now() - 14400000).toISOString(),
            level: 'error',
            type: 'database',
            storeId: 'demo-store-004',
            storeName: '昭和レトロ居酒屋 のんべえ横丁',
            message: 'Database connection timeout',
            details: {
              database: 'kanpai_prod',
              operation: 'reservation_insert',
              timeout: 30000,
              pool: { size: 10, available: 0 }
            }
          },
          {
            id: 'log-006',
            timestamp: new Date(Date.now() - 18000000).toISOString(),
            level: 'warning',
            type: 'rate_limit',
            storeId: 'demo-store-002',
            storeName: '海鮮居酒屋 大漁丸',
            message: 'OpenAI rate limit approaching',
            details: {
              current: 450,
              limit: 500,
              resetIn: '2 minutes',
              endpoint: 'gpt-4'
            }
          },
          {
            id: 'log-007',
            timestamp: new Date(Date.now() - 21600000).toISOString(),
            level: 'info',
            type: 'deployment',
            storeId: null,
            storeName: 'System',
            message: 'New version deployed',
            details: {
              version: '2.3.1',
              features: ['Improved error handling', 'Performance optimization'],
              deployedBy: 'admin'
            }
          }
        ];

        // フィルタリング
        let filteredLogs = mockLogs;
        
        if (selectedStore !== 'all') {
          filteredLogs = filteredLogs.filter(log => log.storeId === selectedStore);
        }
        
        if (selectedLevel !== 'all') {
          filteredLogs = filteredLogs.filter(log => log.level === selectedLevel);
        }
        
        if (selectedType !== 'all') {
          filteredLogs = filteredLogs.filter(log => log.type === selectedType);
        }
        
        if (searchTerm) {
          filteredLogs = filteredLogs.filter(log => 
            log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setLogs(filteredLogs);
        
        // 統計計算
        const stats = {
          total: filteredLogs.length,
          error: filteredLogs.filter(l => l.level === 'error').length,
          warning: filteredLogs.filter(l => l.level === 'warning').length,
          info: filteredLogs.filter(l => l.level === 'info').length
        };
        setLogStats(stats);
        
        setLoading(false);
        return;
      }

      // 本番API
      const response = await api.get('/logs', {
        params: {
          storeId: selectedStore,
          level: selectedLevel,
          type: selectedType,
          startDate: dateRange.start,
          endDate: dateRange.end,
          search: searchTerm
        }
      });

      if (response.data.success) {
        setLogs(response.data.logs);
        setLogStats(response.data.stats);
      }
    } catch (error) {
      console.error('ログ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'error':
        return { icon: AlertCircle, color: 'var(--error-500)' };
      case 'warning':
        return { icon: AlertTriangle, color: 'var(--warning-500)' };
      case 'info':
        return { icon: Info, color: 'var(--info-500)' };
      default:
        return { icon: Info, color: 'var(--text-secondary)' };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'api':
        return { icon: Zap, label: 'API' };
      case 'database':
        return { icon: Database, label: 'データベース' };
      case 'auth':
        return { icon: CheckCircle, label: '認証' };
      case 'performance':
        return { icon: Activity, label: 'パフォーマンス' };
      case 'system':
        return { icon: Terminal, label: 'システム' };
      case 'rate_limit':
        return { icon: AlertTriangle, label: 'レート制限' };
      case 'deployment':
        return { icon: Code, label: 'デプロイ' };
      default:
        return { icon: FileText, label: 'その他' };
    }
  };

  const handleExportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Level', 'Type', 'Store', 'Message', 'Details'],
      ...logs.map(log => [
        log.timestamp,
        log.level,
        log.type,
        log.storeName || 'System',
        log.message,
        JSON.stringify(log.details)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('クリップボードにコピーしました');
  };

  if (loading) {
    return (
      <div className="log-analysis-loading">
        <div className="loading-spinner"></div>
        <p>ログデータを読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="log-analysis">
      <div className="page-header">
        <div className="header-content">
          <h1>🔍 ログ検索・分析</h1>
          <p>システムログの詳細検索とエラーパターン分析</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-secondary"
            onClick={() => fetchLogs()}
          >
            <RefreshCw size={18} />
            更新
          </button>
          <button 
            className="btn-primary"
            onClick={handleExportLogs}
          >
            <Download size={18} />
            エクスポート
          </button>
        </div>
      </div>

      {/* ログ統計サマリー */}
      <div className="log-stats-bar">
        <div className="stats-container">
          <div className="stats-title">📊 ログ統計</div>
          <div className="stats-items">
            <div className="stat-item">
              <FileText size={18} style={{ color: 'var(--text-secondary)' }} />
              <div className="stat-content">
                <span className="stat-value">{logStats.total}</span>
                <span className="stat-label">総ログ数</span>
              </div>
            </div>
            
            <div className="stat-divider"></div>
            
            <div className="stat-item">
              <AlertCircle size={18} style={{ color: 'var(--error-500)' }} />
              <div className="stat-content">
                <span className="stat-value" style={{ color: 'var(--error-500)' }}>
                  {logStats.error}
                </span>
                <span className="stat-label">エラー</span>
              </div>
            </div>
            
            <div className="stat-divider"></div>
            
            <div className="stat-item">
              <AlertTriangle size={18} style={{ color: 'var(--warning-500)' }} />
              <div className="stat-content">
                <span className="stat-value" style={{ color: 'var(--warning-500)' }}>
                  {logStats.warning}
                </span>
                <span className="stat-label">警告</span>
              </div>
            </div>
            
            <div className="stat-divider"></div>
            
            <div className="stat-item">
              <Info size={18} style={{ color: 'var(--info-500)' }} />
              <div className="stat-content">
                <span className="stat-value" style={{ color: 'var(--info-500)' }}>
                  {logStats.info}
                </span>
                <span className="stat-label">情報</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* フィルターセクション */}
      <div className="log-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>店舗</label>
            <select 
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="filter-select"
            >
              <option value="all">すべての店舗</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>レベル</label>
            <select 
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="filter-select"
            >
              <option value="all">すべて</option>
              <option value="error">エラー</option>
              <option value="warning">警告</option>
              <option value="info">情報</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>タイプ</label>
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="filter-select"
            >
              <option value="all">すべて</option>
              <option value="api">API</option>
              <option value="database">データベース</option>
              <option value="auth">認証</option>
              <option value="performance">パフォーマンス</option>
              <option value="system">システム</option>
              <option value="rate_limit">レート制限</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>期間</label>
            <div className="date-range">
              <input 
                type="date" 
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="date-input"
              />
              <span>〜</span>
              <input 
                type="date" 
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="date-input"
              />
            </div>
          </div>
        </div>
        
        <div className="search-row">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="エラーメッセージやキーワードで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* ログ一覧 */}
      <div className="logs-container">
        {logs.length === 0 ? (
          <div className="empty-logs">
            <Terminal size={48} />
            <h3>ログが見つかりません</h3>
            <p>フィルター条件を変更してください</p>
          </div>
        ) : (
          logs.map(log => {
            const levelInfo = getLevelIcon(log.level);
            const typeInfo = getTypeIcon(log.type);
            const LevelIcon = levelInfo.icon;
            const TypeIcon = typeInfo.icon;
            const isExpanded = expandedLog === log.id;

            return (
              <div key={log.id} className={`log-item ${log.level}`}>
                <div 
                  className="log-header"
                  onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                >
                  <div className="log-meta">
                    <LevelIcon size={18} style={{ color: levelInfo.color }} />
                    <span className="log-time">
                      {new Date(log.timestamp).toLocaleString('ja-JP')}
                    </span>
                    <span className="log-store">{log.storeName || 'System'}</span>
                    <div className="log-type">
                      <TypeIcon size={14} />
                      <span>{typeInfo.label}</span>
                    </div>
                  </div>
                  <div className="log-message">
                    {log.message}
                  </div>
                  <div className="log-expand">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="log-details">
                    <div className="detail-section">
                      <h4>詳細情報</h4>
                      <div className="detail-content">
                        <pre>{JSON.stringify(log.details, null, 2)}</pre>
                      </div>
                    </div>
                    
                    {log.stackTrace && (
                      <div className="detail-section">
                        <h4>スタックトレース</h4>
                        <div className="stack-trace">
                          <pre>{log.stackTrace}</pre>
                        </div>
                      </div>
                    )}
                    
                    <div className="log-actions">
                      <button 
                        className="action-btn"
                        onClick={() => copyToClipboard(JSON.stringify(log, null, 2))}
                      >
                        <Copy size={14} />
                        コピー
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => {
                          // 該当店舗の詳細ページに遷移
                          if (log.storeId) {
                            window.location.href = `/stores/${log.storeId}`;
                          }
                        }}
                      >
                        <ExternalLink size={14} />
                        店舗詳細
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LogAnalysis;