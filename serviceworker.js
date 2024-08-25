const CACHE_NAME = "dynamic-cache-v1";

// Install event: Pre-cache some initial files if needed
self.addEventListener("install", async (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cacheArr = [
        "/coffemasters/index.html",
        "/coffemasters/styles.css",
        "/coffemasters/app.js",
        "/coffemasters/app.webmanifest",
        "/coffemasters/images/icons/icon.png",
      ];
      await cache.addAll(cacheArr);
    })()
  );
});

// Fetch event: Cache all fetched resources dynamically and handle SPA routing
self.addEventListener("fetch", async (event) => {
  if (event.request.method === "GET") {
    event.respondWith(
      (async () => {
        const requestUrl = new URL(event.request.url);

        // Handle SPA navigation by serving index.html for HTML pages
        if (
          event.request.mode === "navigate" ||
          requestUrl.pathname.endsWith(".html")
        ) {
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match("/coffemasters/index.html");
          return cachedResponse || fetch("/coffemasters/index.html");
        }

        // Try to respond with the cached resource
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Fetch the resource from the network and cache it
        const cache = await caches.open(CACHE_NAME);
        const response = await fetch(event.request);

        if (
          event.request.url.endsWith(".png") ||
          event.request.url.endsWith(".js") ||
          event.request.url.endsWith(".css") ||
          event.request.url.includes("fonts.googleapis.com")
        ) {
          cache.put(event.request, response.clone());
        }

        return response;
      })()
    );
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
