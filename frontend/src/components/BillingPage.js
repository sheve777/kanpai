// C:\Users\acmsh\kanpAI\frontend\src\components\BillingPage.js
import React, { useState } from 'react';
import api from '../utils/axiosConfig.js';

const BillingPage = ({ storeId }) => {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const plans = {
    entry: 'price_1RVYiQRwa3DcK8z7tSohNy1J',
    standard: 'price_1RVYisRwa3DcK8z7pEQH8mhX',
    pro: 'price_1RVYjLRwa3DcK8z7FLysgkYc',
  };

  const handleCheckout = async (planCode, priceId) => {
    setLoading(planCode);
    try {
      const response = await api.post('/api/stripe/create-checkout-session', { priceId, storeId, planCode });
      const stripe = window.Stripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
      await stripe.redirectToCheckout({ sessionId: response.data.id });
    } catch (err) {
      alert("決済ページの準備に失敗しました。");
      setLoading(null);
    }
  };

  return (
    <div className="card billing-container">
      <div className="card-header">
        <div className="summary-icon">💳</div>
        <h2>プラン変更</h2>
      </div>
      <div className="plans">
        <div className="plan-card">
          <h4>エントリープラン</h4>
          <p className="price">¥10,000 / 月</p>
          <button onClick={() => handleCheckout('entry', plans.entry)} disabled={loading}>
            {loading === 'entry' ? '処理中' : 'このプランに変更'}
          </button>
        </div>
        <div className="plan-card">
          <h4>スタンダードプラン</h4>
          <p className="price">¥30,000 / 月</p>
          <button onClick={() => handleCheckout('standard', plans.standard)} disabled={loading}>
            {loading === 'standard' ? '処理中' : 'このプランに変更'}
          </button>
        </div>
        <div className="plan-card">
          <h4>プロプラン</h4>
          <p className="price">¥50,000 / 月</p>
          <button onClick={() => handleCheckout('pro', plans.pro)} disabled={loading}>
            {loading === 'pro' ? '処理中' : 'このプランに変更'}
          </button>
        </div>
      </div>
      {error && <p className="feedback error">{error}</p>}
    </div>
  );
};

export default BillingPage;
