const CACHE_NAME = "expense-tracker-v1";

const urlsToCache = [
  "/Expense-Tracker/home.html",
  "/Expense-Tracker/dashboard.html",
  "/Expense-Tracker/history.html",

  "/Expense-Tracker/styles/home.css",
  "/Expense-Tracker/styles/dashboard.css",
  "/Expense-Tracker/styles/history.css",
  "/Expense-Tracker/styles/nav.css",
  "/Expense-Tracker/styles/install.css",

  "/Expense-Tracker/scripts/home.js",
  "/Expense-Tracker/scripts/dashboard.js",
  "/Expense-Tracker/scripts/history.js",
  "/Expense-Tracker/scripts/install.js",

  "/Expense-Tracker/icons/svg/add.svg",
  "/Expense-Tracker/icons/svg/history.svg",
  "/Expense-Tracker/icons/svg/dashboard.svg",

  "/Expense-Tracker/icons/svg/calendar-days.svg",
  "/Expense-Tracker/icons/svg/car.svg",
  "/Expense-Tracker/icons/svg/clapperboard.svg",
  "/Expense-Tracker/icons/svg/graduation-cap.svg",
  "/Expense-Tracker/icons/svg/home.svg",
  "/Expense-Tracker/icons/svg/indian-rupee.svg",
  "/Expense-Tracker/icons/svg/pill.svg",
  "/Expense-Tracker/icons/svg/shirt.svg",
  "/Expense-Tracker/icons/svg/shopping-cart.svg",
  "/Expense-Tracker/icons/svg/user-round-pen.svg",
  "/Expense-Tracker/icons/svg/zap.svg",
  
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
