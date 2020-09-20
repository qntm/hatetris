const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const miniCssExtractPlugin = new MiniCssExtractPlugin({
  filename: 'bundle.css'
})

module.exports = {
  mode: 'development',
  plugins: [
    miniCssExtractPlugin
  ],
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader'
      }
    }, {
      test: /\.(ico|html)$/,
      use: {
        loader: 'file-loader',
        options: {
          name: '[name].[ext]'
        }
      }
    }, {
      test: /\.css$/,
      use: [{
        loader: MiniCssExtractPlugin.loader
      }, 'css-loader']
    }]
  },
  output: {
    filename: 'bundle.js'
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  }
}
