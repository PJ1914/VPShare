import React from 'react';
import ReactDOM from 'react-dom/client';
// Import console suppressor first to prevent production warnings
import './config/console-suppressor';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { HackathonProvider } from './contexts/HackathonContext';
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
          <AuthProvider>
            <SubscriptionProvider>
              <HackathonProvider>
                <App />
              </HackathonProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

// Enhanced Service Worker registration with automatic updates and cache management
if ('serviceWorker' in navigator) {
  // Check for module loading errors and force refresh if needed
  const originalLoad = window.addEventListener;
  let moduleErrorDetected = false;

  window.addEventListener('error', (event) => {
    // Detect MIME type errors for JavaScript modules
    if (event.message && event.message.includes('MIME type') && 
        event.message.includes('module script')) {
      console.error('[Main] JavaScript module MIME type error detected:', event.message);
      moduleErrorDetected = true;
      
      // Force refresh to clear cache and reload fresh content
      setTimeout(() => {
        console.log('[Main] Forcing refresh due to MIME type error...');
        if (window.swManager) {
          window.swManager.forceRefresh();
        } else {
          window.location.reload(true);
        }
      }, 1000);
    }
  });

  window.addEventListener('load', () => {
    // Initialize service worker manager with automatic updates
    // Be gentler with problematic browsers to prevent reload loops
    const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
    const isSafari = navigator.userAgent.toLowerCase().includes('safari') && !navigator.userAgent.toLowerCase().includes('chrome');
    const isProblematicBrowser = isFirefox || isSafari;
    
    serviceWorkerManager.init({
      forceReload: !isProblematicBrowser, // Don't force reload in problematic browsers
      showUpdateAvailable: (callback) => {
        // If we detected module errors, force refresh immediately
        if (moduleErrorDetected) {
          console.log('[Main] Forcing immediate refresh due to module errors...');
          callback();
          return;
        }

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
              <span style="font-weight: 600; font-size: 16px;">Cache Update Required!</span>
            </div>
            <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.4; opacity: 0.9;">
              Fresh content is available. Click Update to reload with the latest version.
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
              <button id="force-refresh-btn" style="
                background: #ff4757;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
              ">Force Refresh</button>
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

        // Handle force refresh button
        document.getElementById('force-refresh-btn').onclick = () => {
          updateNotification.remove();
          serviceWorkerManager.forceRefresh();
        };

        // Auto-update after 5 seconds if user doesn't respond
        setTimeout(() => {
          if (document.getElementById('app-update-notification')) {
            updateNotification.remove();
            callback();
          }
        }, 5000);
      }
    }).then((registration) => {
      if (registration) {
        console.log('[Main] Service Worker initialized successfully');
        
        // Make service worker manager available globally for debugging
        window.swManager = serviceWorkerManager;
        
        // Add global force refresh function
        window.forceRefresh = () => serviceWorkerManager.forceRefresh();
        
        // Log current status
        console.log('[Main] SW Status:', serviceWorkerManager.getStatus());
      }
    }).catch((error) => {
      console.error('[Main] Service Worker initialization failed:', error);
      
      // If SW fails, still make force refresh available
      window.forceRefresh = () => {
        console.log('[Main] Manual force refresh...');
        window.location.reload(true);
      };
    });
  });
}
