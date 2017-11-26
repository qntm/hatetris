'use strict'

const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin')
const path = require('path')
const WebpackCleanupPlugin = require('webpack-cleanup-plugin')

const extractTextWebpackPlugin = new ExtractTextWebpackPlugin('bundle.css')
const webpackCleanupPlugin = new WebpackCleanupPlugin()

module.exports = {
  entry: './src/js/hatetris.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: [{
        loader: 'babel-loader',
        options: {
          presets: ['babel-preset-env']
        }
      }]
    }, {
      test: /\.css$/,
      use: extractTextWebpackPlugin.extract(['css-loader'])
    }, {
      test: /\.(ico|html)$/,
      use: [{
        loader: 'file-loader',
        options: {
          name: '[name].[ext]'
        }
      }]
    }]
  },
  plugins: [
    extractTextWebpackPlugin,
    webpackCleanupPlugin
  ]
}
