import { defineConfig } from 'vitest/config';

/**
 * Vitest configuration for API end-to-end tests.
 *
 * E2E tests run against a fully-wired NestJS application (no external Firebase dependency).
 * They test complete HTTP request/response cycles and are intentionally slower than unit tests.
 *
 * Run with: yarn workspace @todos/api test:e2e
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['e2e/**/*.e2e-spec.ts'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'e2e/'],
    },
  },
});
