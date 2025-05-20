const { override, addWebpackPlugin } = require('customize-cra');
const webpack = require('webpack');

module.exports = override(
  addWebpackPlugin(new webpack.ProvidePlugin({
    process: 'process/browser',
  })),
  function(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "fs": false,
      "path": require.resolve("path-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "os": require.resolve("os-browserify/browser"),
    };
    return config;
  }
);