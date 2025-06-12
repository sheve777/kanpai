// C:\Users\acmsh\kanpAI\frontend\src\components\Header.js
import React from 'react';
import './Header.css';

const Header = ({ onLogout, storeId }) => {
  const formatStoreId = (id) => {
    if (!id) return '店舗ID未設定';
    // 長いUUIDを短縮表示
    if (id.length > 20) {
      return `${id.substring(0, 8)}...`;
    }
    return id;
  };

  return (
    <header className="app-header">
      <div className="logo">
        <span className="logo-icon">🍻</span>
        <h1>kanpAI</h1>
      </div>
      <div className="user-info">
        <span style={{ 
          fontSize: '0.9rem',
          color: 'var(--color-text)',
          marginRight: '16px'
        }}>
          店舗: {formatStoreId(storeId)}
        </span>
        {onLogout && (
          <button
            onClick={onLogout}
            style={{
              padding: '6px 12px',
              backgroundColor: 'rgba(178, 34, 34, 0.1)',
              border: '1px solid var(--color-negative)',
              borderRadius: '6px',
              color: 'var(--color-negative)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontFamily: 'var(--font-body)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--color-negative)';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(178, 34, 34, 0.1)';
              e.target.style.color = 'var(--color-negative)';
            }}
          >
            ログアウト
          </button>
        )}
      </div>
    </header>
  );
};
export default Header;
