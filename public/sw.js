const CACHE_NAME = 'merokamataki-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/app.js',
  '/manifest.json',
  '/merokamataki.png'
];

// Install Event - Αποθήκευση των βασικών αρχείων στην Cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// Activate Event - Καθαρισμός παλιών caches αν αλλάξει το CACHE_NAME
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Network First στρατηγική (για να έχουμε πάντα την τελευταία έκδοση)
self.addEventListener('fetch', event => {
  // Εξαιρούμε τα API requests για να παίρνουμε πάντα αληθινά δεδομένα από τη βάση
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // Αν αποτύχει το δίκτυο (π.χ. εκτός σύνδεσης), επιστρέφουμε το αρχείο από την cache
        return caches.match(event.request);
      })
  );
});