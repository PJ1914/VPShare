import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { HelmetProvider } from 'react-helmet-async';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import './styles/index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
        <BrowserRouter>
          <SubscriptionProvider>
            <App />
          </SubscriptionProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </HelmetProvider>
  </React.StrictMode>
);
