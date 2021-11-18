const path = require('path');
const nodeExternals = require('webpack-node-externals');
const { CheckerPlugin } = require('awesome-typescript-loader');

const config = {
  mode: process.env.NODE_ENV,
  target: 'node',
  externals: [nodeExternals()],
  entry: './src/bin/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'awesome-typescript-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [new CheckerPlugin()],
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    type: 'module',
    // type: 'umd'
  },
};

if (process.env.NODE_ENV === 'development') {
  config.devtool = 'eval-source-map';
  config.watch = true;
}

module.exports = config;
