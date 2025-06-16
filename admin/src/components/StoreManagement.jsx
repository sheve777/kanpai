import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import StoreWizard from './StoreWizard';
import StoreDetailModal from './StoreDetailModal';
import StoreDetail from './StoreDetail/index';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MoreVertical,
  Store,
  Phone,
  MapPin,
  Calendar,
  Users,
  RefreshCw,
  Settings,
  Zap
} from 'lucide-react';

const StoreManagement = () => {
  const { api } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showStoreWizard, setShowStoreWizard] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [detailModalMode, setDetailModalMode] = useState('view');
  const [showDetailPage, setShowDetailPage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showTroubleshootDialog, setShowTroubleshootDialog] = useState(false);
  const [troubleshootStore, setTroubleshootStore] = useState(null);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      
      // ローカル環境では本番APIの代わりにデモデータを使用
      if (window.location.hostname === 'localhost') {
        console.log('🏠 ローカル環境：デモ店舗データを使用');
        const demoStores = [
          {
            id: 'demo-store-001',
            name: '居酒屋 花まる 渋谷店',
            phone: '03-1234-5678',
            address: '東京都渋谷区道玄坂1-2-3 渋谷ビル B1F',
            concept: '新鮮な魚介類と日本酒が自慢のアットホームな居酒屋',
            auth_active: true,
            last_login: new Date().toISOString(),
            total_reservations: 156,
            created_at: '2024-01-15T10:00:00Z',
            systemStatus: {
              overall: 'healthy', // healthy, warning, error
              apiConnections: {
                openai: 'connected',
                line: 'connected', 
                googleCalendar: 'connected'
              },
              errorRate: 0.02,
              responseTime: 1.2,
              lastError: null
            },
            serviceQuality: {
              aiResponseRate: 0.94,
              systemUptime: 0.999,
              apiCallsToday: 156,
              errorsToday: 3
            }
          },
          {
            id: 'demo-store-002',
            name: '海鮮居酒屋 大漁丸',
            phone: '03-9876-5432',
            address: '東京都新宿区歌舞伎町2-10-5 新宿タワー 3F',
            concept: '毎日市場から直送！新鮮な海の幸をリーズナブルに',
            auth_active: true,
            last_login: new Date(Date.now() - 86400000 * 3).toISOString(), // 3日前
            total_reservations: 234,
            created_at: '2023-11-20T14:30:00Z',
            systemStatus: {
              overall: 'warning',
              apiConnections: {
                openai: 'connected',
                line: 'connected',
                googleCalendar: 'error'
              },
              errorRate: 0.08,
              responseTime: 2.8,
              lastError: new Date(Date.now() - 3600000).toISOString()
            },
            serviceQuality: {
              aiResponseRate: 0.89,
              systemUptime: 0.987,
              apiCallsToday: 89,
              errorsToday: 7
            }
          },
          {
            id: 'demo-store-003',
            name: '串焼き専門店 炭火屋',
            phone: '03-5555-1234',
            address: '東京都港区六本木3-8-15',
            concept: '備長炭で焼き上げる本格串焼きと厳選日本酒',
            auth_active: true,
            last_login: new Date(Date.now() - 86400000 * 10).toISOString(), // 10日前（要注意）
            total_reservations: 89,
            created_at: '2024-03-01T09:00:00Z',
            systemStatus: {
              overall: 'warning',
              apiConnections: {
                openai: 'connected',
                line: 'warning',
                googleCalendar: 'connected'
              },
              errorRate: 0.12,
              responseTime: 3.5,
              lastError: new Date(Date.now() - 7200000).toISOString()
            },
            serviceQuality: {
              aiResponseRate: 0.85,
              systemUptime: 0.978,
              apiCallsToday: 23,
              errorsToday: 5
            }
          },
          {
            id: 'demo-store-004',
            name: '昭和レトロ居酒屋 のんべえ横丁',
            phone: '03-7777-8888',
            address: '東京都中野区中野5-59-2',
            concept: '昭和の雰囲気そのまま！懐かしの味と空間',
            auth_active: false, // 停止中
            last_login: new Date(Date.now() - 86400000 * 30).toISOString(), // 30日前
            total_reservations: 45,
            created_at: '2023-09-10T11:00:00Z',
            systemStatus: {
              overall: 'error',
              apiConnections: {
                openai: 'error',
                line: 'connected',
                googleCalendar: 'error'
              },
              errorRate: 0.35,
              responseTime: 8.2,
              lastError: new Date(Date.now() - 1800000).toISOString()
            },
            serviceQuality: {
              aiResponseRate: 0.72,
              systemUptime: 0.891,
              apiCallsToday: 0,
              errorsToday: 15
            }
          },
          {
            id: 'demo-store-005',
            name: '創作和食 風花',
            phone: '03-2222-3333',
            address: '東京都世田谷区三軒茶屋2-13-10',
            concept: '季節の食材を使った創作和食とワインのマリアージュ',
            auth_active: true,
            last_login: new Date().toISOString(),
            total_reservations: 312,
            created_at: '2023-06-15T13:45:00Z',
            operating_hours: {
              mon: { open: '17:30', close: '23:30' },
              tue: { open: '17:30', close: '23:30' },
              wed: { open: '17:30', close: '23:30' },
              thu: { open: '17:30', close: '23:30' },
              fri: { open: '17:30', close: '24:00' },
              sat: { open: '17:00', close: '24:00' },
              sun: { open: '17:00', close: '23:00' }
            },
            systemStatus: {
              overall: 'healthy',
              apiConnections: {
                openai: 'connected',
                line: 'connected',
                googleCalendar: 'connected'
              },
              errorRate: 0.01,
              responseTime: 0.9,
              lastError: new Date(Date.now() - 86400000 * 2).toISOString()
            },
            serviceQuality: {
              aiResponseRate: 0.96,
              systemUptime: 0.9995,
              apiCallsToday: 234,
              errorsToday: 1
            }
          }
        ];
        setStores(demoStores);
        setLoading(false);
        return;
      }
      
      const response = await api.get('/stores');
      
      if (response.data.success) {
        setStores(response.data.stores);
      }
    } catch (error) {
      console.error('店舗取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageStore = (store) => {
    setSelectedStore(store.id);
    setShowDetailPage(true);
  };

  const handleDeleteStore = (store) => {
    setStoreToDelete(store);
    setDeleteConfirmText('');
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmText !== storeToDelete.name) {
      alert('店舗名が正しく入力されていません');
      return;
    }

    // 最終確認ダイアログ
    const finalConfirmMessage = `⚠️ 最終確認 ⚠️\n\n本当に「${storeToDelete.name}」を削除しますか？\n\nこの操作は取り消せません。\n・店舗データ\n・予約履歴\n・レポート\n・設定情報\n\nすべて完全に削除されます。`;
    
    if (!window.confirm(finalConfirmMessage)) {
      return;
    }

    try {
      // ローカル環境では削除をシミュレート
      if (window.location.hostname === 'localhost') {
        console.log('🗑️ 店舗削除（ローカルシミュレーション）:', storeToDelete.id);
        alert(`「${storeToDelete.name}」を削除しました（ローカル環境）`);
        setShowDeleteConfirm(false);
        setStoreToDelete(null);
        setDeleteConfirmText('');
        fetchStores();
        return;
      }
      
      const response = await api.delete(`/stores/${storeToDelete.id}`);
      if (response.data.success) {
        alert(`「${storeToDelete.name}」を削除しました`);
        setShowDeleteConfirm(false);
        setStoreToDelete(null);
        setDeleteConfirmText('');
        fetchStores();
      }
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setStoreToDelete(null);
    setDeleteConfirmText('');
  };

  const handleTroubleshoot = (store) => {
    setTroubleshootStore(store);
    setShowTroubleshootDialog(true);
  };

  const handleApiReconnect = async (apiType) => {
    if (window.location.hostname === 'localhost') {
      console.log('🔄 API再接続シミュレーション:', apiType);
      alert(`${apiType} APIの再接続を試行しました（ローカル環境）`);
      // デモ用に成功したことにする
      setTimeout(() => {
        fetchStores();
      }, 1000);
      return;
    }

    try {
      const response = await api.post(`/stores/${troubleshootStore.id}/reconnect-api`, {
        apiType: apiType
      });
      if (response.data.success) {
        alert(`${apiType} APIの再接続に成功しました`);
        fetchStores();
      }
    } catch (error) {
      alert(`${apiType} APIの再接続に失敗しました`);
    }
  };

  const handleSystemRestart = async () => {
    if (!window.confirm('本当にシステムを再起動しますか？\n一時的にサービスが停止します。')) {
      return;
    }

    if (window.location.hostname === 'localhost') {
      console.log('🔄 システム再起動シミュレーション');
      alert('システムを再起動しました（ローカル環境）');
      setShowTroubleshootDialog(false);
      setTimeout(() => {
        fetchStores();
      }, 2000);
      return;
    }

    try {
      const response = await api.post(`/stores/${troubleshootStore.id}/restart-system`);
      if (response.data.success) {
        alert('システムの再起動を開始しました');
        setShowTroubleshootDialog(false);
        fetchStores();
      }
    } catch (error) {
      alert('システム再起動に失敗しました');
    }
  };

  const getStatusInfo = (store) => {
    if (!store.auth_active) {
      return {
        status: 'inactive',
        label: '🔴 停止中',
        className: 'status-inactive'
      };
    }
    
    // 最後のログインから7日以上経過している場合は警告
    const lastLogin = new Date(store.last_login);
    const daysSinceLogin = Math.floor((Date.now() - lastLogin) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLogin > 7) {
      return {
        status: 'warning',
        label: '⚠️ 要注意',
        className: 'status-warning'
      };
    }
    
    return {
      status: 'active',
      label: '🟢 稼働中',
      className: 'status-active'
    };
  };

  const getPlanInfo = (store) => {
    // プラン情報はここでは仮のデータを使用
    const plans = ['エントリー', 'スタンダード', 'プロ'];
    return plans[Math.floor(Math.random() * plans.length)];
  };

  const getUsagePercentage = (store) => {
    // 使用量情報もここでは仮のデータ
    return Math.floor(Math.random() * 100);
  };

  const getRemainingPoints = (store) => {
    // 残ポイントも仮のデータ
    return Math.floor(Math.random() * 3000) + 100;
  };

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'healthy') return matchesSearch && store.systemStatus?.overall === 'healthy';
    if (selectedFilter === 'warning') return matchesSearch && store.systemStatus?.overall === 'warning';
    if (selectedFilter === 'error') return matchesSearch && store.systemStatus?.overall === 'error';
    
    return matchesSearch;
  });

  const getSystemStatusCount = (status) => {
    return stores.filter(s => s.systemStatus?.overall === status).length;
  };

  const filterOptions = [
    { value: 'all', label: '全て', count: stores.length },
    { value: 'healthy', label: '正常稼働', count: getSystemStatusCount('healthy') },
    { value: 'warning', label: '確認推奨', count: getSystemStatusCount('warning') },
    { value: 'error', label: '要対応', count: getSystemStatusCount('error') }
  ];

  if (loading) {
    return (
      <div className="store-management-loading">
        <div className="loading-spinner"></div>
        <p>店舗情報を読み込み中...</p>
      </div>
    );
  }

  // Show detail page if selected
  if (showDetailPage && selectedStore) {
    return (
      <StoreDetail 
        storeId={selectedStore}
        onBack={() => {
          setShowDetailPage(false);
          setSelectedStore(null);
          fetchStores(); // Refresh the store list
        }}
      />
    );
  }

  return (
    <div className="store-management">
      <div className="page-header">
        <h1>店舗管理</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowStoreWizard(true)}
        >
          <Plus size={18} />
          新店舗追加
        </button>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="店舗名で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-buttons">
          {filterOptions.map(option => (
            <button
              key={option.value}
              className={`filter-btn ${selectedFilter === option.value ? 'active' : ''}`}
              onClick={() => setSelectedFilter(option.value)}
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>
      </div>

      {/* Stores Table */}
      <div className="stores-table-container">
        <table className="stores-table">
          <thead>
            <tr>
              <th>店舗名</th>
              <th>プラン</th>
              <th>システム状態</th>
              <th>API連携</th>
              <th>最終活動</th>
              <th>アクション</th>
            </tr>
          </thead>
          <tbody>
            {filteredStores.map(store => {
              const statusInfo = getStatusInfo(store);
              const plan = getPlanInfo(store);
              const usage = getUsagePercentage(store);
              const points = getRemainingPoints(store);
              
              return (
                <tr key={store.id}>
                  <td>
                    <div className="store-info">
                      <Store size={16} />
                      <div>
                        <div className="store-name">{store.name}</div>
                        <div className="store-details">
                          <MapPin size={12} />
                          {store.address}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="plan-badge">{plan}</span>
                  </td>
                  <td>
                    <div className="system-status">
                      <span 
                        className={`status-indicator ${store.systemStatus?.overall || 'unknown'}`}
                        title={
                          store.systemStatus?.overall === 'error' ? 
                            `🚨 エラー詳細:\n${store.systemStatus?.apiConnections?.openai === 'error' ? '• OpenAI API接続エラー\n' : ''}${store.systemStatus?.apiConnections?.line === 'error' ? '• LINE API接続エラー\n' : ''}${store.systemStatus?.apiConnections?.googleCalendar === 'error' ? '• Google Calendar API接続エラー\n' : ''}最終エラー: ${store.systemStatus?.lastError ? new Date(store.systemStatus.lastError).toLocaleString('ja-JP') : '不明'}` :
                          store.systemStatus?.overall === 'warning' ?
                            `⚠️ 警告詳細:\n${store.systemStatus?.apiConnections?.openai === 'warning' ? '• OpenAI API応答遅延\n' : ''}${store.systemStatus?.apiConnections?.line === 'warning' ? '• LINE API応答遅延\n' : ''}${store.systemStatus?.apiConnections?.googleCalendar === 'warning' ? '• Google Calendar API応答遅延\n' : ''}${store.systemStatus?.apiConnections?.googleCalendar === 'error' ? '• Google Calendar API接続エラー\n' : ''}エラー率が高い状態です` :
                          store.systemStatus?.overall === 'healthy' ?
                            '✅ すべてのシステムが正常に動作しています' :
                            'システム状態を取得できません'
                        }
                      >
                        {store.systemStatus?.overall === 'healthy' ? '🟢 正常稼働' :
                         store.systemStatus?.overall === 'warning' ? '🟡 確認推奨' :
                         store.systemStatus?.overall === 'error' ? '🔴 要対応' : '❓ 不明'}
                      </span>
                      <div className="status-details">
                        <small>エラー率: {Math.round((store.systemStatus?.errorRate || 0) * 100)}% | 応答: {store.systemStatus?.responseTime || 0}s</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="api-connections-inline">
                      <span 
                        className={`api-status ${store.systemStatus?.apiConnections?.openai || 'unknown'}`}
                        title={
                          store.systemStatus?.apiConnections?.openai === 'connected' ? 'OpenAI API: 正常接続' :
                          store.systemStatus?.apiConnections?.openai === 'warning' ? 'OpenAI API: 応答遅延 - レート制限の可能性' :
                          store.systemStatus?.apiConnections?.openai === 'error' ? 'OpenAI API: 接続エラー - APIキーまたはネットワークエラー' :
                          'OpenAI API: 状態不明'
                        }
                      >
                        🤖{store.systemStatus?.apiConnections?.openai === 'connected' ? '✅' : 
                            store.systemStatus?.apiConnections?.openai === 'warning' ? '⚠️' : '❌'}
                      </span>
                      <span 
                        className={`api-status ${store.systemStatus?.apiConnections?.line || 'unknown'}`}
                        title={
                          store.systemStatus?.apiConnections?.line === 'connected' ? 'LINE API: 正常接続' :
                          store.systemStatus?.apiConnections?.line === 'warning' ? 'LINE API: 応答遅延 - 配信制限の可能性' :
                          store.systemStatus?.apiConnections?.line === 'error' ? 'LINE API: 接続エラー - トークンまたは設定エラー' :
                          'LINE API: 状態不明'
                        }
                      >
                        💬{store.systemStatus?.apiConnections?.line === 'connected' ? '✅' : 
                            store.systemStatus?.apiConnections?.line === 'warning' ? '⚠️' : '❌'}
                      </span>
                      <span 
                        className={`api-status ${store.systemStatus?.apiConnections?.googleCalendar || 'unknown'}`}
                        title={
                          store.systemStatus?.apiConnections?.googleCalendar === 'connected' ? 'Google Calendar API: 正常接続' :
                          store.systemStatus?.apiConnections?.googleCalendar === 'warning' ? 'Google Calendar API: 応答遅延 - クォータ制限の可能性' :
                          store.systemStatus?.apiConnections?.googleCalendar === 'error' ? 'Google Calendar API: 接続エラー - 認証または権限エラー' :
                          'Google Calendar API: 状態不明'
                        }
                      >
                        📅{store.systemStatus?.apiConnections?.googleCalendar === 'connected' ? '✅' : 
                            store.systemStatus?.apiConnections?.googleCalendar === 'warning' ? '⚠️' : '❌'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="activity-info">
                      <div className="last-login">
                        {store.last_login ? new Date(store.last_login).toLocaleDateString('ja-JP') : '未ログイン'}
                      </div>
                      <div className="activity-summary">
                        <small>
                          {store.last_login ? 
                            `${Math.floor((Date.now() - new Date(store.last_login)) / (1000 * 60 * 60 * 24))}日前 | 今日: API呼び出し${store.serviceQuality?.apiCallsToday || 0}回` : 
                            'システム未使用'
                          }
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn primary" 
                        title="店舗管理（詳細・編集）"
                        onClick={() => handleManageStore(store)}
                      >
                        <Edit size={14} />
                        管理
                      </button>
                      {(store.systemStatus?.overall === 'error' || store.systemStatus?.overall === 'warning') && (
                        <button 
                          className="action-btn warning" 
                          title="問題を解決"
                          onClick={() => handleTroubleshoot(store)}
                        >
                          <RefreshCw size={14} />
                          対処
                        </button>
                      )}
                      <button 
                        className="action-btn danger" 
                        title="店舗削除"
                        onClick={() => handleDeleteStore(store)}
                      >
                        <Trash2 size={14} />
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredStores.length === 0 && (
        <div className="empty-state">
          <Store size={48} />
          <h3>店舗が見つかりません</h3>
          <p>検索条件を変更するか、新しい店舗を追加してください。</p>
        </div>
      )}

      {/* Store Wizard */}
      <StoreWizard
        isOpen={showStoreWizard}
        onClose={() => {
          setShowStoreWizard(false);
          fetchStores(); // 店舗一覧を再取得
        }}
      />

      {/* Store Detail Modal */}
      <StoreDetailModal
        isOpen={selectedStore !== null}
        onClose={() => {
          setSelectedStore(null);
          fetchStores(); // 変更を反映
        }}
        storeId={selectedStore}
        mode={detailModalMode}
      />

      {/* Troubleshoot Dialog */}
      {showTroubleshootDialog && troubleshootStore && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <div className="dialog-header">
              <h3>🔧 問題解決アクション</h3>
              <p>{troubleshootStore.name}</p>
            </div>
            
            <div className="dialog-content">
              <div className="troubleshoot-status">
                <h4>現在の状態</h4>
                <div className="status-summary">
                  <div className="status-item">
                    <span className="label">システム状態:</span>
                    <span className={`value ${troubleshootStore.systemStatus?.overall}`}>
                      {troubleshootStore.systemStatus?.overall === 'error' ? '🔴 要対応' : '🟡 確認推奨'}
                    </span>
                  </div>
                  <div className="status-item">
                    <span className="label">エラー率:</span>
                    <span className="value">{Math.round((troubleshootStore.systemStatus?.errorRate || 0) * 100)}%</span>
                  </div>
                  <div className="status-item">
                    <span className="label">応答時間:</span>
                    <span className="value">{troubleshootStore.systemStatus?.responseTime || 0}秒</span>
                  </div>
                </div>
              </div>

              <div className="troubleshoot-actions">
                <h4>対処方法を選択</h4>
                
                {/* API再接続ボタン */}
                {troubleshootStore.systemStatus?.apiConnections?.openai === 'error' && (
                  <button 
                    className="troubleshoot-btn"
                    onClick={() => handleApiReconnect('OpenAI')}
                  >
                    <RefreshCw size={16} />
                    OpenAI API 再接続
                    <small>APIキーと接続設定を確認して再接続</small>
                  </button>
                )}
                
                {troubleshootStore.systemStatus?.apiConnections?.line === 'error' && (
                  <button 
                    className="troubleshoot-btn"
                    onClick={() => handleApiReconnect('LINE')}
                  >
                    <RefreshCw size={16} />
                    LINE API 再接続
                    <small>トークンと権限を確認して再接続</small>
                  </button>
                )}
                
                {troubleshootStore.systemStatus?.apiConnections?.googleCalendar === 'error' && (
                  <button 
                    className="troubleshoot-btn"
                    onClick={() => handleApiReconnect('Google Calendar')}
                  >
                    <RefreshCw size={16} />
                    Google Calendar API 再接続
                    <small>認証情報を確認して再接続</small>
                  </button>
                )}
                
                <button 
                  className="troubleshoot-btn"
                  onClick={() => {
                    setShowTroubleshootDialog(false);
                    handleManageStore(troubleshootStore);
                  }}
                >
                  <Settings size={16} />
                  設定を確認
                  <small>API設定やトークンを手動で確認・修正</small>
                </button>
                
                <button 
                  className="troubleshoot-btn restart"
                  onClick={handleSystemRestart}
                >
                  <Zap size={16} />
                  システム再起動
                  <small>すべてのサービスを再起動（最終手段）</small>
                </button>
              </div>
            </div>
            
            <div className="dialog-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowTroubleshootDialog(false)}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <div className="dialog-header">
              <h3>⚠️ 店舗削除確認</h3>
              <p>本当に削除しますか？この操作は取り消せません。</p>
            </div>
            
            <div className="dialog-content">
              <div className="store-delete-info">
                <h4>削除対象店舗</h4>
                <div className="store-info-card">
                  <div className="store-name">{storeToDelete?.name}</div>
                  <div className="store-details">
                    <span>📍 {storeToDelete?.address}</span>
                    <span>📞 {storeToDelete?.phone}</span>
                  </div>
                </div>
              </div>
              
              <div className="delete-confirmation-input">
                <label>
                  <strong>確認のため、店舗名を正確に入力してください：</strong>
                </label>
                <div className="large-input-container">
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder={storeToDelete?.name}
                    className="confirmation-input-large"
                  />
                </div>
                <small className="input-hint">
                  削除するには「{storeToDelete?.name}」と入力してください
                </small>
              </div>
            </div>
            
            <div className="dialog-actions">
              <button
                className="btn-secondary"
                onClick={handleCancelDelete}
              >
                キャンセル
              </button>
              <button
                className="btn-danger"
                onClick={handleConfirmDelete}
                disabled={deleteConfirmText !== storeToDelete?.name}
              >
                削除実行
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreManagement;