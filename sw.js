const CACHE_NAME = 'story-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/styles/transitions.css',
  '/app.js',
  '/routes.js',
  '/src/utils/offlineHandler.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/badge-72x72.png',
  '/icons/checkmark.png',
  '/icons/xmark.png',
  'https://unpkg.com/leaflet/dist/leaflet.css',
  'https://unpkg.com/leaflet/dist/leaflet.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((response) => {
        return response || fetch('/index.html');
      })
    );
    return;
  }

  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            if (event.request.destination === 'image') {
              return caches.match('/icons/icon-192x192.png');
            }

            return new Response(
              JSON.stringify({
                error: 'offline',
                message: 'Anda sedang offline. Silakan periksa koneksi internet Anda.'
              }), {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'application/json'
                })
              }
            );
          });
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

function notifyClients(message) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage(message);
    });
  });
}

self.addEventListener('online', () => {
  notifyClients({ type: 'ONLINE' });
});

self.addEventListener('offline', () => {
  notifyClients({ type: 'OFFLINE' });
});

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push message received:', event);
  
  let data = {};
  try {
    data = event.data.json();
    console.log('[Service Worker] Push data:', data);
  } catch (e) {
    data = { message: event.data.text() };
    console.log('[Service Worker] Push data (text):', data);
  }

  const options = {
    body: data.options?.body || 'Ada cerita baru!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    requireInteraction: true,
    tag: 'story-notification',
    renotify: true,
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: data.url || '/'
    },
    actions: [
      {
        action: 'explore',
        title: 'Lihat Detail',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Tutup',
        icon: '/icons/xmark.png'
      },
    ]
  };

  console.log('[Service Worker] Showing notification with options:', options);

  event.waitUntil(
    new Promise((resolve) => {
      setTimeout(() => {
        self.registration.showNotification(data.title || 'Story App Notification', options)
          .then(() => {
            console.log('[Service Worker] Notification shown successfully');
            resolve();
          })
          .catch((error) => {
            console.error('[Service Worker] Error showing notification:', error);
            resolve();
          });
      }, 1000);
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click received:', event);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
}); 