// C:\Users\acmsh\kanpAI\backend\src\routes\demoRoutes.js
import express from 'express';

const router = express.Router();

// 使用量状況のデモレスポンス
router.get('/usage/status', (req, res) => {
  const { store_id } = req.query;
  
  console.log(`📝 デモモード: 使用量状況 (${store_id})`);
  
  res.json({
    success: true,
    usage: {
      chat_messages: 150,
      reservations: 25,
      line_broadcasts: 8,
      menu_operations: 12
    },
    limits: {
      chat_messages: 1000,
      reservations: 100,
      line_broadcasts: 30,
      menu_operations: 50
    },
    plan: {
      name: 'スタンダードプラン',
      price: 5980
    }
  });
});

// ダッシュボードサマリーのデモレスポンス
router.get('/dashboard/summary', (req, res) => {
  const { store_id } = req.query;
  
  console.log(`📝 デモモード: ダッシュボードサマリー (${store_id})`);
  
  res.json({
    success: true,
    summary: {
      todayReservations: 8,
      tomorrowReservations: 12,
      weeklyReservations: 45,
      monthlyRevenue: 125000,
      popularMenu: '唐揚げ',
      averageRating: 4.5
    }
  });
});

// LINE使用状況のデモレスポンス
router.get('/line/usage-status', (req, res) => {
  const { store_id } = req.query;
  
  console.log(`📝 デモモード: LINE使用状況 (${store_id})`);
  
  res.json({
    success: true,
    friendsCount: 234,
    lineOfficialPlan: {
      alertLevel: 'normal',
      usagePercentage: 25,
      currentUsage: 1250,
      limit: 5000
    },
    line_usage: {
      messages_sent: 45,
      messages_limit: 100,
      friends_count: 234,
      broadcasts_sent: 8,
      broadcasts_limit: 30
    },
    restrictions: {
      can_send: true,
      warning_level: 'normal'
    }
  });
});

// 予約関連のデモレスポンス
router.get('/reservations/business-status', (req, res) => {
  const { store_id } = req.query;
  
  console.log(`📝 デモモード: 営業状況 (${store_id})`);
  
  res.json({
    success: true,
    business_status: {
      is_open: true,
      next_opening: null,
      current_capacity: 65,
      max_capacity: 100
    }
  });
});

router.get('/reservations', (req, res) => {
  const { store_id, period } = req.query;
  
  console.log(`📝 デモモード: 予約一覧 (${store_id}, ${period})`);
  
  const demoReservations = [
    {
      id: 1,
      customer_name: '田中太郎',
      customer_phone: '090-1234-5678',
      party_size: 4,
      reservation_time: '19:00',
      end_time: '21:00',
      status: 'confirmed',
      source: 'chatbot',
      notes: '禁煙席希望',
      seat_type_name: 'テーブル席'
    },
    {
      id: 2,
      customer_name: '佐藤花子',
      customer_phone: '090-2345-6789',
      party_size: 2,
      reservation_time: '20:30',
      end_time: '22:30',
      status: 'confirmed',
      source: 'web',
      notes: '窓際席希望',
      seat_type_name: 'カウンター席'
    },
    {
      id: 3,
      customer_name: '山田次郎',
      customer_phone: '090-3456-7890',
      party_size: 6,
      reservation_time: '18:00',
      end_time: '20:00',
      status: 'confirmed',
      source: 'phone',
      notes: 'お誕生日',
      seat_type_name: '座敷'
    }
  ];
  
  res.json({
    success: true,
    reservations: demoReservations
  });
});

// レポート関連のデモレスポンス
router.get('/reports', (req, res) => {
  const { store_id } = req.query;
  
  console.log(`📝 デモモード: レポート一覧 (${store_id})`);
  
  const demoReports = [
    {
      id: 1,
      title: '2024年12月 月次レポート',
      report_month: '2024-12-01',
      period: '2024-12',
      generated_at: '2024-12-31T23:59:59Z',
      status: 'completed',
      plan_type: 'pro'
    },
    {
      id: 2,
      title: '2024年11月 月次レポート',
      report_month: '2024-11-01',
      period: '2024-11',
      generated_at: '2024-11-30T23:59:59Z',
      status: 'completed',
      plan_type: 'standard'
    }
  ];
  
  res.json({
    success: true,
    reports: demoReports
  });
});

