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
  const storeId = "8fbff969-5212-4387-ae62-cc33944edef2";
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard', 'reportDetail', 'reservation'
  const [selectedReportId, setSelectedReportId] = useState(null);

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

  // URL パラメータで予約ページへの直接アクセスを処理
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('page') === 'reservation') {
      setCurrentPage('reservation');
    } else if (urlParams.get('page') === 'standalone-reservation') {
      setCurrentPage('standalone-reservation');
    }
  }, []);

  return (
    <Router>
      <div className="App-container">
        {currentPage !== 'reservation' && currentPage !== 'standalone-reservation' && <Header />}
        
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
            ) : null
          } />
          <Route path="/menu-management" element={<MenuManagementPage storeId={storeId} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
