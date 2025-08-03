import React from 'react';
import { config } from '../config/environment';

const DevNotice = ({ show, onDismiss, message }) => {
  // Only show in development mode
  if (!config.isDevelopment || !show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      backgroundColor: '#fff3cd',
      border: '1px solid #ffeaa7',
      borderRadius: '8px',
      padding: '12px 16px',
      maxWidth: '300px',
      zIndex: 1000,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      fontSize: '14px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        gap: '8px'
      }}>
        <div>
          <strong style={{ color: '#856404' }}>Development Mode</strong>
          <p style={{ margin: '4px 0 0 0', color: '#856404' }}>
            {message || 'Some APIs are not available. Using local fallback data.'}
          </p>
        </div>
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            color: '#856404',
            padding: '0',
            lineHeight: '1'
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default DevNotice;
