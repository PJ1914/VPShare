// Service Worker Manager - Handles updates and cache management
class ServiceWorkerManager {
  constructor() {
    this.registration = null;
    this.showUpdateAvailable = null;
    this.forceReload = true; // Set to true for immediate updates
  }

  // Initialize service worker with automatic update handling
  async init(options = {}) {
    this.showUpdateAvailable = options.showUpdateAvailable || this.defaultUpdateNotification;
    this.forceReload = options.forceReload !== undefined ? options.forceReload : true;

    if ('serviceWorker' in navigator) {
      try {
        // Register service worker
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none' // Always check for updates
        });

        console.log('Service Worker registered successfully');

        // Set up update detection
        this.setupUpdateHandling();

        // Listen for messages from service worker
        this.setupMessageHandling();

        // Check for updates every 30 seconds when page is visible
        this.setupPeriodicUpdateChecks();

        // Handle page visibility changes
        this.setupVisibilityHandling();

        return this.registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
      }
    } else {
      console.log('Service Worker not supported');
      return null;
    }
  }

  // Set up automatic update handling
  setupUpdateHandling() {
    if (!this.registration) return;

    // Handle new service worker installation
    this.registration.addEventListener('updatefound', () => {
      console.log('New Service Worker version found');
      const newWorker = this.registration.installing;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // New version available
            console.log('New Service Worker installed, update available');
            this.handleUpdateAvailable(newWorker);
          } else {
            // First time installation
            console.log('Service Worker installed for the first time');
          }
        }
      });
    });

    // Handle service worker controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service Worker controller changed');
      if (this.forceReload) {
        // Force reload to get new assets
        window.location.reload();
      }
    });
  }

  // Handle when update is available
  handleUpdateAvailable(newWorker) {
    if (this.forceReload) {
      // Immediately update for critical fixes
      console.log('Force updating Service Worker...');
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

      if (data.type === 'SW_UPDATED') {
        console.log('Service Worker updated:', data.version);
        
        // Optional: Show notification about successful update
        if (data.message) {
          console.log(data.message);
        }
      }
    });
  }

  // Check for updates periodically
  setupPeriodicUpdateChecks() {
    if (!this.registration) return;

    // Check for updates every 30 seconds when page is visible
    setInterval(() => {
      if (!document.hidden) {
        this.registration.update().catch(() => {
          // Silently handle update check failures
        });
      }
    }, 30000);
  }

  // Handle page visibility changes
  setupVisibilityHandling() {
    if (!this.registration) return;

    // Check for updates when page becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        console.log('Page became visible, checking for updates...');
        this.registration.update().catch(() => {
          // Silently handle update check failures
        });
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
