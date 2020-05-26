const webpack = require('webpack');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = ({ libraryTarget = 'umd', disFolder = 'dist' } = {}) => ({
  resolve: {
    modules: ['node_modules', 'src'],
  },
  mode: 'production',
  devtool: 'source-map', // more info:https://webpack.github.io/docs/build-performance.html#sourcemaps and https://webpack.github.io/docs/configuration.html#devtool
  entry: path.resolve(__dirname, './index.js'),
  target: 'web', // necessary per https://webpack.github.io/docs/testing.html#compile-and-test
  output: {
    path: path.join(__dirname, disFolder),
    publicPath: '/',
    filename: 'index.js',
    library: 'Animator',
    libraryTarget,
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'), // Tells React to build in either dev or prod modes. https://facebook.github.io/react/downloads.html (See bottom)
      '__DEV__': true,
      'VERSION': '"development"',
    }),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      { test: /\.jsx?$/, exclude: /node_modules/, use: ['babel-loader'] }
    ],
  }
});
