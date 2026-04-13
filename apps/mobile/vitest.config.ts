import { resolve } from 'node:path';
import { reactNative } from '@srsholmes/vitest-react-native';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// __dirname is the apps/mobile directory when this config is loaded
const appDir = __dirname;

export default defineConfig({
  plugins: [react(), reactNative()],
  resolve: {
    /**
     * Redirect `react-native` imports to a pure-JS mock so that the Vitest
     * node environment can load them without a Babel/Flow transform.
     * The mock mirrors the same component tree structure so
     * @testing-library/react-native queries work as expected.
     */
    alias: {
      '@': resolve(appDir, 'src'),
      'react-native': resolve(appDir, 'src/test/__mocks__/react-native.js'),
      'expo-router': resolve(appDir, 'src/test/__mocks__/expo-router.js'),
      'expo-status-bar': resolve(
        appDir,
        'src/test/__mocks__/expo-status-bar.js',
      ),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    root: appDir,
    setupFiles: [
      '@srsholmes/vitest-react-native/setup',
      resolve(appDir, 'src/test/setup.ts'),
    ],
    include: [
      `${appDir}/**/*.test.ts`,
      `${appDir}/**/*.test.tsx`,
      `${appDir}/**/*.spec.ts`,
      `${appDir}/**/*.spec.tsx`,
    ],
    server: {
      deps: {
        /**
         * Force @testing-library/react-native through the Vite module runner
         * so that its internal `require('react-native')` calls are resolved
         * via the alias above rather than Node.js's native require().
         */
        inline: ['@testing-library/react-native', 'react-test-renderer'],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'src/test/__mocks__/**'],
    },
  },
});
