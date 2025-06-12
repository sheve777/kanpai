// C:\Users\acmsh\kanpAI\frontend\src\utils\axiosConfig.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002',
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター：すべてのリクエストにJWTトークンを追加
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kanpai_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター：401エラーでログイン画面へ
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // トークンが無効または期限切れ
      localStorage.removeItem('kanpai_store_id');
      localStorage.removeItem('kanpai_auth_token');
      localStorage.removeItem('kanpai_store_name');
      
      // ログイン画面へリダイレクト
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
