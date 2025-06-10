// C:\Users\acmsh\kanpAI\frontend\src\components\AdditionalServices.js
import React, { useState } from 'react';
import api from '../utils/axiosConfig.js';

const AdditionalServices = ({ storeId }) => {
    const [loading, setLoading] = useState(null);

    const products = {
        points_100: 'price_1RVYnlRwa3DcK8z7d1Xxcd1k',
        points_200: 'price_1RVYoDRwa3DcK8z7O9eK99ol',
        points_500: 'price_1RVYoWRwa3DcK8z7hvjQiwul',
        menu_update: 'price_1RVYotRwa3DcK8z7E6YhHTHX',
        bot_change: 'price_1RVYpERwa3DcK8z7lSSBuC0G',
        line_change: 'price_1RVYpVRwa3DcK8z7MIWtkyj2',
    };

    const handleCheckout = async (productId, priceId) => {
        console.log('🛒 決済開始:', { productId, priceId, storeId });
        setLoading(productId);
        try {
            console.log('📡 API呼び出し開始...');
            const response = await api.post('/api/stripe/create-checkout-session', {
                priceId: priceId,
                storeId: storeId,
                mode: 'payment'
            });
            
            console.log('✅ API応答受信:', response.data);
            
            if (!window.Stripe) {
                console.error('❌ Stripe.jsが読み込まれていません');
                alert("Stripe.jsの読み込みに失敗しました。ページを再読み込みしてください。");
                return;
            }
            
            console.log('🔐 Stripe公開キー:', process.env.REACT_APP_STRIPE_PUBLIC_KEY);
            const stripe = window.Stripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
            
            console.log('🔄 Stripe決済ページにリダイレクト中...');
            const result = await stripe.redirectToCheckout({ sessionId: response.data.id });
            
            if (result.error) {
                console.error('❌ Stripeリダイレクトエラー:', result.error);
                alert(`決済ページへの移動に失敗しました: ${result.error.message}`);
            }
        } catch (err) {
            console.error('❌ 決済処理中にエラーが発生しました:', err);
            console.error('   エラー詳細:', err.response?.data);
            
            let errorMessage = "決済ページの準備に失敗しました。";
            if (err.response?.data?.details) {
                errorMessage += `\\n詳細: ${err.response.data.details}`;
            }
            if (err.response?.data?.code) {
                errorMessage += `\\nエラーコード: ${err.response.data.code}`;
            }
            
            alert(errorMessage);
        } finally {
            setLoading(null);
        }
    };

    // storeIdが渡されていない場合の警告
    if (!storeId) {
        console.warn('⚠️ storeIdが設定されていません');
        return (
            <div className="card additional-services-container">
                <div className="card-header">
                    <div className="summary-icon">⚡</div>
                    <h2>追加サービス (従量課金)</h2>
                </div>
                <p style={{color: 'red'}}>店舗IDが設定されていません。管理者にお問い合わせください。</p>
            </div>
        );
    }

    return (
        <div className="card additional-services-container">
            <div className="card-header">
                <div className="summary-icon">⚡</div>
                <h2>追加サービス (従量課金)</h2>
            </div>
            <div className="service-item">
                <h4>🔋 チャットボット追加ポイント</h4>
                <div className="point-options">
                    <button className="secondary-button" onClick={() => handleCheckout('points_100', products.points_100)} disabled={loading}>
                        {loading === 'points_100' ? '処理中...' : '100pt (3,000円)'}
                    </button>
                    <button className="secondary-button" onClick={() => handleCheckout('points_200', products.points_200)} disabled={loading}>
                        {loading === 'points_200' ? '処理中...' : '200pt (5,000円)'}
                    </button>
                    <button className="secondary-button" onClick={() => handleCheckout('points_500', products.points_500)} disabled={loading}>
                        {loading === 'points_500' ? '処理中...' : '500pt (10,000円)'}
                    </button>
                </div>
            </div>
            <div className="service-item">
                <h4>📝 メニュー操作追加</h4>
                <p>※今月あと◯回利用可能 
                    <button className="secondary-button" onClick={() => handleCheckout('menu_update', products.menu_update)} disabled={loading}>
                        {loading === 'menu_update' ? '処理中...' : '5,000円/回で購入'}
                    </button>
                </p>
            </div>
            <div className="service-item">
                <h4>🎨 チャットボット人格変更</h4>
                <p>話し方・キャラクター設定変更 
                    <button className="secondary-button" onClick={() => handleCheckout('bot_change', products.bot_change)} disabled={loading}>
                        {loading === 'bot_change' ? '処理中...' : '5,000円で購入'}
                    </button>
                </p>
            </div>
             <div className="service-item">
                <h4>📱 LINE公式プラン変更代行</h4>
                <p>複雑な手続きを代行します 
                    <button className="secondary-button" onClick={() => handleCheckout('line_change', products.line_change)} disabled={loading}>
                        {loading === 'line_change' ? '処理中...' : '10,000円で依頼'}
                    </button>
                </p>
            </div>
        </div>
    );
};
export default AdditionalServices;
