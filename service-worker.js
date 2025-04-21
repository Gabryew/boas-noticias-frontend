// service-worker.js

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';

// Precache all assets defined in the manifest
precacheAndRoute(self.__WB_MANIFEST);

// Cache strategy for images (using stale-while-revalidate)
registerRoute(
  ({ request }) => request.destination === 'image', 
  new StaleWhileRevalidate({
    cacheName: 'images-cache',
  })
);

// Cache strategy for API (NetworkFirst - always try to get the latest data)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/boas-noticias'),
  new NetworkFirst({
    cacheName: 'noticias-api-cache',
    networkTimeoutSeconds: 10, // Limita o tempo de espera para a rede
    plugins: [
      {
        cacheWillUpdate: async ({ request, response }) => {
          // Se a resposta da API não for válida, não deve ser cacheada
          if (!response || response.status !== 200) {
            return null;
          }
          return response;
        },
      },
    ],
  })
);

// Offline Fallback - Provide fallback for offline pages if needed
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/offline.html').then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  }
});
