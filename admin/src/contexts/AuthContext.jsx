import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// API設定 - 環境変数で動的に設定
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://kanpai-plus.jp/api/admin';

// ローカル開発環境では認証をスキップ
const SKIP_AUTH_LOCAL = import.meta.env.VITE_SKIP_AUTH_LOCAL === 'true' || 
                       (!import.meta.env.VITE_API_BASE_URL && window.location.hostname === 'localhost');

// Axiosインスタンス作成
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('admin_token'));

  // Axiosインターセプターでトークンを自動追加
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const currentToken = localStorage.getItem('admin_token');
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // トークンが無効な場合はログアウト
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // 初期化時にトークンをチェック
  useEffect(() => {
    const initAuth = async () => {
      // ローカル環境では認証をスキップ
      if (SKIP_AUTH_LOCAL) {
        console.log('🏠 ローカル環境：認証をスキップして管理画面にアクセス');
        setIsAuthenticated(true);
        setAdmin({
          id: 'local-admin',
          username: 'admin',
          email: 'admin@kanpai.local',
          fullName: 'ローカル管理者'
        });
        setLoading(false);
        return;
      }

      const savedToken = localStorage.getItem('admin_token');
      
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        // トークンの有効性を確認
        const response = await api.get('/profile');
        
        if (response.data.success) {
          setIsAuthenticated(true);
          setAdmin(response.data.admin);
          setToken(savedToken);
        } else {
          // 無効なトークンを削除
          localStorage.removeItem('admin_token');
        }
      } catch (error) {
        console.error('認証確認エラー:', error);
        localStorage.removeItem('admin_token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      
      // ローカル環境では即座にログイン成功
      if (SKIP_AUTH_LOCAL) {
        console.log('🏠 ローカル環境：認証をスキップしてログイン成功');
        setIsAuthenticated(true);
        setAdmin({
          id: 'local-admin',
          username: 'admin',
          email: 'admin@kanpai.local',
          fullName: 'ローカル管理者'
        });
        return { success: true };
      }
      
      console.log('🔐 ログイン試行:', { username, API_URL: API_BASE_URL });
      
      const response = await api.post('/login', {
        username,
        password
      });
      
      console.log('✅ ログインレスポンス:', response.data);

      if (response.data.success) {
        const { token: newToken, admin: adminData } = response.data;
        
        // トークンを保存
        localStorage.setItem('admin_token', newToken);
        setToken(newToken);
        setAdmin(adminData);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.data.error || 'ログインに失敗しました' 
        };
      }
    } catch (error) {
      console.error('❌ ログインエラー詳細:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code
      });
      
      let errorMessage = 'ログインに失敗しました';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 404) {
        errorMessage = 'APIエンドポイントが見つかりません。バックエンドサーバーを確認してください。';
      } else if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
        errorMessage = 'バックエンドサーバー(localhost:3002)に接続できません。サーバーが起動しているか確認してください。';
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage = 'サーバーの応答がタイムアウトしました';
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'ネットワークエラー: バックエンドサーバーが起動しているか確認してください';
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setAdmin(null);
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    admin,
    loading,
    token,
    login,
    logout,
    api, // API インスタンスも提供
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};