// 店舗メニューのデモレスポンス（storesルートの代替）
router.get('/stores/:storeId/menus', (req, res) => {
  const { storeId } = req.params;
  
  console.log(`📝 デモモード: 店舗メニュー (${storeId})`);
  
  const demoMenus = [
    {
      id: 1,
      name: '生ビール',
      category: 'ドリンク',
      price: 500,
      description: 'キンキンに冷えたビールです'
    },
    {
      id: 2,
      name: '唐揚げ',
      category: '揚げ物',
      price: 650,
      description: 'ジューシーな鶏の唐揚げ'
    },
    {
      id: 3,
      name: '刺身盛り合わせ',
      category: '刺身',
      price: 1200,
      description: '新鮮な魚の刺身'
    }
  ];
  
  res.json(demoMenus);
});

// 店舗情報のデモレスポンス
router.get('/stores/:storeId/info', (req, res) => {
  const { storeId } = req.params;
  
  console.log(`📝 デモモード: 店舗情報 (${storeId})`);
  
  const demoStore = {
    id: storeId,
    name: `店舗 ${storeId}`,
    phone: '03-1234-5678',
    address: '東京都渋谷区テスト1-2-3',
    concept: 'アットホームな居酒屋です',
    operating_hours: {
      monday: { open: '17:00', close: '23:00' },
      tuesday: { open: '17:00', close: '23:00' },
      wednesday: { open: '17:00', close: '23:00' },
      thursday: { open: '17:00', close: '23:00' },
      friday: { open: '17:00', close: '24:00' },
      saturday: { open: '16:00', close: '24:00' },
      sunday: { open: '16:00', close: '22:00' }
    }
  };
  
  res.json(demoStore);
});

// LINE配信履歴のデモレスポンス
router.get('/line/history', (req, res) => {
  const { store_id } = req.query;
  
  console.log(`📝 デモモード: LINE配信履歴 (${store_id})`);
  
  const demoBroadcastHistory = [
    {
      id: 1,
      message_text: '本日の特別メニューをご案内！季節の野菜を使った美味しい料理をご用意しています。',
      image_url: null,
      sent_at: '2024-12-06T18:00:00Z',
      recipient_count: 234,
      status: 'sent'
    },
    {
      id: 2,
      message_text: '年末の忘年会予約受付中！お早めにご連絡ください。',
      image_url: '/uploads/bonenkai-image.jpg',
      sent_at: '2024-12-05T15:30:00Z',
      recipient_count: 230,
      status: 'sent'
    },
    {
      id: 3,
      message_text: '本日は誠にありがとうございました。明日も皆様のお越しをお待ちしております。',
      image_url: null,
      sent_at: '2024-12-04T22:00:00Z',
      recipient_count: 228,
      status: 'sent'
    }
  ];
  
  res.json(demoBroadcastHistory);
});

// 個別レポート詳細のデモレスポンス
router.get('/reports/:reportId', (req, res) => {
  const { reportId } = req.params;
  
  console.log(`📝 デモモード: レポート詳細 (${reportId})`);
  
  const demoReportDetail = {
    id: parseInt(reportId),
    title: `2024年${reportId === '1' ? '12' : '11'}月 月次レポート`,
    report_month: reportId === '1' ? '2024-12-01' : '2024-11-01',
    generated_at: reportId === '1' ? '2024-12-31T23:59:59Z' : '2024-11-30T23:59:59Z',
    status: 'completed',
    plan_type: reportId === '1' ? 'pro' : 'standard',
    data: {
      summary: {
        totalReservations: reportId === '1' ? 156 : 142,
        totalRevenue: reportId === '1' ? 780000 : 710000,
        averagePartySize: reportId === '1' ? 3.2 : 3.1,
        popularDish: reportId === '1' ? '唐揚げ' : '刺身盛り合わせ'
      },
      reservations: {
        bySource: {
          chatbot: reportId === '1' ? 89 : 85,
          web: reportId === '1' ? 45 : 38,
          phone: reportId === '1' ? 22 : 19
        },
        byTime: {
          '17:00-19:00': reportId === '1' ? 45 : 42,
          '19:00-21:00': reportId === '1' ? 78 : 72,
          '21:00-23:00': reportId === '1' ? 33 : 28
        }
      },
      revenue: {
        daily: Array.from({length: 30}, (_, i) => ({
          date: `2024-${reportId === '1' ? '12' : '11'}-${String(i + 1).padStart(2, '0')}`,
          amount: Math.floor(Math.random() * 50000) + 20000
        })),
        byCategory: {
          food: reportId === '1' ? 520000 : 470000,
          drinks: reportId === '1' ? 260000 : 240000
        }
      }
    }
  };
  
  res.json({
    success: true,
    report: demoReportDetail
  });
});

