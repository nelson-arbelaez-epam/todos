/**
 * Minimal global mock for `expo-router` used in Vitest tests.
 * Exports lightweight components and hooks commonly used in the app tests:
 * - `Link`, `Redirect`, `Stack` components
 * - `useRouter`, `useSegments`, `useLocalSearchParams`, `useGlobalSearchParams` hooks
 */
const React = require('react');
const { Text } = require('react-native');

function Link({ children }) {
  // Render children into a Text so queries like getByText work consistently.
  return React.createElement(Text, null, children);
}

function Redirect({ href }) {
  // Expose the redirected href as visible text for tests that assert redirects.
  return React.createElement(Text, { testID: 'redirect' }, String(href));
}

function Stack() {
  // Layout uses <Stack /> as a navigation container; return null for tests.
  return null;
}

function useRouter() {
  return {
    push: () => {},
    replace: () => {},
    back: () => {},
    prefetch: () => Promise.resolve(),
  };
}

function useSegments() {
  return [];
}

function useLocalSearchParams() {
  return {};
}

function useGlobalSearchParams() {
  return {};
}

module.exports = {
  Link,
  Redirect,
  Stack,
  useRouter,
  useSegments,
  useLocalSearchParams,
  useGlobalSearchParams,
};
