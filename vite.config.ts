import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/perfume-onlineshop/',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/perfume-onlineshop/api/': {
        target: 'http://127.0.0.1:8000',
        rewrite: path => path.replace(/^\/perfume-onlineshop/, ''),
      },
    },
  },
});
