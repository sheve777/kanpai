import React from 'react';
import { BarChart3, Users, TrendingUp, DollarSign } from 'lucide-react';

const ReportsTab = ({ data }) => {
  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h2>店舗レポート</h2>
        <p>この店舗の詳細な分析レポート</p>
      </div>
      
      {/* Performance Summary */}
      <div className="report-summary">
        <div className="summary-cards">
          <div className="summary-card">
            <h4>月間売上</h4>
            <div className="summary-value">
              ¥{(data?.monthlyPerformance?.revenue || 0).toLocaleString()}
            </div>
          </div>
          <div className="summary-card">
            <h4>予約数</h4>
            <div className="summary-value">
              {data?.monthlyPerformance?.reservations || 0}件
            </div>
          </div>
          <div className="summary-card">
            <h4>顧客数</h4>
            <div className="summary-value">
              {data?.monthlyPerformance?.customers || 0}人
            </div>
          </div>
          <div className="summary-card">
            <h4>客単価</h4>
            <div className="summary-value">
              ¥{(data?.monthlyPerformance?.avgSpend || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* LINE Analytics */}
      <div className="line-analytics-section">
        <h3>LINE分析</h3>
        <div className="analytics-grid">
          <div className="analytics-item">
            <div className="analytics-header">
              <BarChart3 size={20} />
              <span>総メッセージ数</span>
            </div>
            <div className="analytics-value">
              {data?.lineAnalytics?.totalMessages || 0}件
            </div>
          </div>
          
          <div className="analytics-item">
            <div className="analytics-header">
              <TrendingUp size={20} />
              <span>応答率</span>
            </div>
            <div className="analytics-value">
              {((data?.lineAnalytics?.responseRate || 0) * 100).toFixed(1)}%
            </div>
          </div>
          
          <div className="analytics-item">
            <div className="analytics-header">
              <Users size={20} />
              <span>リッチメニュー利用</span>
            </div>
            <div className="analytics-value">
              {data?.lineAnalytics?.richMenuUsage || 0}回
            </div>
          </div>
        </div>

        <div className="popular-buttons">
          <h4>人気ボタン</h4>
          <div className="button-list">
            {data?.lineAnalytics?.popularButtons?.map((buttonId, index) => (
              <div key={buttonId} className="button-item">
                <span className="button-rank">{index + 1}</span>
                <span className="button-name">
                  {buttonId === 'reserve' ? '🍽️ 予約' :
                   buttonId === 'chat' ? '💬 チャット' :
                   buttonId === 'menu' ? '📋 メニュー' : buttonId}
                </span>
              </div>
            )) || []}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="insights-section">
        <h3>パフォーマンス分析</h3>
        <div className="insights-grid">
          <div className="insight-card positive">
            <div className="insight-icon">📈</div>
            <div className="insight-content">
              <h4>好調な指標</h4>
              <p>予約数が前月比15%増加しています</p>
            </div>
          </div>
          
          <div className="insight-card neutral">
            <div className="insight-icon">📊</div>
            <div className="insight-content">
              <h4>改善の余地</h4>
              <p>LINE応答率をさらに向上させる機会があります</p>
            </div>
          </div>
          
          <div className="insight-card recommendation">
            <div className="insight-icon">💡</div>
            <div className="insight-content">
              <h4>おすすめ施策</h4>
              <p>人気メニューのリッチメニュー追加を検討してください</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsTab;