import { defineConfig } from 'vitest/config';

/**
 * Vitest configuration for MCP end-to-end tests.
 *
 * E2E tests run against a fully-wired NestJS application verifying MCP transport
 * boundaries, health endpoints, and protocol-level request/response flows.
 *
 * Run with: yarn workspace @todos/mcp test:e2e
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
