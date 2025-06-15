import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  FileText,
  Calendar,
  Send,
  Edit3,
  Download,
  Eye,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  MessageSquare,
  BarChart3,
  Sparkles,
  ChevronRight,
  Plus,
  Filter,
  Search
} from 'lucide-react';

const ReportManagement = () => {
  const { api } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [generating, setGenerating] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  // ローカル環境判定
  const isLocalEnv = window.location.hostname === 'localhost';

  useEffect(() => {
    fetchStoreReports();
  }, [selectedMonth]);

  const fetchStoreReports = async () => {
    try {
      setLoading(true);
      
      // ローカル環境でのモックデータ
      if (isLocalEnv) {
        console.log('🏠 ローカル環境：モック店舗レポートデータを使用');
        const mockStores = [
          {
            id: 'demo-store-001',
            name: '居酒屋 花まる 渋谷店',
            location: '東京都渋谷区',
            reportStatus: 'sent',
            lastReportDate: new Date(Date.now() - 86400000).toISOString(),
            metrics: {
              totalReservations: 156,
              totalRevenue: 892000,
              averageSpend: 5718,
              newCustomers: 43,
              repeatRate: 0.72,
              totalMessages: 312,
              aiResponseRate: 0.94
            },
            healthScore: 92,
            trend: 'up'
          },
          {
            id: 'demo-store-002',
            name: '海鮮居酒屋 大漁丸',
            location: '東京都新宿区',
            reportStatus: 'generated',
            lastReportDate: new Date(Date.now() - 172800000).toISOString(),
            metrics: {
              totalReservations: 234,
              totalRevenue: 1456000,
              averageSpend: 6222,
              newCustomers: 67,
              repeatRate: 0.68,
              totalMessages: 498,
              aiResponseRate: 0.92
            },
            healthScore: 88,
            trend: 'up'
          },
          {
            id: 'demo-store-003',
            name: '創作和食 風花',
            location: '東京都品川区',
            reportStatus: 'draft',
            lastReportDate: null,
            metrics: {
              totalReservations: 134,
              totalRevenue: 789000,
              averageSpend: 5888,
              newCustomers: 28,
              repeatRate: 0.76,
              totalMessages: 267,
              aiResponseRate: 0.91
            },
            healthScore: 85,
            trend: 'stable'
          },
          {
            id: 'demo-store-004',
            name: '串焼き専門店 炭火屋',
            location: '東京都世田谷区',
            reportStatus: 'none',
            lastReportDate: null,
            metrics: {
              totalReservations: 89,
              totalRevenue: 623000,
              averageSpend: 6989,
              newCustomers: 23,
              repeatRate: 0.74,
              totalMessages: 178,
              aiResponseRate: 0.96
            },
            healthScore: 78,
            trend: 'down'
          },
          {
            id: 'demo-store-005',
            name: '昭和レトロ居酒屋 のんべえ横丁',
            location: '東京都台東区',
            reportStatus: 'sent',
            lastReportDate: new Date(Date.now() - 259200000).toISOString(),
            metrics: {
              totalReservations: 67,
              totalRevenue: 445000,
              averageSpend: 6641,
              newCustomers: 19,
              repeatRate: 0.71,
              totalMessages: 134,
              aiResponseRate: 0.88
            },
            healthScore: 82,
            trend: 'stable'
          }
        ];
        
        setStores(mockStores);
        setLoading(false);
        return;
      }
      
      // 本番API呼び出し
      const response = await api.get(`/reports/stores?month=${selectedMonth}`);
      if (response.data.success) {
        setStores(response.data.stores);
      }
    } catch (error) {
      console.error('店舗レポートデータ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAllReports = async () => {
    try {
      setGenerating(true);
      
      // ローカル環境でのシミュレーション
      if (isLocalEnv) {
        console.log('🤖 全店舗レポート生成シミュレーション');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // すべての店舗のステータスを'generated'に更新
        setStores(prev => prev.map(store => ({
          ...store,
          reportStatus: store.reportStatus === 'none' ? 'generated' : store.reportStatus
        })));
        
        alert('全店舗のレポート生成が完了しました！');
        return;
      }
      
      // 本番API呼び出し
      const response = await api.post('/reports/generate-all', {
        month: selectedMonth
      });
      
      if (response.data.success) {
        alert('レポート生成が完了しました');
        fetchStoreReports();
      }
    } catch (error) {
      console.error('レポート生成エラー:', error);
      alert('レポート生成に失敗しました');
    } finally {
      setGenerating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'sent':
        return { icon: CheckCircle, label: '配信済み', className: 'status-sent', color: '#10b981' };
      case 'generated':
        return { icon: Clock, label: '未配信', className: 'status-generated', color: '#f59e0b' };
      case 'draft':
        return { icon: Edit3, label: '下書き', className: 'status-draft', color: '#6b7280' };
      case 'none':
        return { icon: AlertCircle, label: '未生成', className: 'status-none', color: '#ef4444' };
      default:
        return { icon: AlertCircle, label: '不明', className: 'status-unknown', color: '#6b7280' };
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} className="text-green-500" />;
      case 'down':
        return <TrendingUp size={16} className="text-red-500 rotate-180" />;
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full"></div>;
    }
  };

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || store.reportStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const reportStats = {
    total: stores.length,
    sent: stores.filter(s => s.reportStatus === 'sent').length,
    generated: stores.filter(s => s.reportStatus === 'generated').length,
    draft: stores.filter(s => s.reportStatus === 'draft').length,
    none: stores.filter(s => s.reportStatus === 'none').length
  };

  if (loading) {
    return (
      <div className="report-management-loading">
        <div className="loading-spinner"></div>
        <p>店舗レポートデータを読み込み中...</p>
      </div>
    );
  }

  if (selectedStore) {
    // 詳細画面をインポートして表示
    const ReportManagementDetail = React.lazy(() => import('./ReportManagementDetail'));
    return (
      <React.Suspense fallback={<div>読み込み中...</div>}>
        <ReportManagementDetail 
          storeId={selectedStore} 
          onBack={() => setSelectedStore(null)} 
        />
      </React.Suspense>
    );
  }

  return (
    <div className="report-management">
      <div className="page-header">
        <div className="header-content">
          <h1>📊 レポート管理</h1>
          <p>店舗別の月次レポート生成・配信を管理</p>
        </div>
        <div className="header-actions">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="month-selector"
          >
            {[...Array(6)].map((_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - i);
              const value = date.toISOString().slice(0, 7);
              const label = `${date.getFullYear()}年${(date.getMonth() + 1).toString().padStart(2, '0')}月`;
              return <option key={value} value={value}>{label}</option>;
            })}
          </select>
          
          <button 
            className="btn-primary"
            onClick={handleGenerateAllReports}
            disabled={generating}
          >
            {generating ? (
              <>
                <RefreshCw size={18} className="spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                一括生成
              </>
            )}
          </button>
        </div>
      </div>

      {/* 統計カード（横一列） */}
      <div className="report-stats-bar">
        <div className="stats-summary">
          <span className="stats-title">📊 レポート状況:</span>
          <div className="stats-inline">
            <div className="stat-item total">
              <FileText size={16} />
              <span className="stat-label">総店舗</span>
              <span className="stat-value">{reportStats.total}</span>
            </div>
            <div className="stat-divider">|</div>
            <div className="stat-item sent">
              <CheckCircle size={16} />
              <span className="stat-label">配信済み</span>
              <span className="stat-value">{reportStats.sent}</span>
            </div>
            <div className="stat-divider">|</div>
            <div className="stat-item generated">
              <Clock size={16} />
              <span className="stat-label">未配信</span>
              <span className="stat-value">{reportStats.generated}</span>
            </div>
            <div className="stat-divider">|</div>
            <div className="stat-item none">
              <AlertTriangle size={16} />
              <span className="stat-label">未生成</span>
              <span className="stat-value">{reportStats.none}</span>
            </div>
          </div>
        </div>
        <div className="completion-rate">
          <span className="completion-label">完了率:</span>
          <div className="completion-bar">
            <div 
              className="completion-fill"
              style={{ width: `${(reportStats.sent / reportStats.total * 100)}%` }}
            ></div>
          </div>
          <span className="completion-percentage">
            {Math.round(reportStats.sent / reportStats.total * 100)}%
          </span>
        </div>
      </div>

      {/* フィルター・検索 */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="店舗名・場所で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <Filter size={16} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">すべてのステータス</option>
            <option value="sent">配信済み</option>
            <option value="generated">未配信</option>
            <option value="draft">下書き</option>
            <option value="none">未生成</option>
          </select>
        </div>
      </div>

      {/* 店舗テーブル */}
      <div className="stores-table-container">
        <table className="stores-table">
          <thead>
            <tr>
              <th>店舗名</th>
              <th>ステータス</th>
              <th>最終レポート</th>
              <th>レポート品質</th>
              <th>配信状況</th>
              <th>アクション</th>
            </tr>
          </thead>
          <tbody>
            {filteredStores.map(store => {
              const statusInfo = getStatusBadge(store.reportStatus);
              const StatusIcon = statusInfo.icon;
              
              return (
                <tr 
                  key={store.id} 
                  className="store-row"
                  onClick={() => setSelectedStore(store.id)}
                >
                  <td className="store-name-cell">
                    <div className="store-name-content">
                      <div className="store-name">{store.name}</div>
                      <div className="store-location">{store.location}</div>
                    </div>
                  </td>
                  
                  <td className="status-cell">
                    <span 
                      className={`status-badge compact ${statusInfo.className}`}
                      style={{ color: statusInfo.color }}
                    >
                      <StatusIcon size={14} />
                      {statusInfo.label}
                    </span>
                  </td>
                  
                  <td className="date-cell">
                    {store.lastReportDate ? (
                      <div className="date-value">
                        <Calendar size={12} />
                        <span>{new Date(store.lastReportDate).toLocaleDateString('ja-JP')}</span>
                        <small>{Math.floor((Date.now() - new Date(store.lastReportDate)) / (1000 * 60 * 60 * 24))}日前</small>
                      </div>
                    ) : (
                      <span className="no-data">未生成</span>
                    )}
                  </td>

                  <td className="quality-cell">
                    <div className="quality-indicator">
                      <div className="quality-score">
                        <span className={`quality-value ${store.healthScore >= 90 ? 'excellent' : store.healthScore >= 80 ? 'good' : store.healthScore >= 70 ? 'fair' : 'poor'}`}>
                          {store.healthScore}点
                        </span>
                        <div className="quality-factors">
                          <small>AI品質: {store.metrics.aiResponseRate * 100}%</small>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="delivery-cell">
                    <div className="delivery-status">
                      {store.reportStatus === 'sent' ? (
                        <div className="delivery-success">
                          <CheckCircle size={12} />
                          <span>配信完了</span>
                          <small>LINE送信済み</small>
                        </div>
                      ) : store.reportStatus === 'generated' ? (
                        <div className="delivery-pending">
                          <Clock size={12} />
                          <span>配信待ち</span>
                          <small>レポート生成済み</small>
                        </div>
                      ) : (
                        <div className="delivery-none">
                          <AlertTriangle size={12} />
                          <span>未対応</span>
                          <small>要アクション</small>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="action-cell">
                    <div className="action-buttons">
                      <button 
                        className="action-btn primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStore(store.id);
                        }}
                        title="レポート詳細"
                      >
                        <Eye size={14} />
                        詳細
                      </button>
                      <button 
                        className="action-btn secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          // 再生成機能
                        }}
                        title="レポート再生成"
                      >
                        <RefreshCw size={14} />
                        再生成
                      </button>
                      {store.reportStatus === 'generated' && (
                        <button 
                          className="action-btn success"
                          onClick={(e) => {
                            e.stopPropagation();
                            // LINE送信機能
                          }}
                          title="LINE送信"
                        >
                          <Send size={14} />
                          送信
                        </button>
                      )}
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
          <FileText size={48} />
          <h3>条件に一致する店舗がありません</h3>
          <p>検索条件やフィルターを変更してください</p>
        </div>
      )}
    </div>
  );
};

export default ReportManagement;