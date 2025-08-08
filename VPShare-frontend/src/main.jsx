import React from 'react';
import ReactDOM from 'react-dom/client';
// Import console suppressor first to prevent production warnings
import './config/console-suppressor';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { NotificationProvider } from './contexts/NotificationContext';
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

// Register Service Worker for production caching
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    // Add a small delay to avoid timing issues
    setTimeout(() => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Handle service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content available, reload page
                  window.location.reload();
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }, 1000); // 1 second delay
  });
}
