import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/index.tsx', 'src/AppWebComponent.tsx'],
    },
  },
  resolve: {
    alias: {
      'process-flow-lib': resolve(__dirname, '../src/process-flow-lib'),
    },
  },
});
