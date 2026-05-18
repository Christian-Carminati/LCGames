import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globalSetup: ['./tests/db/globalSetup.ts'],
    setupFiles: ['./tests/db/client.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    include: ['tests/db/**/*.test.ts'],
  },
});
