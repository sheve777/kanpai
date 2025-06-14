import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  FileText,
  Download,
  Eye,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

const ReportManagement = () => {
  const { api } = useAuth();
  const [reports, setReports] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [viewingReport, setViewingReport] = useState(null);
  
  // レポート生成フォーム
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));
  const [planType, setPlanType] = useState('standard');

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (selectedStoreId) {
      fetchReports();
    }
  }, [selectedStoreId]);

  const fetchStores = async () => {
    try {
      const response = await api.get('/api/admin/stores');
      const storeList = response.data.stores || [];
      setStores(storeList);
      if (storeList.length > 0 && !selectedStoreId) {
        setSelectedStoreId(storeList[0].id);
      }
    } catch (error) {
      console.error('店舗一覧の取得に失敗しました:', error);
      // デモデータ
      setStores([
        { id: 'test', name: 'デモ居酒屋' },
        { id: 'demo-1', name: '花まる 渋谷店' },
        { id: 'demo-2', name: 'さくら 新宿店' }
      ]);
      setSelectedStoreId('test');
    }
  };

  const fetchReports = async () => {
    if (!selectedStoreId) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/api/reports?store_id=${selectedStoreId}`);
      setReports(response.data.reports || response.data || []);
    } catch (error) {
      console.error('レポート一覧の取得に失敗しました:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!selectedStoreId || !reportMonth || !planType) {
      alert('すべての項目を選択してください');
      return;
    }

    setGenerating(true);
    try {
      const response = await api.post('/api/reports/generate', {
        store_id: selectedStoreId,
        report_month: reportMonth + '-01',
        plan_type: planType
      });

      alert('レポートの生成が完了しました！');
      fetchReports(); // レポート一覧を更新
    } catch (error) {
      console.error('レポート生成に失敗しました:', error);
      alert('レポート生成に失敗しました。もう一度お試しください。');
    } finally {
      setGenerating(false);
    }
  };

  const viewReport = async (reportId) => {
    try {
      const response = await api.get(`/api/reports/${reportId}`);
      const reportData = response.data.report || response.data;
      setViewingReport(reportData);
    } catch (error) {
      console.error('レポート詳細の取得に失敗しました:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '不明';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatMonth = (dateString) => {
    if (!dateString) return '不明';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getPlanBadgeClass = (planType) => {
    switch (planType) {
      case 'pro': return 'badge-pro';
      case 'standard': return 'badge-standard';
      case 'entry': return 'badge-entry';
      default: return 'badge-default';
    }
  };

  const getPlanDisplayName = (planType) => {
    switch (planType) {
      case 'pro': return 'プロ';
      case 'standard': return 'スタンダード';
      case 'entry': return 'エントリー';
      default: return planType;
    }
  };

  const renderReportContent = (content) => {
    if (!content) return '';
    
    // Markdown風のコンテンツをHTMLに変換
    return content
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="report-management">
      <div className="page-header">
        <h1><FileText size={28} /> レポート管理</h1>
        <p className="page-description">月次レポートの生成と管理</p>
      </div>

      {/* 店舗選択 */}
      <div className="card">
        <div className="card-header">
          <h2>店舗選択</h2>
        </div>
        <div className="card-content">
          <select 
            value={selectedStoreId} 
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className="form-select"
          >
            <option value="">店舗を選択してください</option>
            {stores.map(store => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedStoreId && (
        <>
          {/* レポート生成 */}
          <div className="card">
            <div className="card-header">
              <h2><TrendingUp size={20} /> 新規レポート生成</h2>
            </div>
            <div className="card-content">
              <div className="form-grid">
                <div className="form-group">
                  <label>対象月</label>
                  <input
                    type="month"
                    value={reportMonth}
                    onChange={(e) => setReportMonth(e.target.value)}
                    max={new Date().toISOString().slice(0, 7)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>プランタイプ</label>
                  <select
                    value={planType}
                    onChange={(e) => setPlanType(e.target.value)}
                    className="form-select"
                  >
                    <option value="entry">エントリープラン</option>
                    <option value="standard">スタンダードプラン</option>
                    <option value="pro">プロプラン</option>
                  </select>
                </div>
                <div className="form-group">
                  <button
                    onClick={generateReport}
                    disabled={generating}
                    className="btn btn-primary"
                  >
                    {generating ? (
                      <>
                        <div className="spinner-small"></div>
                        生成中...
                      </>
                    ) : (
                      <>
                        <FileText size={20} />
                        レポート生成
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="alert alert-info">
                <AlertCircle size={16} />
                <div>
                  <p><strong>レポート生成について</strong></p>
                  <ul>
                    <li>デモモードではAI生成を模したサンプルレポートが生成されます</li>
                    <li>本番環境ではOpenAI APIを使用して詳細な分析レポートが生成されます</li>
                    <li>プランによって異なる詳細度のレポートが生成されます</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* レポート一覧 */}
          <div className="card">
            <div className="card-header">
              <h2><Calendar size={20} /> 生成済みレポート</h2>
              <button 
                onClick={fetchReports} 
                className="btn btn-secondary btn-sm"
                disabled={loading}
              >
                <RefreshCw size={16} />
                更新
              </button>
            </div>
            <div className="card-content">
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>レポートを読み込み中...</p>
                </div>
              ) : reports.length > 0 ? (
                <div className="report-list">
                  {reports.map((report) => (
                    <div key={report.id} className="report-item">
                      <div className="report-info">
                        <h3>{formatMonth(report.report_month)} レポート</h3>
                        <div className="report-meta">
                          <span className={`badge ${getPlanBadgeClass(report.plan_type)}`}>
                            {getPlanDisplayName(report.plan_type)}
                          </span>
                          <span className="status-badge status-green">
                            <CheckCircle size={16} />
                            {report.status === 'completed' ? '生成済み' : report.status}
                          </span>
                          <span className="text-muted">
                            <Clock size={14} />
                            {formatDate(report.generated_at || report.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="report-actions">
                        <button
                          onClick={() => viewReport(report.id)}
                          className="btn btn-secondary btn-sm"
                        >
                          <Eye size={16} />
                          詳細
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          disabled
                          title="PDF出力は今後実装予定"
                        >
                          <Download size={16} />
                          PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FileText size={48} />
                  <p>まだレポートが生成されていません</p>
                  <p className="text-muted">上のフォームから新規レポートを生成してください</p>
                </div>
              )}
            </div>
          </div>

          {/* 月次スケジュール */}
          <div className="card">
            <div className="card-header">
              <h2><Calendar size={20} /> 自動生成スケジュール</h2>
            </div>
            <div className="card-content">
              <div className="schedule-info">
                <div className="info-item">
                  <strong>実行日時：</strong>毎月1日 午前9:00
                </div>
                <div className="info-item">
                  <strong>対象店舗：</strong>全アクティブ店舗
                </div>
                <div className="info-item">
                  <strong>配信方法：</strong>LINE経由で自動配信
                </div>
              </div>
              <div className="alert alert-warning">
                <AlertCircle size={16} />
                <span>自動生成機能は今後実装予定です</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* レポート詳細モーダル */}
      {viewingReport && (
        <div className="modal-overlay" onClick={() => setViewingReport(null)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {formatMonth(viewingReport.report_month)} レポート
                <span className={`badge ${getPlanBadgeClass(viewingReport.plan_type)} ml-2`}>
                  {getPlanDisplayName(viewingReport.plan_type)}
                </span>
              </h2>
              <button 
                onClick={() => setViewingReport(null)}
                className="btn-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div 
                className="report-content markdown-content"
                dangerouslySetInnerHTML={{ 
                  __html: renderReportContent(viewingReport.report_content || viewingReport.data) 
                }}
              />
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setViewingReport(null)}
                className="btn btn-secondary"
              >
                閉じる
              </button>
              <button 
                className="btn btn-primary"
                disabled
              >
                <Download size={16} />
                PDFダウンロード
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManagement;