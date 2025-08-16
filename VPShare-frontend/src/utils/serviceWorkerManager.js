// Service Worker Manager - Handles updates and cache management
class ServiceWorkerManager {
  constructor() {
    this.registration = null;
    this.showUpdateAvailable = null;
    this.forceReload = false; // Disable force reload to prevent infinite loops in all browsers
    this.updateCheckInterval = null;
    this.isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
    this.isSafari = navigator.userAgent.toLowerCase().includes('safari') && !navigator.userAgent.toLowerCase().includes('chrome');
    this.isProblematicBrowser = this.isFirefox || this.isSafari;
  }

  // Initialize service worker with automatic update handling
  async init(options = {}) {
    this.showUpdateAvailable = options.showUpdateAvailable || this.defaultUpdateNotification;
    this.forceReload = options.forceReload !== undefined ? options.forceReload : false;

    // Skip service worker entirely for very problematic browsers in development
    if (this.isProblematicBrowser && window.location.hostname === 'localhost') {
      console.log('[SWM] Skipping service worker registration for browser compatibility in development');
      return null;
    }

    if ('serviceWorker' in navigator) {
      try {
        // For problematic browsers (Firefox, Safari), be less aggressive with unregistering
        if (!this.isProblematicBrowser) {
          // Unregister any existing service workers first to ensure clean slate
          const existingRegistrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of existingRegistrations) {
            await registration.unregister();
            console.log('[SWM] Unregistered existing service worker');
          }
        }

        // Register new service worker
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: this.isProblematicBrowser ? 'imports' : 'none' // Less aggressive caching for problematic browsers
        });

        console.log('[SWM] Service Worker registered successfully');

        // Set up update detection
        this.setupUpdateHandling();

        // Listen for messages from service worker
        this.setupMessageHandling();

        // Check for updates periodically
        this.setupPeriodicUpdateChecks();

        // Handle page visibility changes
        this.setupVisibilityHandling();

        // Clear any stale caches immediately
        await this.clearStaleCache();

        return this.registration;
      } catch (error) {
        console.error('[SWM] Service Worker registration failed:', error);
        return null;
      }
    } else {
      console.log('[SWM] Service Worker not supported');
      return null;
    }
  }

  // Clear any stale cache on initialization
  async clearStaleCache() {
    try {
      const cacheNames = await caches.keys();
      const staleCaches = cacheNames.filter(name => 
        name.includes('codetapasya') || // Old cache names
        name.includes('dashboard') ||
        !name.includes('vpshare') // Keep only new vpshare caches
      );
      
      for (const cacheName of staleCaches) {
        await caches.delete(cacheName);
        console.log(`[SWM] Deleted stale cache: ${cacheName}`);
      }
    } catch (error) {
      console.error('[SWM] Failed to clear stale cache:', error);
    }
  }

  // Set up automatic update handling
  setupUpdateHandling() {
    if (!this.registration) return;

    // Handle new service worker installation
    this.registration.addEventListener('updatefound', () => {
      console.log('[SWM] New Service Worker version found');
      const newWorker = this.registration.installing;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // New version available
            console.log('[SWM] New Service Worker installed, update available');
            this.handleUpdateAvailable(newWorker);
          } else {
            // First time installation
            console.log('[SWM] Service Worker installed for the first time');
          }
        }
      });
    });

    // Handle service worker controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SWM] Service Worker controller changed');
      // Only reload if not a problematic browser or if explicitly requested
      if (!this.isProblematicBrowser && this.forceReload) {
        console.log('[SWM] Reloading page for controller change');
        window.location.reload();
      } else {
        console.log('[SWM] Skipping reload for browser compatibility');
      }
    });
  }

  // Handle when update is available
  handleUpdateAvailable(newWorker) {
    console.log('[SWM] Handling update available');
    
    // Always force update for MIME type and caching fixes
    if (this.forceReload) {
      console.log('[SWM] Force updating Service Worker...');
      this.skipWaiting(newWorker);
    } else {
      // Show notification to user
      this.showUpdateAvailable(() => {
        this.skipWaiting(newWorker);
      });
    }
  }

  // Skip waiting and activate new service worker
  skipWaiting(worker = null) {
    const targetWorker = worker || this.registration.waiting;
    if (targetWorker) {
      targetWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  // Default update notification
  defaultUpdateNotification(callback) {
    const updateBanner = document.createElement('div');
    updateBanner.id = 'sw-update-banner';
    updateBanner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #2563eb;
        color: white;
        padding: 12px 20px;
        text-align: center;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      ">
        <div style="max-width: 800px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
          <span>🚀 A new version is available with latest features and fixes!</span>
          <div style="display: flex; gap: 10px;">
            <button id="sw-update-btn" style="
              background: white;
              color: #2563eb;
              border: none;
              padding: 8px 16px;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 600;
              font-size: 14px;
            ">Update Now</button>
            <button id="sw-dismiss-btn" style="
              background: transparent;
              color: white;
              border: 1px solid white;
              padding: 8px 16px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
            ">Later</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(updateBanner);

    // Add padding to body to account for banner
    document.body.style.paddingTop = '60px';

    // Handle update button click
    document.getElementById('sw-update-btn').onclick = () => {
      updateBanner.remove();
      document.body.style.paddingTop = '';
      callback();
    };

    // Handle dismiss button click
    document.getElementById('sw-dismiss-btn').onclick = () => {
      updateBanner.remove();
      document.body.style.paddingTop = '';
    };

    // Auto-dismiss after 30 seconds
    setTimeout(() => {
      if (document.getElementById('sw-update-banner')) {
        updateBanner.remove();
        document.body.style.paddingTop = '';
      }
    }, 30000);
  }

  // Set up message handling from service worker
  setupMessageHandling() {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { data } = event;
      
      console.log('[SWM] Received message from SW:', data);

      if (data.type === 'SW_ACTIVATED') {
        console.log('[SWM] Service Worker activated with version:', data.version);
        
        // Force reload when new SW is activated to ensure fresh content
        // But be gentler with problematic browsers (Firefox, Safari)
        if (data.action === 'reload' && (!this.isProblematicBrowser || this.forceReload)) {
          console.log('[SWM] Reloading page for fresh content...');
          window.location.reload();
        } else if (this.isProblematicBrowser) {
          console.log('[SWM] Skipping reload for browser compatibility');
        }
      }
      
      if (data.type === 'SW_UPDATED') {
        console.log('[SWM] Service Worker updated:', data.version);
        
        if (data.message) {
          console.log('[SWM]', data.message);
        }
      }
    });
  }

  // Force refresh - clears all caches and reloads
  async forceRefresh() {
    console.log('[SWM] Force refresh initiated');
    
    try {
      // Clear all caches
      await this.clearAllCaches();
      
      // Send message to SW to clear its caches
      if (navigator.serviceWorker.controller) {
        const channel = new MessageChannel();
        navigator.serviceWorker.controller.postMessage(
          { type: 'CLEAR_CACHE' }, 
          [channel.port2]
        );
      }
      
      // Unregister service worker
      if (this.registration) {
        await this.registration.unregister();
      }
      
      // Force hard reload
      window.location.reload(true);
      
    } catch (error) {
      console.error('[SWM] Force refresh failed:', error);
      // Fallback to simple reload
      window.location.reload();
    }
  }

  // Check for updates periodically
  setupPeriodicUpdateChecks() {
    if (!this.registration) return;

    // Less aggressive checking for problematic browsers
    const checkInterval = this.isProblematicBrowser ? 120000 : 30000; // 2 minutes vs 30 seconds

    // Check for updates when page is visible
    setInterval(() => {
      if (!document.hidden && !this.isProblematicBrowser) {
        this.registration.update().catch(() => {
          // Silently handle update check failures
        });
      }
    }, checkInterval);
  }

  // Handle page visibility changes
  setupVisibilityHandling() {
    if (!this.registration) return;

    // Check for updates when page becomes visible (less aggressive for problematic browsers)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !this.isProblematicBrowser) {
        console.log('Page became visible, checking for updates...');
        this.registration.update().catch(() => {
          // Silently handle update check failures
        });
      } else if (!document.hidden && this.isProblematicBrowser) {
        console.log('Page became visible (problematic browser - skipping update check)');
      }
    });
  }

  // Force clear all caches (for debugging)
  async clearAllCaches() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log('Clearing cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
      console.log('All caches cleared');
    }

    if (this.registration) {
      this.registration.active?.postMessage({ type: 'CLEAR_CACHE' });
    }
  }

  // Get current service worker status
  getStatus() {
    if (!this.registration) {
      return { status: 'not-supported' };
    }

    return {
      status: 'registered',
      scope: this.registration.scope,
      installing: !!this.registration.installing,
      waiting: !!this.registration.waiting,
      active: !!this.registration.active,
      controller: !!navigator.serviceWorker.controller
    };
  }

  // Unregister service worker (for debugging)
  async unregister() {
    if (this.registration) {
      const success = await this.registration.unregister();
      console.log('Service Worker unregistered:', success);
      return success;
    }
    return false;
  }
}

// Create and export singleton instance
const serviceWorkerManager = new ServiceWorkerManager();

export default serviceWorkerManager;

// Also export the class for custom implementations
export { ServiceWorkerManager };
