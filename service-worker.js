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

// Cache strategy para API - sempre tenta obter os dados mais recentes
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/boas-noticias'), // Para a sua API
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

// Offline Fallback - Fornece fallback para páginas se o usuário estiver offline
self.addEventListener('fetch', (event) => {
  // Ignorar requisições para a API
  if (event.request.url.includes('/api/boas-noticias')) {
    return;
  }

  // Fallback de navegação se não houver resposta
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/offline.html').then((cachedResponse) => {
        // Retorna o conteúdo offline se disponível, senão tenta a requisição normal
        return cachedResponse || fetch(event.request);
      })
    );
  }
});

// Cache da API para offline (se a API responder com sucesso)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('noticias-api-cache').then((cache) => {
      return cache.addAll([
        '/offline.html', // Página offline que pode ser usada como fallback
      ]);
    })
  );
});

// Fazendo a ativação do service worker e garantindo que a versão mais nova seja utilizada
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== 'noticias-api-cache' && cacheName !== 'images-cache') {
            // Remover caches antigos
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
