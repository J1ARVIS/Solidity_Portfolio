const webpack = require('webpack');
const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = function override(config, env) {

  const fallback = config.resolve.fallback || {};

  Object.assign(fallback, {
    "crypto": require.resolve("crypto-browserify"),
    //"stream": require.resolve("stream-browserify"),
    "buffer": require.resolve("buffer"),
    "assert": require.resolve("assert"),
    "path": require.resolve("path-browserify"),
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "os": require.resolve("os-browserify"),
    "url": require.resolve("url")
  })

  config.resolve.fallback = fallback;

  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    }),
    new Dotenv()
  ])

  return config;
}
