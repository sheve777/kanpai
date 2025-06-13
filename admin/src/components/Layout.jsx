import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart3,
  Store,
  FileText,
  DollarSign,
  Settings,
  MessageSquare,
  Bell,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'ダッシュボード',
      icon: BarChart3,
      path: '/',
      active: location.pathname === '/'
    },
    {
      id: 'stores',
      label: '店舗管理',
      icon: Store,
      path: '/stores',
      active: location.pathname === '/stores'
    },
    {
      id: 'reports',
      label: 'レポート',
      icon: FileText,
      path: '/reports',
      active: location.pathname === '/reports'
    },
    {
      id: 'revenue',
      label: '収益管理',
      icon: DollarSign,
      path: '/revenue',
      active: location.pathname === '/revenue'
    },
    {
      id: 'system',
      label: 'システム',
      icon: Settings,
      path: '/system',
      active: location.pathname === '/system'
    },
    {
      id: 'support',
      label: 'サポート',
      icon: MessageSquare,
      path: '/support',
      active: location.pathname === '/support'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    if (window.confirm('ログアウトしますか？')) {
      logout();
    }
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.setAttribute('data-theme', darkMode ? 'light' : 'dark');
  };

  return (
    <div className={`admin-layout ${darkMode ? 'dark' : 'light'}`}>
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="logo">
            <span className="logo-icon">🏮</span>
            <span className="logo-text">kanpAI Admin</span>
          </div>
        </div>
        
        <div className="header-right">
          <button className="header-btn">
            <Bell size={18} />
          </button>
          <button className="header-btn" onClick={toggleTheme}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="admin-info">
            <User size={16} />
            <span>{admin?.fullName || admin?.username || '管理者'}</span>
          </div>
          <button className="header-btn logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} 
           onClick={() => setSidebarOpen(false)} />
      
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <nav className="sidebar-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${item.active ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;