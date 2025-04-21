// src/serviceWorkerRegistration.js

// Esse arquivo registra o service worker, tornando o app um PWA

// Verifica se está rodando em localhost para o desenvolvimento
const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
      window.location.hostname === '[::1]' ||
      window.location.hostname === '127.0.0.1'
  );
  
  export function register() {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      // A URL pública do serviço
      const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
      if (publicUrl.origin !== window.location.origin) {
        return;
      }
  
      window.addEventListener('load', () => {
        const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
  
        if (isLocalhost) {
          // Verifica se o service worker está funcionando corretamente no localhost
          checkValidServiceWorker(swUrl);
        } else {
          // Se não for localhost, registra o service worker
          registerValidSW(swUrl);
        }
      });
    }
  }
  
  // Registra o Service Worker em produção
  function registerValidSW(swUrl) {
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log('Service Worker registrado: ', registration);
      })
      .catch((error) => {
        console.error('Falha ao registrar o Service Worker: ', error);
      });
  }
  
  // Verifica se o service worker existe e se é válido
  function checkValidServiceWorker(swUrl) {
    fetch(swUrl)
      .then((response) => {
        // Verifica se o serviço existe e se é um JS válido
        if (
          response.status === 404 ||
          response.headers.get('content-type').indexOf('javascript') === -1
        ) {
          // Se o service worker não foi encontrado, remova-o
          navigator.serviceWorker.ready.then((registration) => {
            registration.unregister();
          });
        } else {
          // Se a resposta for válida, então registra o service worker
          registerValidSW(swUrl);
        }
      })
      .catch(() => {
        console.log(
          'Não foi possível verificar o service worker. O aplicativo está em modo offline.'
        );
      });
  }
  
  // Atualiza o Service Worker automaticamente
  self.addEventListener('install', (event) => {
    self.skipWaiting(); // Força o novo service worker a assumir imediatamente.
  });
  
  self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim()); // Avisa os clientes para usar a versão mais recente imediatamente.
  });
  
  // Cache de arquivos estáticos e respostas de API
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('noticias-cache').then((cache) => {
        return cache.addAll([
          '/index.html',
          '/icons/icon-192x192.png',
          '/icons/icon-512x512.png',
          // Outros arquivos estáticos ou páginas essenciais que você quer manter no cache
          // Se você tiver outras rotas ou arquivos, adicione-os aqui.
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', (event) => {
    // Verifica se a requisição é para a API (não cachear)
    if (event.request.url.includes('/api/')) {
      return event.respondWith(fetch(event.request)); // Requisição para a API vai direto ao servidor
    }
  
    // Para as outras requisições, tenta retornar do cache primeiro
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
  
        return fetch(event.request).then((response) => {
          return caches.open('noticias-cache').then((cache) => {
            // Cache a resposta para futuras requisições
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  });