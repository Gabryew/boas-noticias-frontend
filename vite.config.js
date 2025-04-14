import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['react-icons'], // Isso ajuda a manter o tamanho do bundle menor
    },
  },
  server: {
    // Habilita o hot reload e configurações de servidor
    proxy: {
      // Aqui você pode configurar proxy para o backend se precisar
      '/api': 'http://localhost:3000', // Exemplo de como configurar um proxy para a API
    },
  },
});
