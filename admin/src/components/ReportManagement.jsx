import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ReportManagementDetail from './ReportManagementDetail';
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
  Search,
  MapPin,
  Store
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
  const [showLatestReport, setShowLatestReport] = useState(false);

  // ローカル環境判定
  const isLocalEnv = window.location.hostname === 'localhost';

  // Action handlers for buttons
  const handleSendReport = async (storeId) => {
    // 配信前の確認ダイアログ
    const store = stores.find(s => s.id === storeId);
    const storeName = store?.name || '店舗';
    const currentMonth = new Date(selectedMonth).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });
    
    const confirmMessage = `📤 レポート配信確認\n\n以下のレポートをLINEで配信しますか？\n\n店舗: ${storeName}\n対象月: ${currentMonth}\n\n配信後は顧客に自動送信されます。\n本当に配信しますか？`;
    
    if (!window.confirm(confirmMessage)) {
      console.log('❌ レポート配信をキャンセルしました');
      return;
    }
    
    if (isLocalEnv) {
      console.log('📤 レポート配信シミュレーション:', storeId);
      alert('レポートを配信しました（ローカル環境）');
      // Update status to sent
      setStores(prev => prev.map(store => 
        store.id === storeId ? { ...store, reportStatus: 'sent', lastReportDate: new Date().toISOString() } : store
      ));
      return;
    }
    
    try {
      const response = await api.post(`/reports/send/${storeId}`, { month: selectedMonth });
      if (response.data.success) {
        alert('レポートを配信しました');
        fetchStoreReports();
      }
    } catch (error) {
      console.error('レポート配信エラー:', error);
      alert('配信に失敗しました');
    }
  };

  const handleDownloadReport = async (storeId) => {
    if (isLocalEnv) {
      console.log('📥 レポートダウンロードシミュレーション:', storeId);
      alert('レポートをダウンロードしました（ローカル環境）');
      return;
    }
    
    try {
      const response = await api.get(`/reports/download/${storeId}?month=${selectedMonth}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${storeId}_${selectedMonth}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('レポートダウンロードエラー:', error);
      alert('ダウンロードに失敗しました');
    }
  };

  const handleEditReport = (storeId) => {
    console.log('✏️ レポート編集:', storeId);
    // Navigate to report editor
    setSelectedStore(storeId);
  };

  const handleGenerateReport = async (storeId) => {
    if (isLocalEnv) {
      console.log('🤖 個別レポート生成シミュレーション:', storeId);
      alert('AIでレポートを生成しました（ローカル環境）');
      // Update status to generated
      setStores(prev => prev.map(store => 
        store.id === storeId ? { ...store, reportStatus: 'generated' } : store
      ));
      return;
    }
    
    try {
      const response = await api.post(`/reports/generate/${storeId}`, { month: selectedMonth });
      if (response.data.success) {
        alert('レポートを生成しました');
        fetchStoreReports();
      }
    } catch (error) {
      console.error('レポート生成エラー:', error);
      alert('生成に失敗しました');
    }
  };

  const handleCreateManualReport = (storeId) => {
    console.log('📝 手動レポート作成:', storeId);
    // Navigate to manual report creator
    setSelectedStore(storeId);
  };

  const handleRegenerateReport = async (storeId) => {
    if (isLocalEnv) {
      console.log('🔄 レポート再生成シミュレーション:', storeId);
      alert('レポートを再生成しました（ローカル環境）');
      return;
    }
    
    try {
      const response = await api.post(`/reports/regenerate/${storeId}`, { month: selectedMonth });
      if (response.data.success) {
        alert('レポートを再生成しました');
        fetchStoreReports();
      }
    } catch (error) {
      console.error('レポート再生成エラー:', error);
      alert('再生成に失敗しました');
    }
  };

  const handleViewLatestReport = (storeId) => {
    console.log('📄 最新レポート表示:', storeId);
    // 最新レポートフラグを設定して詳細画面を開く
    setShowLatestReport(true);
    setSelectedStore(storeId);
  };

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
        return { icon: CheckCircle, label: '配信済み', className: 'status-sent', color: 'var(--success-500)' };
      case 'generated':
        return { icon: Clock, label: '未配信', className: 'status-generated', color: 'var(--warning-500)' };
      case 'draft':
        return { icon: Edit3, label: '下書き', className: 'status-draft', color: 'var(--text-secondary)' };
      case 'none':
        return { icon: AlertCircle, label: '未生成', className: 'status-none', color: 'var(--error-500)' };
      default:
        return { icon: AlertCircle, label: '不明', className: 'status-unknown', color: 'var(--text-secondary)' };
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

  const getReportStatusCount = (status) => {
    return stores.filter(s => s.reportStatus === status).length;
  };

  const filterOptions = [
    { value: 'all', label: '全て', count: stores.length },
    { value: 'sent', label: '配信済み', count: getReportStatusCount('sent') },
    { value: 'generated', label: '未配信', count: getReportStatusCount('generated') },
    { value: 'draft', label: '下書き', count: getReportStatusCount('draft') },
    { value: 'none', label: '未生成', count: getReportStatusCount('none') }
  ];

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
    // 詳細画面を表示
    return (
      <ReportManagementDetail 
        storeId={selectedStore} 
        showLatestReport={showLatestReport}
        onBack={() => {
          setSelectedStore(null);
          setShowLatestReport(false);
        }} 
      />
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
        <div className="stats-container">
          <div className="stats-title-section">
            <span className="stats-title">
              📊 レポート状況
            </span>
          </div>
          
          <div className="stats-items">
            <div className="stat-item total">
              <FileText size={18} style={{ color: 'var(--text-secondary)' }} />
              <div className="stat-content">
                <span className="stat-value">
                  {reportStats.total}
                </span>
                <span className="stat-label">
                  総店舗
                </span>
              </div>
            </div>
            
            <div className="stat-divider"></div>
            
            <div className="stat-item sent">
              <CheckCircle size={18} style={{ color: 'var(--success-500)' }} />
              <div className="stat-content">
                <span className="stat-value" style={{ color: 'var(--success-500)' }}>
                  {reportStats.sent}
                </span>
                <span className="stat-label">
                  配信済み
                </span>
              </div>
            </div>
            
            <div className="stat-divider"></div>
            
            <div className="stat-item generated">
              <Clock size={18} style={{ color: 'var(--warning-500)' }} />
              <div className="stat-content">
                <span className="stat-value" style={{ color: 'var(--warning-500)' }}>
                  {reportStats.generated}
                </span>
                <span className="stat-label">
                  未配信
                </span>
              </div>
            </div>
            
            <div className="stat-divider"></div>
            
            <div className="stat-item none">
              <AlertTriangle size={18} style={{ color: 'var(--error-500)' }} />
              <div className="stat-content">
                <span className="stat-value" style={{ color: 'var(--error-500)' }}>
                  {reportStats.none}
                </span>
                <span className="stat-label">
                  未生成
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="completion-section">
          <div className="completion-info">
            <span className="completion-label">
              完了率
            </span>
            <span 
              className="completion-percentage"
              style={{ 
                color: reportStats.sent / reportStats.total > 0.8 ? 'var(--success-500)' : 
                       reportStats.sent / reportStats.total > 0.5 ? 'var(--warning-500)' : 'var(--error-500)'
              }}
            >
              {Math.round(reportStats.sent / reportStats.total * 100)}%
            </span>
          </div>
          <div className="completion-bar">
            <div 
              className="completion-fill"
              style={{ 
                backgroundColor: reportStats.sent / reportStats.total > 0.8 ? 'var(--success-500)' : 
                                reportStats.sent / reportStats.total > 0.5 ? 'var(--warning-500)' : 'var(--error-500)',
                width: `${(reportStats.sent / reportStats.total * 100)}%`
              }}
            ></div>
          </div>
        </div>
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
              className={`filter-btn ${statusFilter === option.value ? 'active' : ''}`}
              onClick={() => setStatusFilter(option.value)}
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
              <th>レポート状況</th>
              <th>データ期間</th>
              <th>最終配信</th>
              <th>アクション</th>
            </tr>
          </thead>
          <tbody>
            {filteredStores.map(store => {
              const statusInfo = getStatusBadge(store.reportStatus);
              const StatusIcon = statusInfo.icon;
              
              // データ期間の計算
              const getDataPeriod = () => {
                const currentDate = new Date(selectedMonth);
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1;
                const startDate = new Date(year, currentDate.getMonth(), 1);
                const endDate = new Date(year, currentDate.getMonth() + 1, 0);
                
                return {
                  period: `${year}年${month.toString().padStart(2, '0')}月`,
                  range: `${month}/1 - ${month}/${endDate.getDate()}`,
                  completeness: Math.floor(Math.random() * 21) + 80, // 80-100%のランダム
                  dataPoints: Math.floor(Math.random() * 500) + 100 // 100-600のデータポイント
                };
              };

              const dataPeriod = getDataPeriod();

              return (
                <tr key={store.id}>
                  <td>
                    <div className="store-info">
                      <Store size={16} />
                      <div className="store-content">
                        <div className="store-name">{store.name}</div>
                        <div className="store-details">
                          <MapPin size={12} />
                          {store.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="plan-badge">スタンダード</span>
                  </td>
                  <td>
                    <div className="system-status">
                      <span 
                        className={`status-indicator ${
                          store.reportStatus === 'sent' ? 'healthy' :
                          store.reportStatus === 'generated' ? 'warning' :
                          store.reportStatus === 'draft' ? 'warning' :
                          store.reportStatus === 'none' ? 'error' : 'unknown'
                        }`}
                        title={
                          store.reportStatus === 'sent' ? 'レポートは正常に配信されています' :
                          store.reportStatus === 'generated' ? 'レポートが生成済みです。配信をお待ちしています。' :
                          store.reportStatus === 'draft' ? 'レポートが下書き状態です' :
                          store.reportStatus === 'none' ? 'レポートがまだ生成されていません' :
                          'レポート状態を取得できません'
                        }
                      >
                        {store.reportStatus === 'sent' ? '🟢 配信済み' :
                         store.reportStatus === 'generated' ? '🟡 未配信' :
                         store.reportStatus === 'draft' ? '🟡 下書き' :
                         store.reportStatus === 'none' ? '🔴 未生成' : '❓ 不明'}
                      </span>
                      <div className="status-details">
                        <small>
                          {store.reportStatus === 'sent' ? '配信完了' :
                           store.reportStatus === 'generated' ? '配信待ち' :
                           store.reportStatus === 'draft' ? '編集中' :
                           store.reportStatus === 'none' ? '未作成' : '不明'}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="activity-info">
                      <div className="last-login">
                        {dataPeriod.period}
                      </div>
                      <div className="activity-summary">
                        <small>
                          {store.reportStatus !== 'none' ? 
                            `${dataPeriod.range} | データ完整性: ${dataPeriod.completeness}%` : 
                            'データ期間未設定'
                          }
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="activity-info">
                      <div className="last-login">
                        {store.lastReportDate ? new Date(store.lastReportDate).toLocaleDateString('ja-JP') : '未配信'}
                      </div>
                      <div className="activity-summary">
                        <small>
                          {store.lastReportDate ? 
                            `${Math.floor((Date.now() - new Date(store.lastReportDate)) / (1000 * 60 * 60 * 24))}日前 | 今月: レポート${store.reportStatus === 'sent' ? '1' : '0'}回配信` : 
                            'レポート未配信'
                          }
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn primary" 
                        title="レポート管理（詳細・編集）"
                        onClick={() => setSelectedStore(store.id)}
                      >
                        <Eye size={14} />
                        管理
                      </button>
                      
                      {/* 最新レポート確認ボタン（レポートが存在する場合のみ） */}
                      {store.reportStatus !== 'none' && (
                        <button 
                          className="action-btn secondary"
                          onClick={() => handleViewLatestReport(store.id)}
                          title="最新レポートを確認"
                        >
                          <FileText size={14} />
                          最新
                        </button>
                      )}
                      
                      {store.reportStatus === 'sent' ? (
                        <button 
                          className="action-btn secondary"
                          onClick={() => handleDownloadReport(store.id)}
                          title="PDFダウンロード"
                        >
                          <Download size={14} />
                          DL
                        </button>
                      ) : store.reportStatus === 'generated' ? (
                        <button 
                          className="action-btn send"
                          onClick={() => handleSendReport(store.id)}
                          title="レポートを配信"
                        >
                          <Send size={14} />
                          配信
                        </button>
                      ) : (
                        <button 
                          className="action-btn warning"
                          onClick={() => handleGenerateReport(store.id)}
                          title="AIでレポート生成"
                        >
                          <Sparkles size={14} />
                          生成
                        </button>
                      )}
                      
                      {store.reportStatus !== 'none' && (
                        <button 
                          className="action-btn danger"
                          onClick={() => handleRegenerateReport(store.id)}
                          title="再生成"
                        >
                          <RefreshCw size={14} />
                          再生成
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