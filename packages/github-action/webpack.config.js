const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');

const config = {
  target: 'node',
  // externals: [nodeExternals()],
  entry: './src/index.ts',
  module: {
    rules: [
      { test: /\.ts?$/, loader: "ts-loader" }
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        path.resolve(__dirname, 'action.yml'),
        path.resolve(__dirname, 'package.json'),
        path.resolve(__dirname, 'package-lock.json'),
      ]
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'build'),
    libraryTarget: 'umd',
    // due to the bug in webpack 4 global object is set to 'window' https://github.com/webpack/webpack/issues/6677
    // the fix https://github.com/webpack/webpack/issues/6642#issuecomment-371087342
    globalObject: 'this'
  },
  optimization: {
    minimize: false,
  },
};

module.exports = config;
