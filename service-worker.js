const CACHE_NAME = 'expense-tracker-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/history.html',
  '/styles/index.css',
  '/styles/dashboard.css',
  '/styles/history.css',
  '/styles/nav.css',
  '/scripts/index.js',
  '/scripts/dashboard.js',
  '/scripts/history.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
