import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Store,
  Users,
  Calendar,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  RefreshCw,
  Clock,
  Star,
  Heart,
  Activity,
  Zap,
  Target,
  BookOpen,
  Database,
  Wifi,
  WifiOff,
  HardDrive
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [hourlyData, setHourlyData] = useState([]);
  const [storeHealth, setStoreHealth] = useState([]);
  const [todoList, setTodoList] = useState([]);
  const [favoriteStores, setFavoriteStores] = useState([]);
  const [currentLayout, setCurrentLayout] = useState(null);

  // ローカル環境判定
  const isLocalEnv = window.location.hostname === 'localhost';

  useEffect(() => {
    fetchDashboardStats();
    
    // リアルタイム更新（30秒間隔）
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchDashboardStats();
        setLastUpdated(new Date());
      }, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // ローカル環境でのモックデータ
      if (isLocalEnv) {
        console.log('🏠 ローカル環境：モック統計データを使用');
        const mockStats = {
          stores: { total: 12, active: 10 },
          reservations: { today: 45 },
          reports: { today: 3 }
        };
        
        // 時間帯別利用状況データ
        const mockHourlyData = generateHourlyData();
        
        // 店舗別健康状態データ
        const mockStoreHealth = generateStoreHealthData();
        
        // 今日やるべきことリスト
        const mockTodoList = generateTodoList();
        
        // お気に入り店舗
        const mockFavoriteStores = generateFavoriteStores();
        
        setStats(mockStats);
        setHourlyData(mockHourlyData);
        setStoreHealth(mockStoreHealth);
        setTodoList(mockTodoList);
        setFavoriteStores(mockFavoriteStores);
        setLoading(false);
        return;
      }
      
      // 本番API呼び出し
      const response = await api.get('/dashboard/stats');
      
      if (response.data.success) {
        setStats(response.data.stats);
      } else {
        setError('統計データの取得に失敗しました');
      }
    } catch (err) {
      console.error('ダッシュボード統計取得エラー:', err);
      setError('サーバーエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // モックデータ生成関数
  const generateHourlyData = () => {
    const data = [];
    const currentHour = new Date().getHours();
    for (let i = 0; i < 24; i++) {
      const hour = i < currentHour ? i : null;
      if (hour !== null) {
        data.push({
          hour: `${hour}:00`,
          chats: Math.floor(Math.random() * 50) + 10,
          reservations: Math.floor(Math.random() * 15) + 2,
          api_calls: Math.floor(Math.random() * 100) + 20
        });
      }
    }
    return data;
  };

  const generateStoreHealthData = () => {
    const stores = [
      '居酒屋 花まる 渋谷店', '海鮮居酒屋 大漁丸', '創作和食 風花', 
      '串焼き専門店 炭火屋', '昭和レトロ居酒屋 のんべえ横丁'
    ];
    
    return stores.map((name, index) => ({
      id: index + 1,
      name,
      status: Math.random() > 0.8 ? 'warning' : 'healthy',
      apiCalls: Math.floor(Math.random() * 1000) + 500,
      errorRate: Math.random() * 5,
      lastActive: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      isFavorite: Math.random() > 0.6
    }));
  };

  const generateTodoList = () => {
    const todos = [
      { id: 1, task: '月次レポート生成（居酒屋 花まる）', priority: 'high', dueTime: '14:00' },
      { id: 2, task: 'APIキー更新確認', priority: 'medium', dueTime: '16:30' },
      { id: 3, task: '週次バックアップ実行', priority: 'low', dueTime: '18:00' },
      { id: 4, task: '新店舗設定完了確認', priority: 'high', dueTime: '明日 10:00' }
    ];
    
    return todos.filter(() => Math.random() > 0.3);
  };

  const generateFavoriteStores = () => {
    return [
      { id: 1, name: '居酒屋 花まる 渋谷店', status: 'healthy', lastReport: '2時間前' },
      { id: 3, name: '創作和食 風花', status: 'warning', lastReport: '1日前' }
    ];
  };

  const toggleFavoriteStore = (storeId) => {
    setStoreHealth(prev => prev.map(store => 
      store.id === storeId 
        ? { ...store, isFavorite: !store.isFavorite }
        : store
    ));
  };

  const getColorByType = (type) => {
    switch (type) {
      case 'blue': return '#3b82f6';
      case 'green': return '#10b981';
      case 'orange': return '#f59e0b';
      case 'purple': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  const statCards = [
    {
      id: 'total_stores',
      title: '総店舗数',
      value: stats?.stores?.total || 0,
      icon: Store,
      color: 'blue',
      trend: '+2 前月比',
      trendType: 'up'
    },
    {
      id: 'active_stores',
      title: 'アクティブ店舗',
      value: stats?.stores?.active || 0,
      icon: CheckCircle,
      color: 'green',
      trend: `${stats?.stores?.total ? Math.round((stats.stores.active / stats.stores.total) * 100) : 0}%`,
      trendType: 'neutral'
    },
    {
      id: 'today_reservations',
      title: '本日の予約',
      value: stats?.reservations?.today || 0,
      icon: Calendar,
      color: 'orange',
      trend: '+15%',
      trendType: 'up'
    },
    {
      id: 'today_reports',
      title: '本日のレポート',
      value: stats?.reports?.today || 0,
      icon: FileText,
      color: 'purple',
      trend: '-5%',
      trendType: 'down'
    }
  ];

  const alerts = [
    {
      id: 1,
      type: 'warning',
      icon: AlertTriangle,
      title: 'API使用量注意',
      message: 'OpenAI APIの月間使用量が80%に達しました',
      time: '2時間前'
    },
    {
      id: 2,
      type: 'info',
      icon: CheckCircle,
      title: 'バックアップ完了',
      message: '自動バックアップが正常に完了しました',
      time: '6時間前'
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>ダッシュボードを読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <AlertTriangle size={48} />
        <h3>エラーが発生しました</h3>
        <p>{error}</p>
        <button onClick={fetchDashboardStats} className="retry-btn">
          再試行
        </button>
      </div>
    );
  }

  const handleLayoutChange = (newLayout) => {
    setCurrentLayout(newLayout);
    // ここで実際のレイアウト変更処理を実装
    console.log('レイアウト変更:', newLayout);
  };

  const renderDashboardContent = () => {
    // デフォルトレイアウト
    return (
      <>
        {/* 統計サマリー（横一列） */}
        <div className="dashboard-summary-bar">
          <div className="summary-container">
            <div className="summary-title">📊 本日のサマリー</div>
            <div className="summary-stats">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.id} className="summary-stat-item">
                    <Icon size={18} style={{ color: getColorByType(card.color) }} />
                    <div className="stat-content">
                      <span className="stat-value">{card.value.toLocaleString()}</span>
                      <span className="stat-label">{card.title}</span>
                    </div>
                    <div className={`stat-trend ${card.trendType}`}>
                      {card.trendType === 'up' && <TrendingUp size={12} />}
                      {card.trendType === 'down' && <TrendingDown size={12} />}
                      <span>{card.trend}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="summary-actions">
              <span className="update-time">
                <Clock size={14} />
                {lastUpdated.toLocaleTimeString('ja-JP')}
              </span>
            </div>
          </div>
        </div>

        {/* お気に入り店舗テーブル */}
        <div className="favorite-stores-section">
          <h2>⭐ お気に入り店舗</h2>
          <div className="table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>店舗名</th>
                  <th>ステータス</th>
                  <th>最終レポート</th>
                  <th>アクション</th>
                </tr>
              </thead>
              <tbody>
                {favoriteStores.map(store => (
                  <tr key={store.id}>
                    <td>
                      <div className="store-name-cell">
                        <Store size={16} />
                        <span>{store.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${store.status}`}>
                        {store.status === 'healthy' ? <Wifi size={12} /> : <WifiOff size={12} />}
                        {store.status === 'healthy' ? '正常' : '注意'}
                      </span>
                    </td>
                    <td>
                      <span className="time-cell">{store.lastReport}</span>
                    </td>
                    <td>
                      <button 
                        className="btn-sm primary"
                        onClick={() => navigate('/stores')}
                      >
                        管理
                      </button>
                    </td>
                  </tr>
                ))}
                {favoriteStores.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty-state-cell">
                      <div className="empty-favorites">
                        <Star size={32} />
                        <p>お気に入り店舗がありません</p>
                        <button onClick={() => window.location.href = '/stores'}>
                          店舗をお気に入りに追加
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 今日やるべきことテーブル */}
        <div className="todo-section">
          <h2>📋 今日やるべきこと</h2>
          <div className="table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>タスク</th>
                  <th>優先度</th>
                  <th>期限</th>
                  <th>アクション</th>
                </tr>
              </thead>
              <tbody>
                {todoList.map(todo => (
                  <tr key={todo.id} className={`todo-row priority-${todo.priority}`}>
                    <td>
                      <div className="task-cell">
                        <span className="todo-task">{todo.task}</span>
                      </div>
                    </td>
                    <td>
                      <div className={`priority-badge ${todo.priority}`}>
                        {todo.priority === 'high' && <Zap size={12} />}
                        {todo.priority === 'medium' && <Target size={12} />}
                        {todo.priority === 'low' && <BookOpen size={12} />}
                        <span>{todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="time-cell">
                        <Clock size={12} />
                        <span>{todo.dueTime}</span>
                      </div>
                    </td>
                    <td>
                      <button className="btn-sm secondary">
                        完了
                      </button>
                    </td>
                  </tr>
                ))}
                {todoList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty-state-cell">
                      <div className="empty-todos">
                        <CheckCircle size={32} />
                        <p>今日のタスクはすべて完了しています！</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 時間帯別利用状況グラフ */}
        <div className="hourly-chart-section">
          <h2>📊 時間帯別利用状況</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="chats" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="チャット数"
                />
                <Line 
                  type="monotone" 
                  dataKey="reservations" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="予約数"
                />
                <Line 
                  type="monotone" 
                  dataKey="api_calls" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="API呼び出し"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 店舗別健康状態テーブル */}
        <div className="store-health-section">
          <h2>🏥 店舗別健康状態</h2>
          <div className="table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>店舗名</th>
                  <th>ステータス</th>
                  <th>API呼び出し</th>
                  <th>エラー率</th>
                  <th>最終活動</th>
                  <th>お気に入り</th>
                  <th>アクション</th>
                </tr>
              </thead>
              <tbody>
                {storeHealth.map(store => (
                  <tr key={store.id} className={`store-health-row ${store.status}`}>
                    <td>
                      <div className="store-name-cell">
                        <Store size={16} />
                        <span>{store.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${store.status}`}>
                        {store.status === 'healthy' ? <Activity size={16} /> : <AlertTriangle size={16} />}
                        {store.status === 'healthy' ? '正常' : '注意'}
                      </span>
                    </td>
                    <td>
                      <span className="metric-value">{store.apiCalls.toLocaleString()}</span>
                    </td>
                    <td>
                      <span className={`error-rate ${store.errorRate > 2 ? 'high' : 'normal'}`}>
                        {store.errorRate.toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      <div className="time-cell">
                        <Clock size={12} />
                        <span>{new Date(store.lastActive).toLocaleTimeString('ja-JP')}</span>
                      </div>
                    </td>
                    <td>
                      <button
                        className={`favorite-btn ${store.isFavorite ? 'active' : ''}`}
                        onClick={() => toggleFavoriteStore(store.id)}
                      >
                        <Heart size={16} fill={store.isFavorite ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-sm primary" onClick={() => window.location.href = '/stores'}>
                          詳細
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* システム通知テーブル */}
        <div className="alerts-section">
          <h2>📋 システム通知</h2>
          <div className="table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>タイプ</th>
                  <th>タイトル</th>
                  <th>メッセージ</th>
                  <th>時刻</th>
                  <th>アクション</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => {
                  const Icon = alert.icon;
                  return (
                    <tr key={alert.id} className={`alert-row ${alert.type}`}>
                      <td>
                        <div className={`alert-type-cell ${alert.type}`}>
                          <Icon size={16} />
                          <span>{alert.type === 'warning' ? '警告' : '情報'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="alert-title">{alert.title}</span>
                      </td>
                      <td>
                        <span className="alert-message">{alert.message}</span>
                      </td>
                      <td>
                        <div className="time-cell">
                          <Clock size={12} />
                          <span>{alert.time}</span>
                        </div>
                      </td>
                      <td>
                        <button className="btn-sm secondary">対応</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* クイックアクション */}
        <div className="quick-actions-section">
          <h2>🚀 クイックアクション</h2>
          <div className="action-grid">
            <button className="action-card primary" onClick={() => window.location.href = '/stores'}>
              <Store size={24} />
              <span>新店舗追加</span>
            </button>
            <button className="action-card secondary" onClick={() => navigate('/reports')}>
              <FileText size={24} />
              <span>レポート一括生成</span>
            </button>
            <button className="action-card secondary" onClick={() => navigate('/backup')}>
              <HardDrive size={24} />
              <span>バックアップ作成</span>
            </button>
            <button className="action-card secondary" onClick={() => navigate('/revenue')}>
              <TrendingUp size={24} />
              <span>収益分析表示</span>
            </button>
          </div>
        </div>
      </>
    );
  };

  // const renderSection = (section) => {
  //   return (
  //     <div key={section.id} className={`dashboard-section ${section.size}`}>
  //       <h2>{section.title}</h2>
  //       <div>セクション内容: {section.type}</div>
  //     </div>
  //   );
  // };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>本日のサービス状況</h1>
          <p>全店舗の運営状況を一元管理</p>
        </div>
        <div className="header-controls">
          <div className="last-updated">
            <Clock size={16} />
            最終更新: {lastUpdated.toLocaleTimeString('ja-JP')}
          </div>
          <button
            className={`auto-refresh-btn ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw size={16} className={autoRefresh ? 'spin' : ''} />
            自動更新: {autoRefresh ? 'ON' : 'OFF'}
          </button>
          <button
            className="manual-refresh-btn"
            onClick={fetchDashboardStats}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            更新
          </button>
        </div>
      </div>

      {renderDashboardContent()}
    </div>
  );
};

export default Dashboard;