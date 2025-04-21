// Importando funções do Workbox
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';

// Precache de todos os assets definidos no manifesto
precacheAndRoute(self.__WB_MANIFEST);

// Cache strategy para imagens (usando stale-while-revalidate)
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'images-cache',
  })
);

// Cache strategy para API externa (com URL absoluta)
registerRoute(
  ({ url }) =>
    url.origin === 'https://boas-noticias-frontend.vercel.app' &&
    url.pathname.startsWith('/api/boas-noticias'),
  new NetworkFirst({
    cacheName: 'noticias-api-cache',
    networkTimeoutSeconds: 10,
    plugins: [
      {
        cacheWillUpdate: async ({ response }) => {
          if (!response || response.status !== 200) return null;
          return response;
        },
      },
    ],
  })
);

// Precache da página offline
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('offline-cache').then((cache) => {
      return cache.addAll(['/offline.html']);
    })
  );
});

// Offline fallback para navegação
self.addEventListener('fetch', (event) => {
  if (
    event.request.mode === 'navigate' &&
    !event.request.url.includes('/api/boas-noticias')
  ) {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/offline.html')
      )
    );
  }
});

// Limpa caches antigos
self.addEventListener('activate', (event) => {
  const expectedCaches = ['noticias-api-cache', 'images-cache', 'offline-cache'];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!expectedCaches.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
