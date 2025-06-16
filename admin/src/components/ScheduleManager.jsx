import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Bell,
  CheckCircle,
  AlertTriangle,
  Settings,
  FileText,
  Database,
  RefreshCw,
  Users,
  Filter,
  Search,
  Save,
  Copy
} from 'lucide-react';

const ScheduleManager = () => {
  const { api } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [executionHistory, setExecutionHistory] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    description: '',
    type: 'report_generation',
    frequency: 'daily',
    time: '09:00',
    enabled: true,
    stores: [],
    config: {}
  });

  // ローカル環境判定
  const isLocalEnv = window.location.hostname === 'localhost';

  useEffect(() => {
    fetchSchedules();
    fetchExecutionHistory();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      
      // ローカル環境でのモックデータ
      if (isLocalEnv) {
        const mockSchedules = [
          {
            id: 1,
            name: '月次レポート自動生成',
            description: '全店舗の月次レポートを自動生成',
            type: 'report_generation',
            frequency: 'monthly',
            time: '09:00',
            dayOfMonth: 1,
            enabled: true,
            stores: [1, 2, 3, 4, 5],
            config: {
              reportType: '月次',
              includeCharts: true,
              autoSend: true
            },
            lastRun: new Date(Date.now() - 86400000 * 30).toISOString(),
            nextRun: new Date(Date.now() + 86400000).toISOString(),
            status: 'active',
            executionCount: 12
          },
          {
            id: 2,
            name: 'データバックアップ',
            description: '全店舗データの定期バックアップ',
            type: 'backup',
            frequency: 'weekly',
            time: '02:00',
            dayOfWeek: 'sunday',
            enabled: true,
            stores: [1, 2, 3, 4, 5],
            config: {
              includeSettings: true,
              includeReports: true,
              compression: true
            },
            lastRun: new Date(Date.now() - 86400000 * 7).toISOString(),
            nextRun: new Date(Date.now() + 86400000 * 7).toISOString(),
            status: 'active',
            executionCount: 52
          },
          {
            id: 3,
            name: 'API使用量チェック',
            description: 'API使用量の監視と通知',
            type: 'monitoring',
            frequency: 'daily',
            time: '18:00',
            enabled: true,
            stores: [1, 2, 3, 4, 5],
            config: {
              threshold: 80,
              notifyEmail: true,
              includeRecommendations: true
            },
            lastRun: new Date(Date.now() - 3600000).toISOString(),
            nextRun: new Date(Date.now() + 86400000 - 3600000).toISOString(),
            status: 'active',
            executionCount: 365
          },
          {
            id: 4,
            name: 'カレンダー同期',
            description: 'Google Calendarとの同期処理',
            type: 'sync',
            frequency: 'hourly',
            enabled: false,
            stores: [1, 3],
            config: {
              syncDirection: 'bidirectional',
              conflictResolution: 'manual'
            },
            lastRun: new Date(Date.now() - 86400000 * 3).toISOString(),
            nextRun: null,
            status: 'disabled',
            executionCount: 2160
          },
          {
            id: 5,
            name: '設定情報更新',
            description: '店舗設定の一括更新',
            type: 'settings_update',
            frequency: 'manual',
            enabled: true,
            stores: [2, 4],
            config: {
              autoReport: true,
              lineEnabled: true
            },
            lastRun: new Date(Date.now() - 86400000 * 14).toISOString(),
            nextRun: null,
            status: 'manual',
            executionCount: 3
          }
        ];
        
        setSchedules(mockSchedules);
        setLoading(false);
        return;
      }
      
      // 本番API呼び出し
      const response = await api.get('/schedules');
      if (response.data.success) {
        setSchedules(response.data.schedules);
      }
    } catch (error) {
      console.error('スケジュール取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExecutionHistory = async () => {
    try {
      // ローカル環境でのモックデータ
      if (isLocalEnv) {
        const mockHistory = [
          {
            id: 1,
            scheduleId: 3,
            scheduleName: 'API使用量チェック',
            startTime: new Date(Date.now() - 3600000).toISOString(),
            endTime: new Date(Date.now() - 3500000).toISOString(),
            status: 'completed',
            result: {
              processed: 5,
              warnings: 1,
              alerts: 0
            }
          },
          {
            id: 2,
            scheduleId: 2,
            scheduleName: 'データバックアップ',
            startTime: new Date(Date.now() - 86400000 * 7).toISOString(),
            endTime: new Date(Date.now() - 86400000 * 7 + 600000).toISOString(),
            status: 'completed',
            result: {
              processed: 5,
              backupSize: '45.7MB',
              errors: 0
            }
          },
          {
            id: 3,
            scheduleId: 1,
            scheduleName: '月次レポート自動生成',
            startTime: new Date(Date.now() - 86400000 * 30).toISOString(),
            endTime: new Date(Date.now() - 86400000 * 30 + 900000).toISOString(),
            status: 'completed_with_errors',
            result: {
              processed: 5,
              generated: 4,
              errors: 1
            }
          }
        ];
        
        setExecutionHistory(mockHistory);
        return;
      }
      
      // 本番API呼び出し
      const response = await api.get('/schedules/history');
      if (response.data.success) {
        setExecutionHistory(response.data.history);
      }
    } catch (error) {
      console.error('実行履歴取得エラー:', error);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    try {
      // ローカル環境でのシミュレーション
      if (isLocalEnv) {
        const schedule = {
          id: Date.now(),
          ...newSchedule,
          lastRun: null,
          nextRun: calculateNextRun(newSchedule),
          status: newSchedule.enabled ? 'active' : 'disabled',
          executionCount: 0
        };
        
        setSchedules(prev => [schedule, ...prev]);
        setNewSchedule({
          name: '',
          description: '',
          type: 'report_generation',
          frequency: 'daily',
          time: '09:00',
          enabled: true,
          stores: [],
          config: {}
        });
        setShowCreateForm(false);
        return;
      }

      // 本番API呼び出し
      const response = await api.post('/schedules', newSchedule);
      if (response.data.success) {
        setSchedules(prev => [response.data.schedule, ...prev]);
        setNewSchedule({
          name: '',
          description: '',
          type: 'report_generation',
          frequency: 'daily',
          time: '09:00',
          enabled: true,
          stores: [],
          config: {}
        });
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('スケジュール作成エラー:', error);
    }
  };

  const handleToggleSchedule = async (id) => {
    try {
      // ローカル環境でのシミュレーション
      if (isLocalEnv) {
        setSchedules(prev => prev.map(schedule => 
          schedule.id === id 
            ? { 
                ...schedule, 
                enabled: !schedule.enabled,
                status: !schedule.enabled ? 'active' : 'disabled',
                nextRun: !schedule.enabled ? calculateNextRun(schedule) : null
              }
            : schedule
        ));
        return;
      }

      // 本番API呼び出し
      const response = await api.patch(`/schedules/${id}/toggle`);
      if (response.data.success) {
        fetchSchedules();
      }
    } catch (error) {
      console.error('スケジュール切り替えエラー:', error);
    }
  };

  const handleExecuteNow = async (schedule) => {
    if (!confirm(`「${schedule.name}」を今すぐ実行しますか？`)) return;
    
    try {
      // ローカル環境でのシミュレーション
      if (isLocalEnv) {
        console.log('スケジュール手動実行:', schedule);
        
        // 実行履歴に追加
        const execution = {
          id: Date.now(),
          scheduleId: schedule.id,
          scheduleName: schedule.name,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 30000).toISOString(),
          status: 'completed',
          result: {
            processed: schedule.stores.length,
            success: schedule.stores.length - Math.floor(Math.random() * 2),
            errors: Math.floor(Math.random() * 2)
          }
        };
        
        setExecutionHistory(prev => [execution, ...prev]);
        
        // 最終実行時間を更新
        setSchedules(prev => prev.map(s => 
          s.id === schedule.id 
            ? { ...s, lastRun: new Date().toISOString(), executionCount: s.executionCount + 1 }
            : s
        ));
        
        alert('スケジュールを実行しました！');
        return;
      }

      // 本番API呼び出し
      const response = await api.post(`/schedules/${schedule.id}/execute`);
      if (response.data.success) {
        alert('スケジュールを実行しました');
        fetchSchedules();
        fetchExecutionHistory();
      }
    } catch (error) {
      console.error('スケジュール実行エラー:', error);
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!confirm('このスケジュールを削除しますか？')) return;
    
    try {
      // ローカル環境でのシミュレーション
      if (isLocalEnv) {
        setSchedules(prev => prev.filter(schedule => schedule.id !== id));
        return;
      }

      // 本番API呼び出し
      const response = await api.delete(`/schedules/${id}`);
      if (response.data.success) {
        setSchedules(prev => prev.filter(schedule => schedule.id !== id));
      }
    } catch (error) {
      console.error('スケジュール削除エラー:', error);
    }
  };

  const calculateNextRun = (schedule) => {
    const now = new Date();
    const [hours, minutes] = schedule.time.split(':').map(Number);
    
    switch (schedule.frequency) {
      case 'hourly':
        return new Date(now.getTime() + 3600000).toISOString();
      case 'daily':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(hours, minutes, 0, 0);
        return tomorrow.toISOString();
      case 'weekly':
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(hours, minutes, 0, 0);
        return nextWeek.toISOString();
      case 'monthly':
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(schedule.dayOfMonth || 1);
        nextMonth.setHours(hours, minutes, 0, 0);
        return nextMonth.toISOString();
      default:
        return null;
    }
  };

  const scheduleTypes = [
    { id: 'report_generation', label: 'レポート生成', icon: FileText, color: 'var(--success-500)' },
    { id: 'backup', label: 'バックアップ', icon: Database, color: 'var(--info-500)' },
    { id: 'monitoring', label: '監視', icon: Bell, color: 'var(--warning-500)' },
    { id: 'sync', label: '同期', icon: RefreshCw, color: 'var(--chart-purple)' },
    { id: 'settings_update', label: '設定更新', icon: Settings, color: 'var(--error-500)' }
  ];

  const getScheduleTypeInfo = (type) => {
    return scheduleTypes.find(t => t.id === type) || scheduleTypes[0];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'disabled': return 'gray';
      case 'manual': return 'blue';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return '有効';
      case 'disabled': return '無効';
      case 'manual': return '手動';
      case 'error': return 'エラー';
      default: return status;
    }
  };

  const getExecutionStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'completed_with_errors': return AlertTriangle;
      case 'running': return Clock;
      case 'failed': return AlertTriangle;
      default: return Clock;
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    if (selectedCategory !== 'all' && schedule.type !== selectedCategory) return false;
    if (searchQuery && !schedule.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !schedule.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="schedule-manager-loading">
        <div className="loading-spinner"></div>
        <p>スケジュールを読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="schedule-manager">
      <div className="page-header">
        <h1>スケジュール管理</h1>
        <button
          className="btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus size={18} />
          新規スケジュール
        </button>
      </div>

      {/* フィルター */}
      <div className="schedule-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="スケジュールを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="type-filter">
          <button
            className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            すべて
          </button>
          {scheduleTypes.map(type => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                className={`filter-btn ${selectedCategory === type.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(type.id)}
              >
                <Icon size={16} />
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* スケジュール一覧 */}
      <div className="schedules-section">
        <h2>スケジュール一覧 ({filteredSchedules.length}件)</h2>
        <div className="schedules-list">
          {filteredSchedules.map(schedule => {
            const typeInfo = getScheduleTypeInfo(schedule.type);
            const TypeIcon = typeInfo.icon;
            
            return (
              <div key={schedule.id} className="schedule-card">
                <div className="schedule-header">
                  <div className="schedule-type">
                    <TypeIcon size={20} style={{ color: typeInfo.color }} />
                    <span>{typeInfo.label}</span>
                  </div>
                  
                  <div className="schedule-status">
                    <span className={`status-badge ${getStatusColor(schedule.status)}`}>
                      {getStatusLabel(schedule.status)}
                    </span>
                  </div>
                  
                  <div className="schedule-actions">
                    <button
                      className="action-btn"
                      onClick={() => handleToggleSchedule(schedule.id)}
                      title={schedule.enabled ? '無効化' : '有効化'}
                    >
                      {schedule.enabled ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    
                    <button
                      className="action-btn"
                      onClick={() => handleExecuteNow(schedule)}
                      title="今すぐ実行"
                    >
                      <Play size={16} />
                    </button>
                    
                    <button
                      className="action-btn"
                      onClick={() => setEditingSchedule(schedule)}
                      title="編集"
                    >
                      <Edit size={16} />
                    </button>
                    
                    <button
                      className="action-btn danger"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      title="削除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="schedule-content">
                  <h3>{schedule.name}</h3>
                  <p>{schedule.description}</p>
                  
                  <div className="schedule-details">
                    <div className="detail-item">
                      <Clock size={14} />
                      <span>
                        {schedule.frequency === 'hourly' && '毎時'}
                        {schedule.frequency === 'daily' && `毎日 ${schedule.time}`}
                        {schedule.frequency === 'weekly' && `毎週 ${schedule.time}`}
                        {schedule.frequency === 'monthly' && `毎月${schedule.dayOfMonth}日 ${schedule.time}`}
                        {schedule.frequency === 'manual' && '手動実行'}
                      </span>
                    </div>
                    
                    <div className="detail-item">
                      <Users size={14} />
                      <span>{schedule.stores.length}店舗</span>
                    </div>
                    
                    <div className="detail-item">
                      <RotateCcw size={14} />
                      <span>{schedule.executionCount}回実行</span>
                    </div>
                  </div>
                  
                  <div className="schedule-timing">
                    {schedule.lastRun && (
                      <div className="timing-item">
                        <span>最終実行:</span>
                        <span>{new Date(schedule.lastRun).toLocaleString('ja-JP')}</span>
                      </div>
                    )}
                    
                    {schedule.nextRun && (
                      <div className="timing-item">
                        <span>次回実行:</span>
                        <span>{new Date(schedule.nextRun).toLocaleString('ja-JP')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredSchedules.length === 0 && (
            <div className="empty-state">
              <Calendar size={48} />
              <h3>スケジュールが見つかりません</h3>
              <p>検索条件を変更するか、新しいスケジュールを作成してください</p>
            </div>
          )}
        </div>
      </div>

      {/* 実行履歴 */}
      <div className="execution-history">
        <h2>実行履歴</h2>
        <div className="history-list">
          {executionHistory.slice(0, 10).map(execution => {
            const StatusIcon = getExecutionStatusIcon(execution.status);
            
            return (
              <div key={execution.id} className="history-item">
                <div className="history-status">
                  <StatusIcon size={20} />
                </div>
                
                <div className="history-content">
                  <h4>{execution.scheduleName}</h4>
                  <div className="history-meta">
                    <span>実行時間: {new Date(execution.startTime).toLocaleString('ja-JP')}</span>
                    <span>処理時間: {Math.round((new Date(execution.endTime) - new Date(execution.startTime)) / 1000)}秒</span>
                    {execution.result && (
                      <span>結果: {JSON.stringify(execution.result)}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {executionHistory.length === 0 && (
            <div className="empty-history">
              <Clock size={48} />
              <h3>実行履歴がありません</h3>
              <p>スケジュールが実行されると、こちらに履歴が表示されます</p>
            </div>
          )}
        </div>
      </div>

      {/* 新規スケジュール作成フォーム */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>新規スケジュール作成</h3>
              <button 
                className="modal-close"
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateSchedule} className="schedule-form">
              <div className="form-row">
                <div className="form-group">
                  <label>スケジュール名</label>
                  <input
                    type="text"
                    value={newSchedule.name}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, name: e.target.value }))}
                    className="form-input"
                    placeholder="スケジュール名"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>種別</label>
                  <select
                    value={newSchedule.type}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, type: e.target.value }))}
                    className="form-select"
                  >
                    {scheduleTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>説明</label>
                <textarea
                  value={newSchedule.description}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, description: e.target.value }))}
                  className="form-textarea"
                  placeholder="このスケジュールの説明"
                  rows="3"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>実行頻度</label>
                  <select
                    value={newSchedule.frequency}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, frequency: e.target.value }))}
                    className="form-select"
                  >
                    <option value="hourly">毎時</option>
                    <option value="daily">毎日</option>
                    <option value="weekly">毎週</option>
                    <option value="monthly">毎月</option>
                    <option value="manual">手動</option>
                  </select>
                </div>
                
                {newSchedule.frequency !== 'manual' && newSchedule.frequency !== 'hourly' && (
                  <div className="form-group">
                    <label>実行時刻</label>
                    <input
                      type="time"
                      value={newSchedule.time}
                      onChange={(e) => setNewSchedule(prev => ({ ...prev, time: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newSchedule.enabled}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, enabled: e.target.checked }))}
                  />
                  <span>作成後すぐに有効化する</span>
                </label>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateForm(false)}>
                  キャンセル
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={18} />
                  作成
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManager;