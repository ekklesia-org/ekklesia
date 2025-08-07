import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    setupFiles: [],
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
  esbuild: {
    target: 'node18'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@ekklesia/database': resolve(__dirname, '../../libs/database/src/index.ts'),
      '@ekklesia/shared': resolve(__dirname, '../../libs/shared/src/index.ts'),
    },
  },
});
