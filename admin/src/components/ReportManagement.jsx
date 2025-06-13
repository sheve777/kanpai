import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  FileText,
  Plus,
  Download,
  Send,
  Edit,
  Eye,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Play
} from 'lucide-react';

const ReportManagement = () => {
  const { api } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // デモデータを設定
    const demoReports = [
      {
        id: '1',
        title: '2025年5月分レポート - 全店舗',
        stores: 12,
        status: 'pending',
        statusLabel: '生成待ち',
        createdAt: new Date(),
        type: 'bulk'
      },
      {
        id: '2',
        title: '居酒屋 花まる - 2025年5月',
        stores: 1,
        status: 'completed',
        statusLabel: '配信済み',
        createdAt: new Date(Date.now() - 86400000),
        type: 'individual',
        plan: 'スタンダード'
      },
      {
        id: '3',
        title: '大衆酒場 さくら - 2025年5月',
        stores: 1,
        status: 'draft',
        statusLabel: '下書き',
        createdAt: new Date(Date.now() - 172800000),
        type: 'individual',
        plan: 'エントリー'
      },
      {
        id: '4',
        title: '創作居酒屋 月の雫 - 2025年5月',
        stores: 1,
        status: 'generating',
        statusLabel: 'AI生成中',
        createdAt: new Date(Date.now() - 3600000),
        type: 'individual',
        plan: 'プロ'
      }
    ];
    
    setReports(demoReports);
    setLoading(false);
  }, []);

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: {
        icon: Clock,
        color: 'gray',
        bgColor: '#f3f4f6'
      },
      generating: {
        icon: Play,
        color: 'blue',
        bgColor: '#dbeafe'
      },
      draft: {
        icon: Edit,
        color: 'yellow',
        bgColor: '#fef3c7'
      },
      completed: {
        icon: CheckCircle,
        color: 'green',
        bgColor: '#d1fae5'
      },
      error: {
        icon: AlertTriangle,
        color: 'red',
        bgColor: '#fee2e2'
      }
    };
    
    return statusMap[status] || statusMap.pending;
  };

  const getActionButtons = (report) => {
    switch (report.status) {
      case 'pending':
        return (
          <button className="action-btn primary">
            <Play size={16} />
            AI生成開始
          </button>
        );
      case 'generating':
        return (
          <button className="action-btn" disabled>
            生成中...
          </button>
        );
      case 'draft':
        return (
          <div className="action-group">
            <button className="action-btn secondary">
              <Edit size={16} />
              編集
            </button>
            <button className="action-btn primary">
              <Send size={16} />
              配信
            </button>
          </div>
        );
      case 'completed':
        return (
          <div className="action-group">
            <button className="action-btn secondary">
              <Eye size={16} />
              確認
            </button>
            <button className="action-btn secondary">
              <Download size={16} />
              ダウンロード
            </button>
            <button className="action-btn warning">
              <Edit size={16} />
              再生成
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="report-management-loading">
        <div className="loading-spinner"></div>
        <p>レポート情報を読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="report-management">
      <div className="page-header">
        <h1>月次レポート管理</h1>
        <button className="btn-primary">
          <Plus size={18} />
          一括生成
        </button>
      </div>

      {/* Summary Stats */}
      <div className="report-stats">
        <div className="stat-card">
          <div className="stat-label">総レポート数</div>
          <div className="stat-value">{reports.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">生成待ち</div>
          <div className="stat-value">
            {reports.filter(r => r.status === 'pending').length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">配信済み</div>
          <div className="stat-value">
            {reports.filter(r => r.status === 'completed').length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">下書き</div>
          <div className="stat-value">
            {reports.filter(r => r.status === 'draft').length}
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="reports-list">
        {reports.map(report => {
          const statusInfo = getStatusInfo(report.status);
          const StatusIcon = statusInfo.icon;
          
          return (
            <div key={report.id} className="report-card">
              <div className="report-header">
                <div className="report-info">
                  <h3>{report.title}</h3>
                  <div className="report-meta">
                    {report.type === 'bulk' ? (
                      <span className="meta-item">
                        <FileText size={14} />
                        対象: {report.stores}店舗
                      </span>
                    ) : (
                      <span className="meta-item">
                        <FileText size={14} />
                        {report.plan}プラン
                      </span>
                    )}
                    <span className="meta-item">
                      <Calendar size={14} />
                      {report.createdAt.toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                </div>
                
                <div className="report-status">
                  <span 
                    className={`status-badge status-${statusInfo.color}`}
                    style={{ backgroundColor: statusInfo.bgColor }}
                  >
                    <StatusIcon size={16} />
                    {report.statusLabel}
                  </span>
                </div>
              </div>
              
              <div className="report-actions">
                {getActionButtons(report)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Monthly Report Schedule */}
      <div className="schedule-section">
        <h2>📅 月次レポート自動生成スケジュール</h2>
        <div className="schedule-info">
          <div className="schedule-item">
            <strong>実行日:</strong> 毎月1日 午前9:00
          </div>
          <div className="schedule-item">
            <strong>対象:</strong> 全アクティブ店舗
          </div>
          <div className="schedule-item">
            <strong>配信:</strong> 生成完了後、自動配信
          </div>
        </div>
        
        <div className="schedule-actions">
          <button className="btn-secondary">
            スケジュール設定
          </button>
          <button className="btn-secondary">
            手動実行
          </button>
        </div>
      </div>

      {/* Help Section */}
      <div className="help-section">
        <h3>💡 レポート管理について</h3>
        <div className="help-content">
          <div className="help-item">
            <strong>AI生成:</strong> OpenAI APIを使用して、店舗の月次データから自動でレポートを生成します
          </div>
          <div className="help-item">
            <strong>カスタマイズ:</strong> 生成されたレポートは編集・カスタマイズが可能です
          </div>
          <div className="help-item">
            <strong>配信:</strong> LINE経由で店舗オーナーに自動配信されます
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportManagement;