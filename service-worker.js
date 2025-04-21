// service-worker.js

import { precacheAndRoute } from 'workbox-precaching';

// Precache all the assets defined in the manifest
precacheAndRoute(self.__WB_MANIFEST);

// Cache strategy for images
self.addEventListener('fetch', (event) => {
  if (event.request.url.endsWith('.jpg') || event.request.url.endsWith('.png')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  }
});
