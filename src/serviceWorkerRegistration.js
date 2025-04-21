// src/serviceWorkerRegistration.js

// Esse arquivo registra o Service Worker (caso queira fazer manualmente)
// MAS com Vite + VitePWA, normalmente isso é automático

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('✅ Service Worker registrado com sucesso:', registration);
        })
        .catch((error) => {
          console.error('❌ Falha ao registrar o Service Worker:', error);
        });
    });
  }
}
