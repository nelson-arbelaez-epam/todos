// Metro configuration for NativeWind
// https://www.nativewind.dev/v4/getting-started/expo-router
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  /.*\/__tests__\/.*/,
  /.*\/__mocks__\/.*/,
  /.*.spec.tsx?$/,
];

module.exports = withNativeWind(config, { input: './global.css' });
