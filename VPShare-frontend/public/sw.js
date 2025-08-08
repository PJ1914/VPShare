// Dashboard Service Worker for Vercel Production
const CACHE_NAME = 'codetapasya-dashboard-v2';
const urlsToCache = [
  '/',
  '/dashboard',
  '/courses',
  '/static/js/bundle.js',
  '/static/css/main.css',
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

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Dashboard cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache install failed:', error);
      })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Fetch event - Cache first for assets, Network first for API calls
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }

  // API calls - Network first
  if (url.pathname.includes('/api/') || url.pathname.includes('execute-api')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Don't cache API errors
          if (!response || response.status !== 200) {
            return response;
          }
          
          // Cache successful API responses for 2 minutes
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseToCache);
            });
          
          return response;
        })
        .catch(() => {
          // Return cached version if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets - Cache first
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(request);
      })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim clients immediately
  return self.clients.claim();
});

// Handle message events to prevent channel closure errors
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  
  // Always respond to messages to prevent channel closure errors
  if (event.ports && event.ports[0]) {
    event.ports[0].postMessage({ success: true });
  }
});
