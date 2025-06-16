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
  const [activeTab, setActiveTab] = useState('general');
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

      {/* システム状態サマリー（横一列） */}
      <div className="system-summary-bar">
        <div className="summary-container">
          <div className="summary-title">🖥️ システム状態サマリー</div>
          <div className="summary-stats">
            <div className="summary-stat-item">
              <Server size={18} style={{ color: getStatusColor(systemStatus.server?.status) === 'green' ? '#10b981' : '#ef4444' }} />
              <div className="stat-content">
                <span className="stat-value">{systemStatus.server?.status || 'Unknown'}</span>
                <span className="stat-label">サーバー</span>
              </div>
              <div className="stat-detail">
                <span>CPU: {systemStatus.server?.cpu || '0'}%</span>
              </div>
            </div>
            
            <div className="summary-stat-item">
              <Database size={18} style={{ color: getStatusColor(systemStatus.database?.status) === 'green' ? '#10b981' : '#ef4444' }} />
              <div className="stat-content">
                <span className="stat-value">{systemStatus.database?.status || 'Unknown'}</span>
                <span className="stat-label">データベース</span>
              </div>
              <div className="stat-detail">
                <span>接続: {systemStatus.database?.connections || '0'}</span>
              </div>
            </div>
            
            <div className="summary-stat-item">
              <Activity size={18} style={{ color: '#3b82f6' }} />
              <div className="stat-content">
                <span className="stat-value">{systemStatus.server?.uptime || '0h'}</span>
                <span className="stat-label">稼働時間</span>
              </div>
              <div className="stat-detail">
                <span>Memory: {systemStatus.server?.memory || '0'}%</span>
              </div>
            </div>
            
            <div className="summary-stat-item">
              <HardDrive size={18} style={{ color: '#f59e0b' }} />
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
                  <button className="btn-sm secondary">再起動</button>
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
                  <button className="btn-sm secondary">最適化</button>
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
  );
};

export default SystemSettings;