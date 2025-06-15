import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  CheckSquare,
  Square,
  Play,
  Pause,
  Save,
  Download,
  Upload,
  Settings,
  FileText,
  Database,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Filter,
  Search,
  ArrowRight,
  Copy,
  Trash2,
  Edit
} from 'lucide-react';

const BulkOperations = () => {
  const { api } = useAuth();
  const [stores, setStores] = useState([]);
  const [selectedStores, setSelectedStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationInProgress, setOperationInProgress] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState('');
  const [operationConfig, setOperationConfig] = useState({});
  const [operationHistory, setOperationHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // ローカル環境判定
  const isLocalEnv = window.location.hostname === 'localhost';

  useEffect(() => {
    fetchStores();
    fetchOperationHistory();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      
      // ローカル環境でのモックデータ
      if (isLocalEnv) {
        const mockStores = [
          {
            id: 1,
            name: '居酒屋 花まる 渋谷店',
            status: 'active',
            lastUpdate: new Date(Date.now() - 3600000).toISOString(),
            apiCalls: 1250,
            errorRate: 2.1,
            settings: {
              autoReport: true,
              lineEnabled: true,
              aiPersonality: 'フレンドリー'
            }
          },
          {
            id: 2,
            name: '海鮮居酒屋 大漁丸',
            status: 'active',
            lastUpdate: new Date(Date.now() - 7200000).toISOString(),
            apiCalls: 890,
            errorRate: 0.5,
            settings: {
              autoReport: false,
              lineEnabled: true,
              aiPersonality: '丁寧'
            }
          },
          {
            id: 3,
            name: '創作和食 風花',
            status: 'maintenance',
            lastUpdate: new Date(Date.now() - 86400000).toISOString(),
            apiCalls: 650,
            errorRate: 5.2,
            settings: {
              autoReport: true,
              lineEnabled: false,
              aiPersonality: '上品'
            }
          },
          {
            id: 4,
            name: '串焼き専門店 炭火屋',
            status: 'active',
            lastUpdate: new Date(Date.now() - 1800000).toISOString(),
            apiCalls: 420,
            errorRate: 1.8,
            settings: {
              autoReport: true,
              lineEnabled: true,
              aiPersonality: 'カジュアル'
            }
          },
          {
            id: 5,
            name: '昭和レトロ居酒屋 のんべえ横丁',
            status: 'inactive',
            lastUpdate: new Date(Date.now() - 86400000 * 3).toISOString(),
            apiCalls: 0,
            errorRate: 0,
            settings: {
              autoReport: false,
              lineEnabled: false,
              aiPersonality: 'レトロ'
            }
          }
        ];
        
        setStores(mockStores);
        setLoading(false);
        return;
      }
      
      // 本番API呼び出し
      const response = await api.get('/stores');
      if (response.data.success) {
        setStores(response.data.stores);
      }
    } catch (error) {
      console.error('店舗一覧取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOperationHistory = async () => {
    try {
      // ローカル環境でのモックデータ
      if (isLocalEnv) {
        const mockHistory = [
          {
            id: 1,
            operation: 'update_settings',
            targetCount: 3,
            successCount: 3,
            failureCount: 0,
            startTime: new Date(Date.now() - 3600000).toISOString(),
            endTime: new Date(Date.now() - 3500000).toISOString(),
            status: 'completed',
            details: 'AI性格設定を一括更新'
          },
          {
            id: 2,
            operation: 'generate_reports',
            targetCount: 5,
            successCount: 4,
            failureCount: 1,
            startTime: new Date(Date.now() - 86400000).toISOString(),
            endTime: new Date(Date.now() - 86400000 + 300000).toISOString(),
            status: 'completed_with_errors',
            details: '月次レポート一括生成'
          },
          {
            id: 3,
            operation: 'backup_data',
            targetCount: 5,
            successCount: 5,
            failureCount: 0,
            startTime: new Date(Date.now() - 86400000 * 7).toISOString(),
            endTime: new Date(Date.now() - 86400000 * 7 + 600000).toISOString(),
            status: 'completed',
            details: '全店舗データバックアップ'
          }
        ];
        
        setOperationHistory(mockHistory);
        return;
      }
      
      // 本番API呼び出し
      const response = await api.get('/bulk-operations/history');
      if (response.data.success) {
        setOperationHistory(response.data.history);
      }
    } catch (error) {
      console.error('操作履歴取得エラー:', error);
    }
  };

  const handleSelectAll = () => {
    if (selectedStores.length === filteredStores.length) {
      setSelectedStores([]);
    } else {
      setSelectedStores(filteredStores.map(store => store.id));
    }
  };

  const handleSelectStore = (storeId) => {
    setSelectedStores(prev => 
      prev.includes(storeId)
        ? prev.filter(id => id !== storeId)
        : [...prev, storeId]
    );
  };

  const handleExecuteOperation = async () => {
    if (!selectedOperation || selectedStores.length === 0) {
      alert('操作と対象店舗を選択してください');
      return;
    }

    if (!confirm(`${selectedStores.length}店舗に対して「${getOperationLabel(selectedOperation)}」を実行しますか？`)) {
      return;
    }

    try {
      setOperationInProgress(true);
      
      // ローカル環境でのシミュレーション
      if (isLocalEnv) {
        console.log('一括操作実行:', {
          operation: selectedOperation,
          stores: selectedStores,
          config: operationConfig
        });

        // 実行シミュレーション（3秒）
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 履歴に追加
        const newOperation = {
          id: Date.now(),
          operation: selectedOperation,
          targetCount: selectedStores.length,
          successCount: selectedStores.length - Math.floor(Math.random() * 2), // ランダムに1〜2店舗失敗
          failureCount: Math.floor(Math.random() * 2),
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 3000).toISOString(),
          status: 'completed',
          details: getOperationLabel(selectedOperation)
        };

        setOperationHistory(prev => [newOperation, ...prev]);
        setSelectedStores([]);
        setSelectedOperation('');
        setOperationConfig({});
        
        alert('一括操作が完了しました！');
        return;
      }

      // 本番API呼び出し
      const response = await api.post('/bulk-operations/execute', {
        operation: selectedOperation,
        storeIds: selectedStores,
        config: operationConfig
      });

      if (response.data.success) {
        alert('一括操作を開始しました');
        fetchOperationHistory();
        setSelectedStores([]);
        setSelectedOperation('');
        setOperationConfig({});
      }
    } catch (error) {
      console.error('一括操作エラー:', error);
      alert('一括操作の実行に失敗しました');
    } finally {
      setOperationInProgress(false);
    }
  };

  const operations = [
    {
      id: 'update_settings',
      label: '設定更新',
      description: '選択した店舗の設定を一括更新',
      icon: Settings,
      configFields: [
        { key: 'autoReport', label: '自動レポート生成', type: 'boolean' },
        { key: 'lineEnabled', label: 'LINE機能', type: 'boolean' },
        { key: 'aiPersonality', label: 'AI性格', type: 'select', options: ['フレンドリー', '丁寧', '上品', 'カジュアル'] }
      ]
    },
    {
      id: 'generate_reports',
      label: 'レポート生成',
      description: '選択した店舗の月次レポートを一括生成',
      icon: FileText,
      configFields: [
        { key: 'reportType', label: 'レポート種別', type: 'select', options: ['月次', '週次', '日次'] },
        { key: 'includeCharts', label: 'グラフ含む', type: 'boolean' }
      ]
    },
    {
      id: 'backup_data',
      label: 'データバックアップ',
      description: '選択した店舗のデータを一括バックアップ',
      icon: Database,
      configFields: [
        { key: 'includeSettings', label: '設定含む', type: 'boolean' },
        { key: 'includeReports', label: 'レポート含む', type: 'boolean' }
      ]
    },
    {
      id: 'sync_calendars',
      label: 'カレンダー同期',
      description: '選択した店舗のGoogle Calendarを同期',
      icon: RefreshCw,
      configFields: [
        { key: 'syncPeriod', label: '同期期間', type: 'select', options: ['1週間', '1ヶ月', '3ヶ月'] }
      ]
    },
    {
      id: 'update_api_keys',
      label: 'APIキー更新',
      description: '選択した店舗のAPIキーを一括更新',
      icon: Copy,
      configFields: [
        { key: 'keyType', label: 'キー種別', type: 'select', options: ['OpenAI', 'LINE', 'すべて'] }
      ]
    }
  ];

  const getOperationLabel = (operationId) => {
    const operation = operations.find(op => op.id === operationId);
    return operation ? operation.label : operationId;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'maintenance': return 'orange';
      case 'inactive': return 'red';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return '稼働中';
      case 'maintenance': return 'メンテナンス';
      case 'inactive': return '停止中';
      default: return status;
    }
  };

  const getOperationStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'completed_with_errors': return AlertTriangle;
      case 'in_progress': return Clock;
      case 'failed': return AlertTriangle;
      default: return Clock;
    }
  };

  const filteredStores = stores.filter(store => {
    if (statusFilter !== 'all' && store.status !== statusFilter) return false;
    if (searchQuery && !store.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const selectedOperation = operations.find(op => op.id === selectedOperation);

  if (loading) {
    return (
      <div className="bulk-operations-loading">
        <div className="loading-spinner"></div>
        <p>店舗データを読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="bulk-operations">
      <div className="page-header">
        <h1>一括操作</h1>
        <p>複数店舗に対する操作を一括実行</p>
      </div>

      {/* 操作選択 */}
      <div className="operation-selection">
        <h2>操作選択</h2>
        <div className="operations-grid">
          {operations.map(operation => {
            const Icon = operation.icon;
            return (
              <div
                key={operation.id}
                className={`operation-card ${selectedOperation === operation.id ? 'selected' : ''}`}
                onClick={() => setSelectedOperation(operation.id)}
              >
                <div className="operation-icon">
                  <Icon size={24} />
                </div>
                <div className="operation-content">
                  <h3>{operation.label}</h3>
                  <p>{operation.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 設定フォーム */}
      {selectedOperation && (
        <div className="operation-config">
          <h3>操作設定</h3>
          <div className="config-form">
            {selectedOperation.configFields.map(field => (
              <div key={field.key} className="form-group">
                <label>{field.label}</label>
                {field.type === 'boolean' ? (
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={operationConfig[field.key] || false}
                      onChange={(e) => setOperationConfig(prev => ({
                        ...prev,
                        [field.key]: e.target.checked
                      }))}
                    />
                    <span>有効</span>
                  </label>
                ) : field.type === 'select' ? (
                  <select
                    value={operationConfig[field.key] || ''}
                    onChange={(e) => setOperationConfig(prev => ({
                      ...prev,
                      [field.key]: e.target.value
                    }))}
                    className="form-select"
                  >
                    <option value="">選択してください</option>
                    {field.options.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={operationConfig[field.key] || ''}
                    onChange={(e) => setOperationConfig(prev => ({
                      ...prev,
                      [field.key]: e.target.value
                    }))}
                    className="form-input"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 店舗選択 */}
      <div className="store-selection">
        <div className="selection-header">
          <h2>対象店舗選択</h2>
          <div className="selection-controls">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="店舗を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
            >
              <option value="all">すべて</option>
              <option value="active">稼働中</option>
              <option value="maintenance">メンテナンス</option>
              <option value="inactive">停止中</option>
            </select>
            
            <button
              className="select-all-btn"
              onClick={handleSelectAll}
            >
              {selectedStores.length === filteredStores.length ? (
                <>
                  <CheckSquare size={16} />
                  すべて解除
                </>
              ) : (
                <>
                  <Square size={16} />
                  すべて選択
                </>
              )}
            </button>
          </div>
        </div>

        <div className="stores-list">
          {filteredStores.map(store => (
            <div
              key={store.id}
              className={`store-item ${selectedStores.includes(store.id) ? 'selected' : ''}`}
              onClick={() => handleSelectStore(store.id)}
            >
              <div className="store-checkbox">
                {selectedStores.includes(store.id) ? (
                  <CheckSquare size={20} />
                ) : (
                  <Square size={20} />
                )}
              </div>
              
              <div className="store-info">
                <h4>{store.name}</h4>
                <div className="store-meta">
                  <span className={`status-badge ${getStatusColor(store.status)}`}>
                    {getStatusLabel(store.status)}
                  </span>
                  <span>API: {store.apiCalls.toLocaleString()}</span>
                  <span>エラー率: {store.errorRate}%</span>
                  <span>更新: {new Date(store.lastUpdate).toLocaleString('ja-JP')}</span>
                </div>
              </div>
            </div>
          ))}
          
          {filteredStores.length === 0 && (
            <div className="empty-state">
              <Users size={48} />
              <h3>対象店舗がありません</h3>
              <p>検索条件を変更してください</p>
            </div>
          )}
        </div>
      </div>

      {/* 実行ボタン */}
      <div className="execution-section">
        <div className="execution-summary">
          <h3>実行サマリー</h3>
          <div className="summary-details">
            <div className="summary-item">
              <span>操作:</span>
              <span>{selectedOperation ? getOperationLabel(selectedOperation) : '未選択'}</span>
            </div>
            <div className="summary-item">
              <span>対象店舗:</span>
              <span>{selectedStores.length}店舗</span>
            </div>
          </div>
        </div>
        
        <button
          className="execute-btn"
          onClick={handleExecuteOperation}
          disabled={!selectedOperation || selectedStores.length === 0 || operationInProgress}
        >
          {operationInProgress ? (
            <>
              <RefreshCw size={18} className="spin" />
              実行中...
            </>
          ) : (
            <>
              <Play size={18} />
              一括実行
            </>
          )}
        </button>
      </div>

      {/* 操作履歴 */}
      <div className="operation-history">
        <h2>操作履歴</h2>
        <div className="history-list">
          {operationHistory.map(operation => {
            const StatusIcon = getOperationStatusIcon(operation.status);
            
            return (
              <div key={operation.id} className="history-item">
                <div className="history-status">
                  <StatusIcon size={20} />
                </div>
                
                <div className="history-content">
                  <h4>{operation.details}</h4>
                  <div className="history-meta">
                    <span>対象: {operation.targetCount}店舗</span>
                    <span>成功: {operation.successCount}</span>
                    {operation.failureCount > 0 && (
                      <span className="failure">失敗: {operation.failureCount}</span>
                    )}
                    <span>
                      実行時間: {new Date(operation.startTime).toLocaleString('ja-JP')}
                    </span>
                  </div>
                </div>
                
                <div className="history-actions">
                  <button className="btn-sm">
                    詳細
                  </button>
                </div>
              </div>
            );
          })}
          
          {operationHistory.length === 0 && (
            <div className="empty-history">
              <Clock size={48} />
              <h3>操作履歴がありません</h3>
              <p>一括操作を実行すると、こちらに履歴が表示されます</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkOperations;