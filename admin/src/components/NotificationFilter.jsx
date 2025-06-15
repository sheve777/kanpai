import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Bell,
  Filter,
  Settings,
  Check,
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Volume2,
  VolumeX,
  Mail,
  MessageSquare,
  Smartphone,
  Monitor,
  Star,
  Tag,
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  RotateCcw
} from 'lucide-react';

const NotificationFilter = ({ isWidget = false, onFilterChange }) => {
  const { api } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filters, setFilters] = useState({
    priority: ['high', 'medium', 'low'],
    types: ['system', 'store', 'api', 'backup', 'security'],
    sources: [],
    timeRange: 'all',
    keywords: '',
    readStatus: 'all'
  });
  const [savedFilters, setSavedFilters] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({
    desktop: true,
    email: false,
    sound: true,
    quietHours: { enabled: false, start: '22:00', end: '08:00' },
    priority: { high: true, medium: true, low: false }
  });
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateFilter, setShowCreateFilter] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');

  // ローカル環境判定
  const isLocalEnv = window.location.hostname === 'localhost';

  useEffect(() => {
    fetchNotifications();
    fetchSavedFilters();
    loadNotificationSettings();
  }, []);

  useEffect(() => {
    const filtered = applyFilters(notifications);
    if (onFilterChange) {
      onFilterChange(filtered);
    }
  }, [filters, notifications]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // ローカル環境でのモックデータ
      if (isLocalEnv) {
        const mockNotifications = [
          {
            id: 1,
            title: 'API使用量警告',
            message: 'OpenAI APIの月間使用量が90%に達しました',
            type: 'api',
            priority: 'high',
            source: '居酒屋 花まる',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            read: false,
            actions: ['設定確認', 'プラン変更']
          },
          {
            id: 2,
            title: 'バックアップ完了',
            message: '全店舗データのバックアップが正常に完了しました',
            type: 'backup',
            priority: 'low',
            source: 'システム',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            read: true,
            actions: ['詳細確認']
          },
          {
            id: 3,
            title: '新規予約受付',
            message: '海鮮居酒屋 大漁丸で新しい予約が入りました',
            type: 'store',
            priority: 'medium',
            source: '海鮮居酒屋 大漁丸',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            read: false,
            actions: ['予約確認', 'カレンダー表示']
          },
          {
            id: 4,
            title: 'セキュリティアラート',
            message: '未承認のIPアドレスからのアクセス試行を検知',
            type: 'security',
            priority: 'high',
            source: 'セキュリティシステム',
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            read: false,
            actions: ['ログ確認', 'アクセス制限']
          },
          {
            id: 5,
            title: 'システム更新',
            message: 'kanpAI システムが最新バージョンに更新されました',
            type: 'system',
            priority: 'medium',
            source: 'システム',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            read: true,
            actions: ['更新内容確認']
          },
          {
            id: 6,
            title: 'レポート生成完了',
            message: '創作和食 風花の月次レポートが生成されました',
            type: 'store',
            priority: 'low',
            source: '創作和食 風花',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            read: true,
            actions: ['レポート確認']
          }
        ];
        
        setNotifications(mockNotifications);
        setLoading(false);
        return;
      }
      
      // 本番API呼び出し
      const response = await api.get('/notifications');
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('通知取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedFilters = async () => {
    try {
      // ローカル環境でのモックデータ
      if (isLocalEnv) {
        const mockFilters = [
          {
            id: 1,
            name: '重要な通知のみ',
            filters: {
              priority: ['high'],
              types: ['security', 'api'],
              readStatus: 'unread'
            },
            isDefault: true
          },
          {
            id: 2,
            name: '店舗関連',
            filters: {
              types: ['store'],
              priority: ['high', 'medium'],
              readStatus: 'all'
            },
            isDefault: false
          },
          {
            id: 3,
            name: '今日の通知',
            filters: {
              timeRange: 'today',
              readStatus: 'all'
            },
            isDefault: false
          }
        ];
        
        setSavedFilters(mockFilters);
        return;
      }
      
      // 本番API呼び出し
      const response = await api.get('/notifications/filters');
      if (response.data.success) {
        setSavedFilters(response.data.filters);
      }
    } catch (error) {
      console.error('フィルター取得エラー:', error);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      // ローカル環境でのモックデータ
      if (isLocalEnv) {
        const savedSettings = localStorage.getItem('notificationSettings');
        if (savedSettings) {
          setNotificationSettings(JSON.parse(savedSettings));
        }
        return;
      }
      
      // 本番API呼び出し
      const response = await api.get('/notifications/settings');
      if (response.data.success) {
        setNotificationSettings(response.data.settings);
      }
    } catch (error) {
      console.error('通知設定取得エラー:', error);
    }
  };

  const applyFilters = (notificationList) => {
    return notificationList.filter(notification => {
      // 優先度フィルター
      if (!filters.priority.includes(notification.priority)) return false;
      
      // タイプフィルター
      if (!filters.types.includes(notification.type)) return false;
      
      // ソースフィルター
      if (filters.sources.length > 0 && !filters.sources.includes(notification.source)) return false;
      
      // 既読状態フィルター
      if (filters.readStatus === 'read' && !notification.read) return false;
      if (filters.readStatus === 'unread' && notification.read) return false;
      
      // キーワードフィルター
      if (filters.keywords) {
        const keyword = filters.keywords.toLowerCase();
        if (!notification.title.toLowerCase().includes(keyword) &&
            !notification.message.toLowerCase().includes(keyword)) return false;
      }
      
      // 時間範囲フィルター
      if (filters.timeRange !== 'all') {
        const now = new Date();
        const notificationTime = new Date(notification.timestamp);
        
        switch (filters.timeRange) {
          case 'today':
            if (notificationTime.toDateString() !== now.toDateString()) return false;
            break;
          case 'week':
            if (now - notificationTime > 7 * 24 * 60 * 60 * 1000) return false;
            break;
          case 'month':
            if (now - notificationTime > 30 * 24 * 60 * 60 * 1000) return false;
            break;
        }
      }
      
      return true;
    });
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      if (filterType === 'priority' || filterType === 'types' || filterType === 'sources') {
        const currentValues = prev[filterType];
        const newValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
        return { ...prev, [filterType]: newValues };
      } else {
        return { ...prev, [filterType]: value };
      }
    });
  };

  const handleSaveFilter = async () => {
    if (!newFilterName.trim()) {
      alert('フィルター名を入力してください');
      return;
    }

    try {
      // ローカル環境でのシミュレーション
      if (isLocalEnv) {
        const newFilter = {
          id: Date.now(),
          name: newFilterName,
          filters: { ...filters },
          isDefault: false
        };
        
        setSavedFilters(prev => [newFilter, ...prev]);
        setNewFilterName('');
        setShowCreateFilter(false);
        alert('フィルターを保存しました！');
        return;
      }
      
      // 本番API呼び出し
      const response = await api.post('/notifications/filters', {
        name: newFilterName,
        filters
      });
      
      if (response.data.success) {
        alert('フィルターを保存しました');
        setNewFilterName('');
        setShowCreateFilter(false);
        fetchSavedFilters();
      }
    } catch (error) {
      console.error('フィルター保存エラー:', error);
    }
  };

  const handleLoadFilter = (savedFilter) => {
    setFilters(savedFilter.filters);
  };

  const handleResetFilters = () => {
    setFilters({
      priority: ['high', 'medium', 'low'],
      types: ['system', 'store', 'api', 'backup', 'security'],
      sources: [],
      timeRange: 'all',
      keywords: '',
      readStatus: 'all'
    });
  };

  const handleNotificationAction = async (notificationId, action) => {
    try {
      // ローカル環境でのシミュレーション
      if (isLocalEnv) {
        console.log('通知アクション実行:', { notificationId, action });
        
        // 既読にマーク
        setNotifications(prev => prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        ));
        
        alert(`アクション「${action}」を実行しました`);
        return;
      }
      
      // 本番API呼び出し
      const response = await api.post(`/notifications/${notificationId}/action`, { action });
      if (response.data.success) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('通知アクション実行エラー:', error);
    }
  };

  const handleSettingsChange = async (settingKey, value) => {
    const newSettings = { ...notificationSettings };
    if (settingKey.includes('.')) {
      const [parent, child] = settingKey.split('.');
      newSettings[parent] = { ...newSettings[parent], [child]: value };
    } else {
      newSettings[settingKey] = value;
    }
    
    setNotificationSettings(newSettings);
    
    try {
      // ローカル環境でのシミュレーション
      if (isLocalEnv) {
        localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
        return;
      }
      
      // 本番API呼び出し
      await api.put('/notifications/settings', newSettings);
    } catch (error) {
      console.error('設定保存エラー:', error);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertTriangle size={16} className="text-red-500" />;
      case 'medium': return <Info size={16} className="text-yellow-500" />;
      case 'low': return <CheckCircle size={16} className="text-green-500" />;
      default: return <Bell size={16} />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'system': return <Monitor size={16} />;
      case 'store': return <Star size={16} />;
      case 'api': return <Settings size={16} />;
      case 'backup': return <Settings size={16} />;
      case 'security': return <AlertTriangle size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const filteredNotifications = applyFilters(notifications);

  if (isWidget) {
    // ウィジェット表示（ダッシュボード用）
    return (
      <div className="notification-filter-widget">
        <div className="widget-header">
          <h3>🔔 通知フィルター</h3>
          <button 
            className="btn-sm"
            onClick={() => window.location.href = '/notifications'}
          >
            すべて表示
          </button>
        </div>
        
        <div className="quick-filters">
          <button
            className={`quick-filter-btn ${filters.readStatus === 'unread' ? 'active' : ''}`}
            onClick={() => handleFilterChange('readStatus', filters.readStatus === 'unread' ? 'all' : 'unread')}
          >
            未読のみ
          </button>
          <button
            className={`quick-filter-btn ${filters.priority.length === 1 && filters.priority[0] === 'high' ? 'active' : ''}`}
            onClick={() => handleFilterChange('priority', filters.priority.length === 1 && filters.priority[0] === 'high' ? ['high', 'medium', 'low'] : ['high'])}
          >
            重要のみ
          </button>
        </div>
        
        <div className="filtered-notifications">
          {filteredNotifications.slice(0, 3).map(notification => (
            <div key={notification.id} className={`notification-item-small ${notification.read ? 'read' : 'unread'}`}>
              <div className="notification-icon">
                {getPriorityIcon(notification.priority)}
              </div>
              <div className="notification-content">
                <h5>{notification.title}</h5>
                <p>{notification.message}</p>
                <span className="notification-time">
                  {new Date(notification.timestamp).toLocaleTimeString('ja-JP')}
                </span>
              </div>
            </div>
          ))}
          
          {filteredNotifications.length === 0 && (
            <div className="empty-notifications">
              <Bell size={24} />
              <p>条件に一致する通知がありません</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // フルページ表示
  return (
    <div className="notification-filter">
      <div className="page-header">
        <h1>通知管理</h1>
        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={() => setShowSettings(true)}
          >
            <Settings size={18} />
            通知設定
          </button>
          <button
            className="btn-primary"
            onClick={() => setShowCreateFilter(true)}
          >
            <Plus size={18} />
            フィルター保存
          </button>
        </div>
      </div>

      {/* フィルターコントロール */}
      <div className="filter-controls">
        <div className="filter-section">
          <h3>保存済みフィルター</h3>
          <div className="saved-filters">
            {savedFilters.map(filter => (
              <button
                key={filter.id}
                className={`saved-filter-btn ${filter.isDefault ? 'default' : ''}`}
                onClick={() => handleLoadFilter(filter)}
              >
                <Filter size={14} />
                {filter.name}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h3>優先度</h3>
          <div className="filter-options">
            {['high', 'medium', 'low'].map(priority => (
              <label key={priority} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.priority.includes(priority)}
                  onChange={() => handleFilterChange('priority', priority)}
                />
                <span>{priority === 'high' ? '高' : priority === 'medium' ? '中' : '低'}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h3>種類</h3>
          <div className="filter-options">
            {[
              { id: 'system', label: 'システム' },
              { id: 'store', label: '店舗' },
              { id: 'api', label: 'API' },
              { id: 'backup', label: 'バックアップ' },
              { id: 'security', label: 'セキュリティ' }
            ].map(type => (
              <label key={type.id} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.types.includes(type.id)}
                  onChange={() => handleFilterChange('types', type.id)}
                />
                <span>{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h3>期間</h3>
          <select
            value={filters.timeRange}
            onChange={(e) => handleFilterChange('timeRange', e.target.value)}
            className="filter-select"
          >
            <option value="all">すべて</option>
            <option value="today">今日</option>
            <option value="week">1週間</option>
            <option value="month">1ヶ月</option>
          </select>
        </div>

        <div className="filter-section">
          <h3>既読状態</h3>
          <select
            value={filters.readStatus}
            onChange={(e) => handleFilterChange('readStatus', e.target.value)}
            className="filter-select"
          >
            <option value="all">すべて</option>
            <option value="unread">未読のみ</option>
            <option value="read">既読のみ</option>
          </select>
        </div>

        <div className="filter-section">
          <h3>キーワード検索</h3>
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="通知を検索..."
              value={filters.keywords}
              onChange={(e) => handleFilterChange('keywords', e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-actions">
          <button
            className="btn-secondary"
            onClick={handleResetFilters}
          >
            <RotateCcw size={16} />
            リセット
          </button>
        </div>
      </div>

      {/* 通知一覧 */}
      <div className="notifications-section">
        <h2>通知一覧 ({filteredNotifications.length}件)</h2>
        <div className="notifications-list">
          {filteredNotifications.map(notification => (
            <div key={notification.id} className={`notification-card ${notification.read ? 'read' : 'unread'}`}>
              <div className="notification-header">
                <div className="notification-info">
                  <div className="notification-type">
                    {getTypeIcon(notification.type)}
                    <span>{notification.type}</span>
                  </div>
                  <div className="notification-priority">
                    {getPriorityIcon(notification.priority)}
                  </div>
                  <div className="notification-source">
                    <Tag size={12} />
                    {notification.source}
                  </div>
                </div>
                <div className="notification-time">
                  <Clock size={12} />
                  {new Date(notification.timestamp).toLocaleString('ja-JP')}
                </div>
              </div>
              
              <div className="notification-content">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
              </div>
              
              <div className="notification-actions">
                {notification.actions.map((action, index) => (
                  <button
                    key={index}
                    className="action-btn"
                    onClick={() => handleNotificationAction(notification.id, action)}
                  >
                    {action}
                  </button>
                ))}
                {!notification.read && (
                  <button
                    className="mark-read-btn"
                    onClick={() => handleNotificationAction(notification.id, 'mark_read')}
                  >
                    <Check size={14} />
                    既読にする
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {filteredNotifications.length === 0 && (
            <div className="empty-state">
              <Bell size={48} />
              <h3>条件に一致する通知がありません</h3>
              <p>フィルター条件を変更してください</p>
            </div>
          )}
        </div>
      </div>

      {/* 通知設定モーダル */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>通知設定</h3>
              <button 
                className="modal-close"
                onClick={() => setShowSettings(false)}
              >
                ×
              </button>
            </div>
            
            <div className="notification-settings">
              <div className="settings-section">
                <h4>通知方法</h4>
                <div className="settings-options">
                  <label className="setting-item">
                    <input
                      type="checkbox"
                      checked={notificationSettings.desktop}
                      onChange={(e) => handleSettingsChange('desktop', e.target.checked)}
                    />
                    <Monitor size={16} />
                    <span>デスクトップ通知</span>
                  </label>
                  
                  <label className="setting-item">
                    <input
                      type="checkbox"
                      checked={notificationSettings.email}
                      onChange={(e) => handleSettingsChange('email', e.target.checked)}
                    />
                    <Mail size={16} />
                    <span>メール通知</span>
                  </label>
                  
                  <label className="setting-item">
                    <input
                      type="checkbox"
                      checked={notificationSettings.sound}
                      onChange={(e) => handleSettingsChange('sound', e.target.checked)}
                    />
                    {notificationSettings.sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    <span>通知音</span>
                  </label>
                </div>
              </div>

              <div className="settings-section">
                <h4>優先度別通知</h4>
                <div className="settings-options">
                  <label className="setting-item">
                    <input
                      type="checkbox"
                      checked={notificationSettings.priority.high}
                      onChange={(e) => handleSettingsChange('priority.high', e.target.checked)}
                    />
                    <AlertTriangle size={16} className="text-red-500" />
                    <span>高優先度</span>
                  </label>
                  
                  <label className="setting-item">
                    <input
                      type="checkbox"
                      checked={notificationSettings.priority.medium}
                      onChange={(e) => handleSettingsChange('priority.medium', e.target.checked)}
                    />
                    <Info size={16} className="text-yellow-500" />
                    <span>中優先度</span>
                  </label>
                  
                  <label className="setting-item">
                    <input
                      type="checkbox"
                      checked={notificationSettings.priority.low}
                      onChange={(e) => handleSettingsChange('priority.low', e.target.checked)}
                    />
                    <CheckCircle size={16} className="text-green-500" />
                    <span>低優先度</span>
                  </label>
                </div>
              </div>

              <div className="settings-section">
                <h4>サイレント時間</h4>
                <div className="quiet-hours">
                  <label className="setting-item">
                    <input
                      type="checkbox"
                      checked={notificationSettings.quietHours.enabled}
                      onChange={(e) => handleSettingsChange('quietHours.enabled', e.target.checked)}
                    />
                    <span>サイレント時間を有効にする</span>
                  </label>
                  
                  {notificationSettings.quietHours.enabled && (
                    <div className="time-range">
                      <label>
                        開始時刻:
                        <input
                          type="time"
                          value={notificationSettings.quietHours.start}
                          onChange={(e) => handleSettingsChange('quietHours.start', e.target.value)}
                          className="time-input"
                        />
                      </label>
                      <label>
                        終了時刻:
                        <input
                          type="time"
                          value={notificationSettings.quietHours.end}
                          onChange={(e) => handleSettingsChange('quietHours.end', e.target.value)}
                          className="time-input"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setShowSettings(false)}
              >
                閉じる
              </button>
              <button 
                className="btn-primary"
                onClick={() => setShowSettings(false)}
              >
                <Save size={16} />
                設定を保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* フィルター保存モーダル */}
      {showCreateFilter && (
        <div className="modal-overlay" onClick={() => setShowCreateFilter(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>フィルターを保存</h3>
              <button 
                className="modal-close"
                onClick={() => setShowCreateFilter(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>フィルター名</label>
                <input
                  type="text"
                  value={newFilterName}
                  onChange={(e) => setNewFilterName(e.target.value)}
                  className="form-input"
                  placeholder="マイフィルター"
                  autoFocus
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setShowCreateFilter(false)}
              >
                キャンセル
              </button>
              <button 
                className="btn-primary" 
                onClick={handleSaveFilter}
              >
                <Save size={16} />
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationFilter;