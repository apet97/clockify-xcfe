import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@api': fileURLToPath(new URL('./apps/api/src', import.meta.url))
    }
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.spec.ts'],
    setupFiles: ['tests/setup.ts']
  }
});
