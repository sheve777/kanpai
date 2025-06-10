// C:\Users\acmsh\kanpAI\frontend\src\components\ReportList.js
import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig.js';

const ReportList = ({ storeId, onSelectReport }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      if (!storeId) {
        console.warn('⚠️ storeIdが設定されていません');
        setLoading(false);
        return;
      }

      console.log('🔄 レポート一覧を取得中...', { storeId });
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(`/api/reports?store_id=${storeId}`);
        
        console.log('✅ レポート一覧取得成功:', response.data);
        setReports(response.data);
        
        if (response.data.length === 0) {
          console.log('ℹ️ レポートがありません。サンプルレポートを生成してみます...');
          // サンプルレポートを生成
          await generateSampleReport();
        }
      } catch (error) {
        console.error('❌ レポートの取得に失敗しました:', error);
        console.error('   エラー詳細:', error.response?.data);
        setError(error.response?.data?.error || 'レポートの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [storeId]);

  const generateSampleReport = async () => {
    try {
      console.log('🔄 サンプルレポートを生成中...');
      
      const currentDate = new Date();
      const reportMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;
      
      const response = await api.post('/api/reports/generate', {
        store_id: storeId,
        report_month: reportMonth,
        plan_type: 'pro'
      });
      
      console.log('✅ サンプルレポート生成成功:', response.data);
      
      // レポート一覧を再取得
      const listResponse = await api.get(`/api/reports?store_id=${storeId}`);
      setReports(listResponse.data);
      
    } catch (error) {
      console.error('❌ サンプルレポート生成に失敗:', error);
    }
  };

  const formatReportMonth = (monthString) => {
    try {
      const date = new Date(monthString);
      return date.toLocaleDateString('ja-JP', { 
        year: 'numeric', 
        month: 'long' 
      });
    } catch (error) {
      console.error('日付フォーマットエラー:', error);
      return monthString;
    }
  };

  if (!storeId) {
    return (
      <div className="card report-list-container">
        <div className="card-header">
          <div className="summary-icon">📊</div>
          <h2>月次レポート</h2>
        </div>
        <p style={{color: 'red'}}>店舗IDが設定されていません。</p>
      </div>
    );
  }

  return (
    <div className="card report-list-container">
      <div className="card-header">
        <div className="summary-icon">📊</div>
        <h2>月次レポート</h2>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>📊 レポートを読み込み中...</p>
        </div>
      ) : error ? (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#ffe6e6', 
          border: '1px solid #ffb3b3',
          borderRadius: '8px',
          color: '#cc0000'
        }}>
          <p><strong>エラーが発生しました:</strong></p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            再読み込み
          </button>
        </div>
      ) : reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>📋 利用可能なレポートはありません。</p>
          <button 
            onClick={generateSampleReport}
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            サンプルレポートを生成
          </button>
        </div>
      ) : (
        <div>
          <p style={{ marginBottom: '16px', color: '#666' }}>
            📊 {reports.length}件のレポートがあります
          </p>
          <ul className="report-link-list">
            {reports.map(report => (
              <li 
                key={report.id} 
                onClick={() => {
                  console.log('📊 レポートを選択:', report);
                  onSelectReport(report.id);
                }}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <div style={{ fontWeight: '600' }}>
                    {formatReportMonth(report.report_month)} 詳細レポート
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    {report.plan_type && `${report.plan_type}プラン`} • 
                    {report.status === 'completed' ? ' 完了' : ` ${report.status}`} • 
                    {report.generated_at && new Date(report.generated_at).toLocaleDateString('ja-JP')}
                  </div>
                </div>
                <span className="arrow">→</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ReportList;
