import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import StoreWizard from './StoreWizard';
import StoreDetailModal from './StoreDetailModal';
import StoreDetail from './StoreDetail';
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
  Users
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
            operating_hours: {
              mon: { open: '17:00', close: '23:00' },
              tue: { open: '17:00', close: '23:00' },
              wed: { open: '17:00', close: '23:00' },
              thu: { open: '17:00', close: '23:00' },
              fri: { open: '17:00', close: '24:00' },
              sat: { open: '16:00', close: '24:00' },
              sun: { open: '16:00', close: '22:00' }
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
            created_at: '2023-11-20T14:30:00Z'
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
            created_at: '2024-03-01T09:00:00Z'
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
            created_at: '2023-09-10T11:00:00Z'
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
            created_at: '2023-06-15T13:45:00Z'
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

  const handleViewStore = (store) => {
    setSelectedStore(store.id);
    setShowDetailPage(true);
  };

  const handleEditStore = (store) => {
    setSelectedStore(store.id);
    setShowDetailPage(true);
  };

  const handleDeleteStore = async (store) => {
    if (confirm(`本当に「${store.name}」を削除しますか？この操作は取り消せません。`)) {
      try {
        // ローカル環境では削除をシミュレート
        if (window.location.hostname === 'localhost') {
          console.log('🗑️ 店舗削除（ローカルシミュレーション）:', store.id);
          alert('店舗を削除しました（ローカル環境）');
          fetchStores();
          return;
        }
        
        const response = await api.delete(`/stores/${store.id}`);
        if (response.data.success) {
          alert('店舗を削除しました');
          fetchStores();
        }
      } catch (error) {
        console.error('削除エラー:', error);
        alert('削除に失敗しました');
      }
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
    const statusInfo = getStatusInfo(store);
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'active') return matchesSearch && statusInfo.status === 'active';
    if (selectedFilter === 'warning') return matchesSearch && statusInfo.status === 'warning';
    if (selectedFilter === 'inactive') return matchesSearch && statusInfo.status === 'inactive';
    
    return matchesSearch;
  });

  const filterOptions = [
    { value: 'all', label: '全て', count: stores.length },
    { value: 'active', label: '稼働中', count: stores.filter(s => getStatusInfo(s).status === 'active').length },
    { value: 'warning', label: '要注意', count: stores.filter(s => getStatusInfo(s).status === 'warning').length },
    { value: 'inactive', label: '停止中', count: stores.filter(s => getStatusInfo(s).status === 'inactive').length }
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
              <th>ステータス</th>
              <th>今月利用</th>
              <th>残ポイント</th>
              <th>最終ログイン</th>
              <th>予約数</th>
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
                    <span className={`status-badge ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td>
                    <div className="usage-info">
                      <div className="usage-bar">
                        <div 
                          className="usage-fill" 
                          style={{ width: `${usage}%` }}
                        ></div>
                      </div>
                      <span>{usage}%</span>
                    </div>
                  </td>
                  <td>
                    <span className="points">{points.toLocaleString()}pt</span>
                  </td>
                  <td>
                    <div className="date-info">
                      {store.last_login ? new Date(store.last_login).toLocaleDateString('ja-JP') : '未ログイン'}
                    </div>
                  </td>
                  <td>
                    <span className="reservation-count">{store.total_reservations || 0}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn" 
                        title="詳細"
                        onClick={() => handleViewStore(store)}
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="action-btn" 
                        title="編集"
                        onClick={() => handleEditStore(store)}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="action-btn danger" 
                        title="削除"
                        onClick={() => handleDeleteStore(store)}
                      >
                        <Trash2 size={16} />
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
    </div>
  );
};

export default StoreManagement;