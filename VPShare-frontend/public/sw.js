// Dashboard Service Worker for Vercel Production
// IMPORTANT: Update this version number with each deployment!
const CACHE_VERSION = 'v' + Date.now(); // Auto-versioning based on deployment time
const CACHE_NAME = `codetapasya-dashboard-${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `codetapasya-static-${CACHE_VERSION}`;
const API_CACHE_NAME = `codetapasya-api-${CACHE_VERSION}`;

const urlsToCache = [
  '/',
  '/dashboard',
  '/courses',
  '/hackathon',
  '/manifest.json'
];

// Add error handling for message channel issues
self.addEventListener('error', (event) => {
  console.log('Service Worker Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.log('Service Worker Unhandled Rejection:', event.reason);
  event.preventDefault();
});

// Install event - Force immediate activation
self.addEventListener('install', (event) => {
  console.log(`Service Worker ${CACHE_VERSION} installing...`);
  
  event.waitUntil(
    Promise.all([
      // Cache essential pages
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Dashboard cache opened');
        return cache.addAll(urlsToCache).catch((error) => {
          console.warn('Some resources failed to cache:', error);
          // Don't fail the install if some resources can't be cached
        });
      }),
      // Pre-cache static assets
      caches.open(STATIC_CACHE_NAME)
    ]).catch((error) => {
      console.error('Cache install failed:', error);
    })
  );
  
  // Force immediate activation - skip waiting
  self.skipWaiting();
});

// Fetch event - Smart caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests (except CDN assets)
  if (url.origin !== location.origin && !url.host.includes('cdn') && !url.host.includes('checkout.razorpay.com')) {
    return;
  }

  // Navigation requests (HTML pages) - Network First with fallback
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful responses
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          console.log('Network failed, serving from cache:', request.url);
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match('/'); // Fallback to homepage
          });
        })
    );
    return;
  }

  // API calls - Network first with short-term caching
  if (url.pathname.includes('/api/') || url.pathname.includes('execute-api') || url.host.includes('amazonaws.com')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful API responses temporarily
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              // Set a short expiration for API responses
              const headers = new Headers(responseToCache.headers);
              headers.set('sw-cache-expires', Date.now() + (2 * 60 * 1000)); // 2 minutes
              const cachedResponse = new Response(responseToCache.body, {
                status: responseToCache.status,
                statusText: responseToCache.statusText,
                headers: headers
              });
              cache.put(request, cachedResponse);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached API response if network fails
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              const cacheExpires = cachedResponse.headers.get('sw-cache-expires');
              if (!cacheExpires || Date.now() < parseInt(cacheExpires)) {
                return cachedResponse;
              }
            }
            // Return a network error response if cache is expired or missing
            return new Response(JSON.stringify({ error: 'Network unavailable' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // Static assets (JS, CSS, images) - Cache First with network fallback
  if (request.destination === 'script' || request.destination === 'style' || 
      request.destination === 'image' || request.destination === 'font' ||
      url.pathname.includes('/assets/') || url.pathname.includes('/static/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Not in cache, fetch from network
        return fetch(request).then((response) => {
          // Only cache successful responses
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        }).catch(() => {
          // If it's a JS or CSS file and network fails, return an empty response
          // This prevents the MIME type error
          if (request.destination === 'script') {
            return new Response('console.warn("Script failed to load from cache and network");', {
              headers: { 'Content-Type': 'application/javascript' }
            });
          }
          if (request.destination === 'style') {
            return new Response('/* CSS failed to load from cache and network */', {
              headers: { 'Content-Type': 'text/css' }
            });
          }
          // For other assets, throw the error
          throw new Error('Asset not available');
        });
      })
    );
    return;
  }

  // Default: Network with cache fallback
  event.respondWith(
    fetch(request).then((response) => {
      // Cache successful responses
      if (response && response.status === 200) {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
      }
      return response;
    }).catch(() => {
      return caches.match(request);
    })
  );
});

// Activate event - Aggressive cache cleanup and client claiming
self.addEventListener('activate', (event) => {
  console.log(`Service Worker ${CACHE_VERSION} activating...`);
  
  event.waitUntil(
    Promise.all([
      // Clean up ALL old caches
      caches.keys().then((cacheNames) => {
        const deletePromises = cacheNames
          .filter((cacheName) => {
            // Delete any cache that doesn't match our current version
            return !cacheName.includes(CACHE_VERSION);
          })
          .map((cacheName) => {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          });
        
        return Promise.all(deletePromises);
      }),
      
      // Clear any stored IndexedDB or localStorage that might be stale
      self.registration.navigationPreload?.enable().catch(() => {
        // Navigation preload not supported, ignore
      })
    ]).then(() => {
      console.log(`Service Worker ${CACHE_VERSION} activated and old caches cleared`);
      
      // Immediately claim all clients and force reload
      return self.clients.claim().then(() => {
        // Notify all clients about the update
        return self.clients.matchAll({ type: 'window' }).then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'SW_UPDATED',
              version: CACHE_VERSION,
              message: 'Service Worker updated, reloading...'
            });
          });
        });
      });
    })
  );
});

// Enhanced message handling for cache updates and client communication
self.addEventListener('message', (event) => {
  const { data } = event;
  
  if (data && data.type === 'SKIP_WAITING') {
    console.log('Client requested skip waiting');
    self.skipWaiting();
    return;
  }
  
  if (data && data.type === 'CHECK_UPDATE') {
    // Check if there's a newer version available
    self.registration.update().then(() => {
      console.log('Manual update check completed');
    });
    return;
  }
  
  if (data && data.type === 'CLEAR_CACHE') {
    // Force clear all caches (for debugging)
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Force deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('All caches cleared by user request');
    });
    return;
  }
  
  // Always respond to messages to prevent channel closure errors
  if (event.ports && event.ports[0]) {
    event.ports[0].postMessage({ 
      success: true, 
      version: CACHE_VERSION,
      timestamp: Date.now()
    });
  }
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    event.waitUntil(
      // Add any background sync logic here
      Promise.resolve()
    );
  }
});

// Handle push notifications if needed
self.addEventListener('push', (event) => {
  if (event.data) {
    const notificationData = event.data.json();
    event.waitUntil(
      self.registration.showNotification(notificationData.title, {
        body: notificationData.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      })
    );
  }
});

// Periodic background sync to check for updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-sync') {
    event.waitUntil(
      // Check for app updates periodically
      self.registration.update()
    );
  }
});
