const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');

const config = {
  mode: process.env.NODE_ENV,
  target: 'web',
  externals: [nodeExternals()],
  entry: './src/index.ts',
  module: {
    rules: [{ test: /\.ts?$/, loader: 'ts-loader' }],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new CopyPlugin({
      patterns: [path.resolve(__dirname, 'src', 'types-internal.d.ts'), path.resolve(__dirname, 'src', 'types.d.ts')],
    }),
  ],
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'build'),
    libraryTarget: 'umd',
    // due to the bug in webpack 4 global object is set to 'window' https://github.com/webpack/webpack/issues/6677
    // the fix https://github.com/webpack/webpack/issues/6642#issuecomment-371087342
    globalObject: 'this',
  },
  optimization: {
    minimize: false,
  },
};

if (process.env.NODE_ENV === 'development') {
  config.devtool = 'eval-source-map';
  config.watch = true;
}

module.exports = config;
