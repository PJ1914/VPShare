// VPShare Service Worker - Fixed Cache Management
// Version with proper MIME type handling and cache invalidation
const CACHE_VERSION = 'vpshare-v' + Date.now();
const CACHE_NAME = `vpshare-main-${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `vpshare-static-${CACHE_VERSION}`;
const API_CACHE_NAME = `vpshare-api-${CACHE_VERSION}`;

// Assets that should be cached
const STATIC_ASSETS = [
  '/',
  '/hackathon',
  '/manifest.json'
];

// MIME types mapping for proper content type enforcement
const MIME_TYPES = {
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.jsx': 'application/javascript',
  '.ts': 'text/typescript',
  '.tsx': 'text/typescript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.html': 'text/html',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

// Get MIME type from URL
function getMimeType(url) {
  const pathname = new URL(url).pathname;
  const ext = pathname.substring(pathname.lastIndexOf('.'));
  return MIME_TYPES[ext] || 'text/plain';
}

// Check if response has correct MIME type
function hasValidMimeType(response, expectedType) {
  const contentType = response.headers.get('content-type');
  if (!contentType) return false;
  
  if (expectedType === 'application/javascript') {
    return contentType.includes('javascript') || contentType.includes('text/javascript');
  }
  
  return contentType.includes(expectedType.split('/')[1]);
}

// Install event - minimal caching, immediate activation
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing version ${CACHE_VERSION}`);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Opened cache');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Assets cached successfully');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Cache installation failed:', error);
      })
  );
});

// Activate event - aggressive cleanup
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating version ${CACHE_VERSION}`);
  
  event.waitUntil(
    Promise.all([
      // Delete all old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => !cacheName.includes(CACHE_VERSION))
            .map(cacheName => {
              console.log(`[SW] Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            })
        );
      }),
      
      // Claim all clients immediately
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Activation complete, all old caches cleared');
      
      // Force reload all clients
      return self.clients.matchAll({ type: 'window' });
    }).then(clients => {
      clients.forEach(client => {
        console.log('[SW] Reloading client:', client.url);
        client.postMessage({
          type: 'SW_ACTIVATED',
          version: CACHE_VERSION,
          action: 'reload'
        });
      });
    })
  );
});

// Fetch event - Network-first with proper MIME type validation
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests except known CDNs
  if (url.origin !== location.origin && 
      !url.host.includes('cdn') && 
      !url.host.includes('vercel') &&
      !url.host.includes('checkout.razorpay.com')) {
    return;
  }

  // Handle different types of requests with appropriate strategies

  // 1. JavaScript modules - NETWORK FIRST with MIME validation
  if (request.destination === 'script' || 
      url.pathname.endsWith('.js') || 
      url.pathname.endsWith('.mjs') || 
      url.pathname.endsWith('.jsx')) {
    
    event.respondWith(
      fetch(request)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          // Validate MIME type for JavaScript
          const expectedMimeType = 'application/javascript';
          if (!hasValidMimeType(response, expectedMimeType)) {
            console.warn(`[SW] Invalid MIME type for ${url.pathname}:`, response.headers.get('content-type'));
            // Don't cache responses with wrong MIME types
            return response;
          }
          
          // Cache valid JavaScript responses
          const responseToCache = response.clone();
          caches.open(STATIC_CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
          
          return response;
        })
        .catch(error => {
          console.log(`[SW] Network failed for script ${url.pathname}, checking cache:`, error.message);
          
          return caches.match(request).then(cachedResponse => {
            if (cachedResponse && hasValidMimeType(cachedResponse, 'application/javascript')) {
              console.log(`[SW] Serving cached script: ${url.pathname}`);
              return cachedResponse;
            }
            
            // No valid cached version, return empty script to prevent errors
            console.warn(`[SW] No valid cache for script: ${url.pathname}`);
            return new Response('console.warn("Failed to load script from network and cache");', {
              status: 200,
              headers: { 'Content-Type': 'application/javascript' }
            });
          });
        })
    );
    return;
  }

  // 2. CSS files - Network first with validation
  if (request.destination === 'style' || url.pathname.endsWith('.css')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok && hasValidMimeType(response, 'text/css')) {
            const responseToCache = response.clone();
            caches.open(STATIC_CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then(cachedResponse => {
            return cachedResponse || new Response('/* CSS failed to load */', {
              headers: { 'Content-Type': 'text/css' }
            });
          });
        })
    );
    return;
  }

  // 3. HTML documents - Network first, no aggressive caching
  if (request.mode === 'navigate' || 
      request.destination === 'document' || 
      url.pathname.endsWith('.html') ||
      url.pathname === '/' ||
      !url.pathname.includes('.')) {
    
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            // Only cache the main pages, not all HTML responses
            if (STATIC_ASSETS.includes(url.pathname) || url.pathname === '/') {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseToCache);
              });
            }
          }
          return response;
        })
        .catch(() => {
          console.log(`[SW] Network failed for navigation: ${url.pathname}`);
          return caches.match(request).then(cachedResponse => {
            return cachedResponse || caches.match('/');
          });
        })
    );
    return;
  }

  // 4. API calls - Network only, short-term cache
  if (url.pathname.includes('/api/') || 
      url.pathname.includes('execute-api') || 
      url.host.includes('amazonaws.com') ||
      url.host.includes('razorpay.com')) {
    
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            // Cache API responses for 30 seconds only
            const responseToCache = response.clone();
            caches.open(API_CACHE_NAME).then(cache => {
              const headers = new Headers(responseToCache.headers);
              headers.set('sw-cached-at', Date.now().toString());
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
          return caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
              const cachedAt = cachedResponse.headers.get('sw-cached-at');
              if (cachedAt && (Date.now() - parseInt(cachedAt)) < 30000) { // 30 seconds
                return cachedResponse;
              }
            }
            return new Response(JSON.stringify({ error: 'Network unavailable' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // 5. Images and fonts - Cache first
  if (request.destination === 'image' || 
      request.destination === 'font' ||
      url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|woff|woff2)$/)) {
    
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request).then(response => {
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(STATIC_CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // 6. Default - Network with cache fallback
  event.respondWith(
    fetch(request).then(response => {
      if (response.ok) {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
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

// Message handling for client communication
self.addEventListener('message', (event) => {
  const { data } = event;
  
  if (!data) return;
  
  switch (data.type) {
    case 'SKIP_WAITING':
      console.log('[SW] Client requested skip waiting');
      self.skipWaiting();
      break;
      
    case 'CHECK_UPDATE':
      console.log('[SW] Client requested update check');
      self.registration.update();
      break;
      
    case 'CLEAR_CACHE':
      console.log('[SW] Client requested cache clear');
      event.waitUntil(
        caches.keys().then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        }).then(() => {
          event.ports[0]?.postMessage({ success: true });
        })
      );
      break;
      
    case 'GET_CACHE_STATUS':
      event.waitUntil(
        caches.keys().then(cacheNames => {
          event.ports[0]?.postMessage({
            caches: cacheNames,
            version: CACHE_VERSION
          });
        })
      );
      break;
  }
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('[SW] Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled rejection:', event.reason);
  event.preventDefault();
});

// Periodic background sync to check for updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-sync') {
    event.waitUntil(
      // Check for app updates periodically
      self.registration.update()
    );
  }
  
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        const oldCaches = cacheNames.filter(name => !name.includes(CACHE_VERSION));
        return Promise.all(oldCaches.map(name => caches.delete(name)));
      })
    );
  }
});

console.log(`[SW] Service Worker ${CACHE_VERSION} loaded and ready`);
