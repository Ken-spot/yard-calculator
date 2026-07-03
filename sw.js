// Service worker: precache the whole app so it works offline.
//
// MAINTENANCE RULE: bump CACHE_NAME (v1 → v2 → …) on EVERY deploy.
// That's the entire cache-busting story — the new worker installs the new
// files and deletes the old cache. Users may need to close and reopen the
// app once to pick up an update; that's normal service-worker behavior.

const CACHE_NAME = 'yardcalc-v1';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './js/app.js',
  './js/storage.js',
  './js/links.js',
  './js/format.js',
  './js/engine/constants.js',
  './js/engine/geometry.js',
  './js/engine/paver-calc.js',
  './js/engine/grass-calc.js',
  './js/ui/dom.js',
  './js/ui/projects-ui.js',
  './js/ui/shapes-ui.js',
  './js/ui/paver-ui.js',
  './js/ui/grass-ui.js',
  './js/ui/materials-ui.js',
  './js/ui/settings-ui.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cached =>
      cached || fetch(event.request).catch(() => {
        // Offline navigation to an uncached URL → serve the app shell
        if (event.request.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      })
    )
  );
});
