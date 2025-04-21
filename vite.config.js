import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import VitePWA from 'vite-plugin-pwa'; // Importa o plugin PWA

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
    }),
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['react-icons'], // Isso ajuda a manter o tamanho do bundle menor
    },
  },
  server: {
    // O proxy pode ser removido, pois você já está utilizando a URL da API da Vercel diretamente
    // E você pode rodar sua aplicação normalmente em desenvolvimento
  },
});
