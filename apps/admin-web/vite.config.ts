/// <reference types='vitest' />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(async () => {
  const tailwindcss = await import('@tailwindcss/vite');
  return {
    root: __dirname,
    cacheDir: '../node_modules/.vite/admin-web',
    server: {
      port: 4201,
      host: 'localhost',
      proxy: {
        '/api': 'http://localhost:3000',
      },
    },
    preview: {
      port: 4300,
      host: 'localhost',
    },
    plugins: [vue(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md']), tailwindcss.default()],
    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [ nxViteTsPaths() ],
    // },
    build: {
      outDir: '../dist/admin-web',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    test: {
      watch: false,
      globals: true,
      environment: 'jsdom',
      include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      reporters: ['default'],
      coverage: {
        reportsDirectory: '../coverage/admin-web',
        provider: 'v8' as const,
      },
    },
  };
});
