import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ReportDetailView from './ReportDetailView';
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
  Sparkles,
  ArrowLeft,
  Store
} from 'lucide-react';

const ReportManagementDetail = ({ storeId, showLatestReport = false, onBack }) => {
  const { api } = useAuth();
  const [reports, setReports] = useState([]);
  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [viewingReport, setViewingReport] = useState(null);

  // ローカル環境判定
  const isLocalEnv = window.location.hostname === 'localhost';

  useEffect(() => {
    fetchReports();
    fetchStoreInfo();
  }, [selectedMonth, storeId]);

  // 最新レポートを自動選択する関数
  const selectLatestReport = (reportList) => {
    if (reportList.length > 0) {
      // 最新のレポート（配信済み > 生成済み > 下書きの順で優先）
      const priorityOrder = { 'sent': 3, 'generated': 2, 'draft': 1 };
      const sortedReports = [...reportList].sort((a, b) => {
        // まず優先度で並び替え
        const priorityDiff = (priorityOrder[b.status] || 0) - (priorityOrder[a.status] || 0);
        if (priorityDiff !== 0) return priorityDiff;
        
        // 次に生成日で並び替え
        return new Date(b.generatedAt) - new Date(a.generatedAt);
      });
      
      const latestReport = sortedReports[0];
      console.log('🔍 最新レポートを自動選択:', latestReport.id);
      setViewingReport(latestReport.id);
    }
  };

  const fetchStoreInfo = async () => {
    try {
      // ローカル環境でのモックデータ
      if (isLocalEnv) {
        const mockStores = {
          'demo-store-001': { name: '居酒屋 花まる 渋谷店', location: '東京都渋谷区' },
          'demo-store-002': { name: '海鮮居酒屋 大漁丸', location: '東京都新宿区' },
          'demo-store-003': { name: '串焼き専門店 炭火屋', location: '東京都世田谷区' },
          'demo-store-004': { name: '創作和食 風花', location: '東京都品川区' },
          'demo-store-005': { name: '昭和レトロ居酒屋 のんべえ横丁', location: '東京都台東区' }
        };
        setStoreInfo(mockStores[storeId] || { name: '未知の店舗', location: '' });
        return;
      }
      
      // 本番API呼び出し
      const response = await api.get(`/stores/${storeId}`);
      if (response.data.success) {
        setStoreInfo(response.data.store);
      }
    } catch (error) {
      console.error('店舗情報取得エラー:', error);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // ローカル環境でのモックデータ
      if (isLocalEnv) {
        console.log('🏠 ローカル環境：モックレポートデータを使用');
        const allMockReports = [
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
          },
          {
            id: 'report-004',
            storeId: 'demo-store-004',
            storeName: '創作和食 風花',
            month: selectedMonth,
            status: 'sent',
            generatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
            sentAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            metrics: {
              totalReservations: 134,
              totalRevenue: 789000,
              averageSpend: 5888,
              newCustomers: 28,
              repeatRate: 0.76,
              totalMessages: 267,
              aiResponseRate: 0.91
            },
            content: `【${selectedMonth.replace('-', '年')}月】月次レポート

◆ 営業実績
予約数134件、売上789,000円を記録しました。

◆ 顧客分析
- 新規顧客: 28名
- リピート率: 76%（優秀な水準）
- 平均客単価: 5,888円

◆ LINE活用状況
- メッセージ数: 267件
- AI応答精度: 91%

◆ 来月への提案
季節メニューの積極的な発信により、さらなる集客向上を目指しましょう。`
          }
        ];
        
        // 指定されたstoreIdのレポートのみをフィルタリング
        const filteredReports = allMockReports.filter(report => report.storeId === storeId);
        setReports(filteredReports);
        
        // 最新レポート表示フラグが立っている場合は自動選択
        if (showLatestReport) {
          selectLatestReport(filteredReports);
        }
        
        setLoading(false);
        return;
      }
      
      // 本番API呼び出し
      const response = await api.get(`/reports?month=${selectedMonth}&storeId=${storeId}`);
      if (response.data.success) {
        setReports(response.data.reports);
        
        // 最新レポート表示フラグが立っている場合は自動選択
        if (showLatestReport) {
          selectLatestReport(response.data.reports);
        }
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
        
        alert(`${storeInfo?.name || '店舗'}のレポートを生成しました！`);
        fetchReports();
        return;
      }
      
      // 本番API呼び出し
      const response = await api.post('/reports/generate', {
        month: selectedMonth,
        storeIds: [storeId]
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
    // 配信前の確認ダイアログ
    const report = reports.find(r => r.id === reportId);
    const storeName = storeInfo?.name || '店舗';
    const reportMonth = report?.month?.replace('-', '年') + '月' || '該当月';
    
    const confirmMessage = `📤 レポート配信確認\n\n以下のレポートをLINEで配信しますか？\n\n店舗: ${storeName}\n対象月: ${reportMonth}\n\n配信後は顧客に自動送信されます。\n本当に配信しますか？`;
    
    if (!window.confirm(confirmMessage)) {
      console.log('❌ レポート配信をキャンセルしました');
      return;
    }
    
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

  // レポート詳細画面を表示
  if (viewingReport) {
    return (
      <ReportDetailView 
        reportId={viewingReport}
        onBack={() => setViewingReport(null)}
      />
    );
  }

  return (
    <div className="report-management-detail">
      <div className="page-header">
        <div className="header-left">
          <button 
            className="back-button"
            onClick={onBack}
            title="店舗一覧に戻る"
          >
            <ArrowLeft size={18} />
            戻る
          </button>
          <div className="header-title">
            <h1>📊 {storeInfo?.name || '店舗'} - レポート詳細</h1>
            {storeInfo?.location && (
              <p className="store-location">{storeInfo.location}</p>
            )}
          </div>
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
                レポート生成
              </>
            )}
          </button>
        </div>
      </div>

      {/* レポート統計サマリー（横一列） */}
      <div className="report-summary-bar">
        <div className="summary-container">
          <div className="summary-title">📈 {selectedMonth.replace('-', '年')}月 {storeInfo?.name || '店舗'}レポート</div>
          <div className="summary-stats">
            <div className="summary-stat-item">
              <FileText size={18} style={{ color: 'var(--text-secondary)' }} />
              <div className="stat-content">
                <span className="stat-value">{reports.length}</span>
                <span className="stat-label">総レポート数</span>
              </div>
            </div>
            
            <div className="summary-stat-item">
              <CheckCircle size={18} style={{ color: 'var(--success-500)' }} />
              <div className="stat-content">
                <span className="stat-value">{reports.filter(r => r.status === 'sent').length}</span>
                <span className="stat-label">配信済み</span>
              </div>
            </div>
            
            <div className="summary-stat-item">
              <Clock size={18} style={{ color: 'var(--warning-500)' }} />
              <div className="stat-content">
                <span className="stat-value">{reports.filter(r => r.status === 'generated').length}</span>
                <span className="stat-label">未配信</span>
              </div>
            </div>
            
            <div className="summary-stat-item">
              <Edit3 size={18} style={{ color: 'var(--chart-purple)' }} />
              <div className="stat-content">
                <span className="stat-value">{reports.filter(r => r.status === 'draft').length}</span>
                <span className="stat-label">下書き</span>
              </div>
            </div>
          </div>
          <div className="summary-actions">
            <span className="update-info">
              <Calendar size={14} />
              対象月: {selectedMonth.replace('-', '年')}月
            </span>
          </div>
        </div>
      </div>

      {/* レポート一覧テーブル */}
      <div className="reports-section">
        <h2>📄 {storeInfo?.name || '店舗'}のレポート履歴</h2>
        <div className="table-container">
          <table className="reports-table">
            <thead>
              <tr>
                <th>レポート期間</th>
                <th>ステータス</th>
                <th>営業実績</th>
                <th>顧客分析</th>
                <th>LINE活用</th>
                <th>生成日</th>
                <th>配信日</th>
                <th>アクション</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => {
                const statusInfo = getStatusBadge(report.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <tr key={report.id}>
                    <td>
                      <div className="report-period-cell">
                        <Calendar size={16} />
                        <div className="period-info">
                          <span className="period-main">{report.month.replace('-', '年')}月</span>
                          <small className="period-detail">
                            {(() => {
                              const [year, month] = report.month.split('-');
                              const endDate = new Date(parseInt(year), parseInt(month), 0).getDate();
                              return `${month}/1 - ${month}/${endDate}`;
                            })()}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${statusInfo.className}`}>
                        <StatusIcon size={12} />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td>
                      <div className="metrics-cell">
                        <span>予約: {report.metrics.totalReservations}件</span>
                        <span>売上: ¥{(report.metrics.totalRevenue / 1000).toFixed(0)}K</span>
                      </div>
                    </td>
                    <td>
                      <div className="metrics-cell">
                        <span>新規: {report.metrics.newCustomers}名</span>
                        <span>リピート: {(report.metrics.repeatRate * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="metrics-cell">
                        <span>メッセージ: {report.metrics.totalMessages}件</span>
                        <span>応答率: {(report.metrics.aiResponseRate * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td>
                      <span className="date-cell">
                        {report.generatedAt ? new Date(report.generatedAt).toLocaleDateString('ja-JP') : '-'}
                      </span>
                    </td>
                    <td>
                      <span className="date-cell">
                        {report.sentAt ? new Date(report.sentAt).toLocaleDateString('ja-JP') : '-'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-sm primary"
                          onClick={() => setViewingReport(report.id)}
                          title="詳細表示"
                        >
                          <Eye size={14} />
                          詳細表示
                        </button>
                        {report.status === 'generated' && (
                          <button 
                            className="btn-sm"
                            onClick={() => handleSendReport(report.id)}
                            disabled={sending}
                            title="配信"
                            style={{ background: 'var(--success-500)', color: 'var(--text-inverse)' }}
                          >
                            <Send size={14} />
                            配信
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