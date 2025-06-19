/**
 * 環境設定ユーティリティ
 * 開発環境とローカル環境の判定を一元管理
 */

/**
 * ローカル/開発環境の判定
 * @returns {boolean} ローカル環境かどうか
 */
export const isLocalEnv = () => {
  return process.env.NODE_ENV === 'development' || 
         process.env.REACT_APP_ENV === 'local' ||
         window.location.hostname === 'localhost';
};

/**
 * 本番環境の判定
 * @returns {boolean} 本番環境かどうか
 */
export const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

/**
 * API基本URL取得
 * @returns {string} API基本URL
 */
export const getApiBaseUrl = () => {
  if (isLocalEnv()) {
    return process.env.REACT_APP_LOCAL_API_URL || 'http://localhost:3002';
  }
  return process.env.REACT_APP_API_URL || '/api';
};

/**
 * デモモードの判定
 * @returns {boolean} デモモードかどうか
 */
export const isDemoMode = () => {
  return process.env.REACT_APP_DEMO_MODE === 'true' || isLocalEnv();
};

/**
 * ログレベル設定
 * 本番環境では console.log を無効化
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