import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true, // Ativa PWA em ambiente de desenvolvimento (útil para testes)
      },
      includeAssets: [
        'icons/icon-192x192.png',
        'icons/icon-512x512.png',
        'favicon.ico',
        'robots.txt',
        'apple-touch-icon.png',
      ],
      manifest: {
        name: 'Notícia Boa',
        short_name: 'Notícia Boa',
        description: 'Notícia boa corre aqui',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#000000',
        background_color: '#000000',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/boas-noticias-frontend\.vercel\.app\/api\/boas-noticias.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'noticias-api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60, // 1 hora
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['react-icons'],
    },
  },
  server: {
    port: 3000, // opcional
    open: true, // opcional
  },
});
