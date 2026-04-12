/**
 * Vitest setup for React Native unit tests.
 *
 * This file is loaded BEFORE any test file.  It patches Node.js's module
 * resolution to redirect `react-native` to a pure-JS mock so that all CJS
 * `require('react-native')` calls (including those from within the compiled
 * @testing-library/react-native package) resolve to the mock instead of
 * react-native's raw Flow-typed source.
 */

import { resolve } from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Module = require('node:module') as typeof import('node:module') & {
  _resolveFilename: (
    request: string,
    parent: NodeModule | null,
    isMain: boolean,
    options?: object,
  ) => string;
  _load: (
    request: string,
    parent: NodeModule | null,
    isMain: boolean,
  ) => unknown;
};

const mockPath = resolve(__dirname, '__mocks__/react-native.js');
const expoStatusBarMockPath = resolve(
  __dirname,
  '__mocks__/expo-status-bar.js',
);

// Intercept _resolveFilename so that `react-native` resolves to our mock
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function patchedResolve(
  request,
  parent,
  isMain,
  options,
) {
  if (request === 'react-native') return mockPath;
  if (request === 'expo-status-bar') return expoStatusBarMockPath;
  return originalResolve.call(this, request, parent, isMain, options);
};

// Intercept _load as a second safety net
const originalLoad = Module._load;
Module._load = function patchedLoad(request, parent, isMain) {
  if (request === 'react-native' || request === mockPath) {
    return originalLoad.call(this, mockPath, parent, isMain);
  }
  if (request === 'expo-status-bar' || request === expoStatusBarMockPath) {
    return originalLoad.call(this, expoStatusBarMockPath, parent, isMain);
  }
  return originalLoad.call(this, request, parent, isMain);
};

// Required by react-native runtime
(globalThis as Record<string, unknown>).__DEV__ = true;
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
(globalThis as Record<string, unknown>).IS_REACT_NATIVE_TEST_ENVIRONMENT = true;

// Mock timers used by animation libraries
if (!globalThis.requestAnimationFrame) {
  (globalThis as Record<string, unknown>).requestAnimationFrame = (
    cb: FrameRequestCallback,
  ) => setTimeout(cb, 0);
}
if (!globalThis.cancelAnimationFrame) {
  (globalThis as Record<string, unknown>).cancelAnimationFrame = (id: number) =>
    clearTimeout(id);
}
