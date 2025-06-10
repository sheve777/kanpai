// C:\Users\acmsh\kanpAI\backend\src\routes\stripeRoutes.js
import express from 'express';
import Stripe from 'stripe';
import pool from '../config/db.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_API_KEY);

// ★★★ Webhook処理を完全に復元 ★★★
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log(`❌ Webhook署名の検証に失敗しました:`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log('✅ 決済完了イベントを受信しました:', session.id);
        // TODO: データベース更新処理
    }
    res.status(200).json({ received: true });
});

/**
 * Stripeの決済ページセッションを作成するAPI (サブスク・一括払いの両対応)
 */
router.post('/create-checkout-session', express.json(), async (req, res) => {
    console.log('🔄 決済セッション作成リクエスト受信:', req.body);
    
    const { priceId, storeId, planCode, mode = 'subscription' } = req.body;
    
    console.log('📝 リクエストパラメータ:', {
        priceId,
        storeId,
        planCode,
        mode
    });
    
    if (!priceId || !storeId) {
        console.log('❌ 必須パラメータが不足:', { priceId: !!priceId, storeId: !!storeId });
        return res.status(400).json({ error: '価格IDと店舗IDは必須です。' });
    }
    
    const checkoutOptions = {
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: mode,
        client_reference_id: storeId,
        success_url: `http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:3000/payment-canceled`,
    };
    
    if (mode === 'subscription' && planCode) {
        checkoutOptions.metadata = { store_id: storeId, plan_code: planCode };
    } else if (mode === 'payment') {
        checkoutOptions.metadata = { store_id: storeId, price_id: priceId };
    }
    
    console.log('⚙️ Stripe決済オプション:', checkoutOptions);
    
    try {
        console.log('🔄 Stripe決済セッション作成開始...');
        const session = await stripe.checkout.sessions.create(checkoutOptions);
        console.log('✅ Stripe決済セッション作成成功:', session.id);
        res.json({ id: session.id });
    } catch (error) {
        console.error('❌ Stripe決済セッションの作成中にエラーが発生しました:');
        console.error('   エラーメッセージ:', error.message);
        console.error('   エラーコード:', error.code);
        console.error('   エラー詳細:', error);
        res.status(500).json({ 
            error: '決済ページの作成に失敗しました。',
            details: error.message,
            code: error.code
        });
    }
});

export default router;
