import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/perfume-onlineshop/',
  plugins: [react(), tailwindcss()],
});
