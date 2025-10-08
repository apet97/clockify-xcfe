import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: ['all', '.ngrok-free.app', '94248bd4f066.ngrok-free.app']
  },
  preview: {
    port: 4173
  },
  build: {
    outDir: 'dist'
  }
});
