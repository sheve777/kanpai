import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import StoreManagement from './components/StoreManagement';
import ReportManagement from './components/ReportManagement';
import RevenueManagement from './components/RevenueManagement';
import BackupExport from './components/BackupExport';
import SystemSettings from './components/SystemSettings';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // ローカル環境では認証をスキップ
  const isLocalhost = window.location.hostname === 'localhost';
  
  if (loading && !isLocalhost) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>読み込み中...</p>
      </div>
    );
  }
  
  // ローカル環境または認証済みの場合はアクセス許可
  return (isAuthenticated || isLocalhost) ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { isAuthenticated } = useAuth();
  const isLocalhost = window.location.hostname === 'localhost';

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              (isAuthenticated || isLocalhost) ? <Navigate to="/" /> : <LoginPage />
            } 
          />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/stores" 
            element={
              <ProtectedRoute>
                <Layout>
                  <StoreManagement />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ReportManagement />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/revenue" 
            element={
              <ProtectedRoute>
                <Layout>
                  <RevenueManagement />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/backup" 
            element={
              <ProtectedRoute>
                <Layout>
                  <BackupExport />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/system" 
            element={
              <ProtectedRoute>
                <Layout>
                  <SystemSettings />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App
