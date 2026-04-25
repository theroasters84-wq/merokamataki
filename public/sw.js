const CACHE_NAME = 'merokamataki-v8';
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
  // Εξαιρούμε τα API requests και τυχόν extensions του browser (π.χ. chrome-extension://)
  if (event.request.url.includes('/api/') || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Προσπαθούμε πρώτα να φέρουμε το αρχείο από το ίντερνετ (ή τον localhost)
        return await fetch(event.request);
      } catch (error) {
        // Αν αποτύχει (π.χ. κομμένο ίντερνετ ή κλειστός server), ψάχνουμε στην cache
        const cachedResponse = await caches.match(event.request, { ignoreSearch: true });
        if (cachedResponse) {
          return cachedResponse;
        }
        // Αν δεν υπάρχει ούτε στην cache, επιστρέφουμε μια έγκυρη κενή απάντηση για να μην "κρασάρει"
        return new Response("Πρόβλημα δικτύου και το αρχείο δεν υπάρχει στην cache.", { 
          status: 503, 
          statusText: "Service Unavailable",
          headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })
        });
      }
    })()
  );
});