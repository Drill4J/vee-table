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
  },
};

if (process.env.NODE_ENV === 'development') {
  config.devtool = 'eval-source-map';
  config.watch = true;
}

module.exports = config;
