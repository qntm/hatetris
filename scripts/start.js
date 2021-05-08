const express = require('express')
const WebpackDevServerUtils = require('react-dev-utils/WebpackDevServerUtils')
const webpack = require('webpack')
const WebpackDevMiddleware = require('webpack-dev-middleware')
const WebpackHotMiddleware = require('webpack-hot-middleware')

const config = require('../config/webpack.config.dev')

const compiler = WebpackDevServerUtils.createCompiler({
  webpack,
  config,
  appName: 'hatetris',
  urls: WebpackDevServerUtils.prepareUrls('http', 'localhost', 3000)
})

express()
  .use(WebpackDevMiddleware(compiler))
  .use(WebpackHotMiddleware(compiler))
  .listen(3000, () => {
    console.log('listening')
    console.log('http://localhost:3000/hatetris.html')
  })
