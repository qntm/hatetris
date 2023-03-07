import webpack from 'webpack'
import webpackConfigProd from './webpack.config.prod.js'

export default {
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
