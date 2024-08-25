const CACHE_NAME = "dynamic-cache-v1";

// Install event: Pre-cache some initial files if needed
self.addEventListener("install", async (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cacheArr = [
        "/index.html",
        "/styles.css",
        "/app.js",
        "/app.webmanifest",
        "/images/icons/icon.png",
      ];
      await cache.addAll(cacheArr);
    })()
  );
});

// Fetch event: Cache all fetched resources dynamically
self.addEventListener("fetch", async (event) => {
  if (event.request.method === "GET") {
    event.respondWith(
      (async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse; // Return cached response if available
        }

        const cache = await caches.open(CACHE_NAME);
        const response = await fetch(event.request);

        // Cache every PNG file dynamically
        if (event.request.url.endsWith(".png")) {
          cache.put(event.request, response.clone());
        } else if (event.request.url.endsWith(".js")) {
          cache.put(event.request, response.clone());
        } else if (event.request.url.endsWith(".css")) {
          cache.put(event.request, response.clone());
        }
        // every font
        else if (event.request.url.includes("fonts.googleapis.com")) {
          cache.put(event.request, response.clone());
        }

        return response;
      })()
    );
  }
  if (event.request.mode === "navigate") {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match("/index.html");
    return cachedResponse || fetch("/index.html");
  }
});

// Activate event: Clean up old caches if necessary
self.addEventListener("activate", async (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })()
  );
});
