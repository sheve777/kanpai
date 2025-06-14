// C:\Users\acmsh\kanpAI\frontend\src\App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import NoticeBoard from './components/NoticeBoard';
import UsageStatus from './components/UsageStatus';
import ReservationList from './components/ReservationList';
import LineBroadcast from './components/LineBroadcast';
import MenuWidget from './components/MenuWidget';
import MenuList from './components/MenuList';
import MenuManagementPage from './components/MenuManagementPage';
import ReportList from './components/ReportList';
import BillingPage from './components/BillingPage';
import AdditionalServices from './components/AdditionalServices';
import BasicInfo from './components/BasicInfo';
import ReportDetailPage from './components/ReportDetailPage';
import ReservationForm from './components/ReservationForm';
import StandaloneReservationPage from './components/StandaloneReservationPage';
import LoginPage from './components/LoginPage';
import { UsageProvider } from './contexts/UsageContext';
import './App.css';

const Dashboard = ({ storeId, onSelectReport }) => (
  <main>
    <NoticeBoard storeId={storeId} />
    <ReservationList storeId={storeId} />
    <LineBroadcast storeId={storeId} />
    <AdditionalServices storeId={storeId} />
    <MenuWidget storeId={storeId} />
    <UsageStatus storeId={storeId} />
    <ReportList storeId={storeId} onSelectReport={onSelectReport} />
    <BasicInfo />
    <BillingPage storeId={storeId} />
  </main>
);

function App() {
  const [storeId, setStoreId] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard', 'reportDetail', 'reservation'
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleSelectReport = (reportId) => {
    setSelectedReportId(reportId);
    setCurrentPage('reportDetail');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
    setSelectedReportId(null);
  };

  const handleReservationComplete = (reservationData) => {
    console.log('✅ 予約完了:', reservationData);
    // 必要に応じてダッシュボードに戻る
    // setCurrentPage('dashboard');
  };

  const handleLogin = (loginStoreId) => {
    console.log('🔓 ログイン成功:', loginStoreId);
    setStoreId(loginStoreId);
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
    
    // URLを更新（必要に応じて）
    const newUrl = `${window.location.pathname}?store=${loginStoreId}`;
    window.history.replaceState({}, '', newUrl);
    
    console.log('✅ 認証状態を更新しました');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setStoreId(null);
    localStorage.removeItem('kanpai_store_id');
    localStorage.removeItem('kanpai_auth_token');
    setCurrentPage('dashboard');
  };

  // 認証状態と店舗IDの初期化
  React.useEffect(() => {
    const initializeAuth = () => {
      // URLパラメータから店舗IDを取得
      const urlParams = new URLSearchParams(window.location.search);
      const urlStoreId = urlParams.get('store');
      
      // LocalStorageから認証情報を取得
      const savedStoreId = localStorage.getItem('kanpai_store_id');
      const savedAuthToken = localStorage.getItem('kanpai_auth_token');
      
      // 店舗IDの決定（URL優先、次にLocalStorage、最後にデフォルト）
      const finalStoreId = urlStoreId || savedStoreId || "8fbff969-5212-4387-ae62-cc33944edef2";
      
      setStoreId(finalStoreId);
      
      // 認証状態の判定
      if (savedAuthToken && savedStoreId === finalStoreId) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        // 認証されていない場合はローカルストレージをクリア
        localStorage.removeItem('kanpai_store_id');
        localStorage.removeItem('kanpai_auth_token');
      }
      
      // URL パラメータでページ指定がある場合の処理
      if (urlParams.get('page') === 'reservation') {
        setCurrentPage('reservation');
      } else if (urlParams.get('page') === 'standalone-reservation') {
        setCurrentPage('standalone-reservation');
      }
      
      setIsLoading(false);
    };
    
    initializeAuth();
  }, []);

  // ローディング中の表示
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-background)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 16px auto' }}></div>
          <p style={{ color: 'var(--color-text)', fontSize: '1rem' }}>
            システムを初期化中...
          </p>
        </div>
      </div>
    );
  }

  // 未認証の場合はログイン画面を表示
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="App-container">
      {isAuthenticated && currentPage !== 'reservation' && currentPage !== 'standalone-reservation' && (
        <Header onLogout={handleLogout} storeId={storeId} />
      )}
      
      {isAuthenticated ? (
        <Router>
          <UsageProvider storeId={storeId}>
            <Routes>
              <Route path="/" element={
                currentPage === 'dashboard' ? (
                  <Dashboard storeId={storeId} onSelectReport={handleSelectReport} />
                ) : currentPage === 'reportDetail' ? (
                <ReportDetailPage reportId={selectedReportId} onBack={handleBackToDashboard} />
              ) : currentPage === 'standalone-reservation' ? (
                <StandaloneReservationPage storeId={storeId} />
              ) : currentPage === 'reservation' ? (
                <div style={{
                  minHeight: '100vh',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '20px 0'
                }}>
                  {/* 予約ページ用ヘッダー */}
                  <div style={{
                    maxWidth: '600px',
                    margin: '0 auto 20px auto',
                    padding: '0 20px'
                  }}>
                    <button
                      onClick={handleBackToDashboard}
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: '2px solid rgba(255,255,255,0.3)',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '25px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '600',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.3)';
                        e.target.style.transform = 'translateX(-5px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.2)';
                        e.target.style.transform = 'translateX(0)';
                      }}
                    >
                      ← ダッシュボードに戻る
                    </button>
                  </div>
                  
                  <ReservationForm 
                    storeId={storeId} 
                    onReservationComplete={handleReservationComplete}
                  />
                </div>
              ) : (
                <Dashboard storeId={storeId} onSelectReport={handleSelectReport} />
              )
            } />
            <Route path="/menu-management" element={<MenuManagementPage storeId={storeId} />} />
          </Routes>
          </UsageProvider>
        </Router>
      ) : null}
    </div>
  );
}

export default App;
