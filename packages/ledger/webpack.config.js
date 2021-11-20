const path = require('path');
const nodeExternals = require('webpack-node-externals');
const { CheckerPlugin } = require('awesome-typescript-loader');

const config = {
  mode: process.env.NODE_ENV,
  target: ['node'],
  externals: [nodeExternals()],
  entry: './src/index.ts',
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
    path: path.resolve(__dirname, 'build'),
    libraryTarget: 'umd',
    // type: 'module',
    // type: 'umd'

    // from js-auto-test-agent
    // path: path.resolve(__dirname, 'build'),
    // filename: 'index.js',
    // library: 'DrillJsAutoTestAgent',
    // libraryTarget: 'umd',
    // globalObject: 'this',
    // umdNamedDefine: true,
  },
};

if (process.env.NODE_ENV === 'development') {
  config.devtool = 'eval-source-map';
  config.watch = true;
}

module.exports = config;
