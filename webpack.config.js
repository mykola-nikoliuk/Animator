const webpack = require('webpack');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = ({library = 'Animator', filename = 'index.js'} = {}) => {
  const distPath = path.join(__dirname, 'example/dist');

  return {
    resolve: {
      modules: ['node_modules', 'src'],
    },
    devtool: 'source-map', // more info:https://webpack.github.io/docs/build-performance.html#sourcemaps and https://webpack.github.io/docs/configuration.html#devtool
    entry: path.resolve(__dirname, './src/index.js'),
    target: 'web', // necessary per https://webpack.github.io/docs/testing.html#compile-and-test
    output: {
      path: distPath, // Note: Physical files are only output by the production build task `npm run build`.
      publicPath: '/',
      filename,
      library
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
        {test: /\.jsx?$/, exclude: /node_modules/, use: ['babel-loader']},
        {test: /\.pem$/, loader: 'text-loader'}
      ]
    }
  };
};
