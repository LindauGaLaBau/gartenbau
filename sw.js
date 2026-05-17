// ── Service Worker für Lindau Garten- und Landschaftsbau ──
const CACHE_NAME = 'lindau-garten-v1';
const ASSETS = [
  './gartenbau-manager.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

// Installation: alle Dateien cachen
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Cache geöffnet');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Aktivierung: alten Cache löschen
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Anfragen: erst Cache, dann Netzwerk (Offline-first)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).then(networkResponse => {
        // Neue Antwort auch cachen
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline-Fallback
        return caches.match('./gartenbau-manager.html');
      });
    })
  );
});
