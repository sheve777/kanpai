import React from 'react';
import { BarChart3, MessageSquare, Calendar, FileText, TrendingUp } from 'lucide-react';

const UsageTab = ({ data }) => {
  const usagePercentage = (used, limit) => {
    return limit ? Math.round((used / limit) * 100) : 0;
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'var(--error-500)';
    if (percentage >= 70) return 'var(--warning-500)';
    return 'var(--success-500)';
  };

  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h2>利用状況</h2>
        <p>今月のサービス利用状況とプラン制限</p>
      </div>
      
      <div className="usage-overview">
        <div className="usage-card">
          <div className="usage-header">
            <MessageSquare size={24} />
            <h3>API呼び出し</h3>
          </div>
          <div className="usage-stats">
            <div className="usage-numbers">
              <span className="current">{data?.currentMonth?.apiCalls?.toLocaleString() || 0}</span>
              <span className="limit">/ {data?.limit?.apiCalls?.toLocaleString() || 0}</span>
            </div>
            <div className="usage-bar">
              <div 
                className="usage-fill"
                style={{ 
                  width: `${usagePercentage(data?.currentMonth?.apiCalls, data?.limit?.apiCalls)}%`,
                  backgroundColor: getUsageColor(usagePercentage(data?.currentMonth?.apiCalls, data?.limit?.apiCalls))
                }}
              />
            </div>
            <div className="usage-percentage">
              {usagePercentage(data?.currentMonth?.apiCalls, data?.limit?.apiCalls)}%
            </div>
          </div>
        </div>

        <div className="usage-card">
          <div className="usage-header">
            <MessageSquare size={24} />
            <h3>LINEメッセージ</h3>
          </div>
          <div className="usage-stats">
            <div className="usage-numbers">
              <span className="current">{data?.currentMonth?.lineMessages?.toLocaleString() || 0}</span>
              <span className="limit">/ {data?.limit?.lineMessages?.toLocaleString() || 0}</span>
            </div>
            <div className="usage-bar">
              <div 
                className="usage-fill"
                style={{ 
                  width: `${usagePercentage(data?.currentMonth?.lineMessages, data?.limit?.lineMessages)}%`,
                  backgroundColor: getUsageColor(usagePercentage(data?.currentMonth?.lineMessages, data?.limit?.lineMessages))
                }}
              />
            </div>
            <div className="usage-percentage">
              {usagePercentage(data?.currentMonth?.lineMessages, data?.limit?.lineMessages)}%
            </div>
          </div>
        </div>

        <div className="usage-card">
          <div className="usage-header">
            <Calendar size={24} />
            <h3>予約処理</h3>
          </div>
          <div className="usage-stats">
            <div className="usage-numbers">
              <span className="current">{data?.currentMonth?.reservations?.toLocaleString() || 0}</span>
              <span className="limit">/ {data?.limit?.reservations?.toLocaleString() || 0}</span>
            </div>
            <div className="usage-bar">
              <div 
                className="usage-fill"
                style={{ 
                  width: `${usagePercentage(data?.currentMonth?.reservations, data?.limit?.reservations)}%`,
                  backgroundColor: getUsageColor(usagePercentage(data?.currentMonth?.reservations, data?.limit?.reservations))
                }}
              />
            </div>
            <div className="usage-percentage">
              {usagePercentage(data?.currentMonth?.reservations, data?.limit?.reservations)}%
            </div>
          </div>
        </div>

        <div className="usage-card">
          <div className="usage-header">
            <FileText size={24} />
            <h3>レポート生成</h3>
          </div>
          <div className="usage-stats">
            <div className="usage-numbers">
              <span className="current">{data?.currentMonth?.reports?.toLocaleString() || 0}</span>
              <span className="limit">/ {data?.limit?.reports?.toLocaleString() || 0}</span>
            </div>
            <div className="usage-bar">
              <div 
                className="usage-fill"
                style={{ 
                  width: `${usagePercentage(data?.currentMonth?.reports, data?.limit?.reports)}%`,
                  backgroundColor: getUsageColor(usagePercentage(data?.currentMonth?.reports, data?.limit?.reports))
                }}
              />
            </div>
            <div className="usage-percentage">
              {usagePercentage(data?.currentMonth?.reports, data?.limit?.reports)}%
            </div>
          </div>
        </div>
      </div>

      <div className="cost-summary">
        <div className="cost-card">
          <div className="cost-header">
            <TrendingUp size={20} />
            <h4>今月の利用料金</h4>
          </div>
          <div className="cost-amount">
            ¥{data?.currentMonth?.totalCost?.toLocaleString() || 0}
          </div>
        </div>
      </div>

      <div className="rich-menu-usage">
        <h3>リッチメニュー利用統計</h3>
        <div className="rich-menu-stats">
          <div className="stat-item">
            <span className="stat-label">総クリック数</span>
            <span className="stat-value">{data?.currentMonth?.richMenuClicks?.toLocaleString() || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageTab;