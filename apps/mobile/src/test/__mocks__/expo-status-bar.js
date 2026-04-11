/**
 * Mock for expo-status-bar in the Vitest test environment.
 * expo-status-bar imports react-native (including useColorScheme) at runtime.
 * This mock avoids loading the TypeScript source of expo-status-bar which
 * requires the native Expo module infrastructure.
 */
const React = require('react');

const StatusBar = React.forwardRef(function StatusBar(_props, _ref) {
  return null;
});
StatusBar.displayName = 'StatusBar';

const setStatusBarStyle = () => {};
const setStatusBarHidden = () => {};
const setStatusBarBackgroundColor = () => {};
const setStatusBarTranslucent = () => {};
const setStatusBarNetworkActivityIndicatorVisible = () => {};

module.exports = {
  StatusBar,
  setStatusBarStyle,
  setStatusBarHidden,
  setStatusBarBackgroundColor,
  setStatusBarTranslucent,
  setStatusBarNetworkActivityIndicatorVisible,
};