// レポート生成のデモレスポンス
router.post('/reports/generate', (req, res) => {
  const { store_id, report_month, plan_type } = req.body;
  
  console.log(`📝 デモモード: レポート生成 (店舗=${store_id}, 月=${report_month}, プラン=${plan_type})`);
  
  // デモ用のAI生成風レポート
  const demoReportContent = generateDemoReport(store_id, report_month, plan_type);
  
  const newReport = {
    id: Date.now(), // 簡易ID生成
    store_id,
    report_month,
    plan_type,
    report_content: demoReportContent,
    status: 'completed',
    generated_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  };
  
  res.status(201).json({
    success: true,
    message: 'デモレポートを生成しました',
    report: newReport
  });
});

// デモ用レポート生成関数
const generateDemoReport = (storeId, reportMonth, planType) => {
  const storeName = `デモ店舗 ${storeId}`;
  const year = reportMonth.substring(0, 4);
  const month = reportMonth.substring(5, 7);
  
  switch (planType) {
    case 'entry':
      return `# ${storeName} ${year}年${month}月 基本レポート

## 📊 今月の基本数値

📞 **チャット対応件数**: 45件
📅 **予約件数**: 23件  
📨 **LINE配信回数**: 3回

## 💡 もっと詳しく知りたくありませんか？

**スタンダードプランなら、さらに詳しい分析をご覧いただけます！**

プラン変更のご相談はサポートまで 📞`;

    case 'standard':
      return `# ${storeName} ${year}年${month}月 月次分析レポート

## 🎯 今月のハイライト

✅ **チャット対応**: 45件（前月比+15%↗️）
✅ **予約獲得**: 23件（前月比+8%↗️）
✅ **LINE配信**: 3回（安定運用中）

## 📈 詳細分析

### よく聞かれた質問TOP5
1位: 営業時間について (12件)
2位: メニューについて (8件)
3位: アクセス方法について (6件)
4位: 予約方法について (5件)
5位: 支払い方法について (4件)

### 💡 改善提案
1. アクセス情報の充実化
2. メニュー説明の強化
3. 混雑時間帯の分散施策

今月もお疲れ様でした！`;

    case 'pro':
      return `# ${storeName} ${year}年${month}月 戦略分析レポート

## 🏆 エグゼクティブサマリー

当月は顧客エンゲージメント向上により、予約獲得率が8%向上しました。特にチャットボット経由での問い合わせ増加が目立ちます。

## 📊 詳細KPI分析

### 重要指標
- **チャット対応率**: 98.2%（業界平均85%を上回る）
- **予約転換率**: 51.1%（前月比+3.2%）
- **顧客満足度**: 4.3/5.0（推定）

### 競合ベンチマーク
同エリア居酒屋平均と比較して：
- チャット対応数: +28%
- 予約獲得数: +31%
- LINE活用度: +45%

## 🎯 戦略的改善提案

### 短期施策（1ヶ月以内）
1. **アクセス情報の最適化**
   - 効果予測: 問い合わせ15%削減
   - ROI: 約120%

### 中期施策（3ヶ月以内）
1. **メニュー訴求強化**
   - 売上向上予測: +8-12%
   - 投資回収期間: 2ヶ月

### 長期戦略（6ヶ月以内）
1. **顧客ロイヤルティプログラム**
   - リピート率向上: +25%
   - LTV向上: +40%

## 📈 来月の数値目標
- チャット対応: 50件（+11%）
- 予約獲得: 25件（+9%）
- 売上: 前月比+10%

戦略的経営により持続的成長を実現しましょう！`;

    default:
      return generateDemoReport(storeId, reportMonth, 'entry');
  }
};

export default router;