import React from 'react';
import ReactDOM from 'react-dom/client';
// Import console suppressor first to prevent production warnings
import './config/console-suppressor';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { HelmetProvider } from 'react-helmet-async';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { NotificationProvider } from './contexts/NotificationContext';
import './styles/index.css';
import './styles/ModernGlobal.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
        <BrowserRouter>
          <NotificationProvider>
            <SubscriptionProvider>
              <App />
            </SubscriptionProvider>
          </NotificationProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </HelmetProvider>
  </React.StrictMode>
);

// Register Service Worker for production caching
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
