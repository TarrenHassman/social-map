const { getDefaultConfig } = require('expo/metro-config');
const { mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const customConfig = {
  resolver: {
    unstable_enablePackageExports: true,
    extraNodeModules: {
      crypto: require.resolve('react-native-quick-crypto'),
      stream: require.resolve('stream-browserify'),
      os: require.resolve('os-browserify'),
      path: require.resolve('path-browserify'),
      net: require.resolve('react-native-tcp-socket'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
    },
  },
};

module.exports = mergeConfig(defaultConfig, customConfig);
