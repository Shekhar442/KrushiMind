// Service worker for KrushiMind PWA
const CACHE_NAME = 'krushimind-cache-v1';

// Files to cache for offline use
const filesToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  // CSS files
  '/styles/globals.css',
  // JavaScript bundles
  '/_next/static/chunks/main.js',
  // Icons
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  // Page icons
  '/images/identify-icon.png',
  '/images/finance-icon.png',
  '/images/community-icon.png',
  '/images/marketplace-icon.png',
  // Voice files
  '/voices/welcome.mp3',
  '/voices/identify.mp3',
  '/voices/finance.mp3',
  '/voices/community.mp3',
  '/voices/marketplace.mp3',
  '/voices/analyzing.mp3',
  '/voices/error.mp3',
  '/voices/image_selected.mp3',
  // AI models
  '/models/crop_disease_model/model.json',
  '/models/crop_disease_model/weights.bin'
];

const ASSETS = {
  images: [
    '/images/identify-icon.png',
    '/images/finance-icon.png',
    '/images/community-icon.png',
    '/images/marketplace-icon.png'
  ],
  voices: [
    '/voices/identify.mp3',
    '/voices/finance.mp3',
    '/voices/community.mp3',
    '/voices/marketplace.mp3',
    '/voices/analyzing.mp3',
    '/voices/error.mp3',
    '/voices/image_selected.mp3',
    '/voices/welcome.mp3'
  ]
};

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  // Skip waiting to ensure the new service worker takes over immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(filesToCache);
      })
      .then(() => {
        console.log('Service Worker: All resources cached');
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  // Claim clients to ensure the service worker takes control immediately
  self.clients.claim();
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, then network with cache update
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  // Handle API requests differently - network first, then fallback to cache
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response to store in cache
          const responseToCache = response.clone();
          
          // Open cache and store the response
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Standard cache-first strategy for non-API requests
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return from cache if found
        if (response) {
          return response;
        }
        
        // Otherwise, fetch from network
        return fetch(event.request)
          .then((response) => {
            // If invalid response, just return it
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone response to store in cache
            const responseToCache = response.clone();
            
            // Open cache and store response
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed:', error);
            
            // For navigation requests, return the offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            
            return new Response('Network error happened', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    console.log('Service Worker: Syncing data...');
    event.waitUntil(syncData());
  }
});

// Function to handle background sync
function syncData() {
  return new Promise((resolve, reject) => {
    // This would be handled by the sync service in the main app
    self.clients.matchAll().then((clients) => {
      if (clients && clients.length) {
        // Send message to client to initiate sync
        clients[0].postMessage({
          type: 'SYNC_INITIATED',
          timestamp: new Date().getTime()
        });
      }
      resolve();
    });
  });
}

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  let data = {};
  
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'KrushiMind Update',
      body: event.data ? event.data.text() : 'New update available'
    };
  }
  
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});