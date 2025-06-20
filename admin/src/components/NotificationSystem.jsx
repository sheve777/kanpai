import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, X } from 'lucide-react';

// Notification Context
const NotificationContext = createContext();

// Notification Types
const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Individual Notification Component
const Notification = ({ notification, onRemove }) => {
  const { id, type, title, message, duration = 5000 } = notification;

  // Auto remove after duration
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onRemove(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onRemove]);

  const getTypeConfig = () => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-600'
        };
      case NOTIFICATION_TYPES.ERROR:
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600'
        };
      case NOTIFICATION_TYPES.WARNING:
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600'
        };
      default:
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600'
        };
    }
  };

  const typeConfig = getTypeConfig();

  return (
    <div className={`
      max-w-sm w-full ${typeConfig.bgColor} ${typeConfig.borderColor} border rounded-lg shadow-lg
      transform transition-all duration-300 ease-in-out
      hover:shadow-xl
    `}>
      <div className="p-4">
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${typeConfig.iconColor}`}>
            {typeConfig.icon}
          </div>
          <div className="ml-3 w-0 flex-1">
            {title && (
              <p className={`text-sm font-medium ${typeConfig.textColor}`}>
                {title}
              </p>
            )}
            {message && (
              <p className={`text-sm ${typeConfig.textColor} ${title ? 'mt-1' : ''}`}>
                {message}
              </p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={`
                rounded-md inline-flex ${typeConfig.textColor} hover:${typeConfig.textColor}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                transition-opacity hover:opacity-75
              `}
              onClick={() => onRemove(id)}
            >
              <span className="sr-only">Close</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Confirmation Dialog Component
const ConfirmDialog = ({ dialog, onConfirm, onCancel }) => {
  if (!dialog) return null;

  const { title, message, confirmText = '確認', cancelText = 'キャンセル' } = dialog;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {title}
          </h3>
          {message && (
            <div className="mt-2">
              <p className="text-sm text-gray-500 whitespace-pre-line">
                {message}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Notification Provider Component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { ...notification, id }]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showSuccess = useCallback((title, message, duration) => {
    addNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      title,
      message,
      duration
    });
  }, [addNotification]);

  const showError = useCallback((title, message, duration) => {
    addNotification({
      type: NOTIFICATION_TYPES.ERROR,
      title,
      message,
      duration
    });
  }, [addNotification]);

  const showWarning = useCallback((title, message, duration) => {
    addNotification({
      type: NOTIFICATION_TYPES.WARNING,
      title,
      message,
      duration
    });
  }, [addNotification]);

  const showInfo = useCallback((title, message, duration) => {
    addNotification({
      type: NOTIFICATION_TYPES.INFO,
      title,
      message,
      duration
    });
  }, [addNotification]);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        ...options,
        resolve
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmDialog?.resolve) {
      confirmDialog.resolve(true);
    }
    setConfirmDialog(null);
  }, [confirmDialog]);

  const handleCancel = useCallback(() => {
    if (confirmDialog?.resolve) {
      confirmDialog.resolve(false);
    }
    setConfirmDialog(null);
  }, [confirmDialog]);

  const value = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    confirm
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        dialog={confirmDialog}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </NotificationContext.Provider>
  );
};

// Hook to use notifications
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationProvider;