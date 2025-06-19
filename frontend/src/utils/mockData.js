/**
 * Frontend店舗管理ダッシュボード用モックデータ
 */

import { isLocalEnv } from './environment.js';

// 現在の日付から過去・未来の日付を生成するヘルパー
const getDateOffset = (daysOffset) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString();
};

// 予約データ
export const mockReservations = [
  {
    id: 'res-001',
    customer_name: '田中 太郎',
    customer_phone: '090-1234-5678',
    date: getDateOffset(0), // 今日
    reservation_time: '19:00:00',
    end_time: '21:00',
    party_size: 4,
    status: 'confirmed',
    source: 'chatbot',
    seat_type_name: 'テーブル席',
    notes: '禁煙席希望',
    created_at: getDateOffset(-1)
  },
  {
    id: 'res-002', 
    customer_name: '佐藤 花子',
    customer_phone: '080-9876-5432',
    date: getDateOffset(1), // 明日
    reservation_time: '18:30:00',
    end_time: '20:30',
    party_size: 2,
    status: 'confirmed',
    source: 'web',
    seat_type_name: 'カウンター席',
    notes: 'アレルギー: 海老',
    created_at: getDateOffset(0)
  },
  {
    id: 'res-003',
    customer_name: '山田 一郎',
    customer_phone: '070-1111-2222',
    date: getDateOffset(0), // 今日
    reservation_time: '20:00:00',
    end_time: '22:00',
    party_size: 6,
    status: 'pending',
    source: 'phone',
    seat_type_name: '個室',
    notes: '歓送迎会',
    created_at: getDateOffset(0)
  },
  {
    id: 'res-004',
    customer_name: '鈴木 美咲',
    customer_phone: '090-3333-4444',
    date: getDateOffset(2), // 明後日
    reservation_time: '19:30:00',
    end_time: '21:30',
    party_size: 3,
    status: 'confirmed',
    source: 'chatbot',
    seat_type_name: 'テーブル席',
    notes: '',
    created_at: getDateOffset(-1)
  },
  {
    id: 'res-005',
    customer_name: '高橋 誠',
    customer_phone: '080-5555-6666',
    date: getDateOffset(-1), // 昨日
    reservation_time: '18:00:00',
    end_time: '20:00',
    party_size: 2,
    status: 'completed',
    source: 'web',
    seat_type_name: 'カウンター席',
    notes: '記念日ディナー',
    created_at: getDateOffset(-3)
  }
];

// メニューデータ
export const mockMenus = [
  {
    id: 'menu-001',
    name: '刺身盛り合わせ',
    category: '刺身',
    price: 1800,
    description: '新鮮な魚を厳選した刺身の盛り合わせ',
    available: true,
    image: null
  },
  {
    id: 'menu-002',
    name: '唐揚げ',
    category: '揚げ物',
    price: 800,
    description: 'ジューシーな鶏の唐揚げ',
    available: true,
    image: null
  },
  {
    id: 'menu-003',
    name: '焼き鳥盛り合わせ',
    category: '焼き物',
    price: 1200,
    description: '5種類の部位を楽しめる焼き鳥セット',
    available: true,
    image: null
  },
  {
    id: 'menu-004',
    name: 'サラダ',
    category: 'サラダ',
    price: 600,
    description: '新鮮野菜のシーザーサラダ',
    available: true,
    image: null
  },
  {
    id: 'menu-005',
    name: '日本酒飲み比べセット',
    category: 'ドリンク',
    price: 1500,
    description: '厳選された3種類の日本酒',
    available: false,
    image: null
  }
];

// 使用状況データ
export const mockUsageData = {
  currentMonth: {
    apiCalls: 2847,
    tokensUsed: 45620,
    lineMessages: 156,
    reservations: 89
  },
  limits: {
    apiCalls: 5000,
    tokensUsed: 100000,
    lineMessages: 500,
    reservations: 200
  },
  previousMonth: {
    apiCalls: 2234,
    tokensUsed: 38450,
    lineMessages: 123,
    reservations: 76
  },
  dailyUsage: Array.from({ length: 30 }, (_, i) => ({
    date: getDateOffset(-29 + i).slice(0, 10),
    apiCalls: Math.floor(Math.random() * 200) + 50,
    reservations: Math.floor(Math.random() * 10) + 1
  }))
};

// レポートデータ
export const mockReports = [
  {
    id: 'report-001',
    title: '2024年12月 月次レポート',
    type: 'monthly',
    date: '2024-12-01',
    status: 'delivered',
    summary: '売上前月比110%達成。リピート客が20%増加しました。',
    data: {
      revenue: 892000,
      customers: 156,
      averageSpend: 5718,
      repeatRate: 72
    }
  },
  {
    id: 'report-002',
    title: '2024年11月 月次レポート',
    type: 'monthly', 
    date: '2024-11-01',
    status: 'delivered',
    summary: '忘年会シーズンの需要増加により、売上が大幅に向上しました。',
    data: {
      revenue: 810000,
      customers: 142,
      averageSpend: 5704,
      repeatRate: 68
    }
  },
  {
    id: 'report-003',
    title: '2024年10月 月次レポート',
    type: 'monthly',
    date: '2024-10-01', 
    status: 'delivered',
    summary: '季節メニューが好評で、新規顧客の獲得に成功しています。',
    data: {
      revenue: 756000,
      customers: 134,
      averageSpend: 5642,
      repeatRate: 65
    }
  }
];

// LINE配信履歴
export const mockLineBroadcasts = [
  {
    id: 'broadcast-001',
    title: '年末年始営業時間のお知らせ',
    message: '🎍年末年始の営業時間をお知らせいたします...',
    sentAt: getDateOffset(-2),
    recipientCount: 234,
    status: 'sent'
  },
  {
    id: 'broadcast-002',
    title: '忘年会コース予約受付中',
    message: '🍻忘年会シーズンの特別コースをご用意しました...',
    sentAt: getDateOffset(-7),
    recipientCount: 189,
    status: 'sent'
  },
  {
    id: 'broadcast-003',
    title: '12月限定メニューのご案内',
    message: '🐟冬の味覚を楽しめる限定メニューが登場...',
    sentAt: getDateOffset(-14),
    recipientCount: 156,
    status: 'sent'
  }
];

// 通知・アラートデータ
export const mockNotices = [
  {
    id: 'notice-001',
    type: 'new_reservation',
    title: '新しい予約が入りました',
    message: '田中様より4名での予約が入りました（今日 19:00）',
    timestamp: getDateOffset(0),
    read: false,
    priority: 'high'
  },
  {
    id: 'notice-002',
    type: 'new_report',
    title: '月次レポートが配信されました',
    message: '12月の月次レポートが管理システムより配信されました',
    timestamp: getDateOffset(-1),
    read: false,
    priority: 'medium'
  },
  {
    id: 'notice-003',
    type: 'usage_warning',
    title: 'API使用量が上限に近づいています',
    message: '今月のAPI使用量が80%に達しました',
    timestamp: getDateOffset(-3),
    read: true,
    priority: 'low'
  }
];

// 請求・料金データ
export const mockBillingData = {
  currentPlan: 'standard',
  monthlyFee: 5980,
  currentUsage: {
    apiCalls: 2847,
    tokensUsed: 45620,
    additionalFees: 340
  },
  upcomingBill: {
    baseFee: 5980,
    usageFee: 340,
    total: 6320,
    dueDate: '2025-01-15'
  },
  paymentHistory: [
    {
      date: '2024-12-15',
      amount: 6120,
      status: 'paid',
      description: '12月分利用料金'
    },
    {
      date: '2024-11-15', 
      amount: 5980,
      status: 'paid',
      description: '11月分利用料金'
    }
  ]
};

/**
 * 環境に応じてモックデータまたは実際のAPIレスポンスを返す
 */
export const getMockDataIfLocal = (realData, mockData) => {
  return isLocalEnv() ? mockData : realData;
};

// APIモック関数
export const mockApiCall = (mockData, delay = 800) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: mockData
      });
    }, delay);
  });
};