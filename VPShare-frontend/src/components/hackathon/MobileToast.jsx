import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MobileToast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return {
          background: 'linear-gradient(45deg, #4CAF50, #45a049)',
          color: '#fff',
          icon: '✅'
        };
      case 'error':
        return {
          background: 'linear-gradient(45deg, #f44336, #d32f2f)',
          color: '#fff',
          icon: '❌'
        };
      case 'warning':
        return {
          background: 'linear-gradient(45deg, #ff9800, #f57c00)',
          color: '#fff',
          icon: '⚠️'
        };
      default:
        return {
          background: 'linear-gradient(45deg, #2196F3, #1976D2)',
          color: '#fff',
          icon: 'ℹ️'
        };
    }
  };

  const toastStyle = getToastStyle();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 500, damping: 30 }}
          style={{
            position: 'fixed',
            top: '2rem',
            left: '1rem',
            right: '1rem',
            background: toastStyle.background,
            color: toastStyle.color,
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.95rem',
            fontWeight: '600',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
          onTap={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>{toastStyle.icon}</span>
          <span style={{ flex: 1 }}>{message}</span>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'inherit',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast Manager Hook for Mobile
export const useMobileToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    // Haptic feedback for mobile
    if ('vibrate' in navigator) {
      const vibrationPattern = type === 'error' ? [100, 50, 100] : [50];
      navigator.vibrate(vibrationPattern);
    }
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
      <AnimatePresence>
        {toasts.map((toast, index) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: index * 80 }}
            exit={{ opacity: 0, y: -50 }}
            style={{ position: 'absolute', width: '100%' }}
          >
            <MobileToast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  return {
    showToast,
    ToastContainer
  };
};

export default MobileToast;
