/**
 * 環境設定ユーティリティ
 * Frontend店舗管理ダッシュボード用
 */

/**
 * ローカル/開発環境の判定
 * @returns {boolean} ローカル環境かどうか
 */
export const isLocalEnv = () => {
  return process.env.NODE_ENV === 'development' || 
         window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1';
};

/**
 * 本番環境の判定
 * @returns {boolean} 本番環境かどうか
 */
export const isProduction = () => {
  return process.env.NODE_ENV === 'production' && !isLocalEnv();
};

/**
 * デモ用店舗情報
 */
export const mockStores = [
  {
    id: 'demo-store-001',
    name: '居酒屋 花まる 渋谷店',
    location: '東京都渋谷区',
    plan: 'standard'
  },
  {
    id: 'demo-store-002', 
    name: '海鮮居酒屋 大漁丸',
    location: '東京都新宿区',
    plan: 'pro'
  },
  {
    id: 'demo-store-003',
    name: '串焼き専門店 炭火屋',
    location: '東京都世田谷区', 
    plan: 'entry'
  },
  {
    id: 'demo-store-004',
    name: '創作和食 風花',
    location: '東京都品川区',
    plan: 'standard'
  },
  {
    id: 'demo-store-005',
    name: '昭和レトロ居酒屋 のんべえ横丁',
    location: '東京都台東区',
    plan: 'pro'
  }
];

/**
 * デモ用ログイン認証
 * @param {string} storeId 
 * @param {string} password 
 * @returns {Promise<Object>} ログイン結果
 */
export const mockLogin = (storeId, password) => {
  return new Promise((resolve, reject) => {
    // リアルなレスポンス時間をシミュレート
    setTimeout(() => {
      // 任意の店舗IDを許可（デモ用）
      if (!storeId.trim()) {
        reject(new Error('店舗IDを入力してください'));
        return;
      }

      // パスワードチェック - 環境変数から取得
      const validPasswords = (process.env.REACT_APP_DEMO_PASSWORDS || 'kanpai123,demo,admin123').split(',');
      if (!validPasswords.includes(password)) {
        reject(new Error('パスワードが正しくありません'));
        return;
      }

      // 対応する店舗を探すか、最初の店舗を使用
      let store = mockStores.find(s => s.id === storeId);
      if (!store) {
        // 任意の店舗IDでも最初の店舗情報を使用
        store = {
          ...mockStores[0],
          id: storeId,
          name: storeId + ' (デモ店舗)'
        };
      }

      // 成功レスポンス
      resolve({
        success: true,
        token: 'mock-jwt-token-' + Date.now(),
        store: {
          id: store.id,
          name: store.name,
          location: store.location,
          plan: store.plan
        }
      });
    }, 800); // 800ms のレスポンス時間
  });
};

/**
 * ログレベル設定
 */
export const logger = {
  log: (...args) => {
    if (!isProduction()) {
      console.log(...args);
    }
  },
  warn: (...args) => {
    if (!isProduction()) {
      console.warn(...args);
    }
  },
  error: (...args) => {
    console.error(...args); // エラーは本番でも出力
  }
};