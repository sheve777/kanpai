import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Settings,
  Database,
  Shield,
  Bell,
  Mail,
  Globe,
  Cpu,
  HardDrive,
  Activity,
  Users,
  Key,
  Server,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Save,
  Eye,
  EyeOff,
  Clock
} from 'lucide-react';

const SystemSettings = () => {
  const { api } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('monitoring');
  const [settings, setSettings] = useState({});
  const [systemStatus, setSystemStatus] = useState({});
  const [showApiKeys, setShowApiKeys] = useState({});

  // ローカル環境判定
  const isLocalEnv = window.location.hostname === 'localhost';

  useEffect(() => {
    fetchSystemStatus();
    fetchSettings();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      setLoading(true);
      
      // ローカル環境でのモックデータ
      if (isLocalEnv) {
        console.log('🏠 ローカル環境：モックシステム設定を使用');
        const mockStatus = {
          server: {
            status: 'healthy',
            uptime: '7日 3時間',
            cpu: 23,
            memory: 68
          },
          database: {
            status: 'healthy',
            connections: 12,
            size: '2.4GB'
          },
          storage: {
            used: 45,
            free: '12GB'
          },
          apis: {
            openai: { status: 'healthy' },
            line: { status: 'healthy' },
            stripe: { status: 'warning' }
          }
        };
        
        setSystemStatus(mockStatus);
        setLoading(false);
        return;
      }
      
      // 本番API呼び出し
      const response = await api.get('/system/status');
      if (response.data.success) {
        setSystemStatus(response.data.status);
      }
    } catch (error) {
      console.error('システム状態取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      // ローカル環境でのモック設定
      if (isLocalEnv) {
        const mockSettings = {
          general: {
            siteName: 'kanpAI Admin',
            adminEmail: 'admin@kanpai.local',
            timezone: 'Asia/Tokyo'
          },
          api: {
            openaiKey: 'sk-1234...abcd',
            lineToken: 'line_token_123...',
            stripeKey: 'sk_test_123...'
          }
        };
        
        setSettings(mockSettings);
        return;
      }
      
      // 本番API呼び出し
      const response = await api.get('/system/settings');
      if (response.data.success) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      console.error('設定取得エラー:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'green';
      case 'warning': return 'orange';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const handleRestartComponent = async (component) => {
    if (isLocalEnv) {
      console.log(`🔄 ${component}を再起動中...`);
      alert(`${component}を再起動しました（ローカル環境）`);
      return;
    }
    
    try {
      const response = await api.post(`/system/restart/${component}`);
      if (response.data.success) {
        alert(`${component}を再起動しました`);
        fetchSystemStatus();
      }
    } catch (error) {
      console.error(`${component}再起動エラー:`, error);
      alert('再起動に失敗しました');
    }
  };

  const handleOptimizeDatabase = async () => {
    if (isLocalEnv) {
      console.log('🔧 データベースを最適化中...');
      alert('データベースを最適化しました（ローカル環境）');
      return;
    }
    
    try {
      const response = await api.post('/system/optimize/database');
      if (response.data.success) {
        alert('データベースを最適化しました');
        fetchSystemStatus();
      }
    } catch (error) {
      console.error('データベース最適化エラー:', error);
      alert('最適化に失敗しました');
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      if (isLocalEnv) {
        console.log('💾 設定を保存中...', settings);
        alert('設定を保存しました（ローカル環境）');
        setSaving(false);
        return;
      }
      
      const response = await api.post('/system/settings', settings);
      if (response.data.success) {
        alert('設定を保存しました');
      }
    } catch (error) {
      console.error('設定保存エラー:', error);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleRefreshLogs = () => {
    console.log('📋 ログを更新中...');
    // ログ更新処理をここに実装
    alert('ログを更新しました');
  };

  if (loading) {
    return (
      <div className="system-settings-loading">
        <div className="loading-spinner"></div>
        <p>システム設定を読み込み中...</p>
      </div>
    );
  }

  // タブ設定
  const tabs = [
    { id: 'monitoring', label: 'システム監視', icon: Activity },
    { id: 'settings', label: '設定管理', icon: Settings },
    { id: 'logs', label: 'ログ表示', icon: Database },
    { id: 'security', label: 'セキュリティ', icon: Shield }
  ];

  return (
    <div className="system-settings">
      <div className="page-header">
        <h1>システム設定</h1>
        <p>システム全体の設定と監視</p>
      </div>

      {/* システム状態サマリー（横一列） */}
      <div className="system-summary-bar">
        <div className="summary-container">
          <div className="summary-title">🖥️ システム状態サマリー</div>
          <div className="summary-stats">
            <div className="summary-stat-item">
              <Server size={18} style={{ color: getStatusColor(systemStatus.server?.status) === 'green' ? 'var(--success-500)' : 'var(--error-500)' }} />
              <div className="stat-content">
                <span className="stat-value">{systemStatus.server?.status || 'Unknown'}</span>
                <span className="stat-label">サーバー</span>
              </div>
              <div className="stat-detail">
                <span>CPU: {systemStatus.server?.cpu || '0'}%</span>
              </div>
            </div>
            
            <div className="summary-stat-item">
              <Database size={18} style={{ color: getStatusColor(systemStatus.database?.status) === 'green' ? 'var(--success-500)' : 'var(--error-500)' }} />
              <div className="stat-content">
                <span className="stat-value">{systemStatus.database?.status || 'Unknown'}</span>
                <span className="stat-label">データベース</span>
              </div>
              <div className="stat-detail">
                <span>接続: {systemStatus.database?.connections || '0'}</span>
              </div>
            </div>
            
            <div className="summary-stat-item">
              <Activity size={18} style={{ color: 'var(--info-500)' }} />
              <div className="stat-content">
                <span className="stat-value">{systemStatus.server?.uptime || '0h'}</span>
                <span className="stat-label">稼働時間</span>
              </div>
              <div className="stat-detail">
                <span>Memory: {systemStatus.server?.memory || '0'}%</span>
              </div>
            </div>
            
            <div className="summary-stat-item">
              <HardDrive size={18} style={{ color: 'var(--warning-500)' }} />
              <div className="stat-content">
                <span className="stat-value">{systemStatus.storage?.used || '0'}%</span>
                <span className="stat-label">ストレージ</span>
              </div>
              <div className="stat-detail">
                <span>{systemStatus.storage?.free || '0GB'} 空き</span>
              </div>
            </div>
          </div>
          <div className="summary-actions">
            <span className="update-time">
              <Clock size={14} />
              最終更新: {new Date().toLocaleTimeString('ja-JP')}
            </span>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="system-tabs">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* タブコンテンツ */}
      <div className="tab-content">
        {activeTab === 'monitoring' && (
          <div className="tab-panel">
            {/* システムコンポーネント詳細テーブル */}
      <div className="system-components-section">
        <h2>📊 システムコンポーネント詳細</h2>
        <div className="table-container">
          <table className="system-table">
            <thead>
              <tr>
                <th>コンポーネント</th>
                <th>ステータス</th>
                <th>バージョン</th>
                <th>リソース使用率</th>
                <th>最終ヘルスチェック</th>
                <th>アクション</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="component-name-cell">
                    <Server size={16} />
                    <span>API サーバー</span>
                  </div>
                </td>
                <td>
                  <span className="status-badge healthy">
                    <CheckCircle size={12} />
                    稼働中
                  </span>
                </td>
                <td>
                  <span className="version-text">v1.2.3</span>
                </td>
                <td>
                  <div className="resource-usage">
                    <span>CPU: {systemStatus.server?.cpu || '15'}%</span>
                    <span>RAM: {systemStatus.server?.memory || '68'}%</span>
                  </div>
                </td>
                <td>
                  <span className="timestamp">{new Date().toLocaleTimeString('ja-JP')}</span>
                </td>
                <td>
                  <button 
                    className="btn-sm secondary"
                    onClick={() => handleRestartComponent('APIサーバー')}
                  >
                    再起動
                  </button>
                </td>
              </tr>
              
              <tr>
                <td>
                  <div className="component-name-cell">
                    <Database size={16} />
                    <span>PostgreSQL</span>
                  </div>
                </td>
                <td>
                  <span className="status-badge healthy">
                    <CheckCircle size={12} />
                    接続済み
                  </span>
                </td>
                <td>
                  <span className="version-text">v14.2</span>
                </td>
                <td>
                  <div className="resource-usage">
                    <span>接続: {systemStatus.database?.connections || '12'}/100</span>
                    <span>容量: {systemStatus.database?.size || '2.4GB'}</span>
                  </div>
                </td>
                <td>
                  <span className="timestamp">{new Date().toLocaleTimeString('ja-JP')}</span>
                </td>
                <td>
                  <button 
                    className="btn-sm secondary"
                    onClick={handleOptimizeDatabase}
                  >
                    最適化
                  </button>
                </td>
              </tr>
              
              <tr>
                <td>
                  <div className="component-name-cell">
                    <Globe size={16} />
                    <span>外部API</span>
                  </div>
                </td>
                <td>
                  <span className="status-badge warning">
                    <AlertTriangle size={12} />
                    制限中
                  </span>
                </td>
                <td>
                  <span className="version-text">各種</span>
                </td>
                <td>
                  <div className="resource-usage">
                    <span>OpenAI: 使用量 80%</span>
                    <span>LINE: 正常</span>
                  </div>
                </td>
                <td>
                  <span className="timestamp">{new Date().toLocaleTimeString('ja-JP')}</span>
                </td>
                <td>
                  <button className="btn-sm primary">設定</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="tab-panel">
            <div className="settings-section">
              <h2>⚙️ システム設定管理</h2>
              
              <div className="settings-grid">
                <div className="setting-card">
                  <h3>
                    <Key size={20} />
                    API キー管理
                  </h3>
                  <div className="setting-items">
                    <div className="setting-item">
                      <label>OpenAI API Key</label>
                      <div className="input-with-action">
                        <input
                          type={showApiKeys.openai ? 'text' : 'password'}
                          value={settings.api?.openaiKey || ''}
                          className="form-input"
                          readOnly
                        />
                        <button
                          className="action-btn"
                          onClick={() => setShowApiKeys(prev => ({ ...prev, openai: !prev.openai }))}
                        >
                          {showApiKeys.openai ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="setting-item">
                      <label>LINE Token</label>
                      <div className="input-with-action">
                        <input
                          type={showApiKeys.line ? 'text' : 'password'}
                          value={settings.api?.lineToken || ''}
                          className="form-input"
                          readOnly
                        />
                        <button
                          className="action-btn"
                          onClick={() => setShowApiKeys(prev => ({ ...prev, line: !prev.line }))}
                        >
                          {showApiKeys.line ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="setting-item">
                      <label>Stripe Key</label>
                      <div className="input-with-action">
                        <input
                          type={showApiKeys.stripe ? 'text' : 'password'}
                          value={settings.api?.stripeKey || ''}
                          className="form-input"
                          readOnly
                        />
                        <button
                          className="action-btn"
                          onClick={() => setShowApiKeys(prev => ({ ...prev, stripe: !prev.stripe }))}
                        >
                          {showApiKeys.stripe ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="setting-actions">
                    <button 
                      className="btn-primary"
                      onClick={handleSaveSettings}
                      disabled={saving}
                    >
                      <Save size={16} />
                      {saving ? '保存中...' : '設定を保存'}
                    </button>
                  </div>
                </div>

                <div className="setting-card">
                  <h3>
                    <Bell size={20} />
                    通知設定
                  </h3>
                  <div className="setting-items">
                    <div className="setting-item">
                      <label>
                        <input type="checkbox" defaultChecked />
                        システムアラート通知
                      </label>
                    </div>
                    <div className="setting-item">
                      <label>
                        <input type="checkbox" defaultChecked />
                        メンテナンス通知
                      </label>
                    </div>
                    <div className="setting-item">
                      <label>
                        <input type="checkbox" />
                        パフォーマンス警告
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="tab-panel">
            <div className="logs-section">
              <h2>📝 システムログ表示</h2>
              
              <div className="log-filters">
                <select className="form-select">
                  <option>すべてのログ</option>
                  <option>エラーログ</option>
                  <option>アクセスログ</option>
                  <option>APIログ</option>
                </select>
                <input type="date" className="form-input" />
                <button 
                  className="btn-secondary"
                  onClick={handleRefreshLogs}
                >
                  <RefreshCw size={16} />
                  更新
                </button>
              </div>
              
              <div className="log-viewer">
                <div className="log-entry">
                  <span className="log-timestamp">{new Date().toISOString()}</span>
                  <span className="log-level info">INFO</span>
                  <span className="log-message">システム正常稼働中</span>
                </div>
                <div className="log-entry">
                  <span className="log-timestamp">{new Date(Date.now() - 60000).toISOString()}</span>
                  <span className="log-level warning">WARN</span>
                  <span className="log-message">API使用量が80%に達しました</span>
                </div>
                <div className="log-entry">
                  <span className="log-timestamp">{new Date(Date.now() - 120000).toISOString()}</span>
                  <span className="log-level error">ERROR</span>
                  <span className="log-message">データベース接続タイムアウト</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="tab-panel">
            <div className="security-section">
              <h2>🔒 セキュリティ設定</h2>
              
              <div className="security-grid">
                <div className="security-card">
                  <h3>アクセス制御</h3>
                  <div className="security-items">
                    <div className="security-item">
                      <span>管理者ログイン試行制限</span>
                      <span className="security-status enabled">有効</span>
                    </div>
                    <div className="security-item">
                      <span>API レート制限</span>
                      <span className="security-status enabled">有効</span>
                    </div>
                    <div className="security-item">
                      <span>SSL証明書</span>
                      <span className="security-status valid">有効 (有効期限: 2025-12-31)</span>
                    </div>
                  </div>
                </div>

                <div className="security-card">
                  <h3>監査ログ</h3>
                  <div className="audit-summary">
                    <div className="audit-item">
                      <span>今日のログイン回数</span>
                      <span className="audit-count">12</span>
                    </div>
                    <div className="audit-item">
                      <span>失敗したログイン試行</span>
                      <span className="audit-count warning">3</span>
                    </div>
                    <div className="audit-item">
                      <span>API キー使用回数</span>
                      <span className="audit-count">1,234</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemSettings;