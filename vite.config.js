import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Define o tipo de registro do service worker
      manifest: {
        name: 'Notícia Boa',
        short_name: 'Notícia Boa',
        description: 'Notícia boa corre aqui',
        theme_color: '#000000', // Cor do tema
        background_color: '#000000', // Cor de fundo ao carregar
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
            urlPattern: /\/api\/boas-noticias/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'noticias-api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60,
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
      external: ['react-icons'], // Isso ajuda a manter o tamanho do bundle menor
    },
  },
  server: {
    // Você pode configurar opções de servidor aqui, se necessário
  },
});
