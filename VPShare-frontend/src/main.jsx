import React from 'react';
import ReactDOM from 'react-dom/client';
// Import console suppressor first to prevent production warnings
import './config/console-suppressor';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { NotificationProvider } from './contexts/NotificationContext';
import serviceWorkerManager from './utils/serviceWorkerManager';
import './styles/index.css';
import './styles/ModernGlobal.css';

// Global error handler for extension/service worker conflicts
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && 
      event.error.message.includes('message channel closed')) {
    // Suppress this specific error as it's usually from browser extensions
    event.preventDefault();
    return false;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && 
      event.reason.message.includes('message channel closed')) {
    // Suppress this specific error as it's usually from browser extensions
    event.preventDefault();
    return false;
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider>
      <BrowserRouter>
        <NotificationProvider>
          <SubscriptionProvider>
            <App />
          </SubscriptionProvider>
        </NotificationProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

// Enhanced Service Worker registration with automatic updates and cache management
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Initialize service worker manager with automatic updates
    serviceWorkerManager.init({
      forceReload: true, // Automatically reload when updates are available
      showUpdateAvailable: (callback) => {
        // Custom update notification for your app
        const updateNotification = document.createElement('div');
        updateNotification.id = 'app-update-notification';
        updateNotification.innerHTML = `
          <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 350px;
            animation: slideInRight 0.5s ease-out;
          ">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
              <span style="font-size: 24px;">🚀</span>
              <span style="font-weight: 600; font-size: 16px;">Update Available!</span>
            </div>
            <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.4; opacity: 0.9;">
              A new version of VPShare is ready with latest features and improvements.
            </p>
            <div style="display: flex; gap: 8px;">
              <button id="update-now-btn" style="
                background: white;
                color: #667eea;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                font-size: 14px;
                flex: 1;
              ">Update Now</button>
              <button id="update-later-btn" style="
                background: transparent;
                color: white;
                border: 1px solid rgba(255,255,255,0.5);
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
              ">Later</button>
            </div>
          </div>
          <style>
            @keyframes slideInRight {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          </style>
        `;

        document.body.appendChild(updateNotification);

        // Handle update button
        document.getElementById('update-now-btn').onclick = () => {
          updateNotification.remove();
          callback(); // This will trigger the update
        };

        // Handle later button
        document.getElementById('update-later-btn').onclick = () => {
          updateNotification.remove();
        };

        // Auto-dismiss after 15 seconds
        setTimeout(() => {
          if (document.getElementById('app-update-notification')) {
            updateNotification.remove();
          }
        }, 15000);
      }
    }).then((registration) => {
      if (registration) {
        console.log('Service Worker initialized successfully');
        
        // Make service worker manager available globally for debugging
        window.swManager = serviceWorkerManager;
        
        // Log current status
        console.log('SW Status:', serviceWorkerManager.getStatus());
      }
    }).catch((error) => {
      console.error('Service Worker initialization failed:', error);
    });
  });
}
