const webpack = require('webpack')

const webpackConfigProd = require('./webpack.config.prod')

module.exports = {
  ...webpackConfigProd,
  mode: 'development',

  // "Recommended choice for development builds with high quality SourceMaps"
  devtool: 'eval-source-map',

  entry: [
    'webpack-hot-middleware/client',
    ...webpackConfigProd.entry
  ],

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    ...webpackConfigProd.plugins
  ]
}
