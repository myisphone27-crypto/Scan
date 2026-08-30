// =========================================================
// SERVICE WORKER — Colis Scanner PWA
// =========================================================

const CACHE_NAME = 'colis-scanner-v2';

const PRECACHE_URLS = [
  './',
  './index.html',
  './icon.svg',
  './manifest.json'
];

const CDN_URLS = [
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap',
  'https://www.gstatic.com/firebasejs/'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] Erreur pré-cache:', err))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET' || !url.protocol.startsWith('http')) return;

  // إستثناء طلبات Firebase كي تعمل المزامنة اللحظية بمرونة
  if (url.hostname.includes('firebase') || url.hostname.includes('googleapis')) return;

  if (CDN_URLS.some(cdn => event.request.url.startsWith(cdn))) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => new Response('Hors ligne', { status: 503 }));
      })
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(cached => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            if (networkResponse.ok) cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }).catch(() => cached);
          return cached || fetchPromise;
        });
      })
    );
  }
});