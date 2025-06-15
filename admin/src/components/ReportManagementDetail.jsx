import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  FileText,
  Calendar,
  Send,
  Edit3,
  Save,
  X,
  Download,
  Eye,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  MessageSquare,
  BarChart3,
  Sparkles
} from 'lucide-react';

const ReportManagementDetail = () => {
  const { api } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedStores, setSelectedStores] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // ローカル環境判定
  const isLocalEnv = window.location.hostname === 'localhost';

  useEffect(() => {
    fetchReports();
  }, [selectedMonth]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // ローカル環境でのモックデータ
      if (isLocalEnv) {
        console.log('🏠 ローカル環境：モックレポートデータを使用');
        const mockReports = [
          {
            id: 'report-001',
            storeId: 'demo-store-001',
            storeName: '居酒屋 花まる 渋谷店',
            month: selectedMonth,
            status: 'generated',
            generatedAt: new Date().toISOString(),
            sentAt: null,
            metrics: {
              totalReservations: 156,
              totalRevenue: 892000,
              averageSpend: 5718,
              newCustomers: 43,
              repeatRate: 0.72,
              totalMessages: 312,
              aiResponseRate: 0.94
            },
            content: `【${selectedMonth.replace('-', '年')}月】月次レポート

◆ 営業実績サマリー
今月の総予約数は156件、売上は892,000円となりました。
客単価は5,718円で、前月比108%の成長を達成しました。

◆ 顧客動向
- 新規顧客: 43名（前月比+15%）
- リピート率: 72%（高水準を維持）
- 人気時間帯: 19:00-21:00

◆ LINE Bot活用状況
- 総メッセージ数: 312件
- AI応答率: 94%
- 予約完了率: 87%

◆ 来月の施策提案
1. 金曜日の予約が集中しているため、平日限定クーポンの配信を検討
2. リピーター向けの特別メニュー導入
3. SNS連携キャンペーンの実施

引き続きよろしくお願いいたします。`
          },
          {
            id: 'report-002',
            storeId: 'demo-store-002',
            storeName: '海鮮居酒屋 大漁丸',
            month: selectedMonth,
            status: 'sent',
            generatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            sentAt: new Date(Date.now() - 86400000).toISOString(),
            metrics: {
              totalReservations: 234,
              totalRevenue: 1456000,
              averageSpend: 6222,
              newCustomers: 67,
              repeatRate: 0.68,
              totalMessages: 498,
              aiResponseRate: 0.92
            },
            content: `【${selectedMonth.replace('-', '年')}月】月次レポート

◆ 営業実績
予約数234件、売上1,456,000円を達成。過去最高を更新しました。

◆ 主要指標
- 客単価: 6,222円
- 新規顧客獲得: 67名
- リピート率: 68%

◆ 改善点と提案
週末の満席率が高いため、予約枠の最適化を推奨します。`
          },
          {
            id: 'report-003',
            storeId: 'demo-store-003',
            storeName: '串焼き専門店 炭火屋',
            month: selectedMonth,
            status: 'draft',
            generatedAt: new Date().toISOString(),
            sentAt: null,
            metrics: {
              totalReservations: 89,
              totalRevenue: 623000,
              averageSpend: 6989,
              newCustomers: 23,
              repeatRate: 0.74,
              totalMessages: 178,
              aiResponseRate: 0.96
            },
            content: '（レポート生成中...）'
          }
        ];
        
        setReports(mockReports);
        setLoading(false);
        return;
      }
      
      // 本番API呼び出し
      const response = await api.get(`/reports?month=${selectedMonth}`);
      if (response.data.success) {
        setReports(response.data.reports);
      }
    } catch (error) {
      console.error('レポート取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReports = async () => {
    try {
      setGenerating(true);
      
      // ローカル環境でのシミュレーション
      if (isLocalEnv) {
        console.log('🤖 AI レポート生成シミュレーション');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        alert(`${selectedStores.length || 'すべての'}店舗のレポートを生成しました！`);
        fetchReports();
        return;
      }
      
      // 本番API呼び出し
      const response = await api.post('/reports/generate', {
        month: selectedMonth,
        storeIds: selectedStores.length > 0 ? selectedStores : undefined
      });
      
      if (response.data.success) {
        alert('レポート生成が完了しました');
        fetchReports();
      }
    } catch (error) {
      console.error('レポート生成エラー:', error);
      alert('レポート生成に失敗しました');
    } finally {
      setGenerating(false);
    }
  };

  const handleSendReport = async (reportId) => {
    try {
      setSending(true);
      
      // ローカル環境でのシミュレーション
      if (isLocalEnv) {
        console.log('📨 レポート配信シミュレーション:', reportId);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        alert('レポートをLINEで配信しました！');
        
        // ステータスを更新
        setReports(prev => prev.map(report => 
          report.id === reportId 
            ? { ...report, status: 'sent', sentAt: new Date().toISOString() }
            : report
        ));
        return;
      }
      
      // 本番API呼び出し
      const response = await api.post(`/reports/${reportId}/send`);
      
      if (response.data.success) {
        alert('レポートを配信しました');
        fetchReports();
      }
    } catch (error) {
      console.error('レポート配信エラー:', error);
      alert('レポート配信に失敗しました');
    } finally {
      setSending(false);
    }
  };

  const handleEditReport = (report) => {
    setSelectedReport(report);
    setEditedContent(report.content);
    setEditMode(true);
  };

  const handleSaveEdit = async () => {
    try {
      // ローカル環境でのシミュレーション
      if (isLocalEnv) {
        console.log('💾 レポート編集保存:', selectedReport.id);
        
        // レポートを更新
        setReports(prev => prev.map(report => 
          report.id === selectedReport.id 
            ? { ...report, content: editedContent }
            : report
        ));
        
        setEditMode(false);
        setSelectedReport(null);
        alert('レポートを保存しました');
        return;
      }
      
      // 本番API呼び出し
      const response = await api.patch(`/reports/${selectedReport.id}`, {
        content: editedContent
      });
      
      if (response.data.success) {
        fetchReports();
        setEditMode(false);
        setSelectedReport(null);
      }
    } catch (error) {
      console.error('レポート保存エラー:', error);
      alert('保存に失敗しました');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'sent':
        return { icon: CheckCircle, label: '配信済み', className: 'status-sent' };
      case 'generated':
        return { icon: Clock, label: '生成済み', className: 'status-generated' };
      case 'draft':
        return { icon: Edit3, label: '下書き', className: 'status-draft' };
      default:
        return { icon: AlertCircle, label: '不明', className: 'status-unknown' };
    }
  };

  if (loading) {
    return (
      <div className="report-management-loading">
        <div className="loading-spinner"></div>
        <p>レポートを読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="report-management">
      <div className="page-header">
        <h1>レポート管理</h1>
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
            onClick={handleGenerateReports}
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

      {/* レポート統計 */}
      <div className="report-stats">
        <div className="stat-card">
          <FileText size={24} />
          <div>
            <h3>{reports.length}</h3>
            <p>総レポート数</p>
          </div>
        </div>
        <div className="stat-card">
          <CheckCircle size={24} />
          <div>
            <h3>{reports.filter(r => r.status === 'sent').length}</h3>
            <p>配信済み</p>
          </div>
        </div>
        <div className="stat-card">
          <Clock size={24} />
          <div>
            <h3>{reports.filter(r => r.status === 'generated').length}</h3>
            <p>未配信</p>
          </div>
        </div>
        <div className="stat-card">
          <Edit3 size={24} />
          <div>
            <h3>{reports.filter(r => r.status === 'draft').length}</h3>
            <p>下書き</p>
          </div>
        </div>
      </div>

      {/* レポート一覧 */}
      <div className="reports-grid">
        {reports.map(report => {
          const statusInfo = getStatusBadge(report.status);
          const StatusIcon = statusInfo.icon;
          
          return (
            <div key={report.id} className="report-card">
              <div className="report-header">
                <h3>{report.storeName}</h3>
                <span className={`status-badge ${statusInfo.className}`}>
                  <StatusIcon size={16} />
                  {statusInfo.label}
                </span>
              </div>
              
              <div className="report-metrics">
                <div className="metric">
                  <Users size={16} />
                  <span>{report.metrics.totalReservations}件</span>
                </div>
                <div className="metric">
                  <DollarSign size={16} />
                  <span>¥{report.metrics.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="metric">
                  <TrendingUp size={16} />
                  <span>{(report.metrics.repeatRate * 100).toFixed(0)}%</span>
                </div>
                <div className="metric">
                  <MessageSquare size={16} />
                  <span>{report.metrics.totalMessages}件</span>
                </div>
              </div>
              
              <div className="report-content-preview">
                {report.content.slice(0, 100)}...
              </div>
              
              <div className="report-actions">
                <button 
                  className="action-btn"
                  onClick={() => handleEditReport(report)}
                  title="編集"
                >
                  <Edit3 size={16} />
                </button>
                <button 
                  className="action-btn"
                  onClick={() => setSelectedReport(report)}
                  title="プレビュー"
                >
                  <Eye size={16} />
                </button>
                <button 
                  className="action-btn"
                  title="ダウンロード"
                >
                  <Download size={16} />
                </button>
                <button 
                  className="action-btn primary"
                  onClick={() => handleSendReport(report.id)}
                  disabled={report.status === 'sent' || sending}
                  title="LINE配信"
                >
                  <Send size={16} />
                </button>
              </div>
              
              <div className="report-footer">
                <span className="timestamp">
                  生成: {new Date(report.generatedAt).toLocaleDateString('ja-JP')}
                </span>
                {report.sentAt && (
                  <span className="timestamp">
                    配信: {new Date(report.sentAt).toLocaleDateString('ja-JP')}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* レポートプレビューモーダル */}
      {selectedReport && !editMode && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-container report-preview" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>レポートプレビュー</h2>
              <button className="close-btn" onClick={() => setSelectedReport(null)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-content">
              <div className="report-info">
                <h3>{selectedReport.storeName}</h3>
                <p>{selectedReport.month.replace('-', '年')}月</p>
              </div>
              <pre className="report-content">{selectedReport.content}</pre>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => handleEditReport(selectedReport)}
              >
                <Edit3 size={18} />
                編集
              </button>
              <button 
                className="btn-primary"
                onClick={() => handleSendReport(selectedReport.id)}
                disabled={selectedReport.status === 'sent'}
              >
                <Send size={18} />
                LINE配信
              </button>
            </div>
          </div>
        </div>
      )}

      {/* レポート編集モーダル */}
      {editMode && selectedReport && (
        <div className="modal-overlay">
          <div className="modal-container report-edit" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>レポート編集</h2>
              <button className="close-btn" onClick={() => {
                setEditMode(false);
                setSelectedReport(null);
              }}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-content">
              <div className="report-info">
                <h3>{selectedReport.storeName}</h3>
                <p>{selectedReport.month.replace('-', '年')}月</p>
              </div>
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="report-editor"
                rows={20}
              />
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => {
                  setEditMode(false);
                  setSelectedReport(null);
                }}
              >
                キャンセル
              </button>
              <button 
                className="btn-primary"
                onClick={handleSaveEdit}
              >
                <Save size={18} />
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManagementDetail;