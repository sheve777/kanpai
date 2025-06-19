import React, { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, X, Info } from 'lucide-react';

// 通知コンテキスト
const NotificationContext = createContext();

// 通知タイプの設定
const notificationTypes = {
  success: {
    icon: CheckCircle,
    color: 'var(--success-500)',
    bgColor: 'var(--success-50)',
    borderColor: 'var(--success-200)'
  },
  error: {
    icon: AlertCircle,
    color: 'var(--error-500)',
    bgColor: 'var(--error-50)',
    borderColor: 'var(--error-200)'
  },
  warning: {
    icon: AlertTriangle,
    color: 'var(--warning-500)',
    bgColor: 'var(--warning-50)',
    borderColor: 'var(--warning-200)'
  },
  info: {
    icon: Info,
    color: 'var(--info-500)',
    bgColor: 'var(--info-50)',
    borderColor: 'var(--info-200)'
  }
};

// 通知アイテムコンポーネント
const NotificationItem = ({ notification, onClose }) => {
  const config = notificationTypes[notification.type] || notificationTypes.info;
  const Icon = config.icon;

  useEffect(() => {
    if (notification.autoClose !== false) {
      const timer = setTimeout(() => {
        onClose(notification.id);
      }, notification.duration || 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  return (
    <div 
      className="notification-item"
      style={{
        backgroundColor: config.bgColor,
        borderLeft: `4px solid ${config.color}`,
        border: `1px solid ${config.borderColor}`
      }}
    >
      <div className="notification-content">
        <div className="notification-icon">
          <Icon size={20} style={{ color: config.color }} />
        </div>
        <div className="notification-message">
          <div className="notification-title">{notification.title}</div>
          {notification.message && (
            <div className="notification-text">{notification.message}</div>
          )}
        </div>
      </div>
      <button 
        className="notification-close"
        onClick={() => onClose(notification.id)}
      >
        <X size={16} />
      </button>
    </div>
  );
};

// 確認ダイアログコンポーネント
const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = '確認', cancelText = 'キャンセル' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay confirm-dialog-overlay">
      <div className="modal-container confirm-dialog">
        <div className="confirm-dialog-header">
          <AlertTriangle size={24} style={{ color: 'var(--warning-500)' }} />
          <h3>{title}</h3>
        </div>
        <div className="confirm-dialog-body">
          <p>{message}</p>
        </div>
        <div className="confirm-dialog-actions">
          <button 
            className="btn-secondary" 
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className="btn-primary" 
            onClick={onConfirm}
            style={{ backgroundColor: 'var(--warning-500)' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// 通知プロバイダー
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { ...notification, id }]);
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const showConfirm = (options) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        isOpen: true,
        ...options,
        onConfirm: () => {
          setConfirmDialog({ isOpen: false });
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog({ isOpen: false });
          resolve(false);
        }
      });
    });
  };

  const value = {
    // 通知関数
    showSuccess: (title, message, options = {}) => 
      addNotification({ type: 'success', title, message, ...options }),
    
    showError: (title, message, options = {}) => 
      addNotification({ type: 'error', title, message, ...options }),
    
    showWarning: (title, message, options = {}) => 
      addNotification({ type: 'warning', title, message, ...options }),
    
    showInfo: (title, message, options = {}) => 
      addNotification({ type: 'info', title, message, ...options }),
    
    // 確認ダイアログ
    confirm: showConfirm,
    
    // 通知削除
    removeNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* 通知コンテナ */}
      <div className="notification-container">
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </div>

      {/* 確認ダイアログ */}
      <ConfirmDialog {...confirmDialog} />
    </NotificationContext.Provider>
  );
};

// 通知システムフック
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationProvider;