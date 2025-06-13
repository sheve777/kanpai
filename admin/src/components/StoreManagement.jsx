import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import StoreWizard from './StoreWizard';
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

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
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
                      <button className="action-btn" title="詳細">
                        <Eye size={16} />
                      </button>
                      <button className="action-btn" title="編集">
                        <Edit size={16} />
                      </button>
                      <button className="action-btn danger" title="削除">
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
    </div>
  );
};

export default StoreManagement;