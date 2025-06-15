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
  EyeOff
} from 'lucide-react';

const SystemSettings = () => {
  const { api } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({});
  const [systemStatus, setSystemStatus] = useState({});
  const [showApiKeys, setShowApiKeys] = useState({});

  // ローカル環境判定
  const isLocalEnv = window.location.hostname === 'localhost';

  useEffect(() => {
    fetchSystemSettings();
    fetchSystemStatus();
  }, []);

  const fetchSystemSettings = async () => {
    try {
      setLoading(true);
      
      // ローカル環境でのモックデータ
      if (isLocalEnv) {
        console.log('🏠 ローカル環境：モックシステム設定を使用');
        const mockSettings = {
          general: {
            siteName: 'kanpAI Admin',
            timezone: 'Asia/Tokyo',
            language: 'ja',
            maintenanceMode: false
          },
          database: {
            host: 'localhost',
            port: 5432,
            maxConnections: 20,
            backupSchedule: 'daily'
          },
          security: {
            sessionTimeout: 3600,
            requireTwoFactor: false
          },
          api: {
            openaiKey: 'sk-*********************',
            lineToken: '*********************',
            stripeKey: 'sk_test_*********************',
            rateLimitPerMinute: 100
          }
        };
        setSettings(mockSettings);
        setLoading(false);
        return;
      }
      
      // 本番API呼び出し
      const response = await api.get('/system/settings');
      if (response.data.success) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      console.error('システム設定取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      // ローカル環境でのモックデータ
      if (isLocalEnv) {
        const mockStatus = {
          server: { status: 'healthy', uptime: '7日 12時間', cpu: 45, memory: 67 },
          database: { status: 'healthy', connections: 8, queries: 1250 },
          apis: {
            openai: { status: 'healthy', lastCheck: new Date().toISOString() },
            line: { status: 'healthy', lastCheck: new Date().toISOString() },
            stripe: { status: 'warning', lastCheck: new Date().toISOString() }
          }
        };
        setSystemStatus(mockStatus);
        return;
      }
      
      // 本番API呼び出し
      const response = await api.get('/system/status');
      if (response.data.success) {
        setSystemStatus(response.data.status);
      }
    } catch (error) {
      console.error('システム状態取得エラー:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // ローカル環境でのシミュレーション
      if (isLocalEnv) {
        console.log('💾 設定保存シミュレーション:', settings);
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('設定を保存しました！');
        return;
      }
      
      // 本番API呼び出し
      const response = await api.put('/system/settings', settings);
      if (response.data.success) {
        alert('設定を保存しました');
      }
    } catch (error) {
      console.error('設定保存エラー:', error);
      alert('設定の保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const toggleApiKeyVisibility = (keyName) => {
    setShowApiKeys(prev => ({
      ...prev,
      [keyName]: !prev[keyName]
    }));
  };

  const tabs = [
    { id: 'general', label: '基本設定', icon: Settings },
    { id: 'api', label: 'API設定', icon: Key },
    { id: 'database', label: 'データベース', icon: Database },
    { id: 'security', label: 'セキュリティ', icon: Shield }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'green';
      case 'warning': return 'orange';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      default: return RefreshCw;
    }
  };

  if (loading) {
    return (
      <div className="system-settings-loading">
        <div className="loading-spinner"></div>
        <p>システム設定を読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="system-settings">
      <div className="page-header">
        <h1>システム設定</h1>
        <p>システム全体の設定と監視</p>
      </div>

      {/* システム状態 */}
      <div className="system-status-section">
        <h2>🖥️ システム状態監視</h2>
        
        {/* サーバー・DB状態テーブル */}
        <div className="status-tables-row">
          <div className="status-table-container">
            <h3>システムコンポーネント</h3>
            <table className="status-table">
              <thead>
                <tr>
                  <th>コンポーネント</th>
                  <th>状態</th>
                  <th>詳細情報</th>
                  <th>最終確認</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="component-cell">
                    <div className="component-info">
                      <Server size={16} />
                      <span>サーバー</span>
                    </div>
                  </td>
                  <td className="status-cell">
                    <div className={`status-badge ${getStatusColor(systemStatus.server?.status)}`}>
                      {React.createElement(getStatusIcon(systemStatus.server?.status), { size: 14 })}
                      <span>{systemStatus.server?.status || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="details-cell">
                    <div className="details-grid">
                      <span>稼働: {systemStatus.server?.uptime}</span>
                      <span>CPU: {systemStatus.server?.cpu}%</span>
                      <span>Memory: {systemStatus.server?.memory}%</span>
                    </div>
                  </td>
                  <td className="timestamp-cell">
                    <span>{new Date().toLocaleTimeString('ja-JP')}</span>
                  </td>
                </tr>
                
                <tr>
                  <td className="component-cell">
                    <div className="component-info">
                      <Database size={16} />
                      <span>データベース</span>
                    </div>
                  </td>
                  <td className="status-cell">
                    <div className={`status-badge ${getStatusColor(systemStatus.database?.status)}`}>
                      {React.createElement(getStatusIcon(systemStatus.database?.status), { size: 14 })}
                      <span>{systemStatus.database?.status || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="details-cell">
                    <div className="details-grid">
                      <span>接続: {systemStatus.database?.connections}/20</span>
                      <span>クエリ: {systemStatus.database?.queries}件</span>
                      <span>レスポンス: ~15ms</span>
                    </div>
                  </td>
                  <td className="timestamp-cell">
                    <span>{new Date().toLocaleTimeString('ja-JP')}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 外部API状態テーブル */}
        <div className="api-status-table-container">
          <h3>外部API接続状態</h3>
          <table className="api-status-table">
            <thead>
              <tr>
                <th>API</th>
                <th>状態</th>
                <th>レスポンス時間</th>
                <th>今日の使用量</th>
                <th>制限</th>
                <th>最終確認</th>
                <th>アクション</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="api-name-cell">
                  <div className="api-info">
                    <div className="api-icon openai">🤖</div>
                    <span>OpenAI API</span>
                  </div>
                </td>
                <td className="status-cell">
                  <div className={`status-badge ${getStatusColor(systemStatus.apis?.openai?.status)}`}>
                    {React.createElement(getStatusIcon(systemStatus.apis?.openai?.status), { size: 14 })}
                    <span>{systemStatus.apis?.openai?.status || 'Unknown'}</span>
                  </div>
                </td>
                <td className="response-cell">
                  <span className="response-time">~450ms</span>
                </td>
                <td className="usage-cell">
                  <div className="usage-bar">
                    <div className="usage-fill" style={{ width: '67%', backgroundColor: '#10b981' }}></div>
                    <span className="usage-text">8,450 / 12,000</span>
                  </div>
                </td>
                <td className="limit-cell">
                  <span>12K req/day</span>
                </td>
                <td className="timestamp-cell">
                  <span>{new Date(systemStatus.apis?.openai?.lastCheck || Date.now()).toLocaleTimeString('ja-JP')}</span>
                </td>
                <td className="action-cell">
                  <button className="btn-sm test-btn">テスト</button>
                </td>
              </tr>
              
              <tr>
                <td className="api-name-cell">
                  <div className="api-info">
                    <div className="api-icon line">💬</div>
                    <span>LINE API</span>
                  </div>
                </td>
                <td className="status-cell">
                  <div className={`status-badge ${getStatusColor(systemStatus.apis?.line?.status)}`}>
                    {React.createElement(getStatusIcon(systemStatus.apis?.line?.status), { size: 14 })}
                    <span>{systemStatus.apis?.line?.status || 'Unknown'}</span>
                  </div>
                </td>
                <td className="response-cell">
                  <span className="response-time">~230ms</span>
                </td>
                <td className="usage-cell">
                  <div className="usage-bar">
                    <div className="usage-fill" style={{ width: '34%', backgroundColor: '#3b82f6' }}></div>
                    <span className="usage-text">1,234 / 3,600</span>
                  </div>
                </td>
                <td className="limit-cell">
                  <span>3.6K msg/day</span>
                </td>
                <td className="timestamp-cell">
                  <span>{new Date(systemStatus.apis?.line?.lastCheck || Date.now()).toLocaleTimeString('ja-JP')}</span>
                </td>
                <td className="action-cell">
                  <button className="btn-sm test-btn">テスト</button>
                </td>
              </tr>
              
              <tr>
                <td className="api-name-cell">
                  <div className="api-info">
                    <div className="api-icon stripe">💳</div>
                    <span>Stripe API</span>
                  </div>
                </td>
                <td className="status-cell">
                  <div className={`status-badge ${getStatusColor(systemStatus.apis?.stripe?.status)}`}>
                    {React.createElement(getStatusIcon(systemStatus.apis?.stripe?.status), { size: 14 })}
                    <span>{systemStatus.apis?.stripe?.status || 'Unknown'}</span>
                  </div>
                </td>
                <td className="response-cell">
                  <span className="response-time">~680ms</span>
                </td>
                <td className="usage-cell">
                  <div className="usage-bar">
                    <div className="usage-fill" style={{ width: '12%', backgroundColor: '#a855f7' }}></div>
                    <span className="usage-text">45 / 360</span>
                  </div>
                </td>
                <td className="limit-cell">
                  <span>360 req/day</span>
                </td>
                <td className="timestamp-cell">
                  <span>{new Date(systemStatus.apis?.stripe?.lastCheck || Date.now()).toLocaleTimeString('ja-JP')}</span>
                </td>
                <td className="action-cell">
                  <button className="btn-sm test-btn">テスト</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 設定タブ */}
      <div className="settings-section">
        <div className="settings-tabs">
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

        <div className="settings-content">
          {/* 基本設定 */}
          {activeTab === 'general' && (
            <div className="settings-panel">
              <h3>基本設定</h3>
              <table className="settings-table">
                <thead>
                  <tr>
                    <th>設定項目</th>
                    <th>現在の値</th>
                    <th>設定</th>
                    <th>説明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="setting-name">
                      <div className="setting-label">
                        <Globe size={16} />
                        <span>サイト名</span>
                      </div>
                    </td>
                    <td className="current-value">
                      <code>{settings.general?.siteName || 'kanpAI Admin'}</code>
                    </td>
                    <td className="setting-input">
                      <input
                        type="text"
                        value={settings.general?.siteName || ''}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          general: { ...prev.general, siteName: e.target.value }
                        }))}
                        className="form-input compact"
                        placeholder="kanpAI Admin"
                      />
                    </td>
                    <td className="setting-description">
                      <span>管理画面のタイトルに表示されます</span>
                    </td>
                  </tr>
                  
                  <tr>
                    <td className="setting-name">
                      <div className="setting-label">
                        <Clock size={16} />
                        <span>タイムゾーン</span>
                      </div>
                    </td>
                    <td className="current-value">
                      <code>{settings.general?.timezone || 'Asia/Tokyo'}</code>
                    </td>
                    <td className="setting-input">
                      <select
                        value={settings.general?.timezone || 'Asia/Tokyo'}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          general: { ...prev.general, timezone: e.target.value }
                        }))}
                        className="form-select compact"
                      >
                        <option value="Asia/Tokyo">Asia/Tokyo</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">America/New_York</option>
                      </select>
                    </td>
                    <td className="setting-description">
                      <span>日時表示とログに使用されます</span>
                    </td>
                  </tr>

                  <tr>
                    <td className="setting-name">
                      <div className="setting-label">
                        <Globe size={16} />
                        <span>言語</span>
                      </div>
                    </td>
                    <td className="current-value">
                      <code>{settings.general?.language === 'ja' ? '日本語' : 'English'}</code>
                    </td>
                    <td className="setting-input">
                      <select
                        value={settings.general?.language || 'ja'}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          general: { ...prev.general, language: e.target.value }
                        }))}
                        className="form-select compact"
                      >
                        <option value="ja">日本語</option>
                        <option value="en">English</option>
                      </select>
                    </td>
                    <td className="setting-description">
                      <span>管理画面の表示言語</span>
                    </td>
                  </tr>

                  <tr>
                    <td className="setting-name">
                      <div className="setting-label">
                        <AlertTriangle size={16} />
                        <span>メンテナンスモード</span>
                      </div>
                    </td>
                    <td className="current-value">
                      <div className={`status-badge ${settings.general?.maintenanceMode ? 'warning' : 'healthy'}`}>
                        {settings.general?.maintenanceMode ? 'ON' : 'OFF'}
                      </div>
                    </td>
                    <td className="setting-input">
                      <label className="switch-label">
                        <input
                          type="checkbox"
                          checked={settings.general?.maintenanceMode || false}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            general: { ...prev.general, maintenanceMode: e.target.checked }
                          }))}
                        />
                        <div className="switch-slider"></div>
                      </label>
                    </td>
                    <td className="setting-description">
                      <span>有効時、一般ユーザーのアクセスを制限</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* API設定 */}
          {activeTab === 'api' && (
            <div className="settings-panel">
              <h3>API設定</h3>
              <div className="api-settings">
                <div className="form-group">
                  <label>OpenAI API Key</label>
                  <div className="api-key-input">
                    <input
                      type={showApiKeys.openai ? 'text' : 'password'}
                      value={settings.api?.openaiKey || ''}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        api: { ...prev.api, openaiKey: e.target.value }
                      }))}
                      className="form-input"
                      placeholder="sk-..."
                    />
                    <button
                      type="button"
                      onClick={() => toggleApiKeyVisibility('openai')}
                      className="visibility-btn"
                    >
                      {showApiKeys.openai ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>LINE Channel Access Token</label>
                  <div className="api-key-input">
                    <input
                      type={showApiKeys.line ? 'text' : 'password'}
                      value={settings.api?.lineToken || ''}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        api: { ...prev.api, lineToken: e.target.value }
                      }))}
                      className="form-input"
                    />
                    <button
                      type="button"
                      onClick={() => toggleApiKeyVisibility('line')}
                      className="visibility-btn"
                    >
                      {showApiKeys.line ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Stripe API Key</label>
                  <div className="api-key-input">
                    <input
                      type={showApiKeys.stripe ? 'text' : 'password'}
                      value={settings.api?.stripeKey || ''}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        api: { ...prev.api, stripeKey: e.target.value }
                      }))}
                      className="form-input"
                      placeholder="sk_test_..."
                    />
                    <button
                      type="button"
                      onClick={() => toggleApiKeyVisibility('stripe')}
                      className="visibility-btn"
                    >
                      {showApiKeys.stripe ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>API制限（分あたり）</label>
                  <input
                    type="number"
                    value={settings.api?.rateLimitPerMinute || 100}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      api: { ...prev.api, rateLimitPerMinute: parseInt(e.target.value) }
                    }))}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* セキュリティ設定 */}
          {activeTab === 'security' && (
            <div className="settings-panel">
              <h3>セキュリティ設定</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>セッションタイムアウト（秒）</label>
                  <input
                    type="number"
                    value={settings.security?.sessionTimeout || 3600}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                    }))}
                    className="form-input"
                  />
                  <small>ローカル環境では認証がスキップされます</small>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.security?.requireTwoFactor || false}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, requireTwoFactor: e.target.checked }
                      }))}
                    />
                    <span>二要素認証を必須にする（本番環境用）</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* データベース設定 */}
          {activeTab === 'database' && (
            <div className="settings-panel">
              <h3>データベース設定</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>ホスト</label>
                  <input
                    type="text"
                    value={settings.database?.host || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      database: { ...prev.database, host: e.target.value }
                    }))}
                    className="form-input"
                    placeholder="localhost"
                  />
                </div>

                <div className="form-group">
                  <label>ポート</label>
                  <input
                    type="number"
                    value={settings.database?.port || 5432}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      database: { ...prev.database, port: parseInt(e.target.value) }
                    }))}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>最大接続数</label>
                  <input
                    type="number"
                    value={settings.database?.maxConnections || 20}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      database: { ...prev.database, maxConnections: parseInt(e.target.value) }
                    }))}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>バックアップスケジュール</label>
                  <select
                    value={settings.database?.backupSchedule || 'daily'}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      database: { ...prev.database, backupSchedule: e.target.value }
                    }))}
                    className="form-select"
                  >
                    <option value="daily">毎日</option>
                    <option value="weekly">毎週</option>
                    <option value="monthly">毎月</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 保存ボタン */}
      <div className="settings-actions">
        <button
          className="btn-primary"
          onClick={handleSaveSettings}
          disabled={saving}
        >
          {saving ? (
            <>
              <RefreshCw size={18} className="spin" />
              保存中...
            </>
          ) : (
            <>
              <Save size={18} />
              設定を保存
            </>
          )}
        </button>
        
        <button
          className="btn-secondary"
          onClick={fetchSystemStatus}
        >
          <RefreshCw size={18} />
          状態を更新
        </button>
      </div>
    </div>
  );
};

export default SystemSettings;