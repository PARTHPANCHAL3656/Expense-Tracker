const CACHE_NAME = "expense-tracker-v1";

const urlsToCache = [
  "/Expense-Tracker/home.html",
  "/Expense-Tracker/dashboard.html",
  "/Expense-Tracker/history.html",
  "/Expense-Tracker/styles/home.css",
  "/Expense-Tracker/styles/dashboard.css",
  "/Expense-Tracker/styles/history.css",
  "/Expense-Tracker/styles/nav.css",
  "/Expense-Tracker/scripts/home.js",
  "/Expense-Tracker/scripts/dashboard.js",
  "/Expense-Tracker/scripts/history.js",
  "/Expense-Tracker/icon-192.png",
  "/Expense-Tracker/icon-512.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // We use a loop instead of addAll so one failure doesn't stop the rest
      const cachePromises = urlsToCache.map(async (url) => {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Offline file not found: ${url}`);
          return cache.put(url, response);
        } catch (err) {
          console.warn("Skipping cache for:", url, err);
        }
      });
      return Promise.all(cachePromises);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request)),
  );
});
