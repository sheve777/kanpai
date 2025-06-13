import React, { useState, useEffect } from 'react';
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
  BarChart3
} from 'lucide-react';

const Dashboard = () => {
  const { api } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
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
      type: 'error',
      icon: XCircle,
      title: '居酒屋B',
      message: 'API使用量が95%に達しています',
      time: '5分前'
    },
    {
      id: 2,
      type: 'warning',
      icon: AlertTriangle,
      title: '居酒屋F',
      message: '3日連続でチャットエラーが発生',
      time: '1時間前'
    },
    {
      id: 3,
      type: 'info',
      icon: CheckCircle,
      title: '居酒屋A',
      message: '月次レポート生成完了',
      time: '2時間前'
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

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>本日のサービス状況</h1>
        <p>全店舗の運営状況を一元管理</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.id} className={`stat-card ${card.color}`}>
              <div className="stat-icon">
                <Icon size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">{card.title}</div>
                <div className="stat-value">{card.value.toLocaleString()}</div>
                <div className={`stat-trend ${card.trendType}`}>
                  {card.trendType === 'up' && <TrendingUp size={14} />}
                  {card.trendType === 'down' && <TrendingDown size={14} />}
                  <span>{card.trend}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerts Section */}
      <div className="alerts-section">
        <h2>⚠️ 要対応アラート</h2>
        <div className="alerts-list">
          {alerts.map((alert) => {
            const Icon = alert.icon;
            return (
              <div key={alert.id} className={`alert-card ${alert.type}`}>
                <Icon className="alert-icon" size={20} />
                <div className="alert-content">
                  <div className="alert-title">{alert.title}</div>
                  <div className="alert-message">{alert.message}</div>
                  <div className="alert-time">{alert.time}</div>
                </div>
                <button className="alert-action">対応</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="chart-section">
        <h2>📊 利用推移</h2>
        <div className="chart-placeholder">
          <BarChart3 size={48} />
          <p>日別利用推移グラフ</p>
          <small>チャート機能は今後実装予定です</small>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>クイックアクション</h2>
        <div className="action-buttons">
          <button className="action-btn primary">
            新店舗追加
          </button>
          <button className="action-btn secondary">
            レポート一括生成
          </button>
          <button className="action-btn secondary">
            システム監視
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;