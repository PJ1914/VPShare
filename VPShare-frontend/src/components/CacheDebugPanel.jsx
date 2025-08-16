import React, { useState, useEffect } from 'react';
import serviceWorkerManager from '../utils/serviceWorkerManager';

const CacheDebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [swStatus, setSwStatus] = useState(null);
  const [caches, setCaches] = useState([]);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      updateStatus();
      loadCaches();
    }
  }, [isOpen]);

  const updateStatus = () => {
    const status = serviceWorkerManager.getStatus();
    setSwStatus(status);
  };

  const loadCaches = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        const cacheDetails = await Promise.all(
          cacheNames.map(async (name) => {
            const cache = await caches.open(name);
            const keys = await cache.keys();
            return {
              name,
              size: keys.length,
              keys: keys.slice(0, 5).map(req => req.url) // Show first 5 URLs
            };
          })
        );
        setCaches(cacheDetails);
      } catch (error) {
        console.error('Error loading caches:', error);
      }
    }
  };

  const clearAllCaches = async () => {
    setIsClearing(true);
    try {
      await serviceWorkerManager.clearAllCaches();
      await loadCaches();
      alert('All caches cleared successfully!');
    } catch (error) {
      console.error('Error clearing caches:', error);
      alert('Error clearing caches: ' + error.message);
    } finally {
      setIsClearing(false);
    }
  };

  const forceUpdate = async () => {
    try {
      if (serviceWorkerManager.registration) {
        await serviceWorkerManager.registration.update();
        updateStatus();
        alert('Update check triggered!');
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };

  const unregisterSW = async () => {
    if (window.confirm('Are you sure you want to unregister the service worker?')) {
      try {
        await serviceWorkerManager.unregister();
        updateStatus();
        alert('Service Worker unregistered!');
      } catch (error) {
        console.error('Error unregistering SW:', error);
      }
    }
  };

  // Only show in development or when manually triggered, and hide on mobile
  if (import.meta.env.PROD && !window.location.search.includes('debug=cache')) {
    return null;
  }
  
  // Hide on mobile devices (screen width < 768px)
  const isMobile = window.innerWidth < 768;
  if (isMobile) {
    return null;
  }

  return (
    <>
      {/* Debug Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 16px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
        }}
      >
        🛠️ Cache Debug
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          left: '20px',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px',
          width: '400px',
          maxHeight: '500px',
          overflowY: 'auto',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
          zIndex: 9998,
          fontSize: '14px',
          fontFamily: 'monospace'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '16px',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '12px'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
              Cache Debug Panel
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              ✕
            </button>
          </div>

          {/* Service Worker Status */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>Service Worker Status</h4>
            <div style={{ 
              background: '#f9fafb', 
              padding: '12px', 
              borderRadius: '6px',
              fontSize: '12px'
            }}>
              {swStatus ? (
                <pre>{JSON.stringify(swStatus, null, 2)}</pre>
              ) : (
                'Loading...'
              )}
            </div>
          </div>

          {/* Cache Information */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>
              Cache Storage ({caches.length} caches)
            </h4>
            {caches.map((cache, index) => (
              <div key={index} style={{
                background: '#f9fafb',
                padding: '8px 12px',
                borderRadius: '6px',
                marginBottom: '8px',
                fontSize: '12px'
              }}>
                <div style={{ fontWeight: '600', color: '#1f2937' }}>
                  {cache.name} ({cache.size} items)
                </div>
                {cache.keys.length > 0 && (
                  <div style={{ marginTop: '4px', color: '#6b7280' }}>
                    Sample URLs:
                    {cache.keys.map((url, i) => (
                      <div key={i} style={{ fontSize: '11px', truncate: 'ellipsis' }}>
                        • {url.split('/').pop()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <button
              onClick={updateStatus}
              style={{
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Refresh Status
            </button>
            <button
              onClick={forceUpdate}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Check Updates
            </button>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr',
            gap: '8px'
          }}>
            <button
              onClick={clearAllCaches}
              disabled={isClearing}
              style={{
                background: isClearing ? '#9ca3af' : '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                cursor: isClearing ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              {isClearing ? 'Clearing...' : 'Clear All Caches'}
            </button>
            <button
              onClick={unregisterSW}
              style={{
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Unregister SW
            </button>
          </div>

          <div style={{ 
            marginTop: '12px', 
            padding: '8px', 
            background: '#fef3c7', 
            borderRadius: '6px',
            fontSize: '11px',
            color: '#92400e'
          }}>
            💡 Tip: Add ?debug=cache to URL to show this panel in production
          </div>
        </div>
      )}
    </>
  );
};

export default CacheDebugPanel;
