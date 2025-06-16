import React from 'react';
import { CreditCard, Calendar, DollarSign, CheckCircle } from 'lucide-react';

const BillingTab = ({ data }) => {
  const getPlanName = (plan) => {
    switch (plan) {
      case 'entry': return 'エントリープラン';
      case 'standard': return 'スタンダードプラン';
      case 'pro': return 'プロプラン';
      default: return plan;
    }
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'entry': return 'var(--info-500)';
      case 'standard': return 'var(--success-500)';
      case 'pro': return 'var(--chart-purple)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h2>請求情報</h2>
        <p>プラン詳細と請求履歴を確認</p>
      </div>
      
      {/* Current Plan */}
      <div className="billing-overview">
        <div className="current-plan-card">
          <div className="plan-header">
            <div className="plan-badge" style={{ backgroundColor: getPlanColor(data?.plan) }}>
              {getPlanName(data?.plan)}
            </div>
            <div className="plan-status">
              <CheckCircle size={16} />
              <span>有効</span>
            </div>
          </div>
          
          <div className="plan-details">
            <div className="plan-price">
              <DollarSign size={20} />
              <span className="price-amount">¥{data?.monthlyFee?.toLocaleString() || 0}</span>
              <span className="price-period">/月</span>
            </div>
            
            <div className="next-billing">
              <Calendar size={16} />
              <span>次回請求日: {data?.nextBillingDate || '-'}</span>
            </div>
          </div>
        </div>

        <div className="payment-method-card">
          <div className="payment-header">
            <CreditCard size={20} />
            <h4>支払い方法</h4>
          </div>
          
          <div className="payment-details">
            <div className="card-info">
              <span className="card-type">
                {data?.paymentMethod === 'credit_card' ? 'クレジットカード' : '銀行振込'}
              </span>
              {data?.cardLast4 && (
                <span className="card-number">**** **** **** {data.cardLast4}</span>
              )}
            </div>
            
            <button className="btn-secondary">
              支払い方法を変更
            </button>
          </div>
        </div>
      </div>

      {/* Plan Features */}
      <div className="plan-features-section">
        <h3>現在のプラン機能</h3>
        <div className="features-grid">
          <div className="feature-item">
            <CheckCircle size={16} />
            <span>基本チャットボット</span>
          </div>
          <div className="feature-item">
            <CheckCircle size={16} />
            <span>予約管理</span>
          </div>
          <div className="feature-item">
            <CheckCircle size={16} />
            <span>LINE連携</span>
          </div>
          <div className="feature-item">
            <CheckCircle size={16} />
            <span>月次レポート</span>
          </div>
          {data?.plan === 'pro' && (
            <>
              <div className="feature-item">
                <CheckCircle size={16} />
                <span>高度な分析</span>
              </div>
              <div className="feature-item">
                <CheckCircle size={16} />
                <span>カスタムAI設定</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Billing History */}
      <div className="billing-history-section">
        <h3>請求履歴</h3>
        <div className="billing-table-container">
          <table className="billing-table">
            <thead>
              <tr>
                <th>請求日</th>
                <th>プラン</th>
                <th>金額</th>
                <th>ステータス</th>
                <th>アクション</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2024-12-01</td>
                <td>{getPlanName(data?.plan)}</td>
                <td>¥{data?.monthlyFee?.toLocaleString()}</td>
                <td>
                  <span className="status-badge paid">
                    <CheckCircle size={12} />
                    支払済み
                  </span>
                </td>
                <td>
                  <button className="btn-sm secondary">
                    領収書
                  </button>
                </td>
              </tr>
              <tr>
                <td>2024-11-01</td>
                <td>{getPlanName(data?.plan)}</td>
                <td>¥{data?.monthlyFee?.toLocaleString()}</td>
                <td>
                  <span className="status-badge paid">
                    <CheckCircle size={12} />
                    支払済み
                  </span>
                </td>
                <td>
                  <button className="btn-sm secondary">
                    領収書
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan Upgrade */}
      <div className="plan-upgrade-section">
        <h3>プランのアップグレード</h3>
        <p>より多くの機能をご利用になりたい場合は、上位プランへのアップグレードをご検討ください。</p>
        
        <div className="upgrade-actions">
          <button className="btn-primary">
            プランを変更
          </button>
          <button className="btn-secondary">
            プラン比較を見る
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillingTab;