import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  plugins: [swc.vite()],
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.e2e-spec.ts'],
    setupFiles: ['./test/setup-env.ts'],
    // Les tests e2e partagent la même base de données : exécution séquentielle
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
