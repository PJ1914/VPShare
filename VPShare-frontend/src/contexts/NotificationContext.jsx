import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationContext = createContext();
export { NotificationContext };

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const NotificationComponent = ({ notification, onClose }) => {
  const getNotificationStyle = () => {
    switch (notification.type) {
      case 'success':
        return {
          background: 'linear-gradient(45deg, #4CAF50, #45a049)',
          icon: '✅',
          borderColor: '#4CAF50'
        };
      case 'error':
        return {
          background: 'linear-gradient(45deg, #f44336, #d32f2f)',
          icon: '❌',
          borderColor: '#f44336'
        };
      case 'warning':
        return {
          background: 'linear-gradient(45deg, #ff9800, #f57c00)',
          icon: '⚠️',
          borderColor: '#ff9800'
        };
      case 'hackathon':
        return {
          background: 'linear-gradient(45deg, #667eea, #764ba2)',
          icon: '🚀',
          borderColor: '#667eea'
        };
      default:
        return {
          background: 'linear-gradient(45deg, #2196F3, #1976D2)',
          icon: 'ℹ️',
          borderColor: '#2196F3'
        };
    }
  };

  const style = getNotificationStyle();

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: style.background,
        color: 'white',
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        zIndex: 10000,
        maxWidth: '400px',
        minWidth: '300px',
        border: `2px solid ${style.borderColor}`,
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}
    >
      <span style={{ fontSize: '1.2rem' }}>{style.icon}</span>
      <div style={{ flex: 1 }}>
        {notification.title && (
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {notification.title}
          </div>
        )}
        <div style={{ fontSize: '0.9rem', opacity: 0.95 }}>
          {notification.message}
        </div>
        {notification.action && (
          <button
            onClick={notification.action.onClick}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              marginTop: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            {notification.action.label}
          </button>
        )}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '1.2rem',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '4px',
          opacity: 0.7,
          transition: 'opacity 0.2s ease'
        }}
        onMouseOver={(e) => { e.target.style.opacity = '1'; }}
        onMouseOut={(e) => { e.target.style.opacity = '0.7'; }}
        aria-label="Close notification"
      >
        ✕
      </button>
    </motion.div>
  );
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((config) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      type: 'info',
      duration: 5000,
      ...config
    };

    setNotifications(prev => [...prev, notification]);

    // Auto remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, notification.duration);

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showLoginPrompt = useCallback((context = 'general') => {
    // Don't show login prompts if user is already logged in
    // This will be checked by the component using this function
    showNotification({
      type: 'info',
      title: 'Login Required',
      message: 'Please log in to access all features and participate in events.',
      duration: 6000,
      action: {
        label: 'Login',
        onClick: () => {
          window.location.href = '/login';
        }
      }
    });
  }, [showNotification]);

  const showHackathonNotification = useCallback(() => {
    showNotification({
      type: 'hackathon',
      title: 'CodeKurukshetra 2025',
      message: 'Join the ultimate 48-hour coding battlefield! Register now for exciting prizes and challenges.',
      duration: 8000,
      action: {
        label: 'Register Now',
        onClick: () => {
          window.location.href = '/hackathon';
        }
      }
    });
  }, [showNotification]);

  const value = {
    showNotification,
    removeNotification,
    showHackathonNotification,
    showLoginPrompt
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 10000 }}>
        <AnimatePresence>
          {notifications.map((notification) => (
            <NotificationComponent
              key={notification.id}
              notification={notification}
              onClose={() => removeNotification(notification.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};
