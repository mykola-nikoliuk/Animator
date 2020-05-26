const baseWebpackConfig = require('./webpack.config');

module.exports = () => baseWebpackConfig({ libraryTarget: 'var', disFolder: 'examples/dist' });
